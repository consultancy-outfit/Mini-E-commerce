'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: string;
}

interface ProductFormProps {
  productId?: string;
  initial?: Partial<ProductFormData>;
}

const EMPTY: ProductFormData = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: '',
  stock: '',
};

export default function ProductForm({ productId, initial }: ProductFormProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(productId);

  function set(field: keyof ProductFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError('');

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      imageUrl: form.imageUrl.trim(),
      category: form.category.trim(),
      stock: parseInt(form.stock, 10),
    };

    try {
      await apiFetch(isEdit ? `/products/${productId}` : '/products', {
        method: isEdit ? 'PATCH' : 'POST',
        body,
        token,
      });
      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product Name" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Wireless Headphones"
          />
        </Field>

        <Field label="Category" required>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Electronics"
          />
        </Field>

        <Field label="Price (USD)" required>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="29.99"
          />
        </Field>

        <Field label="Stock" required>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            required
            min="0"
            step="1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="100"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Image URL" required>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="A detailed description of the product..."
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
