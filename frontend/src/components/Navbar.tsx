'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart, openCart } = useCart();
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

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label={`Open cart${cart.itemCount > 0 ? ` (${cart.itemCount} items)` : ''}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cart.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </button>

            {!loading && (
              user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <span className="hidden text-sm text-gray-500 sm:block max-w-[160px] truncate">
                    {user.email}
                  </span>
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
