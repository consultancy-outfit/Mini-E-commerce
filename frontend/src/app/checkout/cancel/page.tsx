import Link from 'next/link';

export const metadata = {
  title: 'Payment Cancelled',
};

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
          <svg
            className="h-10 w-10 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Payment Cancelled
        </h1>
        <p className="mb-8 text-gray-600">
          No worries — your cart is still saved and you can complete your purchase
          whenever you&apos;re ready.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
