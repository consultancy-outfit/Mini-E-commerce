import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'My Profile — ShopHub',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
