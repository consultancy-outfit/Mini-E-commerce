'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  type Order,
  type OrderStatus,
  STATUS_LABEL,
  STATUS_CLASSES,
  formatDate,
} from '@/lib/order-utils';

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/orders');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    apiFetch<Order[]>('/orders', { token })
      .then(setOrders)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load orders'),
      )
      .finally(() => setFetching(false));
  }, [token]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      {fetching ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-gray-200">
          <p className="mb-4 text-gray-500">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-blue-300 transition-all"
                >
                  <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[order.status as OrderStatus]}`}
                        >
                          {STATUS_LABEL[order.status as OrderStatus]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} &middot; {itemCount} item
                        {itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      {/* Product thumbnails */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-100 ring-1 ring-gray-200"
                          >
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://placehold.co/40x40/e5e7eb/9ca3af?text=?';
                              }}
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">
                          ${order.total}
                        </p>
                        <p className="text-xs text-gray-400">View details →</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
