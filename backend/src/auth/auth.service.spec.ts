import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const jwtMock = {
  sign: jest.fn().mockReturnValue('signed-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a user and returns a signed JWT', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        role: 'CUSTOMER',
        createdAt: new Date('2024-01-01'),
      });

      const result = await service.register({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('alice@example.com');
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('hashes the password before storing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      await service.register({ email: 'alice@example.com', password: 'secret' });

      const createCall = prismaMock.user.create.mock.calls[0][0];
      const storedHash: string = createCall.data.passwordHash;
      expect(storedHash).not.toBe('secret');
      expect(await bcrypt.compare('secret', storedHash)).toBe(true);
    });

    it('throws ConflictException when email is already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({ email: 'dupe@example.com', password: 'pass' }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    async function makeUser(password: string) {
      const passwordHash = await bcrypt.hash(password, 1);
      return {
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash,
        role: 'CUSTOMER' as const,
        createdAt: new Date(),
      };
    }

    it('returns a signed JWT for valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(await makeUser('correct'));

      const result = await service.login({
        email: 'alice@example.com',
        password: 'correct',
      });

      expect(result.token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('alice@example.com');
    });

    it('throws UnauthorizedException for an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(await makeUser('correct'));

      await expect(
        service.login({ email: 'alice@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
