'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.role === 'ADMIN' ? '/admin' : '/shop');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel: image + brand ──────────────────────── */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-indigo-900/75" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="anim-fade-in">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Shop<span className="text-blue-300">Hub</span>
            </span>
          </div>

          {/* Center copy */}
          <div className="space-y-6">
            <div className="anim-fade-up d-150">
              <span className="inline-block rounded-full bg-blue-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200">
                Welcome back
              </span>
            </div>
            <h2 className="anim-fade-up d-225 text-4xl font-extrabold leading-tight text-white">
              Your style,<br />
              <span className="gradient-text">your story.</span>
            </h2>
            <p className="anim-fade-up d-300 text-lg text-blue-100/80 max-w-xs">
              Thousands of curated products, delivered to your door with care.
            </p>

            {/* Social proof badges */}
            <div className="anim-fade-up d-375 flex flex-wrap gap-3 pt-2">
              {[
                { icon: '⭐', text: '4.9 / 5 rating' },
                { icon: '🛍️', text: '10K+ happy shoppers' },
                { icon: '🔒', text: 'Secure checkout' },
              ].map((b) => (
                <div key={b.text} className="glass flex items-center gap-2 rounded-full px-4 py-2">
                  <span className="text-base">{b.icon}</span>
                  <span className="text-xs font-medium text-white/90">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="anim-fade-up d-450">
            <blockquote className="border-l-2 border-blue-400/50 pl-4">
              <p className="text-sm italic text-white/60">
                "Amazing selection and lightning-fast delivery. ShopHub is my go-to."
              </p>
              <footer className="mt-1 text-xs text-blue-300">— Sarah M., verified buyer</footer>
            </blockquote>
          </div>
        </div>

        {/* Floating decorative orbs */}
        <div className="anim-float pointer-events-none absolute right-12 top-24 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="anim-float-b pointer-events-none absolute bottom-32 left-8 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* ── Right panel: form ──────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden text-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-600">ShopHub</Link>
          </div>

          {/* Header */}
          <div className="anim-fade-up mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="anim-scale-pop mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="anim-fade-up d-75 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div className="anim-fade-up d-150 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="anim-fade-up d-225 pt-1">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="anim-fade-up d-300 relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Social buttons (UI only) */}
          <div className="anim-fade-up d-375 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <svg className="h-4 w-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="anim-fade-up d-450 mt-8 text-center text-xs text-gray-400">
            By signing in you agree to our{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Terms</span> and{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
