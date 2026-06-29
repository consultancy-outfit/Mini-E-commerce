'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: { name: string; imageUrl: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { token } = useAuth();
  const { refreshCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (!sessionId || !token || called.current) return;
    called.current = true;

    apiFetch<Order>('/checkout/confirm', {
      method: 'POST',
      token,
      body: { sessionId },
    })
      .then((ord) => {
        setOrder(ord);
        refreshCart(); // Reset cart badge to 0
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not confirm order');
      })
      .finally(() => setLoading(false));
  }, [sessionId, token, refreshCart]);

  if (!sessionId) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">No session found. <Link href="/shop" className="text-blue-600 hover:underline">Go shopping</Link></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Confirming your order…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-red-50 border border-red-200 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-red-700">Something went wrong</h1>
          <p className="mb-6 text-sm text-red-600">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/orders" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              Check My Orders
            </Link>
            <Link href="/shop" className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-gray-500">
          Thank you for your purchase. Your order is being processed.
        </p>
        <p className="mt-1 font-mono text-sm text-gray-400">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Order summary card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-800">
            Order Summary — {itemCount} item{itemCount !== 1 ? 's' : ''}
          </h2>
        </div>

        <ul className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://placehold.co/56x56/e5e7eb/9ca3af?text=?';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.priceAtPurchase.toFixed(2)}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ${(item.priceAtPurchase * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-8 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-5 py-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-blue-700">
          Status: <span className="font-semibold">Processing</span> — You&apos;ll receive a confirmation email from Stripe shortly.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/orders"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 transition-all hover:-translate-y-0.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
