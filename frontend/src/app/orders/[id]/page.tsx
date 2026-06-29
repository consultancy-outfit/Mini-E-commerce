'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  type Order,
  type OrderStatus,
  STATUS_LABEL,
  STATUS_CLASSES,
  formatDate,
} from '@/lib/order-utils';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/orders');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token || !id) return;
    setFetching(true);
    apiFetch<Order>(`/orders/${id}`, { token })
      .then(setOrder)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Order not found'),
      )
      .finally(() => setFetching(false));
  }, [token, id]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <p className="mb-4 text-red-700">{error || 'Order not found'}</p>
          <Link
            href="/orders"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-gray-900 transition-colors">
          My Orders
        </Link>
        <span>/</span>
        <span className="font-mono text-gray-900">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CLASSES[order.status as OrderStatus]}`}
        >
          {STATUS_LABEL[order.status as OrderStatus]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Items ({itemCount})
              </h2>
            </div>

            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://placehold.co/64x64/e5e7eb/9ca3af?text=?';
                      }}
                    />
                  </div>
                  <div className="flex flex-1 items-start justify-between min-w-0">
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${item.productId}`}
                        className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.category && (
                        <p className="mt-0.5 text-xs text-gray-400 capitalize">
                          {item.product.category}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity} &times; ${parseFloat(item.priceAtPurchase).toFixed(2)}
                      </p>
                    </div>
                    <p className="ml-4 flex-shrink-0 text-sm font-semibold text-gray-900">
                      $
                      {(
                        parseFloat(item.priceAtPurchase) * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Summary
              </h2>
            </div>
            <div className="space-y-3 px-6 py-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({itemCount})</span>
                <span>${order.total}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Order Info
              </h2>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Order ID</p>
                <p className="font-mono text-gray-700 break-all">{order.id}</p>
              </div>
              {order.stripeSessionId && (
                <div className="pt-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Stripe Session
                  </p>
                  <p className="font-mono text-xs text-gray-500 break-all">
                    {order.stripeSessionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/orders"
            className="block text-center text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
