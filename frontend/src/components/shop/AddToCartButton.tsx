'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
  productId: string;
  inStock: boolean;
}

export default function AddToCartButton({ productId, inStock }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addItem, loading } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setError('');
    try {
      await addItem(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not add to cart');
    }
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-gray-200 px-6 py-3.5 text-base font-semibold text-gray-400 cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          added ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {loading ? 'Adding…' : added ? '✓ Added to cart' : 'Add to Cart'}
      </button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
