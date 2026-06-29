'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▤' },
  { href: '/admin/products', label: 'Products', icon: '◫' },
  { href: '/admin/orders', label: 'Orders', icon: '◻' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 text-white">
        <div className="border-b border-gray-700 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Admin
          </p>
          <p className="mt-0.5 text-base font-bold text-white">ShopHub</p>
        </div>

        <nav className="mt-2 space-y-0.5 px-2 py-3">
          {NAV.map(({ href, label, icon }) => {
            const active =
              href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-56 border-t border-gray-700 px-4 py-4">
          <Link
            href="/shop"
            className="block text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm font-medium text-gray-600">
            {NAV.find((n) =>
              n.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(n.href),
            )?.label ?? 'Admin'}
          </span>
          <span className="text-xs text-gray-400">{user.email}</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
