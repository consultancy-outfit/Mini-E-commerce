import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { SortBy, SortOrder } from './dto/query-products.dto';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: { toString: () => '79.99' },
    imageUrl: 'https://example.com/headphones.jpg',
    category: 'Electronics',
    stock: 50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

const prismaMock = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('returns paginated products with Decimal price serialized to string', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);
      prismaMock.product.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 12,
        sortBy: SortBy.NEWEST,
        sortOrder: SortOrder.DESC,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBe('79.99');
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 12, totalPages: 1 });
    });
  });

  describe('findOne', () => {
    it('returns the product with price as a string', async () => {
      prismaMock.product.findUnique.mockResolvedValue(makeProduct());

      const result = await service.findOne('prod-1');

      expect(result.id).toBe('prod-1');
      expect(result.price).toBe('79.99');
    });

    it('throws NotFoundException for an unknown product id', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSuggestions', () => {
    it('returns up to 4 co-purchased products in co-occurrence order', async () => {
      prismaMock.product.findUnique.mockResolvedValue(
        makeProduct({ category: 'Electronics' }),
      );
      prismaMock.orderItem.findMany.mockResolvedValue([
        { orderId: 'order-1' },
        { orderId: 'order-2' },
      ]);
      // groupBy returns 4 co-purchased products — fills LIMIT, no fallback needed
      prismaMock.orderItem.groupBy.mockResolvedValue([
        { productId: 'prod-2', _count: { productId: 8 } },
        { productId: 'prod-3', _count: { productId: 5 } },
        { productId: 'prod-4', _count: { productId: 3 } },
        { productId: 'prod-5', _count: { productId: 1 } },
      ]);
      prismaMock.product.findMany.mockResolvedValue([
        makeProduct({ id: 'prod-3', name: 'Earbuds' }),
        makeProduct({ id: 'prod-5', name: 'Cable' }),
        makeProduct({ id: 'prod-2', name: 'Speaker' }),
        makeProduct({ id: 'prod-4', name: 'Stand' }),
      ]);

      const result = await service.getSuggestions('prod-1');

      expect(result).toHaveLength(4);
      // Co-occurrence order preserved: prod-2 (8) → prod-3 (5) → prod-4 (3) → prod-5 (1)
      expect(result[0].id).toBe('prod-2');
      expect(result[1].id).toBe('prod-3');
    });

    it('falls back to same-category products when no purchase history exists', async () => {
      prismaMock.product.findUnique.mockResolvedValue(
        makeProduct({ category: 'Electronics' }),
      );
      prismaMock.orderItem.findMany.mockResolvedValue([]); // no orders
      // product.findMany: first call = same-category fallback, second = full details
      prismaMock.product.findMany
        .mockResolvedValueOnce([makeProduct({ id: 'prod-9', name: 'Fallback A' })])
        .mockResolvedValueOnce([makeProduct({ id: 'prod-9', name: 'Fallback A' })]);

      const result = await service.getSuggestions('prod-1');

      expect(prismaMock.orderItem.groupBy).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prod-9');
    });

    it('throws NotFoundException for an unknown product id', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(service.getSuggestions('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
