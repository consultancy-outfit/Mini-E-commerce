import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Checkout',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
