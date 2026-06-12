import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import FlipCard from '../components/ui/FlipCard';
import HowItWorksCard from '../components/ui/HowItWorksCard';
import useAuthStore from '../store/authStore';
import { cameraAPI } from '../services/api';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const logoY = useTransform(scrollY, [0, 1000], [0, -150]);
  const { token, user } = useAuthStore();
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
  const [topCameras, setTopCameras] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await cameraAPI.getTop();
        if (res.data.success) {
          let fetchedCameras = res.data.data.cameras || [];

          while (fetchedCameras.length < 3) {
            fetchedCameras.push({
              id: `empty-${fetchedCameras.length}`,
              name: 'Segera Hadir',
              brand: 'Katalog Kosong',
              rentedCount: 0,
              images: [''],
              isEmpty: true
            });
          }

          setTopCameras(fetchedCameras);
        }
      } catch (err) {
        console.error('Failed to fetch top cameras', err);
      }
    };
    fetchTop();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  useEffect(() => {
    // Micro-interactions copied from script
    const elements = document.querySelectorAll('button, a');
    const handleMouseDown = function () { this.style.transform = 'scale(0.96)'; };
    const handleMouseUpLeave = function () { this.style.transform = ''; };

    elements.forEach(el => {
      el.addEventListener('mousedown', handleMouseDown);
      el.addEventListener('mouseup', handleMouseUpLeave);
      el.addEventListener('mouseleave', handleMouseUpLeave);
    });

    return () => {
      elements.forEach(el => {
        el.removeEventListener('mousedown', handleMouseDown);
        el.removeEventListener('mouseup', handleMouseUpLeave);
        el.removeEventListener('mouseleave', handleMouseUpLeave);
      });
    };
  }, []);

  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-white">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 opacity-10">
          <img
            alt="Hero Background"
            className="w-full h-full object-cover"
            src="/icon.png"
          />
        </motion.div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-extrabold text-on-surface tracking-tighter">
              Bukan Sekadar Ngonten <br /><span className="text-primary">Ini Karya Visual</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary mb-10 max-w-xl leading-relaxed">
              Kami menyediakan kamera dan perlengkapan produksi terbaik untuk membantu creator, filmmaker, dan content enthusiast menghasilkan karya visual yang lebih profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={token ? dashboardPath : "/login"} className="text-center bg-primary text-white px-8 py-4 text-sm font-bold rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95">
                {token ? "Pergi ke Dashboard" : "Sewa Sekarang"}
              </Link>
              <Link to="/catalog" className="text-center border-2 border-on-surface/10 bg-white text-on-surface px-8 py-4 text-sm font-bold rounded-full hover:bg-surface-bright transition-all hover:scale-105 active:scale-95">
                Lihat Katalog
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            style={{ y: logoY }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <img
              alt="Professional Camera Gear"
              className="w-full max-w-[480px] h-auto object-contain drop-shadow-2xl rounded-3xl"
              src="/icon.png"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. Kategori Gear */}
      <section className="py-12 bg-white" id="katalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              { title: 'Kamera', value: 'KAMERA', img: "/kamera.png" },
              { title: 'Lensa', value: 'LENSA', img: "/lensa.png" },
              { title: 'Lighting', value: 'LIGHTING', img: "/lighting.png" },
              { title: 'Aksesoris', value: 'AKSESORIS', img: "/aksesoris.png" }
            ].map((cat, i) => (
              <motion.div key={i} variants={fadeUpVariant}>
                <Link to={`/catalog?category=${cat.value}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-surface-variant hover:shadow-2xl shadow-sm bg-white block transition-all hover:-translate-y-2">
                  <img
                    alt={`${cat.title} Category`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={cat.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="text-white font-display font-bold text-2xl tracking-tight group-hover:text-primary transition-colors">{cat.title}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Produk Populer */}
      <div className="border-t border-surface-variant"></div>
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-4 font-extrabold tracking-tight text-on-surface">Koleksi Terpopuler</h2>
            <p className="text-secondary text-lg mb-12 max-w-2xl mx-auto">Pilihan favorit para sinematografer profesional.</p>
          </motion.div>

          <motion.div
            key={topCameras.length}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {topCameras.map((prod, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="flex h-full">
                <FlipCard
                  title={prod.name}
                  desc={prod.brand}
                  rentedCount={prod.rentedCount || 0}
                  img={prod.images && prod.images[0] ? prod.images[0] : null}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Cara Kerja */}
      <section className="py-24 bg-surface" id="cara-kerja">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-4 font-extrabold tracking-tight text-on-surface">Cara Kerja</h2>
            <p className="text-secondary text-lg">Proses sewa profesional tanpa ribet. Fokus pada kreativitas Anda, biarkan kami urus logistiknya.</p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              { icon: 'shopping_basket', title: '1. Pesan Online', desc: 'Pilih gear yang Anda butuhkan dan tentukan tanggal sewa secara langsung melalui website kami.' },
              { icon: 'local_shipping', title: '2. Kami Kirim', desc: 'Gear akan dikirim langsung ke lokasi Anda dengan pengemasan yang aman dan profesional.' },
              { icon: 'movie', title: '3. Mulai Berkarya', desc: 'Gunakan gear pro untuk menciptakan karya ikonik. Kembalikan dengan mudah setelah project selesai.' }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="flex h-full w-full justify-center px-4">
                <HowItWorksCard icon={step.icon} title={step.title} desc={step.desc} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Tentang Lensify */}
      <section className="py-24 md:py-32 bg-white overflow-hidden" id="tentang-kami">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <img alt="Tentang Lensify" className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-1000" src="/tentangkami.png" />
          </motion.div>
          <motion.div
            className="w-full lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold text-xs uppercase tracking-widest mb-2">
              Tentang Kami
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface leading-tight tracking-tight">
              Solusi Premium untuk <span className="text-primary">Kreator Profesional.</span>
            </h2>
            <p className="text-lg text-secondary leading-relaxed">
              Lensify.co lahir dari visi untuk mendemokratisasi akses ke teknologi sinematografi tercanggih. Kami percaya bahwa batasan anggaran tidak boleh menghalangi lahirnya sebuah mahakarya.
            </p>
            <p className="text-base text-secondary opacity-80 leading-relaxed">
              Sebagai penyedia layanan sewa kamera dan gear premium, kami berfokus pada kualitas alat yang selalu terjaga (well-maintained) dan kemudahan akses bagi setiap kreator di Indonesia.
            </p>
            <div className="pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                </div>
                <span className="font-semibold text-on-surface tracking-wide text-sm">Kualitas Gear Terstandarisasi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                </div>
                <span className="font-semibold text-on-surface tracking-wide text-sm">Dukungan Teknis Ahli</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                </div>
                <span className="font-semibold text-on-surface tracking-wide text-sm">Pengiriman Aman & Tepat Waktu</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                </div>
                <span className="font-semibold text-on-surface tracking-wide text-sm">Harga Transparan, Tanpa Biaya Tersembunyi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. CTA Besar */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <h2 className="font-display text-4xl md:text-6xl mb-6 font-extrabold tracking-tight text-white">Siap untuk project berikutnya?</h2>
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto text-white">Dapatkan diskon 10% untuk penyewaan pertama Anda. Bergabunglah dengan ribuan kreator profesional.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={token ? dashboardPath : "/login"} className="inline-block text-center bg-white text-primary px-8 py-4 font-bold rounded-full shadow-2xl hover:bg-surface-bright hover:-translate-y-1 transition-all hover:scale-105 active:scale-95">
              {token ? "Buka Dashboard" : "Mulai Sewa Sekarang"}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 7. Lokasi Toko */}
      <section className="py-24 bg-surface-container-low" id="lokasi">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface mb-4 tracking-tight">Lokasi Kami</h2>
            <p className="text-secondary max-w-2xl mx-auto text-lg">Kunjungi store kami untuk konsultasi gear langsung dengan tim ahli kami.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="bg-white p-10 rounded-3xl shadow-sm border border-surface-variant hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-display font-bold text-2xl mb-8 tracking-tight">Lensify Studio Cirebon</h3>
              <div className="space-y-6 text-secondary">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">location_on</span>
                  <p className="pt-2 leading-relaxed">Jl. Ciremai Raya No. 01, Perumnas,<br />Kota Cirebon, 45142</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">schedule</span>
                  <p>Senin - Minggu: 08:00 - 20:00 WIB</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">call</span>
                  <p>+62 81 555 04321</p>
                </div>
              </div>
              <button className="mt-10 w-full border-2 border-primary text-primary font-bold py-4 rounded-full hover:bg-primary hover:text-white transition-all outline-none hover:scale-105 active:scale-95 duration-200 focus:ring-4 focus:ring-primary/20">Petunjuk Arah Google Maps</button>
            </motion.div>
            <motion.div
              className="aspect-[4/3] lg:aspect-video bg-surface-container rounded-3xl overflow-hidden relative border border-surface-variant shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <iframe
                title="Lokasi Lensify Studio Cirebon"
                src="https://www.openstreetmap.org/export/embed.html?bbox=108.5300%2C-6.7450%2C108.5600%2C-6.7150&layer=mapnik&marker=-6.7300%2C108.5450"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Jl.+Ciremai+Raya+No.+01,+Perumnas,+Kota+Cirebon"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Buka di Google Maps
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
