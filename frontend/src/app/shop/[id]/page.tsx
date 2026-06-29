import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ProductCard, { type ProductSummary } from '@/components/shop/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE}/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchSuggestions(id: string): Promise<ProductSummary[]> {
  try {
    const res = await fetch(`${BASE}/products/${id}/suggestions`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, suggestions] = await Promise.all([
    fetchProduct(id),
    fetchSuggestions(id),
  ]);

  if (!product) notFound();

  const price = parseFloat(product.price).toFixed(2);
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/shop" className="hover:text-gray-900">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{product.category}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-gray-100 aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <p className="mt-4 text-4xl font-bold text-gray-900">${price}</p>

          <div className="mt-3 flex items-center gap-2">
            {inStock ? (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  In stock ({product.stock} available)
                </span>
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                <span className="text-sm font-medium text-red-600">Out of stock</span>
              </>
            )}
          </div>

          <p className="mt-6 text-base leading-relaxed text-gray-600">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton productId={product.id} inStock={inStock} />
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <Link
              href="/shop"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to products
            </Link>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {suggestions.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {suggestions.map((s) => (
              <ProductCard key={s.id} product={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
