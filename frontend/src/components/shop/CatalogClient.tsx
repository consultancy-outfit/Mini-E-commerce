'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition, FormEvent } from 'react';
import ProductCard, { type ProductSummary } from './ProductCard';

interface Meta { total: number; page: number; limit: number; totalPages: number; }
interface Filters {
  search?: string; category?: string; minPrice?: string;
  maxPrice?: string; sortBy?: string; sortOrder?: string; page?: string;
}
interface CatalogClientProps {
  initialProducts: ProductSummary[];
  initialMeta: Meta;
  categories: string[];
  currentFilters: Filters;
}

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc',  label: 'Oldest first' },
  { value: 'price:asc',      label: 'Price: Low → High' },
  { value: 'price:desc',     label: 'Price: High → Low' },
  { value: 'name:asc',       label: 'Name: A–Z' },
  { value: 'name:desc',      label: 'Name: Z–A' },
];

export default function CatalogClient({ initialProducts, initialMeta, categories, currentFilters }: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentFilters.search ?? '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ?? '');

  function buildUrl(updates: Partial<Filters>): string {
    const merged: Filters = { ...currentFilters, ...updates };
    const params = new URLSearchParams();
    if (merged.search)   params.set('search', merged.search);
    if (merged.category) params.set('category', merged.category);
    if (merged.minPrice) params.set('minPrice', merged.minPrice);
    if (merged.maxPrice) params.set('maxPrice', merged.maxPrice);
    if (merged.sortBy)   params.set('sortBy', merged.sortBy);
    if (merged.sortOrder)params.set('sortOrder', merged.sortOrder);
    if (merged.page && merged.page !== '1') params.set('page', merged.page);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(updates: Partial<Filters>) {
    startTransition(() => router.push(buildUrl(updates)));
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    navigate({ search: search.trim() || undefined, page: '1' });
  }

  function handleCategoryToggle(cat: string) {
    navigate({ category: currentFilters.category === cat ? undefined : cat, page: '1' });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [sortBy, sortOrder] = e.target.value.split(':');
    navigate({ sortBy, sortOrder, page: '1' });
  }

  function handlePriceFilter(e: FormEvent) {
    e.preventDefault();
    navigate({ minPrice: minPrice.trim() || undefined, maxPrice: maxPrice.trim() || undefined, page: '1' });
  }

  function clearAll() {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    navigate({ search: undefined, category: undefined, minPrice: undefined, maxPrice: undefined, page: '1' });
  }

  const currentSortValue = `${currentFilters.sortBy ?? 'createdAt'}:${currentFilters.sortOrder ?? 'desc'}`;
  const hasPriceFilter = !!(currentFilters.minPrice || currentFilters.maxPrice);
  const hasAnyFilter = !!(currentFilters.search || currentFilters.category || hasPriceFilter);

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* ── Page header ── */}
      <div className="mb-8 anim-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {currentFilters.category ?? 'All Products'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {initialMeta.total} product{initialMeta.total !== 1 ? 's' : ''} found
              {currentFilters.search && <> for &ldquo;<span className="font-semibold text-gray-800">{currentFilters.search}</span>&rdquo;</>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasAnyFilter && (
              <button
                onClick={clearAll}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              >
                ✕ Clear all
              </button>
            )}
            <select
              value={currentSortValue}
              onChange={handleSortChange}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        {hasAnyFilter && (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentFilters.search && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Search: {currentFilters.search}
                <button onClick={() => { setSearch(''); navigate({ search: undefined, page: '1' }); }} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {currentFilters.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                {currentFilters.category}
                <button onClick={() => navigate({ category: undefined, page: '1' })} className="hover:text-violet-900">✕</button>
              </span>
            )}
            {hasPriceFilter && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                ${currentFilters.minPrice || '0'} – ${currentFilters.maxPrice || '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); navigate({ minPrice: undefined, maxPrice: undefined, page: '1' }); }} className="hover:text-emerald-900">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar ── */}
        <aside className="hidden w-60 shrink-0 space-y-6 lg:block">

          {/* Search */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Search</p>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Category</p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all ${
                      currentFilters.category === cat
                        ? 'bg-blue-600 font-semibold text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat}</span>
                    {currentFilters.category === cat && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price range */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Price Range</p>
            <form onSubmit={handlePriceFilter} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                  <input
                    type="number" placeholder="Min" value={minPrice} min="0" step="0.01"
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-6 pr-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                  <input
                    type="number" placeholder="Max" value={maxPrice} min="0" step="0.01"
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-6 pr-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
                Apply filter
              </button>
              {hasPriceFilter && (
                <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); navigate({ minPrice: undefined, maxPrice: undefined, page: '1' }); }}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ✕ Clear price filter
                </button>
              )}
            </form>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0">
          {isPending && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-xs font-medium text-blue-600">Updating results…</span>
            </div>
          )}

          {initialProducts.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
              <span className="text-4xl">🔍</span>
              <p className="text-gray-500 font-medium">No products match your filters.</p>
              <button onClick={clearAll} className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {initialProducts.map((product, i) => (
                <div key={product.id} className={`anim-fade-up d-${Math.min(i * 75, 600)}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {initialMeta.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => navigate({ page: String(initialMeta.page - 1) })}
                disabled={initialMeta.page <= 1}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(initialMeta.totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  const isCurrent = page === initialMeta.page;
                  return (
                    <button
                      key={page}
                      onClick={() => navigate({ page: String(page) })}
                      className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => navigate({ page: String(initialMeta.page + 1) })}
                disabled={initialMeta.page >= initialMeta.totalPages}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
