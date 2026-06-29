'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function CheckoutPage() {
  const { cart, cartReady, openCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (cartReady && user && cart.items.length === 0) {
      router.replace('/shop');
    }
  }, [cartReady, cart.items.length, user, router]);

  async function handlePay() {
    if (!token) return;
    setPaying(true);
    setError('');
    try {
      const { url } = await apiFetch<{ url: string }>(
        '/checkout/create-session',
        { method: 'POST', token },
      );
      window.location.href = url;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Could not start checkout. Please try again.',
      );
      setPaying(false);
    }
  }

  // Loading states
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!cartReady || cart.items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Complete Your Order</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order items — takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Order Items ({cart.itemCount})
              </h2>
            </div>

            <ul className="divide-y divide-gray-100">
              {cart.items.map((item) => (
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
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${item.productId}`}
                        className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Qty: {item.quantity} &times; ${parseFloat(item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="ml-4 flex-shrink-0 text-sm font-semibold text-gray-900">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 px-6 py-3">
              <button
                onClick={openCart}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Edit cart
              </button>
            </div>
          </div>
        </div>

        {/* Order summary — 1 column */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
            </div>

            <div className="space-y-3 px-6 py-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''})</span>
                <span>${cart.total}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${cart.total}</span>
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {paying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Redirecting to Stripe…
                  </span>
                ) : (
                  'Pay with Stripe →'
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Secured by{' '}
                <span className="font-semibold text-gray-500">Stripe</span>
                {' '}· Test mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
