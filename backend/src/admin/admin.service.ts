import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      itemCount: o._count.items,
    }));
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async getAnalytics() {
    const [revenueResult, totalOrders, ordersByStatus, topProductItems, recentOrders] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: { status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        this.prisma.order.count(),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
        this.prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { email: true } } },
        }),
      ]);

    const productIds = topProductItems.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const topProducts = topProductItems.map((item) => ({
      productId: item.productId,
      name: products.find((p) => p.id === item.productId)?.name ?? 'Unknown',
      totalSold: item._sum.quantity ?? 0,
    }));

    return {
      totalRevenue: revenueResult._sum.total ?? 0,
      totalOrders,
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count._all,
      })),
      topProducts,
      recentOrders,
    };
  }
}
