'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  type OrderStatus,
  STATUS_LABEL,
  STATUS_CLASSES,
  formatDate,
} from '@/lib/order-utils';

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

interface AdminOrder {
  id: string;
  status: OrderStatus;
  total: string;
  createdAt: string;
  itemCount: number;
  user: { email: string };
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<AdminOrder[]>('/admin/orders', { token });
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(id: string, status: OrderStatus) {
    if (!token) return;
    setUpdating(id);
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">
        Orders{' '}
        {!loading && (
          <span className="text-sm font-normal text-gray-400">
            ({orders.length})
          </span>
        )}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Items</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-gray-400"
                    >
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-gray-700">
                        {order.user.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.itemCount}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ${order.total}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {updating === order.id ? (
                          <span className="text-xs text-gray-400">
                            Updating…
                          </span>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus,
                              )
                            }
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_CLASSES[order.status]}`}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
