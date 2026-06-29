import Link from 'next/link';

export const metadata = {
  title: 'Order Confirmed',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Order Confirmed!
        </h1>
        <p className="mb-1 text-gray-600">
          Thank you for your purchase. Your order is being processed.
        </p>
        <p className="mb-8 text-sm text-gray-500">
          You will receive a confirmation email from Stripe shortly.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            View My Orders
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
