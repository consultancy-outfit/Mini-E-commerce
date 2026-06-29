import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductsDto, SortBy, SortOrder } from './dto/query-products.dto';

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
      data: products.map((p) => ({ ...p, price: p.price.toString() })),
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
    return { ...product, price: product.price.toString() };
  }

  async getCategories(): Promise<string[]> {
    const rows = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  }
}
