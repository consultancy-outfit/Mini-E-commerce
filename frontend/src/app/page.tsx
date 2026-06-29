import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard, { type ProductSummary } from '@/components/shop/ProductCard';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchFeaturedProducts(): Promise<ProductSummary[]> {
  try {
    const res = await fetch(
      `${BASE}/products?limit=8&sortBy=createdAt&sortOrder=desc`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', bg: 'from-blue-500 to-blue-600', desc: 'Laptops, phones & more' },
  { name: 'Clothing', icon: '👕', bg: 'from-violet-500 to-violet-600', desc: 'Fashion & accessories' },
  { name: 'Books', icon: '📚', bg: 'from-amber-500 to-amber-600', desc: 'Learn & be inspired' },
  { name: 'Home & Garden', icon: '🏡', bg: 'from-emerald-500 to-emerald-600', desc: 'Make your space perfect' },
];

const BADGES = [
  { icon: '🚚', title: 'Free Shipping', sub: 'On all orders over $49' },
  { icon: '💰', title: 'Money-Back Guarantee', sub: '30-day hassle-free returns' },
  { icon: '🎧', title: '24/7 Online Support', sub: "We're always here to help" },
];

export default async function HomePage() {
  const products = await fetchFeaturedProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-100">
                New arrivals every week
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your one-stop<br />
                <span className="text-blue-200">online store</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-blue-100">
                Discover thousands of products — electronics, fashion, books, and home goods — at prices you&apos;ll love.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
                >
                  Shop Now
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust badges ───────────────────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {BADGES.map((b) => (
                <div key={b.title} className="flex items-center gap-4 px-6 py-5">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category tiles ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              All products →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.bg} p-6 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
              >
                <span className="text-4xl">{cat.icon}</span>
                <p className="mt-3 text-base font-bold leading-tight">{cat.name}</p>
                <p className="mt-1 text-xs text-white/75">{cat.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured products ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              View all →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-gray-100">
              <p className="text-gray-400 text-sm">
                Start the backend and seed the database to see products here.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Go to shop →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="text-xl font-bold text-blue-600">ShopHub</Link>
            <p className="text-sm text-gray-400">© 2026 ShopHub. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/shop" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Shop</Link>
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link href="/auth/register" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
