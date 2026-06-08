import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Star, Camera, ChevronLeft, Info, Shield, ArrowRight,
  CheckCircle2, CalendarDays, Zap, Package, Clock3
} from 'lucide-react'
import { cameraAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import toast from 'react-hot-toast'
import CartDrawer from '../components/features/CartDrawer'

const CATEGORY_LABELS = {
  DSLR: 'DSLR', MIRRORLESS: 'Mirrorless', ACTION_CAM: 'Action Cam',
  FILM: 'Film', MEDIUM_FORMAT: 'Medium Format', ACCESSORIES: 'Accessories', LENSA: 'Lensa'
}

// Utility: get all booked date strings from bookings array
function getBookedDateStrings(bookings = []) {
  const set = new Set()
  bookings.forEach(b => {
    let d = new Date(b.startDate)
    const end = new Date(b.endDate)
    while (d <= end) {
      set.add(d.toISOString().split('T')[0])
      d.setDate(d.getDate() + 1)
    }
  })
  return set
}

// Mini read-only calendar info component
function AvailabilityCalendar({ bookings }) {
  const bookedSet = getBookedDateStrings(bookings)
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // Build 6-week grid for current month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthName = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 text-center">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
          <div key={d} className="text-[9px] font-bold text-on-surface-variant/50 pb-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const isBooked = bookedSet.has(dateStr)
          const isToday = d === today.getDate()
          const isPast = new Date(year, month, d) < new Date(year, month, today.getDate())
          return (
            <div key={d}
              className={`w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all
                ${isBooked ? 'bg-red-100 text-red-500 line-through' : ''}
                ${isToday ? 'bg-primary text-white ring-2 ring-primary/40' : ''}
                ${isPast && !isToday ? 'opacity-30 text-on-surface-variant' : ''}
                ${!isBooked && !isToday && !isPast ? 'bg-green-50 text-green-600 hover:bg-green-100' : ''}
              `}
            >
              {d}
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-5 mt-3 text-[10px] font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block"/> Tersedia</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block"/> Terpesan</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary border border-primary/60 inline-block"/> Hari ini</span>
      </div>
    </div>
  )
}

export default function CameraDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [camera, setCamera] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState('spec')
  const [cartOpen, setCartOpen] = useState(false)
  const { items, addItem, removeItem, isInCart } = useCartStore()

  useEffect(() => {
    cameraAPI.getById(id)
      .then(res => setCamera(res.data.data.camera))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="h-20 bg-white border-b border-surface-variant animate-pulse" />
      <div className="page-container pt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="aspect-[4/3] skeleton rounded-3xl" />
          <div className="flex gap-2">{[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 skeleton rounded-xl" />)}</div>
        </div>
        <div className="space-y-4">{[...Array(7)].map((_, i) => <div key={i} className="h-8 skeleton rounded-xl" />)}</div>
      </div>
    </div>
  )

  if (!camera) return null

  const images = camera.images || []
  const specs = (() => {
    try {
      if (!camera.specs) return {}
      if (typeof camera.specs === 'object') return camera.specs
      const val = camera.specs.trim()
      if (val.startsWith('{') && val.endsWith('}')) return JSON.parse(val)
      
      const lines = val.split('\n').filter(l => l.trim().length > 0)
      const result = {}
      lines.forEach(line => {
        const text = line.trim()
        const idx = text.indexOf(':') > -1 ? text.indexOf(':') : text.indexOf('-')
        if (idx > -1) {
          result[text.substring(0, idx).trim()] = text.substring(idx + 1).trim()
        } else {
          result[text] = ''
        }
      })
      return result
    } catch { return {} }
  })()
  const inCart = isInCart(camera.id)
  const available = camera.isAvailable && camera.stock > 0

  const handleCartToggle = () => {
    if (inCart) {
      removeItem(camera.id)
      toast('Dihapus dari keranjang')
    } else {
      addItem(camera)
      toast.success('Berhasil ditambahkan ke keranjang!')
    }
  }

  const handleBook = () => {
    if (!token) { toast.error('Silakan login terlebih dahulu'); navigate('/login'); return }
    navigate('/checkout', { state: { camera } })
  }

  return (
    <div className="min-h-screen font-sans text-on-surface" style={{ background: 'linear-gradient(160deg, #fff7f0 0%, #fff 40%, #f8faff 100%)' }}>

      {/* ── Minimal Navbar ── */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-surface-variant z-40 h-20 px-6 md:px-12 flex justify-between items-center w-full shadow-sm">
        <Link to="/" className="font-display font-black text-2xl text-primary tracking-tight">
          Lensify<span className="text-on-surface">.co</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-surface hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all border border-surface-variant"
            title="Keranjang Sewa">
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
          {token && user ? (
            <Link to="/dashboard" className="flex items-center gap-3 pl-4 border-l border-surface-variant group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-on-surface leading-none">{user.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Lens Friend</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm px-5">Login</Link>
          )}
        </div>
      </header>

      {/* ── Hero Section ── */}
      <div className="page-container pt-8 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary mb-8 transition-colors text-sm font-semibold group">
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Kembali ke Katalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 xl:gap-16 items-start">

          {/* ── LEFT: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 group"
              style={{ background: 'linear-gradient(135deg, #ff6b2b15, #f97316 10%, #ea580c 90%)' }}>
              <div className="aspect-[4/3]">
                {images[activeImg] ? (
                  <img src={`http://localhost:5000${images[activeImg]}`} alt={camera.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Camera size={64} className="text-white/40" />
                    <p className="text-white/60 text-sm">Foto tidak tersedia</p>
                  </div>
                )}
              </div>
              {/* Status badge overlay */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {available ? '● Tersedia' : '● Tidak Tersedia'}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${activeImg === i ? 'border-primary scale-105 shadow-primary/20' : 'border-surface-variant opacity-60 hover:opacity-100 hover:border-primary/40'}`}>
                    <img src={`http://localhost:5000${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info kalender ketersediaan */}
            <div className="bg-white rounded-2xl border border-surface-variant shadow-sm p-5">
              <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                Ketersediaan Gear (Bulan Ini)
              </h3>
              <AvailabilityCalendar bookings={camera.bookings || []} />
              <p className="text-xs text-on-surface-variant/60 mt-3 text-center">
                Tanggal sewa dipilih saat proses checkout
              </p>
            </div>
          </div>

          {/* ── RIGHT: Info & CTA ── */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1">
                {CATEGORY_LABELS[camera.category] || camera.category}
              </span>
              {camera.reviewCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full font-bold">
                  <Star size={11} className="fill-yellow-500 text-yellow-500" />
                  {Number(camera.avgRating).toFixed(1)} ({camera.reviewCount} ulasan)
                </span>
              )}
            </div>

            {/* Name & Brand */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">{camera.brand}</p>
              <h1 className="font-display font-black text-4xl md:text-5xl text-on-surface leading-tight">{camera.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 pb-5 border-b border-surface-variant">
              <div>
                <p className="text-xs text-on-surface-variant mb-1 font-semibold">HARGA SEWA</p>
                <span className="text-4xl font-black text-primary tracking-tight">
                  Rp {camera.pricePerDay.toLocaleString('id-ID')}
                </span>
                <span className="text-on-surface-variant font-semibold text-sm ml-1">/ hari</span>
              </div>
            </div>

            {/* Description */}
            {camera.description && (
              <p className="text-on-surface-variant leading-relaxed text-[15px]">{camera.description}</p>
            )}

            {/* Benefits grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: <CheckCircle2 size={15} className="text-green-500" />, text: '100% Asuransi Aman' },
                { icon: <Zap size={15} className="text-blue-500" />, text: 'Dukungan 24/7' },
                { icon: <Package size={15} className="text-orange-500" />, text: 'Kondisi Prima & Bersih' },
                { icon: <Clock3 size={15} className="text-purple-500" />, text: 'Pengembalian Fleksibel' },
              ].map((k, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white px-3 py-2.5 rounded-xl border border-surface-variant shadow-sm text-sm font-semibold text-on-surface">
                  {k.icon} {k.text}
                </div>
              ))}
            </div>

            {/* CTA Box */}
            <div className="bg-white rounded-3xl border border-surface-variant shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface-variant">Stok tersedia</span>
                <span className={`font-bold ${available ? 'text-green-600' : 'text-red-500'}`}>
                  {available ? `${camera.stock} unit` : 'Habis'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCartToggle}
                  disabled={!available}
                  className={`btn flex-1 font-bold py-3.5 text-[15px] rounded-2xl border-2 transition-all
                    ${inCart
                      ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                      : 'bg-white border-primary text-primary hover:bg-primary/5'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {inCart ? 'remove_shopping_cart' : 'add_shopping_cart'}
                  </span>
                  {inCart ? 'Hapus dari Keranjang' : 'Tambah ke Keranjang'}
                </button>

                <button
                  onClick={handleBook}
                  disabled={!available}
                  className="btn btn-primary flex-1 font-bold py-3.5 text-[15px] rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {available ? (
                    <>Sewa Sekarang <ArrowRight size={18} /></>
                  ) : 'Stok Habis'}
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant/60 font-medium">
                <Shield size={12} className="text-green-500" />
                Pembatalan gratis selama status masih pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs: Spec + Reviews ── */}
      <div className="page-container pb-20 mt-4">
        {/* Tab nav */}
        <div className="flex gap-2 mb-6 border-b border-surface-variant pb-0">
          {[['spec', 'Spesifikasi'], ['review', 'Ulasan']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}>
              {label} {key === 'review' && camera.reviewCount > 0 && `(${camera.reviewCount})`}
            </button>
          ))}
        </div>

        {tab === 'spec' && (
          <div className="bg-white rounded-2xl border border-surface-variant shadow-sm p-6 md:p-8">
            <h2 className="font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="bg-primary/10 p-2 rounded-lg text-primary flex"><Info size={18} /></span>
              Spesifikasi Teknis
            </h2>
            {Object.keys(specs).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-3.5 border-b border-surface-variant last:border-0">
                    <span className="text-on-surface-variant capitalize text-sm font-semibold">{key}</span>
                    {val && <span className="text-on-surface font-bold text-sm max-w-[55%] text-right">{val}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">Spesifikasi belum tersedia.</p>
            )}
          </div>
        )}

        {tab === 'review' && (
          <div className="bg-white rounded-2xl border border-surface-variant shadow-sm p-6 md:p-8">
            <h2 className="font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600 flex"><Star size={18} className="fill-yellow-600" /></span>
              Ulasan Pengguna
            </h2>
            {camera.reviews && camera.reviews.length > 0 ? (
              <div className="space-y-4">
                {camera.reviews.map(review => (
                  <div key={review.id} className="p-5 bg-surface-container-low rounded-xl border border-surface-variant">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
                          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{review.user?.name || 'User'}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(review.createdAt || Date.now()).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-surface-variant'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-on-surface-variant text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-20 block">star_rate</span>
                <p className="text-sm">Belum ada ulasan untuk perlengkapan ini.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
