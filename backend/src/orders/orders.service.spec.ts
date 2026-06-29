import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    userId: 'user-1',
    status: 'PENDING',
    total: { toString: () => '49.98' },
    stripeSessionId: 'cs_test_abc',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        quantity: 2,
        priceAtPurchase: { toString: () => '24.99' },
        product: {
          id: 'prod-1',
          name: 'Wireless Headphones',
          imageUrl: 'https://example.com/img.jpg',
        },
      },
    ],
    ...overrides,
  };
}

const prismaMock = {
  order: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('findAll', () => {
    it('returns orders with Decimal fields serialized to strings', async () => {
      prismaMock.order.findMany.mockResolvedValue([makeOrder()]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].total).toBe('49.98');
      expect(result[0].items[0].priceAtPurchase).toBe('24.99');
    });

    it('returns an empty array when the user has no orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the order with serialized totals', async () => {
      prismaMock.order.findFirst.mockResolvedValue(makeOrder());

      const result = await service.findOne('user-1', 'order-1');

      expect(result.id).toBe('order-1');
      expect(result.total).toBe('49.98');
      expect(result.items[0].priceAtPurchase).toBe('24.99');
    });

    it('throws NotFoundException when the order does not belong to the user', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'other-order')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
