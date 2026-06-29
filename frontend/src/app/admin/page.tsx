'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  type OrderStatus,
  STATUS_LABEL,
  STATUS_CLASSES,
  formatDate,
} from '@/lib/order-utils';

interface AnalyticsData {
  totalRevenue: string;
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
  topProducts: { productId: string; name: string; totalSold: number }[];
  recentOrders: {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    user: { email: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#6366f1',
  DELIVERED: '#22c55e',
  CANCELLED: '#f87171',
};

function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-around gap-2 h-36 pt-4">
      {data.map(({ label, value, color }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-semibold text-gray-600">{value}</span>
          <div
            style={{
              height: `${Math.max((value / max) * 100, 4)}%`,
              backgroundColor: color,
            }}
            className="w-full rounded-t-md transition-all duration-500 min-h-1"
          />
          <span className="text-[10px] text-gray-500 text-center leading-tight">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<AnalyticsData>('/admin/analytics', { token })
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load analytics'),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
        {error || 'Failed to load'}
      </div>
    );
  }

  const chartData = data.ordersByStatus.map((o) => ({
    label: STATUS_LABEL[o.status as OrderStatus] ?? o.status,
    value: o.count,
    color: STATUS_COLORS[o.status] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${parseFloat(data.totalRevenue).toFixed(2)}`}
          sub="Excluding cancelled orders"
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={String(data.totalOrders)}
          sub="All time"
          color="indigo"
        />
        <StatCard
          title="Top Product"
          value={data.topProducts[0]?.name ?? '—'}
          sub={
            data.topProducts[0]
              ? `${data.topProducts[0].totalSold} units sold`
              : 'No sales yet'
          }
          color="green"
        />
        <StatCard
          title="Delivered Orders"
          value={String(
            data.ordersByStatus.find((o) => o.status === 'DELIVERED')?.count ?? 0,
          )}
          sub="Successfully fulfilled"
          color="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by status chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Orders by Status
          </h2>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No orders yet</p>
          ) : (
            <BarChart data={chartData} />
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Top Selling Products
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No sales yet</p>
          ) : (
            <ol className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-gray-800">
                    {p.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    {p.totalSold} sold
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Order</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Total</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="max-w-[160px] truncate px-6 py-3 text-gray-700">
                      {order.user.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[order.status as OrderStatus]}`}
                      >
                        {STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      ${order.total}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: 'blue' | 'indigo' | 'green' | 'emerald';
}) {
  const ring: Record<string, string> = {
    blue: 'ring-blue-100',
    indigo: 'ring-indigo-100',
    green: 'ring-green-100',
    emerald: 'ring-emerald-100',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${ring[color]}`}
    >
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className={`mt-1 truncate text-2xl font-bold ${text[color]}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}
