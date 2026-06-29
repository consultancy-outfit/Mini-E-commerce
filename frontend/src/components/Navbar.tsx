'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart, openCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    router.push('/');
  }

  const isActive = (href: string) =>
    pathname === href ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900';

  const initials = user?.email.charAt(0).toUpperCase() ?? '?';

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

            {/* Search icon */}
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
                /* ── Authenticated: avatar button + dropdown ── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1 pl-1 pr-2.5 shadow-sm hover:border-gray-300 hover:shadow transition-all"
                    aria-label="Open account menu"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <span className="hidden text-sm font-medium text-gray-700 sm:block max-w-[90px] truncate">
                      {user.email.split('@')[0]}
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 z-50">

                      {/* User header */}
                      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.email}</p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mt-0.5 ${
                            user.role === 'ADMIN'
                              ? 'bg-violet-50 text-violet-700 border border-violet-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                          </span>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        <Link
                          href="/account"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </span>
                          <span className="font-medium">My Orders</span>
                        </Link>

                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-violet-700 hover:bg-violet-50 transition-colors"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0 5.986 5.986 0 00-.454 2.916A5 5 0 0010 11z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="font-semibold">Admin Panel</span>
                          </Link>
                        )}

                        <div className="my-1.5 border-t border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </span>
                          <span className="font-medium">Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
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
