'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartDrawer() {
  const { cart, isOpen, loading, closeCart, updateItem, removeItem, clearCart } =
    useCart();
  const { user } = useAuth();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Shopping Cart
            {cart.itemCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {cart.itemCount}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className={`flex-1 overflow-y-auto px-5 py-4 transition-opacity ${
            loading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-gray-100 p-5">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-medium text-gray-700">Sign in to view your cart</p>
              <Link
                href="/auth/login"
                onClick={closeCart}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-gray-100 p-5">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-medium text-gray-600">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${item.productId}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateItem(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <span className="text-sm leading-none">−</span>
                        </button>
                        <span className="w-5 text-center text-sm font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <span className="text-sm leading-none">+</span>
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {user && cart.items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Subtotal ({cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''})
              </span>
              <span className="text-lg font-bold text-gray-900">${cart.total}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Proceed to Checkout →
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
