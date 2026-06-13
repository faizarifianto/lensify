import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { bookingAPI, reviewAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import UserSidebar from '../components/layout/UserSidebar'
import CartDrawer from '../components/features/CartDrawer'
import Loader from '../components/ui/Loader'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

/* ── Status config ─────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu',
    badge: 'bg-amber-100 text-amber-700',
    pulse: false,
    cardBorder: 'border-outline-variant',
    shadow: '0 4px 12px rgba(0,0,0,0.05)',
    imgGray: false,
    actionLabel: 'Batalkan',
    actionStyle: 'border-2 border-error text-error hover:bg-error hover:text-white',
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    badge: 'bg-blue-100 text-blue-700',
    pulse: false,
    cardBorder: 'border-outline-variant',
    shadow: '0 4px 12px rgba(0,0,0,0.05)',
    imgGray: false,
    actionLabel: 'Detail',
    actionStyle: 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20',
  },
  ONGOING: {
    label: 'Berjalan',
    badge: 'bg-primary text-white',
    pulse: true,
    cardBorder: 'border-primary/20',
    shadow: '0 4px 12px rgba(255,77,0,0.08)',
    imgGray: false,
    actionLabel: 'Detail',
    actionStyle: 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20',
  },
  RETURNED: {
    label: 'Selesai',
    badge: 'bg-green-100 text-green-700',
    pulse: false,
    cardBorder: 'border-outline-variant',
    shadow: '0 4px 12px rgba(0,0,0,0.05)',
    imgGray: false,
    actionLabel: 'Invoice',
    actionStyle: 'border-2 border-outline text-on-surface-variant hover:bg-surface',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    badge: 'bg-surface-container-highest text-on-surface-variant',
    pulse: false,
    cardBorder: 'border-outline-variant',
    shadow: '0 4px 12px rgba(0,0,0,0.05)',
    imgGray: true,
    actionLabel: 'Re-book',
    actionStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
}

/* ── Review Modal (new, simple design) ─────────────────── */
const MOOD = ['', 'Buruk 😞', 'Kurang 😕', 'Cukup 😐', 'Bagus 😊', 'Luar Biasa! 🤩']
const MOOD_CLR = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [hover,   setHover]   = useState(0)
  const [loading, setLoading] = useState(false)

  const active = hover || rating

  const handleSubmit = async () => {
    if (!rating) { toast.error('Pilih bintang dulu ya!'); return }
    setLoading(true)
    try {
      await reviewAPI.create({ bookingId: booking.id, rating, comment })
      toast.success('Ulasan berhasil dikirim! ⭐')
      onSubmit(); onClose()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mengirim ulasan')
    } finally { setLoading(false) }
  }

  const cam    = booking.camera
  const imgSrc = cam?.images?.[0]
    ? cam.images[0].startsWith('http') ? cam.images[0] : `http://localhost:5000${cam.images[0]}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Mood color bar */}
        <div className="h-1.5 w-full transition-all duration-300" style={{ background: MOOD_CLR[active] || '#e5e7eb' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <p className="font-bold text-gray-800 text-lg">Bagaimana pengalamanmu?</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Gear chip */}
        <div className="mx-5 mb-4 flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          {imgSrc
            ? <img src={imgSrc} alt={cam?.name} className="w-11 h-9 rounded-lg object-cover flex-shrink-0" />
            : <div className="w-11 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-gray-400">camera_alt</span>
              </div>
          }
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{cam?.name || '-'}</p>
            <p className="text-xs text-gray-400">{cam?.brand}</p>
          </div>
        </div>

        {/* Stars + mood label */}
        <div className="px-5 pb-2 text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <button key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="focus:outline-none active:scale-90 transition-transform"
                style={{ transform: s <= active ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s' }}
              >
                <span className="text-[42px] leading-none transition-colors duration-150 block"
                  style={{ color: s <= active ? MOOD_CLR[active] : '#e5e7eb' }}>★</span>
              </button>
            ))}
          </div>
          <p className="text-sm font-bold h-6 transition-all duration-200"
            style={{ color: MOOD_CLR[active] || 'transparent' }}>
            {MOOD[active]}
          </p>
        </div>

        {/* Comment + actions */}
        <div className="px-5 pb-6">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Tulis komentarmu di sini... (opsional)"
            className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all mt-2"
          />
          <div className="flex gap-3 mt-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button onClick={handleSubmit} disabled={loading || !rating}
              className="flex-[2] py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ background: rating ? MOOD_CLR[rating] : '#d1d5db' }}>
              {loading ? 'Mengirim...' : '★ Kirim Ulasan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Invoice Modal ─────────────────────────────────────── */
function InvoiceModal({ booking, onClose }) {
  const cam    = booking.camera
  const imgSrc = cam?.images?.[0]
    ? cam.images[0].startsWith('http') ? cam.images[0] : `http://localhost:5000${cam.images[0]}`
    : null

  const fmt = (d) => {
    try { return format(new Date(d), 'dd MMMM yyyy', { locale: localeId }) }
    catch { return '-' }
  }
  const invoiceNo = `INV-${String(booking.id).padStart(6, '0')}`
  const issuedAt  = fmt(booking.endDate || booking.createdAt || new Date())
  const pricePerDay = booking.totalDays > 0 ? Math.round(booking.totalPrice / booking.totalDays) : 0

  const handlePrint = () => {
    const el = document.getElementById('invoice-print-area')
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`
      <html><head><title>${invoiceNo} - Lensify</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background:#fff; }
        .inv { max-width:740px; margin:32px auto; padding:40px; }
        .inv-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
        .brand { font-size:28px; font-weight:900; color:#ff4d00; letter-spacing:-1px; }
        .brand span { color:#1a1a1a; }
        .inv-num { text-align:right; }
        .inv-num p { font-size:13px; color:#888; }
        .inv-num h2 { font-size:20px; font-weight:800; color:#1a1a1a; }
        .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; background:#dcfce7; color:#166534; }
        .divider { border:none; border-top:2px solid #f0f0f0; margin:24px 0; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
        .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#888; margin-bottom:6px; }
        .val { font-size:14px; color:#1a1a1a; font-weight:600; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
        th { background:#f8f8f8; padding:10px 16px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#888; text-align:left; }
        td { padding:14px 16px; font-size:13px; color:#444; border-top:1px solid #f0f0f0; }
        .amount { text-align:right; }
        .total-row td { background:#fff7f3; font-weight:800; font-size:16px; color:#ff4d00; }
        .footer { text-align:center; color:#aaa; font-size:12px; margin-top:40px; }
        @media print { .inv { margin:0; } }
      </style></head><body>
      <div class="inv">
        <div class="inv-head">
          <div>
            <div class="brand">Lens<span>ify</span></div>
            <p style="font-size:12px;color:#888;margin-top:4px">Jl. Ciremai Raya No. 01, Perumnas, Cirebon</p>
            <p style="font-size:12px;color:#888">+62 81 555 04321 · hello@lensify.co</p>
          </div>
          <div class="inv-num">
            <span class="badge">LUNAS</span>
            <h2 style="margin-top:8px">${invoiceNo}</h2>
            <p>Tanggal: ${issuedAt}</p>
          </div>
        </div>
        <hr class="divider"/>
        <div class="grid2">
          <div>
            <p class="label">Tagihan Kepada</p>
            <p class="val">${booking.user?.name || '-'}</p>
            <p style="font-size:13px;color:#666;margin-top:2px">${booking.user?.email || '-'}</p>
            <p style="font-size:13px;color:#666">${booking.phone || ''}</p>
            <p style="font-size:13px;color:#666">${booking.address || ''}</p>
          </div>
          <div>
            <p class="label">Detail Sewa</p>
            <p class="val">${fmt(booking.startDate)} — ${fmt(booking.endDate)}</p>
            <p style="font-size:13px;color:#666;margin-top:2px">${booking.totalDays} hari · ${booking.paymentMethod?.replace('_',' ') || 'Transfer Bank'}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Item Sewa</th><th>Harga/Hari</th><th>Durasi</th><th class="amount">Subtotal</th></tr></thead>
          <tbody>
            <tr>
              <td><b>${cam?.name || '-'}</b><br/><span style="font-size:11px;color:#aaa">${cam?.brand || ''} · ${cam?.category || ''}</span></td>
              <td>Rp ${pricePerDay.toLocaleString('id-ID')}</td>
              <td>${booking.totalDays} hari</td>
              <td class="amount">Rp ${booking.totalPrice?.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"><b>TOTAL PEMBAYARAN</b></td>
              <td class="amount">Rp ${booking.totalPrice?.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
        <p class="footer">Terima kasih telah menggunakan layanan Lensify.<br/>Dokumen ini sah sebagai tanda bukti pembayaran sewa alat.</p>
      </div></body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close(); }, 400)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Bukti Pembayaran</p>
              <h2 className="font-bold text-lg text-gray-800 leading-tight">{invoiceNo}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Print disabled for user — view only */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-on-surface-variant text-xs font-bold rounded-xl border border-outline-variant cursor-not-allowed opacity-60 select-none">
              <span className="material-symbols-outlined text-[16px]">print_disabled</span>
              Cetak hanya tersedia di Admin
            </span>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div id="invoice-print-area" className="overflow-y-auto p-6 space-y-6">

          {/* Brand + Invoice Info */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-black tracking-tight">
                <span className="text-primary">Lens</span>ify
              </p>
              <p className="text-xs text-gray-400 mt-1">Jl. Ciremai Raya No. 01, Perumnas, Cirebon 45142</p>
              <p className="text-xs text-gray-400">+62 81 555 04321 · hello@lensify.co</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                LUNAS
              </span>
              <p className="text-xs text-gray-400 mt-2">No. Invoice</p>
              <p className="font-black text-gray-800 text-lg">{invoiceNo}</p>
              <p className="text-xs text-gray-400">Diterbitkan: {issuedAt}</p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tagihan Kepada</p>
              <p className="font-bold text-gray-800">{booking.user?.name || '-'}</p>
              <p className="text-sm text-gray-500">{booking.user?.email || '-'}</p>
              {booking.phone && <p className="text-sm text-gray-500">{booking.phone}</p>}
              {booking.address && <p className="text-sm text-gray-500 mt-1">{booking.address}</p>}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Info Sewa</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Tanggal Mulai</span>
                  <span className="font-semibold text-gray-700">{fmt(booking.startDate)}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Tanggal Selesai</span>
                  <span className="font-semibold text-gray-700">{fmt(booking.endDate)}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Durasi</span>
                  <span className="font-semibold text-gray-700">{booking.totalDays} hari</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Metode Bayar</span>
                  <span className="font-semibold text-gray-700">{booking.paymentMethod?.replace('_', ' ') || 'Transfer Bank'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="rounded-2xl border border-gray-100 overflow-hidden min-w-[500px]">
              <div className="bg-gray-50 grid grid-cols-12 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="col-span-6">Item Sewa</div>
              <div className="col-span-2 text-center">Harga/Hari</div>
              <div className="col-span-2 text-center">Durasi</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>
            <div className="grid grid-cols-12 px-4 py-4 items-center border-t border-gray-100">
              <div className="col-span-6 flex items-center gap-3">
                {imgSrc ? (
                  <img src={imgSrc} alt={cam?.name} className="w-14 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-14 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-300">camera_alt</span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{cam?.name || '-'}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{cam?.brand} · {cam?.category}</p>
                  {cam?.serialNumber && <p className="text-[10px] text-gray-300 font-mono">SN: {cam?.serialNumber}</p>}
                </div>
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">
                Rp {pricePerDay.toLocaleString('id-ID')}
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">
                {booking.totalDays}×
              </div>
              <div className="col-span-2 text-right font-bold text-gray-800">
                Rp {booking.totalPrice?.toLocaleString('id-ID')}
              </div>
            </div>
            {/* Total Row */}
            <div className="grid grid-cols-12 px-4 py-4 bg-primary/5 border-t-2 border-primary/20">
              <div className="col-span-10 text-sm font-black uppercase tracking-wider text-primary">TOTAL PEMBAYARAN</div>
              <div className="col-span-2 text-right font-black text-lg text-primary whitespace-nowrap">
                Rp {booking.totalPrice?.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
          </div>

          {/* Note */}
          <div className="text-center text-xs text-gray-400 pt-2 border-t border-dashed border-gray-200">
            <p className="font-semibold text-gray-500 mb-1">Terima kasih telah menggunakan layanan Lensify! 📸</p>
            <p>Dokumen ini merupakan bukti sah atas transaksi sewa alat. Simpan baik-baik untuk keperluan Anda.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingHistory() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [bookings,       setBookings]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [filter,         setFilter]         = useState('ALL')
  const [search,         setSearch]         = useState('')
  const [globalSearch,   setGlobalSearch]   = useState('')
  const [reviewTarget,   setReviewTarget]   = useState(null)
  const [invoiceTarget,  setInvoiceTarget]  = useState(null)
  const [dateRange,      setDateRange]      = useState('ALL')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [cartOpen,       setCartOpen]       = useState(false)
  const cartItems = useCartStore(s => s.items)

  const tierLabel = user?.role === 'ADMIN' ? 'SUPER ADMIN' : 'LENS FRIEND'

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMy()
      setBookings(res.data.data.bookings || [])
    } catch {
      toast.error('Gagal memuat riwayat pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Batalkan pesanan ini?')) return
    try {
      await bookingAPI.cancel(id)
      toast.success('Pesanan dibatalkan')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal membatalkan')
    }
  }

  /* filter + search */
  const filtered = bookings
    .filter(b => filter === 'ALL' || b.status === filter)
    .filter(b =>
      b.camera?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.camera?.brand?.toLowerCase().includes(search.toLowerCase())
    )

  const statusCounts = {
    ALL: bookings.length,
    PENDING:   bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    ONGOING:   bookings.filter(b => b.status === 'ONGOING').length,
    RETURNED:  bookings.filter(b => b.status === 'RETURNED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  }

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={fetchBookings}
        />
      )}

      {invoiceTarget && (
        <InvoiceModal
          booking={invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
        />
      )}

      <UserSidebar />

      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top App Bar ────────────────────────────── */}
        <header className="flex justify-end items-center h-20 px-4 sm:px-6 md:px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40 gap-4">

          <div className="flex items-center gap-md">
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
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface relative">
                notifications
                {statusCounts.PENDING > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-sm pl-4 border-l border-outline-variant">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-label-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{tierLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-outline-variant flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ──────────────────────────── */}
        <main className="px-6 md:px-margin-desktop py-8 flex-grow">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Riwayat Sewa</h1>
              <p className="font-body-md text-on-surface-variant mt-1 max-w-2xl">
                Kelola riwayat penyewaan gear dan pesanan mendatang Anda.
              </p>
            </div>
            <div className="flex gap-sm">
              {/* Filter Status Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="px-md py-2 border border-outline text-on-surface font-label-bold hover:bg-surface-container transition-all rounded-xl flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  Filter Status
                  {filter !== 'ALL' && (
                    <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
                  )}
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-outline-variant shadow-xl z-30 min-w-[160px] overflow-hidden">
                    {['ALL','PENDING','CONFIRMED','ONGOING','RETURNED','CANCELLED'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setFilter(s); setShowFilterMenu(false) }}
                        className={`w-full text-left px-md py-sm font-label-bold text-sm transition-colors flex items-center justify-between ${
                          filter === s ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface'
                        }`}
                      >
                        <span>
                          {s === 'ALL' ? 'Semua' :
                           s === 'PENDING' ? 'Menunggu' :
                           s === 'CONFIRMED' ? 'Dikonfirmasi' :
                           s === 'ONGOING' ? 'Berjalan' :
                           s === 'RETURNED' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                        <span className="text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded-full font-bold">
                          {statusCounts[s]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="px-md py-2 border border-outline text-on-surface font-label-bold hover:bg-surface-container transition-all rounded-xl flex items-center gap-sm">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                30 Hari Terakhir
              </button>
            </div>
          </div>

          {/* ── Search & Filter Bar ────────────────── */}
          <div className="flex flex-col gap-md">
            <div
              className="flex flex-col md:flex-row gap-md items-center justify-between bg-white p-md rounded-xl border border-outline-variant"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="relative flex-grow max-w-xl w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari transaksi berdasarkan nama gear..."
                  className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="flex gap-sm w-full md:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-grow md:flex-grow-0 bg-white border border-outline-variant rounded-lg px-md py-2 font-label-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="RETURNED">Selesai</option>
                  <option value="ONGOING">Berjalan</option>
                  <option value="CONFIRMED">Dikonfirmasi</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* ── Transaction Cards ──────────────────── */}
            {loading ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <div
                className="text-center py-24 bg-white rounded-xl border border-outline-variant"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 block mb-4">
                  receipt_long
                </span>
                <h3 className="font-headline-md text-on-surface-variant opacity-50 mb-2">
                  {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada riwayat sewa'}
                </h3>
                <p className="text-sm text-on-surface-variant opacity-40 mb-5">
                  {search ? 'Coba kata kunci lain' : 'Yuk mulai sewa gear pertamamu!'}
                </p>
                <Link
                  to="/category/kamera"
                  className="inline-flex items-center gap-sm px-md py-sm bg-primary text-white font-label-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  Lihat Katalog
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-md">
                {filtered.map((booking) => {
                  const cam    = booking.camera
                  const cfg    = STATUS_CONFIG[booking.status] || STATUS_CONFIG['PENDING']
                  const imgSrc = cam?.images?.[0]
                    ? cam.images[0].startsWith('http') ? cam.images[0] : `http://localhost:5000${cam.images[0]}`
                    : 'https://placehold.co/96x96?text=Gear'

                  const canCancel = booking.status === 'PENDING'
                  const canReview = booking.status === 'RETURNED' && !booking.review
                  const hasReview = booking.status === 'RETURNED' && booking.review

                  let startFmt = ''
                  let endFmt   = ''
                  try {
                    startFmt = format(new Date(booking.startDate), 'dd MMM', { locale: localeId })
                    endFmt   = format(new Date(booking.endDate),   'dd MMM yyyy', { locale: localeId })
                  } catch {}

                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-xl p-md border hover:shadow-lg transition-all ${
                        booking.status === 'CANCELLED' ? 'opacity-80 hover:opacity-100' : ''
                      } ${cfg.cardBorder}`}
                      style={{ boxShadow: cfg.shadow }}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-md">

                        {/* Image */}
                        <div className={`w-24 h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0 ${cfg.imgGray ? 'grayscale' : ''}`}>
                          <img
                            src={imgSrc}
                            alt={cam?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-grow space-y-1 min-w-0">
                          <div className="flex items-start justify-between gap-sm">
                            <div>
                              <div className="flex items-center gap-sm flex-wrap">
                                <h4 className="font-headline-md text-lg text-on-surface">{cam?.name}</h4>
                                <span className="text-[10px] text-on-surface-variant font-bold opacity-50">
                                  #{String(booking.id).padStart(6, '0')}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">{cam?.brand || cam?.category}</p>
                            </div>
                            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full uppercase ${cfg.badge} ${cfg.pulse ? 'animate-pulse' : ''}`}>
                              {cfg.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-md flex-wrap mt-2">
                            <div className="flex items-center gap-xs">
                              <span className="material-symbols-outlined text-on-surface-variant text-base">calendar_month</span>
                              <span className="text-sm text-on-surface-variant">
                                {startFmt} — {endFmt}
                              </span>
                            </div>
                            <div className="flex items-center gap-xs">
                              <span className="material-symbols-outlined text-on-surface-variant text-base">schedule</span>
                              <span className="text-sm text-on-surface-variant">{booking.totalDays} hari</span>
                            </div>
                            {hasReview && (
                              <div className="flex items-center gap-xs">
                                <span className="text-yellow-400 text-sm">★</span>
                                <span className="text-xs font-bold text-on-surface-variant">{booking.review.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price + Action */}
                        <div className="flex flex-row flex-wrap md:flex-col items-center md:items-end justify-between md:justify-center gap-sm min-w-[140px] w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/30 md:border-0">
                          <div className="text-left md:text-right">
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Total Bayar</p>
                            <p className={`font-headline-md text-xl ${booking.status === 'CANCELLED' ? 'text-on-surface-variant opacity-60' : 'text-primary'}`}>
                              Rp {booking.totalPrice?.toLocaleString('id-ID')}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-xs">
                            {canReview && (
                              <button
                                onClick={() => setReviewTarget(booking)}
                                className="py-2 px-sm border-2 border-primary text-primary font-label-bold hover:bg-primary hover:text-white transition-all rounded-lg text-xs whitespace-nowrap"
                              >
                                ★ Ulasan
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="py-2 px-sm border-2 border-error text-error font-label-bold hover:bg-error hover:text-white transition-all rounded-lg text-xs"
                              >
                                Batalkan
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (booking.status === 'RETURNED' && !canReview) {
                                  setInvoiceTarget(booking)
                                } else {
                                  navigate(`/cameras/${cam?.id}`)
                                }
                              }}
                              className={`py-2 px-md font-label-bold transition-all rounded-lg text-sm ${cfg.actionStyle}`}
                            >
                              {booking.status === 'CANCELLED' ? 'Re-book' :
                               booking.status === 'RETURNED' && !canReview ? 'Invoice' :
                               'Detail'}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Load More */}
          {!loading && filtered.length > 0 && (
            <div className="mt-lg flex justify-center">
              <button className="text-primary font-label-bold text-sm hover:underline flex items-center gap-sm">
                Lihat Riwayat Lengkap
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          <div className="h-xl" />
        </main>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── FAB ─────────────────────────────────────── */}
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
