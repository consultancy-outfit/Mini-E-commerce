'use client';

interface AddToCartButtonProps {
  productId: string;
  inStock: boolean;
}

export default function AddToCartButton({ inStock }: AddToCartButtonProps) {
  return (
    <button
      disabled={!inStock}
      className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      {inStock ? 'Add to Cart' : 'Out of Stock'}
    </button>
  );
}
