'use client';

import Link from 'next/link';

export interface ProductSummary {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: number;
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(product.name.slice(0, 12))}`;
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800">
              Out of stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          {product.category}
        </p>
        <h3 className="flex-1 text-sm font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-gray-900">
          ${parseFloat(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
