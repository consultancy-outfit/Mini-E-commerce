'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][passwordStrength];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(email, password);
      router.push('/shop');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div
        className="relative hidden w-1/2 flex-col overflow-hidden lg:flex"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-800/80 to-blue-900/85" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="anim-fade-in">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Shop<span className="text-indigo-300">Hub</span>
            </span>
          </div>

          {/* Main copy */}
          <div className="space-y-6">
            <div className="anim-fade-up d-150">
              <span className="inline-block rounded-full bg-indigo-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-200">
                Join for free today
              </span>
            </div>
            <h2 className="anim-fade-up d-225 text-4xl font-extrabold leading-tight text-white">
              Discover products<br />
              <span style={{
                background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 55%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                you&apos;ll love.
              </span>
            </h2>
            <p className="anim-fade-up d-300 text-lg text-indigo-100/80 max-w-xs">
              Create your free account and unlock exclusive deals, fast checkout, and personalised recommendations.
            </p>

            {/* Perks */}
            <div className="anim-fade-up d-375 space-y-3 pt-2">
              {[
                { icon: '🎁', text: 'Free shipping on your first order' },
                { icon: '🏷️', text: 'Exclusive member-only discounts' },
                { icon: '📦', text: 'Real-time order tracking' },
                { icon: '🔄', text: '30-day hassle-free returns' },
              ].map((perk) => (
                <div key={perk.text} className="flex items-center gap-3">
                  <span className="text-xl">{perk.icon}</span>
                  <span className="text-sm text-white/80">{perk.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="anim-fade-up d-450 grid grid-cols-3 gap-4">
            {[
              { val: '22+', label: 'Products' },
              { val: '4.9★', label: 'Rating' },
              { val: '100%', label: 'Secure' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center">
                <p className="text-xl font-extrabold text-white">{s.val}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="anim-float pointer-events-none absolute right-8 top-20 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="anim-float-b pointer-events-none absolute bottom-24 left-4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* ── Right panel: form ──────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="mb-6 lg:hidden text-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-600">ShopHub</Link>
          </div>

          <div className="anim-fade-up mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Create account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Already have one?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="anim-scale-pop mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Min. 8 chars, uppercase, number"
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

              {/* Password strength meter */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength ? strengthColor : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  {strengthLabel && (
                    <p className="text-xs text-gray-400">{strengthLabel} password</p>
                  )}
                </div>
              )}
            </div>

            <div className="anim-fade-up d-225 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500">Passwords don&apos;t match</p>
              )}
              {confirm && confirm === password && confirm.length > 0 && (
                <p className="text-xs text-green-600">✓ Passwords match</p>
              )}
            </div>

            <div className="anim-fade-up d-300 pt-1">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create free account
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="anim-fade-up d-375 mt-6 text-center text-xs text-gray-400">
            By creating an account you agree to our{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span> and{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
