import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CheckoutService } from '../src/checkout/checkout.service';

// Fake Stripe env so CheckoutService constructor can be instantiated if needed.
// We override CheckoutService below, so this is just a safety net.
process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder_for_e2e_tests';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_placeholder_for_e2e_tests';

const buildPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  order: { findMany: jest.fn(), findFirst: jest.fn() },
  orderItem: { findMany: jest.fn(), groupBy: jest.fn() },
  cart: { findUnique: jest.fn() },
  cartItem: { findMany: jest.fn() },
});

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaMock: ReturnType<typeof buildPrismaMock>;

  beforeAll(async () => {
    prismaMock = buildPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(CheckoutService)
      .useValue({ createSession: jest.fn(), handleWebhook: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/auth/register ─────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('201 — creates an account and returns a JWT', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const { body, status } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'alice@example.com', password: 'password123' });

      expect(status).toBe(HttpStatus.CREATED);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('alice@example.com');
    });

    it('409 — rejects a duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' });

      const { status } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'alice@example.com', password: 'password123' });

      expect(status).toBe(HttpStatus.CONFLICT);
    });

    it('400 — rejects a short password', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'alice@example.com', password: '123' });

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('400 — rejects an invalid email', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  // ── POST /api/auth/login ────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('200 — returns a JWT for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-pass', 1);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash,
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const { body, status } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'correct-pass' });

      expect(status).toBe(HttpStatus.OK);
      expect(body.token).toBeDefined();
    });

    it('401 — rejects an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const { status } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'any' });

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401 — rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-pass', 1);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash,
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const { status } = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'wrong-pass' });

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  // ── GET /api/auth/profile ───────────────────────────────────────────────────

  describe('GET /api/auth/profile', () => {
    it('200 — returns the authenticated user profile', async () => {
      // Register to get a real JWT signed by the test server
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // register check
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'bob@example.com',
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bob@example.com', password: 'password123' });

      const token: string = registerRes.body.token;

      // Now use the JWT for the profile endpoint
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'bob@example.com',
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const { body, status } = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(status).toBe(HttpStatus.OK);
      expect(body.email).toBe('bob@example.com');
    });

    it('401 — rejects a request with no token', async () => {
      const { status } = await request(app.getHttpServer()).get(
        '/api/auth/profile',
      );
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  // ── GET /api/products ───────────────────────────────────────────────────────

  describe('GET /api/products', () => {
    it('200 — returns a paginated list of products', async () => {
      const fakeProduct = {
        id: 'prod-1',
        name: 'Widget',
        description: 'A widget',
        price: { toString: () => '9.99' },
        imageUrl: 'https://example.com/img.jpg',
        category: 'Tools',
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.product.findMany.mockResolvedValue([fakeProduct]);
      prismaMock.product.count.mockResolvedValue(1);

      const { body, status } = await request(app.getHttpServer()).get(
        '/api/products',
      );

      expect(status).toBe(HttpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta.total).toBe(1);
    });
  });
});
