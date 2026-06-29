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
  } catch { return []; }
}

const CATEGORIES = [
  {
    name: 'Electronics',
    icon: '💻',
    desc: 'Laptops, phones & gadgets',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    color: 'from-blue-600/80 to-blue-900/90',
  },
  {
    name: 'Clothing',
    icon: '👗',
    desc: 'Fashion & accessories',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    color: 'from-violet-600/80 to-violet-900/90',
  },
  {
    name: 'Books',
    icon: '📚',
    desc: 'Learn & be inspired',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    color: 'from-amber-600/80 to-amber-900/90',
  },
  {
    name: 'Home & Garden',
    icon: '🏡',
    desc: 'Make your space perfect',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    color: 'from-emerald-600/80 to-emerald-900/90',
  },
];

const BADGES = [
  { icon: '🚚', title: 'Free Shipping', sub: 'On all orders over $49' },
  { icon: '🔄', title: '30-Day Returns', sub: 'Hassle-free guarantee' },
  { icon: '🔒', title: 'Secure Payment', sub: 'SSL encrypted checkout' },
  { icon: '🎧', title: '24/7 Support', sub: 'We\'re always here' },
];

export default async function HomePage() {
  const products = await fetchFeaturedProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 80%, #2563eb 100%)',
        }}>
          {/* Dot grid overlay */}
          <div className="hero-dots absolute inset-0 pointer-events-none" />

          {/* Glowing orbs */}
          <div className="anim-float pointer-events-none absolute -top-20 right-40 h-80 w-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
          <div className="anim-float-b pointer-events-none absolute bottom-10 -left-20 h-72 w-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
          <div className="pointer-events-none absolute top-1/2 right-1/4 h-96 w-96 -translate-y-1/2 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />

          <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left: copy */}
              <div>
                <div className="anim-fade-up">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                    New arrivals every week
                  </span>
                </div>

                <h1 className="anim-fade-up d-150 mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Shop Smarter,<br />
                  <span className="gradient-text">Live Better.</span>
                </h1>

                <p className="anim-fade-up d-225 mt-6 max-w-lg text-lg text-blue-100/75 leading-relaxed">
                  Discover thousands of curated products — from cutting-edge electronics to timeless fashion — all in one beautiful store.
                </p>

                <div className="anim-fade-up d-300 mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-blue-700 shadow-lg shadow-blue-900/30 transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-0.5"
                  >
                    Shop Now
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/25 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40"
                  >
                    Create Free Account
                  </Link>
                </div>

                {/* Quick stats */}
                <div className="anim-fade-up d-375 mt-10 flex items-center gap-6">
                  {[
                    { val: '22+', label: 'Products' },
                    { val: '4.9★', label: 'Rating' },
                    { val: 'Free', label: 'Shipping $49+' },
                  ].map((s, i) => (
                    <div key={s.label} className={`${i > 0 ? 'border-l border-white/20 pl-6' : ''}`}>
                      <p className="text-xl font-extrabold text-white">{s.val}</p>
                      <p className="text-xs text-blue-200/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: floating product cards */}
              <div className="relative hidden lg:block h-80">
                {/* Card 1 */}
                <div className="anim-float absolute right-0 top-0 glass rounded-2xl p-4 shadow-2xl w-52">
                  <div className="mb-3 h-24 w-full rounded-xl overflow-hidden bg-blue-500/20">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80"
                      alt="Product" className="h-full w-full object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-white/70">Electronics</p>
                  <p className="text-sm font-bold text-white">Premium Headphones</p>
                  <p className="mt-1 text-lg font-extrabold text-blue-300">$89.99</p>
                </div>
                {/* Card 2 */}
                <div className="anim-float-b absolute bottom-0 right-16 glass rounded-2xl p-4 shadow-2xl w-48">
                  <div className="mb-3 h-20 w-full rounded-xl overflow-hidden bg-purple-500/20">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"
                      alt="Product" className="h-full w-full object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-white/70">Footwear</p>
                  <p className="text-sm font-bold text-white">Sport Runners</p>
                  <p className="mt-1 text-base font-extrabold text-blue-300">$129.00</p>
                </div>
                {/* Badge */}
                <div className="anim-scale-pop d-600 absolute left-0 top-8 glass rounded-2xl px-5 py-3.5 shadow-xl">
                  <p className="text-xs text-white/60">Trending today</p>
                  <p className="mt-0.5 text-sm font-bold text-white">🔥 +127 sold</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust badges ──────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
              {BADGES.map((b, i) => (
                <div
                  key={b.title}
                  className={`anim-fade-up flex items-center gap-4 px-6 py-5 d-${i * 75 + 75}`}
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    {b.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="anim-fade-up mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Explore</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/shop" className="hidden text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors sm:block">
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className={`lift anim-fade-up d-${i * 75 + 75} group relative overflow-hidden rounded-2xl shadow-md`}
                style={{ minHeight: '200px' }}
              >
                {/* Background image */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color}`} />
                {/* Content */}
                <div className="relative flex h-full flex-col justify-end p-5">
                  <span className="mb-1 text-3xl">{cat.icon}</span>
                  <p className="text-base font-bold text-white leading-tight">{cat.name}</p>
                  <p className="text-xs text-white/70">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:gap-2 transition-all">
                    Browse <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="anim-fade-up mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Hand-picked</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900">Featured Products</h2>
            </div>
            <Link href="/shop" className="hidden text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors sm:block">
              View all →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <div className="text-center">
                <p className="text-4xl">🛍️</p>
                <p className="mt-2 text-sm text-gray-400">Products loading — make sure the backend is running.</p>
                <Link href="/shop" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
                  Go to shop →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <div key={p.id} className={`anim-fade-up d-${Math.min(i * 75, 600)}`}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Newsletter / CTA banner ───────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div
            className="anim-fade-up relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #7c3aed 100%)' }}
          >
            <div className="hero-dots absolute inset-0 pointer-events-none opacity-50" />
            <div className="anim-float pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #a5b4fc, transparent)' }} />
            <div className="anim-float-b pointer-events-none absolute -bottom-8 -left-8 h-52 w-52 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">Limited time</p>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Ready to start shopping?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-blue-100/80">
                Join thousands of happy customers. Create a free account and get free shipping on your first order.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Create Free Account →
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-4">
            <div className="sm:col-span-1">
              <Link href="/" className="text-xl font-extrabold text-blue-600">ShopHub</Link>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                Your one-stop destination for curated products at unbeatable prices.
              </p>
            </div>
            {[
              { title: 'Shop', links: [{ label: 'All Products', href: '/shop' }, { label: 'Electronics', href: '/shop?category=Electronics' }, { label: 'Clothing', href: '/shop?category=Clothing' }] },
              { title: 'Account', links: [{ label: 'Sign In', href: '/auth/login' }, { label: 'Register', href: '/auth/register' }, { label: 'My Orders', href: '/orders' }] },
              { title: 'Support', links: [{ label: 'Contact Us', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Privacy Policy', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-gray-400">© 2026 ShopHub. All rights reserved.</p>
            <p className="text-xs text-gray-400">Built with ❤️ for great shopping experiences</p>
          </div>
        </div>
      </footer>
    </>
  );
}
