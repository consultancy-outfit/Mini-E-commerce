'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart, openCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const isActive = (href: string) =>
    pathname === href ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900';

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-extrabold shadow-sm shadow-blue-200">
              S
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              Shop<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          {/* ── Nav links ── */}
          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/shop"
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/shop')}`}
            >
              Products
            </Link>
            {user && (
              <Link
                href="/orders"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${isActive('/orders')}`}
              >
                My Orders
              </Link>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">

            {/* Search icon (decorative — links to shop) */}
            <Link
              href="/shop"
              className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors sm:flex"
              aria-label="Search products"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label={`Open cart${cart.itemCount > 0 ? ` (${cart.itemCount} items)` : ''}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white shadow">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </button>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  {/* Admin pill */}
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="hidden rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors sm:inline-flex items-center gap-1"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0 5.986 5.986 0 00-.454 2.916A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Admin
                    </Link>
                  )}

                  {/* User avatar */}
                  <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 sm:flex flex-shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors sm:block"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-500 hover:-translate-y-px hover:shadow-md transition-all"
                  >
                    Get started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
