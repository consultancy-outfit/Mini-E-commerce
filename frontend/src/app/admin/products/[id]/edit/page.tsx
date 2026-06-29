'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: number;
}

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    apiFetch<Product>(`/products/${id}`, { token })
      .then(setProduct)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Product not found'),
      )
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
        {error || 'Product not found'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Edit Product</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <ProductForm
          productId={id}
          initial={{
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            stock: String(product.stock),
          }}
        />
      </div>
    </div>
  );
}
