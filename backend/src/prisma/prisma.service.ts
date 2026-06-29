import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  get user() { return this.client.user; }
  get product() { return this.client.product; }
  get cart() { return this.client.cart; }
  get cartItem() { return this.client.cartItem; }
  get order() { return this.client.order; }
  get orderItem() { return this.client.orderItem; }

  get $transaction() { return this.client.$transaction.bind(this.client); }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
