import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      total: order.total.toString(),
      items: order.items.map((item) => ({
        ...item,
        priceAtPurchase: item.priceAtPurchase.toString(),
      })),
    }));
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, category: true },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      ...order,
      total: order.total.toString(),
      items: order.items.map((item) => ({
        ...item,
        priceAtPurchase: item.priceAtPurchase.toString(),
      })),
    };
  }
}
