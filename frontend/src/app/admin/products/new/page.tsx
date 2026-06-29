import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'New Product',
};

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Add New Product</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <ProductForm />
      </div>
    </div>
  );
}
