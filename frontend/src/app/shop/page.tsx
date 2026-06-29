import CatalogClient from '@/components/shop/CatalogClient';

interface ShopSearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
}

function getString(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

const EMPTY_PRODUCTS = { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };

async function fetchProducts(filters: ShopSearchParams) {
  try {
    const qs = new URLSearchParams();
    if (filters.search) qs.set('search', filters.search);
    if (filters.category) qs.set('category', filters.category);
    if (filters.minPrice) qs.set('minPrice', filters.minPrice);
    if (filters.maxPrice) qs.set('maxPrice', filters.maxPrice);
    if (filters.sortBy) qs.set('sortBy', filters.sortBy);
    if (filters.sortOrder) qs.set('sortOrder', filters.sortOrder);
    if (filters.page) qs.set('page', filters.page);
    qs.set('limit', '12');

    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${base}/products?${qs.toString()}`);
    if (!res.ok) return EMPTY_PRODUCTS;
    return res.json();
  } catch {
    return EMPTY_PRODUCTS;
  }
}

async function fetchCategories(): Promise<string[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${base}/products/categories`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;

  const filters: ShopSearchParams = {
    search: getString(raw.search),
    category: getString(raw.category),
    minPrice: getString(raw.minPrice),
    maxPrice: getString(raw.maxPrice),
    sortBy: getString(raw.sortBy),
    sortOrder: getString(raw.sortOrder),
    page: getString(raw.page),
  };

  const [productsData, categories] = await Promise.all([
    fetchProducts(filters),
    fetchCategories(),
  ]);

  return (
    <CatalogClient
      initialProducts={productsData.data}
      initialMeta={productsData.meta}
      categories={categories}
      currentFilters={filters}
    />
  );
}
