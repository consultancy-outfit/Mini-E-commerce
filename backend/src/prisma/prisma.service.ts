import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(process.env.DATABASE_URL as string);
  return new PrismaClient({ adapter });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }

  // Expose all Prisma model delegates via getters
  get user() { return this.client.user; }
  get product() { return this.client.product; }
  get cart() { return this.client.cart; }
  get cartItem() { return this.client.cartItem; }
  get order() { return this.client.order; }
  get orderItem() { return this.client.orderItem; }

  // Expose transaction and raw query helpers
  get $transaction() { return this.client.$transaction.bind(this.client); }
  get $queryRaw() { return this.client.$queryRaw.bind(this.client); }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
