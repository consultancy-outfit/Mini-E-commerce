import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────
  const adminPassword = await hashPassword('Admin123!');
  const customerPassword = await hashPassword('Customer123!');

  const admin =
    (await prisma.user.findUnique({ where: { email: 'admin@shophub.com' } })) ??
    (await prisma.user.create({
      data: { email: 'admin@shophub.com', passwordHash: adminPassword, role: Role.ADMIN },
    }));

  const customer =
    (await prisma.user.findUnique({ where: { email: 'customer@shophub.com' } })) ??
    (await prisma.user.create({
      data: { email: 'customer@shophub.com', passwordHash: customerPassword, role: Role.CUSTOMER },
    }));

  console.log(`✅ Users: admin (${admin.email}), customer (${customer.email})`);

  // ── Products ────────────────────────────────────────────────────────────
  const products = [
    // Electronics
    {
      name: 'ProBook Laptop 15"',
      description:
        'Powerful 15-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD. Perfect for developers and creatives.',
      price: 1299.99,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
      category: 'Electronics',
      stock: 25,
    },
    {
      name: 'NoiseBlock Pro Headphones',
      description:
        'Premium wireless noise-cancelling headphones with 40-hour battery life and studio-quality sound.',
      price: 349.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      category: 'Electronics',
      stock: 60,
    },
    {
      name: 'UltraPhone X12',
      description:
        '6.7-inch AMOLED display, 200MP camera, 5000mAh battery. The smartphone that does it all.',
      price: 899.99,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
      category: 'Electronics',
      stock: 40,
    },
    {
      name: 'SmartWatch Series 5',
      description:
        'Health and fitness smartwatch with ECG, blood oxygen monitoring, GPS, and 7-day battery life.',
      price: 249.99,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      category: 'Electronics',
      stock: 80,
    },
    {
      name: '4K Webcam Pro',
      description:
        'Crystal-clear 4K webcam with built-in ring light and noise-cancelling microphone for professional video calls.',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
      category: 'Electronics',
      stock: 45,
    },
    {
      name: 'Portable SSD 1TB',
      description:
        'Ultra-fast portable SSD with USB-C, shock-resistant casing, and read speeds up to 1050MB/s.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600',
      category: 'Electronics',
      stock: 100,
    },

    // Clothing
    {
      name: 'Classic Oxford Shirt',
      description:
        'Timeless 100% cotton Oxford shirt. Slim fit, button-down collar, available in multiple colours.',
      price: 59.99,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
      category: 'Clothing',
      stock: 120,
    },
    {
      name: 'Slim Fit Chinos',
      description:
        'Modern slim-fit chinos crafted from stretch-cotton blend. Comfortable enough for all day, smart enough for the office.',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      category: 'Clothing',
      stock: 90,
    },
    {
      name: 'Merino Wool Crew Sweater',
      description:
        'Ultra-soft extra-fine merino wool crew neck sweater. Breathable, odour-resistant, and machine washable.',
      price: 119.99,
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      category: 'Clothing',
      stock: 55,
    },
    {
      name: 'Waterproof Parka Jacket',
      description:
        'Fully waterproof and windproof parka with a breathable membrane and removable inner fleece.',
      price: 189.99,
      imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600',
      category: 'Clothing',
      stock: 35,
    },
    {
      name: 'Running Shorts Pro',
      description:
        'Lightweight 5-inch running shorts with built-in liner, zip pocket, and reflective details.',
      price: 44.99,
      imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
      category: 'Clothing',
      stock: 150,
    },
    {
      name: 'Leather Chelsea Boots',
      description:
        'Hand-crafted full-grain leather Chelsea boots with elastic side panels and a low stacked heel.',
      price: 219.99,
      imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600',
      category: 'Clothing',
      stock: 30,
    },

    // Books
    {
      name: 'Clean Code',
      description:
        'A handbook of agile software craftsmanship by Robert C. Martin. Essential reading for every developer.',
      price: 34.99,
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
      category: 'Books',
      stock: 200,
    },
    {
      name: 'The Pragmatic Programmer',
      description:
        'From journeyman to master — the classic guide to software development excellence by Hunt and Thomas.',
      price: 39.99,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      category: 'Books',
      stock: 150,
    },
    {
      name: 'Designing Data-Intensive Applications',
      description:
        'The go-to guide for engineers working with distributed systems, databases, and data engineering.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600',
      category: 'Books',
      stock: 80,
    },
    {
      name: 'Atomic Habits',
      description:
        'An easy and proven way to build good habits and break bad ones, by James Clear.',
      price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
      category: 'Books',
      stock: 300,
    },
    {
      name: 'System Design Interview Vol. 2',
      description:
        "An insider's guide to system design interviews, covering large-scale distributed systems.",
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      category: 'Books',
      stock: 110,
    },

    // Home & Garden
    {
      name: 'Ceramic Pour-Over Coffee Set',
      description:
        'Handmade ceramic pour-over dripper with a matching carafe and two mugs. Slow brew, exceptional flavour.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      category: 'Home & Garden',
      stock: 45,
    },
    {
      name: 'Bamboo Desk Organiser',
      description:
        'Sustainable bamboo desktop organiser with 6 compartments, a phone stand, and a cable management slot.',
      price: 39.99,
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c5d5b2f72?w=600',
      category: 'Home & Garden',
      stock: 70,
    },
    {
      name: 'Indoor Plant Grow Light',
      description:
        'Full-spectrum LED grow light with adjustable arms, timer, and 5 brightness levels. Ideal for indoor plants.',
      price: 54.99,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
      category: 'Home & Garden',
      stock: 60,
    },
    {
      name: 'Linen Duvet Cover Set',
      description:
        '100% stone-washed linen duvet cover with two pillowcases. Breathable, hypoallergenic, and gets softer with every wash.',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      category: 'Home & Garden',
      stock: 40,
    },
    {
      name: 'Cast Iron Skillet 12"',
      description:
        'Pre-seasoned 12-inch cast iron skillet. Works on all hob types including induction. Built to last generations.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      category: 'Home & Garden',
      stock: 85,
    },
  ];

  let productCount = 0;
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { name: p.name } });
    if (existing) {
      await prisma.product.update({
        where: { name: p.name },
        data: {
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          category: p.category,
          stock: p.stock,
        },
      });
    } else {
      await prisma.product.create({ data: p });
    }
    productCount++;
  }

  console.log(`✅ Products: ${productCount} seeded across 4 categories`);
  console.log('');
  console.log('🔑 Seeded credentials:');
  console.log('   Admin    → admin@shophub.com     / Admin123!');
  console.log('   Customer → customer@shophub.com  / Customer123!');
  console.log('');
  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
