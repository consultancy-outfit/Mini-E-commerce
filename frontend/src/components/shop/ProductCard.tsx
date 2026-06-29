'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export interface ProductSummary {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: string;
  stock: number;
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { user } = useAuth();
  const { addItem, loading: cartLoading } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const price = parseFloat(String(product.price)).toFixed(2);
  const inStock = product.stock > 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/auth/register');
      return;
    }
    if (!inStock || adding || cartLoading) return;
    setAdding(true);
    try {
      await addItem(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch {
      // silently fail on card — detail page shows the error
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link
        href={`/shop/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(
                product.name.slice(0, 14),
              )}`;
          }}
        />
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
          {product.category}
        </p>
        <Link href={`/shop/${product.id}`} className="flex-1">
          <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-gray-900">${price}</p>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding || cartLoading}
            title={!user ? 'Sign up to add to cart' : !inStock ? 'Out of stock' : 'Add to cart'}
            aria-label="Add to cart"
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
              added
                ? 'bg-green-500 scale-95'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
            }`}
          >
            {added ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : adding ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
