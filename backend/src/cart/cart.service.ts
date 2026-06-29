import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async getOrCreateCart(userId: string) {
    const existing = await this.prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId } });
  }

  private async buildCartResponse(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
                category: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!cart) {
      return { id: null, items: [], total: '0.00', itemCount: 0 };
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: { ...item.product, price: item.product.price.toString() },
    }));

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0,
    );

    return {
      id: cart.id,
      items,
      total: total.toFixed(2),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  // ── Public operations ──────────────────────────────────────────────────────

  getCart(userId: string) {
    return this.buildCartResponse(userId);
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const { productId, quantity = 1 } = dto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < 1) throw new BadRequestException('Product is out of stock');

    const cart = await this.getOrCreateCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        throw new BadRequestException(`Only ${product.stock} unit(s) available`);
      }
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      if (quantity > product.stock) {
        throw new BadRequestException(`Only ${product.stock} unit(s) available`);
      }
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.buildCartResponse(userId);
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!item) throw new NotFoundException('Item not in cart');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (product && dto.quantity > product.stock) {
        throw new BadRequestException(`Only ${product.stock} unit(s) available`);
      }
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: dto.quantity },
      });
    }

    return this.buildCartResponse(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    }
    return this.buildCartResponse(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { id: cart?.id ?? null, items: [], total: '0.00', itemCount: 0 };
  }
}
