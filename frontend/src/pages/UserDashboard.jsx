import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { cameraAPI, bookingAPI } from '../services/api'
import UserSidebar from '../components/layout/UserSidebar'
import CartDrawer from '../components/features/CartDrawer'
import Loader from '../components/ui/Loader'

/* ── Helpers ───────────────────────────────────────── */
const STATUS_LABEL = {
  PENDING:   { label: 'Menunggu',       bg: 'bg-amber-100',  text: 'text-amber-700'  },
  CONFIRMED: { label: 'Dikonfirmasi',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
  ONGOING:   { label: 'Sedang Disewa',  bg: 'bg-orange-100', text: 'text-primary'    },
  RETURNED:  { label: 'Selesai',        bg: 'bg-green-100',  text: 'text-green-700'  },
  CANCELLED: { label: 'Dibatalkan',     bg: 'bg-red-100',    text: 'text-red-600'    },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_LABEL[status] || { label: status, bg: 'bg-surface', text: 'text-on-surface-variant' }
  return (
    <span className={`px-3 py-1 ${s.bg} ${s.text} text-[10px] font-bold uppercase rounded-full tracking-wider`}>
      {s.label}
    </span>
  )
}

/* ── Category Card ─────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Kamera',
    count: '0',
    sub: 'DSLR, Mirrorless, & Cinema',
    to: '/category/kamera',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAONIQ-bXwp2p4AVBqmY5s_tC_ejBt4V4HDNVTWQacMtbJqJZr0qArG7ttfrTq6ZPEmtBEZDrNo5F55Q6VvLKJ2q70ODo1bD20rtpx0uAgD-rFkbsbkazR80Mzx8LwcOoHEyR4txD7DbZZ6T0c0jyeMLOgxWjQDoJk3mE-36WIG9ds5kC_jiWI49wQKnCsM0RjoHwRAzRVsfoewLPwCAOHkZUakR8E9DeUMpcBiv02M_6RWUhXIeoIVGE7qP6-2agW0v-ORKp9rP4I',
  },
  {
    label: 'Lensa',
    count: '0',
    sub: 'Wide, Tele, & Prime',
    to: '/category/lensa',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCV2AU8FyUvBOVckl9DtnVKoFKWTgzCMiJFjLvoJ2ZfzWd_lY_QlXjm9uOwXRQ3B7Q3MGDP3jjnVSqvxwYlWgiOWF5wHosfakte70x1KBa3t5hcts5kxsP_WzqcCk8U3Vn7r0CLS3-2jqLOeEa__LnyV6lLepUa9DSS87MOxLU2gzIVqjjzVRBfNiqpKZuq6Yp-KKscb9GXSVn1SHS683PWkuMG-5QLp2gvQUp8N1cdpg2DcyN_4hzjchbm8VrpeTw2h6C-BdV3C0',
  },
  {
    label: 'Lighting',
    count: '0',
    sub: 'Continuous & Flash Kits',
    to: '/category/lighting',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRxLjdmj68x0nEG9ZDm0oQDGO2ddhuMHAfNKJ3D_fEAgwHGhYW993Rfc8hLIHL0WmrpF7fBptKbltgRvSmZf6DzysX9wXuUJsb10dKr6h0CCIpLngJrO5k4AB6HsH5cjYYig75D7xvJoOrgolthWH7eC6UxlsWiT2ZCueji11HWcPAJhZWdAw_WXHAlQKuBl9GDffWgiFNK8wkcZIQ67nDsz0dWFyGBudkhukIqYQgNT8VhOsvlKiM9DNvMR8nY77ask9eaoLKO-E',
  },
  {
    label: 'Aksesoris',
    count: '0',
    sub: 'Tripod, Gimbal, & Storage',
    to: '/category/aksesoris',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbMpJnrUfRZf_wPf5UanaxzH19mZ1JI-TsSbMKpWkkgG3qKn1ApA8W8w4ftSkjxHoOMQTAiFBPzV6EJwDlnFIhkNVPnzTHmjBkMhSgaIlh1HA76uCxduDrih-p48fNsV232vw2mTymTu0tJtCZmrRfyeNhONzCuY8jCYBpyeFHYMJxzXJ5MwEpAmMHjnm8hkpt-iplv19pyi6qjPyqy1jSUhZBad1IKz05jJcrxj5SP3ZymPx-Z3UZsG8RNzAgxJDa6-25GpZaopE',
  },
]

/* ── Main Dashboard ────────────────────────────────── */
export default function UserDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [trendingCameras, setTrendingCameras] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [promoVisible, setPromoVisible] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const cartItems = useCartStore(s => s.items)
  const [categoryCounts, setCategoryCounts] = useState({ Kamera: 0, Lensa: 0, Lighting: 0, Aksesoris: 0 })

  useEffect(() => {
    Promise.all([
      cameraAPI.getAll({ limit: 5 }),
      bookingAPI.getMy(),
    ])
      .then(([camsRes, bookingsRes]) => {
        const allCams = camsRes.data.data.cameras || []
        setTrendingCameras(allCams.slice(0, 5))
        
        // Caculate dynamic category counts
        const counts = { Kamera: 0, Lensa: 0, Lighting: 0, Aksesoris: 0 }
        allCams.forEach(cam => {
          const cat = (cam.category || '').toUpperCase()
          if (cat === 'KAMERA') counts.Kamera++
          else if (cat === 'LENSA') counts.Lensa++
          else if (cat === 'LIGHTING') counts.Lighting++
          else if (cat === 'AKSESORIS' || cat === 'AKSESORI') counts.Aksesoris++
        })
        setCategoryCounts(counts)

        const allBookings = bookingsRes.data.data.bookings || []
        setRecentBookings(allBookings.slice(0, 3))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  /* Filtered trending by search */
  const filteredCameras = trendingCameras.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  /* First name only */
  const firstName = user?.name?.split(' ')[0] || 'User'

  /* Membership tier */
  const tierLabel = user?.role === 'ADMIN' ? 'SUPER ADMIN' : 'LENS FRIEND'

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      {/* ── Sidebar ─────────────────────────────── */}
      <UserSidebar />

      {/* ── Main wrapper offset by sidebar ──────── */}
      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top App Bar ──────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-4 sm:px-6 md:px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40 gap-4">
          {/* Search */}
          <div className="flex items-center gap-md flex-1">
            <div className="relative w-full sm:w-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari gear..."
                className="bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 w-full sm:w-64 md:w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-md">
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface"
                title="Keranjang Sewa"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <Link
                to="/bookings"
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface"
                title="Riwayat Sewa"
              >
                notifications
              </Link>
            </div>

            <div className="h-8 w-px bg-outline-variant" />

            <div className="flex items-center gap-sm pl-4 border-l border-outline-variant">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-label-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{tierLabel}</p>
              </div>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-outline-variant flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ──────────────────────────── */}
        <main className="px-6 md:px-8 py-8 flex-grow">

          {/* Greeting Section */}
          <section className="mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Selamat Datang, {firstName}.
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1 max-w-2xl">
              Sudah siap untuk proyek besar berikutnya? Temukan gear terbaik dunia untuk visual tanpa batas.
            </p>
          </section>

          <div className="flex flex-col gap-lg">

            {/* ── Category Grid ──────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-md">
                <h2 className="font-headline-md text-headline-md">Kategori Gear</h2>
                <Link to="/catalog" className="text-primary font-label-bold text-sm hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {CATEGORIES.map((cat) => {
                  const currentCount = categoryCounts[cat.label] || 0;
                  return (
                    <Link
                      key={cat.label}
                      to={cat.to}
                      className="bg-white p-md rounded-2xl group cursor-pointer transition-all hover:-translate-y-1 hover:border-primary border border-transparent block"
                      style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-sm bg-surface">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={cat.img}
                          alt={cat.label}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-xs">
                        <div className="flex items-center gap-2">
                          <p className="font-label-bold group-hover:text-primary transition-colors">{cat.label}</p>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            {currentCount} Item
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant text-center leading-tight opacity-70">
                          {cat.sub}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* ── Promo Banner ───────────────────────── */}
            {promoVisible && (
              <section>
                <div
                  className="bg-primary p-lg rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between text-white gap-lg"
                  style={{ boxShadow: '0 4px 20px -2px rgba(255,77,0,0.2)' }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setPromoVisible(false)}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>

                  <div className="relative z-10 flex items-center gap-lg flex-grow">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl flex-shrink-0">
                      <span
                        className="material-symbols-outlined text-white text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        bolt
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-white mb-1">Membership Pro</h3>
                      <p className="text-white/90 font-body-md">
                        Diskon 25% Selama Akhir Pekan. Gunakan kode:{' '}
                        <span className="font-bold border-b border-white">WEEKENDWARRIOR</span>
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 flex-shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText('WEEKENDWARRIOR')
                        alert('Kode promo disalin!')
                      }}
                      className="bg-white text-primary font-label-bold py-sm px-xl rounded-xl hover:bg-on-surface hover:text-white transition-all transform active:scale-95 shadow-lg whitespace-nowrap"
                    >
                      Klaim Sekarang
                    </button>
                  </div>

                  {/* Decorative */}
                  <span
                    className="material-symbols-outlined absolute -bottom-10 right-20 text-[200px] text-white/10 select-none pointer-events-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                </div>
              </section>
            )}

            {/* ── Trending Gear Table ─────────────────── */}
            <section>
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
              >
                <div className="p-md border-b border-outline-variant flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Sedang Tren Pekan Ini</h3>
                  <Link to="/catalog" className="text-primary font-label-bold text-sm hover:underline">
                    Lihat Semua
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest">
                        <th className="px-4 md:px-6 py-4">Produk Gear</th>
                        <th className="px-4 md:px-6 py-4 hidden md:table-cell">Deskripsi</th>
                        <th className="px-4 md:px-6 py-4 text-right sm:text-left">Harga Sewa</th>
                        <th className="px-4 md:px-6 py-4 text-right hidden sm:table-cell">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-10">
                            <Loader />
                          </td>
                        </tr>
                      ) : filteredCameras.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-md py-12 text-center text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-5xl opacity-20 block mb-2">camera_alt</span>
                            Tidak ada gear ditemukan
                          </td>
                        </tr>
                      ) : (
                        filteredCameras.map((cam, idx) => {
                          const imgSrc =
                            cam.image ||
                            (cam.images && cam.images.length > 0
                              ? cam.images[0].startsWith('http')
                                ? cam.images[0]
                                : `http://localhost:5000${cam.images[0]}`
                              : 'https://placehold.co/64x64?text=Gear')
                          return (
                            <tr
                              key={cam.id || idx}
                              className="hover:bg-surface transition-colors group cursor-pointer"
                              onClick={() => navigate(`/cameras/${cam.id}`)}
                            >
                              <td className="px-4 md:px-6 py-4">
                                <div className="flex items-center gap-md">
                                  <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                    <img className="w-full h-full object-cover" src={imgSrc} alt={cam.name} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-xs flex-wrap">
                                      <span className="font-label-bold">{cam.name}</span>
                                      {idx === 0 && (
                                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                          Hot
                                        </span>
                                      )}
                                      {cam.category && (
                                        <span className="bg-on-surface/5 text-on-surface-variant text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                          {cam.category}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
                                      {cam.brand || 'Professional Gear'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-4 font-body-md text-on-surface-variant max-w-xs truncate hidden md:table-cell">
                                {cam.description || 'Peralatan fotografi berkualitas tinggi.'}
                              </td>
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right sm:text-left">
                                <p className="font-label-bold text-primary">
                                  Rp {cam.pricePerDay?.toLocaleString('id-ID')}
                                  <span className="text-[10px] text-on-surface-variant font-normal"> / hari</span>
                                </p>
                              </td>
                              <td className="px-4 md:px-6 py-4 text-right hidden sm:table-cell">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/cameras/${cam.id}`)
                                  }}
                                  className="px-md py-1.5 border-2 border-primary text-primary font-label-bold hover:bg-primary hover:text-white transition-all rounded-xl text-sm whitespace-nowrap"
                                >
                                  Sewa
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── Recent Bookings ─────────────────────── */}
            {!loading && recentBookings.length > 0 && (
              <section>
                <div
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                >
                  <div className="p-md border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Booking Saya</h3>
                    <Link to="/bookings" className="text-primary font-label-bold text-sm hover:underline">
                      Lihat Semua
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest">
                          <th className="px-4 md:px-6 py-4">Gear</th>
                          <th className="px-4 md:px-6 py-4 hidden md:table-cell">Durasi</th>
                          <th className="px-4 md:px-6 py-4 hidden md:table-cell">Total</th>
                          <th className="px-4 md:px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {recentBookings.map((b) => {
                          const cam = b.camera
                          const imgSrc =
                            cam?.images?.[0]
                              ? cam.images[0].startsWith('http')
                                ? cam.images[0]
                                : `http://localhost:5000${cam.images[0]}`
                              : 'https://placehold.co/64x64?text=Gear'
                          return (
                            <tr
                              key={b.id}
                              className="hover:bg-surface transition-colors group cursor-pointer"
                              onClick={() => navigate('/bookings')}
                            >
                              <td className="px-4 md:px-6 py-4">
                                <div className="flex items-center gap-md">
                                  <div className="w-12 h-12 bg-surface rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                    <img className="w-full h-full object-cover" src={imgSrc} alt={cam?.name} />
                                  </div>
                                  <div>
                                    <span className="font-label-bold block">{cam?.name}</span>
                                    <span className="text-xs text-on-surface-variant opacity-60">
                                      #{String(b.id).padStart(6, '0')}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-4 font-body-md text-on-surface-variant hidden md:table-cell">
                                {b.totalDays} Hari
                              </td>
                              <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                                <p className="font-label-bold text-primary">
                                  Rp {b.totalPrice?.toLocaleString('id-ID')}
                                </p>
                              </td>
                              <td className="px-4 md:px-6 py-4 text-right">
                                <StatusBadge status={b.status} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Bottom spacer removed as per request */}
        </main>
      </div>

      {/* ── Floating Action Button ─────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="fixed bottom-lg right-lg z-50 group">
        <button
          onClick={() => window.open('https://wa.me/628155504321', '_blank')}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">chat_bubble</span>
        </button>
        <span className="absolute right-full mr-md bg-on-surface text-inverse-on-surface text-label-sm px-md py-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2">
          Tanya Admin
        </span>
      </div>
    </div>
  )
}
