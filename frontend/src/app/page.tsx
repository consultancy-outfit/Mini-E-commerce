import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        ShopHub
      </h1>
      <p className="max-w-md text-lg text-gray-500">
        Mini e-commerce platform — backend &amp; storefront up and running.
      </p>
      <div className="flex gap-4">
        <Link
          href="/shop"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          Browse Products
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </main>
  );
}
