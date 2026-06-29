import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
  }

  async createSession(userId: string): Promise<{ url: string }> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.name}"`,
        );
      }
    }

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.product.price * 100),
          product_data: { name: item.product.name },
        },
        quantity: item.quantity,
      })),
      metadata: { userId, cartId: cart.id },
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
    });

    if (!session.url) {
      throw new InternalServerErrorException('Failed to create checkout session');
    }

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err: unknown) {
      this.logger.warn(`Webhook verification failed: ${String(err)}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;

    if (!userId || !cartId) return;

    // Idempotency: skip if order already created for this session
    const existing = await this.prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (existing) return;

    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });

    if (cartItems.length === 0) return;

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          userId,
          status: 'PROCESSING',
          total,
          stripeSessionId: session.id,
          stripePaymentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId } });
    });
  }
}
