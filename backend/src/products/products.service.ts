import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductsDto, SortBy, SortOrder } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = SortBy.NEWEST,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 12,
    } = query;

    const where: Record<string, unknown> = {};

    if (search?.trim()) {
      where['OR'] = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (category?.trim()) {
      where['category'] = { equals: category.trim(), mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter['gte'] = minPrice;
      if (maxPrice !== undefined) priceFilter['lte'] = maxPrice;
      where['price'] = priceFilter;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.prisma.product.findMany({
        where: where as any,
        orderBy: { [sortBy]: sortOrder } as any,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: where as any }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getCategories(): Promise<string[]> {
    const rows = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  }

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: dto });
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === 'P2002') {
        throw new ConflictException('A product with that name already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
  }

  async getSuggestions(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const LIMIT = 4;

    // Step 1: find orders that contain this product
    const containing = await this.prisma.orderItem.findMany({
      where: { productId: id },
      select: { orderId: true },
    });
    const orderIds = [...new Set(containing.map((r) => r.orderId))];

    let suggestionIds: string[] = [];

    // Step 2: co-occurrence — other products bought in those same orders
    if (orderIds.length > 0) {
      const coItems = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          orderId: { in: orderIds },
          productId: { not: id },
        },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: LIMIT,
      });
      suggestionIds = coItems.map((r) => r.productId);
    }

    // Step 3: fallback — same-category products to fill remaining slots
    if (suggestionIds.length < LIMIT) {
      const excluded = [id, ...suggestionIds];
      const fallback = await this.prisma.product.findMany({
        where: {
          category: product.category,
          id: { notIn: excluded },
          stock: { gt: 0 },
        },
        take: LIMIT - suggestionIds.length,
        orderBy: { createdAt: 'desc' },
      });
      suggestionIds.push(...fallback.map((p) => p.id));
    }

    if (suggestionIds.length === 0) return [];

    // Fetch full details and preserve suggestion order
    const products = await this.prisma.product.findMany({
      where: { id: { in: suggestionIds } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    return suggestionIds
      .map((sid) => byId.get(sid))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }
}
