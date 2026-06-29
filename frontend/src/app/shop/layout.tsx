import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <Link href="/" className="text-lg font-bold text-blue-600">ShopHub</Link>
            <p className="text-xs text-gray-400">© 2026 ShopHub. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-900">Home</Link>
              <Link href="/orders" className="text-xs text-gray-500 hover:text-gray-900">My Orders</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
