require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── 1. HAPUS SEMUA DATA KATALOG ────────────────────────────────────────────
  console.log('🗑️  Menghapus semua data katalog lama...');
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.camera.deleteMany({});
  console.log('✅ Semua data katalog berhasil dihapus.');

  // ─── 2. BUAT / UPDATE AKUN ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lensify.co' },
    update: {},
    create: {
      name: 'Admin Lensify',
      email: 'admin@lensify.co',
      password: adminPassword,
      phone: '081234567890',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin.email);

  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@lensify.co' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@lensify.co',
      password: userPassword,
      phone: '089876543210',
      role: 'USER'
    }
  });
  console.log('✅ Demo user created:', user.email);

  // ─── 3. KATEGORI KAMERA ─────────────────────────────────────────────────────
  const cameras = [
    {
      name: 'Canon EOS R5',
      brand: 'Canon',
      category: 'KAMERA',
      description:
        'Kamera mirrorless profesional Canon EOS R5 dengan sensor full-frame 45MP. Sempurna untuk fotografi komersial, wedding, dan video 8K RAW. Dilengkapi IBIS 8-stop untuk hasil foto yang tajam bahkan di kondisi cahaya rendah.',
      specs: JSON.stringify({
        sensor: 'Full-Frame 45MP CMOS',
        iso: '100-51200 (expandable to 102400)',
        shutter: '1/8000s - 30s',
        video: '8K RAW, 4K 120fps',
        autofocus: 'Dual Pixel CMOS AF II',
        stabilization: 'IBIS 8-stop',
        weight: '738g',
        battery: 'LP-E6NH'
      }),
      pricePerDay: 450000,
      stock: 2,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800'
      ])
    },
    {
      name: 'Sony A7 IV',
      brand: 'Sony',
      category: 'KAMERA',
      description:
        'Sony Alpha A7 IV adalah kamera hybrid terbaik untuk fotografer dan videografer profesional. Sensor full-frame 33MP dengan performa video 4K 60fps yang outstanding.',
      specs: JSON.stringify({
        sensor: 'Full-Frame 33MP BSI CMOS',
        iso: '100-51200 (expandable to 204800)',
        shutter: '1/8000s - 30s',
        video: '4K 60fps, FHD 120fps',
        autofocus: 'Real-time Eye AF',
        stabilization: '5.5-stop IBIS',
        weight: '659g',
        battery: 'NP-FZ100'
      }),
      pricePerDay: 400000,
      stock: 3,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'
      ])
    },
    {
      name: 'Nikon Z6 III',
      brand: 'Nikon',
      category: 'KAMERA',
      description:
        'Nikon Z6 III hadir sebagai kamera hybrid generasi ketiga dengan sensor 24.5MP partially-stacked CMOS. Sempurna untuk fotografi olahraga, wildlife, dan konten video profesional.',
      specs: JSON.stringify({
        sensor: 'Full-Frame 24.5MP Partially-Stacked CMOS',
        iso: '100-64000 (expandable to 204800)',
        shutter: '1/8000s - 30s',
        video: '6K RAW, 4K 120fps',
        autofocus: 'AI subject detection',
        stabilization: '8-stop IBIS',
        weight: '760g',
        battery: 'EN-EL15c'
      }),
      pricePerDay: 380000,
      stock: 2,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
      ])
    }
  ];

  // ─── 4. KATEGORI LENSA ──────────────────────────────────────────────────────
  const lenses = [
    {
      name: 'Canon RF 50mm f/1.2L USM',
      brand: 'Canon',
      category: 'LENSA',
      description:
        'Lensa prime Canon RF 50mm f/1.2L USM menghadirkan bokeh yang creamy dan tajam luar biasa. Pilihan utama fotografer portrait dan wedding profesional di seluruh dunia.',
      specs: JSON.stringify({
        focalLength: '50mm',
        aperture: 'f/1.2 - f/16',
        mount: 'Canon RF',
        elements: '15 elements in 10 groups',
        autofocus: 'Nano USM',
        filterSize: '77mm',
        weight: '950g',
        minFocusDistance: '0.4m'
      }),
      pricePerDay: 200000,
      stock: 3,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540535027986-db5eb7b68e3f?w=800'
      ])
    },
    {
      name: 'Sony FE 24-70mm f/2.8 GM II',
      brand: 'Sony',
      category: 'LENSA',
      description:
        'Sony FE 24-70mm f/2.8 GM II adalah lensa zoom serbaguna terbaik untuk sistem Sony E-mount. Ringan, tajam, dan autofokus sangat cepat untuk berbagai situasi pemotretan.',
      specs: JSON.stringify({
        focalLength: '24-70mm',
        aperture: 'f/2.8 - f/22',
        mount: 'Sony E-mount',
        elements: '20 elements in 15 groups',
        autofocus: 'XD Linear Motor',
        filterSize: '82mm',
        weight: '695g',
        minFocusDistance: '0.21m'
      }),
      pricePerDay: 250000,
      stock: 2,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617500603321-d3e7acb63f5c?w=800'
      ])
    },
    {
      name: 'Sigma 85mm f/1.4 DG DN Art',
      brand: 'Sigma',
      category: 'LENSA',
      description:
        'Sigma 85mm f/1.4 DG DN Art adalah lensa portrait legendaris yang menghadirkan ketajaman optik luar biasa dengan harga yang lebih terjangkau dibanding lensa OEM.',
      specs: JSON.stringify({
        focalLength: '85mm',
        aperture: 'f/1.4 - f/16',
        mount: 'Sony E / L-mount',
        elements: '17 elements in 13 groups',
        autofocus: 'High-speed stepping motor',
        filterSize: '77mm',
        weight: '625g',
        minFocusDistance: '0.85m'
      }),
      pricePerDay: 150000,
      stock: 4,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=800'
      ])
    }
  ];

  // ─── 5. KATEGORI LIGHTING ───────────────────────────────────────────────────
  const lightings = [
    {
      name: 'Godox AD600Pro',
      brand: 'Godox',
      category: 'LIGHTING',
      description:
        'Godox AD600Pro adalah strobe portabel 600Ws yang powerful dengan baterai built-in. Ideal untuk outdoor shoot, wedding, dan pemotretan fashion yang memerlukan pencahayaan kuat dan portabel.',
      specs: JSON.stringify({
        power: '600Ws',
        flashDuration: '1/220s - 1/10200s',
        recycleTime: '0.01-0.9s',
        battery: '500 full-power flashes',
        sync: 'X System wireless',
        colorTemp: '5600K ± 200K',
        weight: '2.8kg',
        mountType: 'Bowens S-type'
      }),
      pricePerDay: 180000,
      stock: 3,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=800'
      ])
    },
    {
      name: 'Aputure 300d Mark II',
      brand: 'Aputure',
      category: 'LIGHTING',
      description:
        'Aputure 300d Mark II adalah lampu LED COB continuous 300W yang terkenal di industri film dan fotografi. Pencahayaan daylight 5500K yang natural dengan CRI 96+ untuk warna yang akurat.',
      specs: JSON.stringify({
        power: '300W',
        colorTemp: '5500K',
        cri: '96+',
        brightness: '80000 lux @ 1m',
        mount: 'Bowens S-type',
        control: 'Sidus Link App / DMX',
        fanNoise: '< 30dB',
        weight: '3.5kg'
      }),
      pricePerDay: 200000,
      stock: 2,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800'
      ])
    },
    {
      name: 'Godox SL60W Studio LED',
      brand: 'Godox',
      category: 'LIGHTING',
      description:
        'Godox SL60W adalah lampu LED studio continuous 60W yang hemat energi dan serbaguna. Cocok untuk video konten kreator, podcast, dan pemotretan produk di studio.',
      specs: JSON.stringify({
        power: '60W',
        colorTemp: '5600K',
        cri: '≥ 93',
        brightness: '4500 lux @ 1m',
        mount: 'Bowens S-type',
        control: 'Manual + remote',
        fanNoise: 'Silent',
        weight: '2.2kg'
      }),
      pricePerDay: 100000,
      stock: 5,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800'
      ])
    }
  ];

  // ─── 6. KATEGORI AKSESORI ───────────────────────────────────────────────────
  const accessories = [
    {
      name: 'Manfrotto MT055CXPRO4 Carbon Tripod',
      brand: 'Manfrotto',
      category: 'AKSESORI',
      description:
        'Manfrotto MT055CXPRO4 adalah tripod carbon fiber profesional yang ringan namun sangat kuat. Dilengkapi kolom tengah yang bisa diposisikan horizontal untuk angle kreatif.',
      specs: JSON.stringify({
        material: 'Carbon Fiber',
        maxLoad: '9kg',
        maxHeight: '170cm',
        minHeight: '9cm',
        foldedLength: '60cm',
        weight: '1.9kg',
        sections: '4',
        head: 'Not included'
      }),
      pricePerDay: 80000,
      stock: 5,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800'
      ])
    },
    {
      name: 'DJI RS 3 Pro Gimbal',
      brand: 'DJI',
      category: 'AKSESORI',
      description:
        'DJI RS 3 Pro adalah gimbal tiga sumbu untuk kamera mirrorless dan DSLR. Stabilisasi elektronik yang canggih untuk video cinematik tanpa getaran dari genggaman tangan.',
      specs: JSON.stringify({
        payload: '4.5kg',
        batteryLife: '12 hours',
        axes: '3-axis (pan, tilt, roll)',
        connectivity: 'Bluetooth 5.0',
        weight: '1.3kg',
        control: 'OLED display + joystick',
        stabilization: 'RavenEye AI tracking',
        compatibility: 'Camera ≤ 4.5kg'
      }),
      pricePerDay: 150000,
      stock: 3,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800'
      ])
    },
    {
      name: 'Reflector 5-in-1 110cm',
      brand: 'Neewer',
      category: 'AKSESORI',
      description:
        'Reflector 5-in-1 serbaguna dengan diameter 110cm. Hadir dalam 5 mode: putih, perak, emas, hitam, dan transparan. Alat wajib untuk mengontrol pencahayaan tanpa listrik.',
      specs: JSON.stringify({
        diameter: '110cm',
        surfaces: 'White, Silver, Gold, Black, Translucent',
        foldedSize: '42cm',
        material: 'Lightweight fabric + steel frame',
        weight: '0.8kg',
        usage: 'Portrait, Product, Outdoor'
      }),
      pricePerDay: 30000,
      stock: 8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617500603565-5a67cf5f5f59?w=800'
      ])
    }
  ];

  // ─── 7. INSERT SEMUA DATA ───────────────────────────────────────────────────
  const allItems = [...cameras, ...lenses, ...lightings, ...accessories];

  for (const item of allItems) {
    await prisma.camera.create({ data: item });
  }

  console.log(`✅ ${cameras.length} kamera berhasil ditambahkan`);
  console.log(`✅ ${lenses.length} lensa berhasil ditambahkan`);
  console.log(`✅ ${lightings.length} lighting berhasil ditambahkan`);
  console.log(`✅ ${accessories.length} aksesori berhasil ditambahkan`);
  console.log(`✅ Total: ${allItems.length} item katalog`);

  console.log('\n🎉 Seeding selesai!');
  console.log('📧 Admin login: admin@lensify.co / admin123');
  console.log('📧 User login:  demo@lensify.co / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
