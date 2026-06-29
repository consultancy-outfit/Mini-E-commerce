'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition, FormEvent } from 'react';
import ProductCard, { type ProductSummary } from './ProductCard';

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
}

interface CatalogClientProps {
  initialProducts: ProductSummary[];
  initialMeta: Meta;
  categories: string[];
  currentFilters: Filters;
}

export default function CatalogClient({
  initialProducts,
  initialMeta,
  categories,
  currentFilters,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentFilters.search ?? '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ?? '');

  function buildUrl(updates: Partial<Filters>): string {
    const merged: Filters = { ...currentFilters, ...updates };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.category) params.set('category', merged.category);
    if (merged.minPrice) params.set('minPrice', merged.minPrice);
    if (merged.maxPrice) params.set('maxPrice', merged.maxPrice);
    if (merged.sortBy) params.set('sortBy', merged.sortBy);
    if (merged.sortOrder) params.set('sortOrder', merged.sortOrder);
    if (merged.page && merged.page !== '1') params.set('page', merged.page);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(updates: Partial<Filters>) {
    startTransition(() => {
      router.push(buildUrl(updates));
    });
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    navigate({ search: search.trim() || undefined, page: '1' });
  }

  function handleCategoryToggle(cat: string) {
    const isSame = currentFilters.category === cat;
    navigate({ category: isSame ? undefined : cat, page: '1' });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [sortBy, sortOrder] = e.target.value.split(':');
    navigate({ sortBy, sortOrder, page: '1' });
  }

  function handlePriceFilter(e: FormEvent) {
    e.preventDefault();
    navigate({
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined,
      page: '1',
    });
  }

  function clearPriceFilter() {
    setMinPrice('');
    setMaxPrice('');
    navigate({ minPrice: undefined, maxPrice: undefined, page: '1' });
  }

  const currentSortValue = `${currentFilters.sortBy ?? 'createdAt'}:${currentFilters.sortOrder ?? 'desc'}`;
  const hasPriceFilter = !!(currentFilters.minPrice || currentFilters.maxPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Products
          <span className="ml-2 text-base font-normal text-gray-500">
            {initialMeta.total} item{initialMeta.total !== 1 ? 's' : ''}
          </span>
        </h1>

        <select
          value={currentSortValue}
          onChange={handleSortChange}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
          <option value="name:asc">Name: A–Z</option>
          <option value="name:desc">Name: Z–A</option>
        </select>
      </div>

      <div
        className={`flex gap-8 transition-opacity ${isPending ? 'pointer-events-none opacity-50' : ''}`}
      >
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 space-y-6 lg:block">
          {/* Search */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Search
            </p>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Go
              </button>
            </form>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Category
            </p>
            <ul className="space-y-0.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      currentFilters.category === cat
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
              {currentFilters.category && (
                <li>
                  <button
                    onClick={() => navigate({ category: undefined, page: '1' })}
                    className="mt-1 w-full rounded-md px-2 py-1 text-left text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕ Clear category
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Price range */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Price Range
            </p>
            <form onSubmit={handlePriceFilter} className="space-y-2">
              <input
                type="number"
                placeholder="Min $"
                value={minPrice}
                min="0"
                step="0.01"
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max $"
                value={maxPrice}
                min="0"
                step="0.01"
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Apply
              </button>
              {hasPriceFilter && (
                <button
                  type="button"
                  onClick={clearPriceFilter}
                  className="w-full text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕ Clear price filter
                </button>
              )}
            </form>
          </div>
        </aside>

        {/* ── Product grid ─────────────────────────────────────── */}
        <div className="flex-1">
          {initialProducts.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No products match your filters. Try adjusting them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {initialMeta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => navigate({ page: String(initialMeta.page - 1) })}
                disabled={initialMeta.page <= 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {initialMeta.page} of {initialMeta.totalPages}
              </span>
              <button
                onClick={() => navigate({ page: String(initialMeta.page + 1) })}
                disabled={initialMeta.page >= initialMeta.totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
