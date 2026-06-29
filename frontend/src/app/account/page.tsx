'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function AccountPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [loading, user, router]);

  const passwordStrength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][passwordStrength];

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (newPassword !== confirmNew) {
      setPwError('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await apiFetch('/auth/password', {
        method: 'PATCH',
        token: token ?? undefined,
        body: { currentPassword, newPassword },
      });
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">My Profile</span>
      </nav>

      {/* Profile header card */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-6">
          {/* Large avatar */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-extrabold text-white backdrop-blur-sm shadow-lg">
            {user.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{user.email.split('@')[0]}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                user.role === 'ADMIN'
                  ? 'bg-violet-400/30 text-violet-100 border border-violet-300/40'
                  : 'bg-blue-400/30 text-blue-100 border border-blue-300/40'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-sm text-blue-100/80">{user.email}</p>
            <p className="mt-1 text-xs text-blue-200/60">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">

        {/* Account details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Details
          </h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</dt>
              <dd className="mt-0.5">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Member Since</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-800">{memberSince}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account ID</dt>
              <dd className="mt-0.5 font-mono text-xs text-gray-500 break-all">{user.id}</dd>
            </div>
          </dl>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Links
          </h2>

          <div className="space-y-2">
            <Link href="/orders"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">My Orders</p>
                <p className="text-xs text-gray-400">View your order history</p>
              </div>
              <svg className="ml-auto h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href="/shop"
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Browse Store</p>
                <p className="text-xs text-gray-400">Discover new products</p>
              </div>
              <svg className="ml-auto h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {user.role === 'ADMIN' && (
              <Link href="/admin"
                className="flex items-center gap-3 rounded-xl border border-violet-100 p-3 hover:border-violet-300 hover:bg-violet-50 transition-all group"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0 5.986 5.986 0 00-.454 2.916A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-violet-800 group-hover:text-violet-700">Admin Panel</p>
                  <p className="text-xs text-violet-400">Manage store & orders</p>
                </div>
                <svg className="ml-auto h-4 w-4 text-violet-200 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Change Password
        </h2>

        {pwSuccess && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
            <span className="text-lg">✅</span>
            <p className="text-sm text-green-700 font-medium">Password updated successfully!</p>
          </div>
        )}

        {pwError && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-red-700">{pwError}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid gap-5 sm:grid-cols-3">
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="currentPw">
              Current password
            </label>
            <div className="relative">
              <input
                id="currentPw"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={`${inputCls} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showCurrent ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="newPw">
              New password
            </label>
            <div className="relative">
              <input
                id="newPw"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={`${inputCls} pr-10`}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showNew ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {newPassword && (
              <div className="space-y-1 pt-0.5">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : 'bg-gray-100'}`} />
                  ))}
                </div>
                {strengthLabel && <p className="text-xs text-gray-400">{strengthLabel}</p>}
              </div>
            )}
          </div>

          {/* Confirm new password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="confirmPw">
              Confirm new password
            </label>
            <input
              id="confirmPw"
              type="password"
              autoComplete="new-password"
              required
              value={confirmNew}
              onChange={e => setConfirmNew(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
            {confirmNew && confirmNew !== newPassword && (
              <p className="text-xs text-red-500">Passwords don&apos;t match</p>
            )}
            {confirmNew && confirmNew === newPassword && confirmNew.length > 0 && (
              <p className="text-xs text-green-600">✓ Passwords match</p>
            )}
          </div>

          {/* Submit */}
          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {pwLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating…
                </>
              ) : (
                <>
                  Update password
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
