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
  const [wishlist, setWishlist] = useState(false);

  const price = parseFloat(String(product.price)).toFixed(2);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/auth/register'); return; }
    if (!inStock || adding || cartLoading) return;
    setAdding(true);
    try {
      await addItem(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch { /* silently fail — detail page shows error */ }
    finally { setAdding(false); }
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(v => !v);
  }

  return (
    <div className="lift group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* ── Image ── */}
      <Link
        href={`/shop/${product.id}`}
        className="relative block overflow-hidden bg-gray-50"
        style={{ aspectRatio: '1' }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transition: 'transform 0.5s cubic-bezier(.25,.46,.45,.94)' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(product.name.slice(0, 12))}`;
          }}
        />

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-gray-700 shadow">
              Out of stock
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {lowStock && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              Only {product.stock} left!
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200
            ${wishlist
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:scale-110'
            }`}
          aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg className="h-4 w-4" fill={wishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick-view label on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 py-2 text-center text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
          Quick view
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              {product.category}
            </span>
            <Link href={`/shop/${product.id}`} className="block">
              <h3 className="mt-0.5 text-sm font-bold leading-snug text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        <p className="mt-1.5 line-clamp-1 text-xs text-gray-400 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold text-gray-900">${price}</p>
            {inStock ? (
              <p className="text-[10px] text-green-600 font-medium">{lowStock ? `⚡ ${product.stock} in stock` : '✓ In stock'}</p>
            ) : (
              <p className="text-[10px] text-red-500 font-medium">✗ Out of stock</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding || cartLoading}
            title={!user ? 'Sign up to add to cart' : !inStock ? 'Out of stock' : 'Add to cart'}
            aria-label="Add to cart"
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all duration-200 active:scale-90
              ${added
                ? 'bg-green-500 shadow-green-200'
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed'
              }`}
          >
            {added ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : adding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
