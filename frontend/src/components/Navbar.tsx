'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              ShopHub
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <span className="hidden text-sm text-gray-500 sm:block">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
