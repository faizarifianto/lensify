import { useState, useEffect, useCallback, useRef } from 'react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Loader from '../../components/ui/Loader'
import useLoadingStore from '../../store/loadingStore'

/* ── Admin Invoice Modal (printable) ─────────────────────── */
function AdminInvoiceModal({ booking, onClose }) {
  const cam    = booking.camera
  const imgSrc = cam?.images?.[0]
    ? cam.images[0].startsWith('http') ? cam.images[0] : `http://localhost:5000${cam.images[0]}`
    : null

  const fmt = (d) => {
    try { return format(new Date(d), 'dd MMMM yyyy', { locale: id }) }
    catch { return '-' }
  }
  const invoiceNo   = `INV-${String(booking.id).padStart(6, '0')}`
  const issuedAt    = fmt(booking.endDate || booking.createdAt || new Date())
  const pricePerDay = booking.totalDays > 0 ? Math.round(booking.totalPrice / booking.totalDays) : 0

  const handlePrint = () => {
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
        .admin-stamp { border:2px solid #dcfce7; border-radius:12px; padding:16px; margin-top:24px; display:flex; align-items:center; gap:12px; background:#f0fdf4; }
        .admin-stamp p { font-size:11px; color:#166534; font-weight:700; }
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
            <p style="font-size:11px;color:#16a34a;font-weight:700;">✓ DICETAK OLEH ADMIN</p>
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
        <div class="admin-stamp">
          <p>🔏 Dokumen ini dicetak oleh Admin Lensify sebagai struk resmi penyewaan alat. ID Pesanan: #BK-${String(booking.id).padStart(4,'0')}</p>
        </div>
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
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">receipt_long</span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Struk Admin — Siap Cetak</p>
              <h2 className="font-bold text-lg text-gray-800 leading-tight">{invoiceNo}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Cetak Struk / PDF
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
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
              <p className="text-xs text-green-600 font-bold mt-1">✓ Dicetak oleh Admin</p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-6">
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
                {[['Tanggal Mulai', fmt(booking.startDate)], ['Tanggal Selesai', fmt(booking.endDate)],
                  ['Durasi', `${booking.totalDays} hari`], ['Metode Bayar', booking.paymentMethod?.replace('_', ' ') || 'Transfer Bank']
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-28 flex-shrink-0">{k}</span>
                    <span className="font-semibold text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
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
                </div>
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">Rp {pricePerDay.toLocaleString('id-ID')}</div>
              <div className="col-span-2 text-center text-sm text-gray-600">{booking.totalDays}×</div>
              <div className="col-span-2 text-right font-bold text-gray-800">Rp {booking.totalPrice?.toLocaleString('id-ID')}</div>
            </div>
            <div className="grid grid-cols-12 px-4 py-4 bg-primary/5 border-t-2 border-primary/20">
              <div className="col-span-10 text-sm font-black uppercase tracking-wider text-primary">TOTAL PEMBAYARAN</div>
              <div className="col-span-2 text-right font-black text-lg text-primary">Rp {booking.totalPrice?.toLocaleString('id-ID')}</div>
            </div>
          </div>

          {/* Admin stamp */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <span className="material-symbols-outlined text-green-600 text-2xl flex-shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
            <p className="text-xs text-green-700 font-semibold leading-relaxed">
              Dokumen ini dicetak oleh Admin Lensify sebagai struk resmi penyewaan alat.<br/>
              ID Pesanan: <strong>#BK-{String(booking.id).padStart(4,'0')}</strong>
            </p>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-dashed border-gray-200">
            <p className="font-semibold text-gray-500 mb-1">Terima kasih telah menggunakan layanan Lensify! 📸</p>
            <p>Dokumen ini merupakan bukti sah atas transaksi sewa alat.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const STATUS_LABELS = {
  '': 'Semua', PENDING: 'Menunggu', CONFIRMED: 'Dikonfirmasi',
  ONGOING: 'Aktif', RETURNED: 'Selesai', CANCELLED: 'Dibatalkan'
}

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const formatDate = (d) => format(new Date(d), 'MMM dd, yyyy', { locale: id })

// Badge Styles Map
const getBadgeStyles = (status) => {
  switch(status) {
    case 'PENDING':
    case 'CONFIRMED':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    case 'ONGOING':
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
    case 'RETURNED':
      return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    default:
      return 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
  }
}

// Re-using the detail modal internally
function BookingDetailModal({ booking, onClose, onStatusChanged, onPrintInvoice }) {
  const [updating, setUpdating] = useState(false)
  const STATUS_NEXT = {
    PENDING:   ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['ONGOING',   'CANCELLED'],
    ONGOING:   ['RETURNED'],
    RETURNED:  [],
    CANCELLED: []
  }
  const nextStatuses = STATUS_NEXT[booking.status] || []
  const { showLoader, hideLoader } = useLoadingStore()

  const handleStatus = async (status) => {
    showLoader('Memperbarui Status...')
    try {
      await adminAPI.updateBookingStatus(booking.id, status)
      toast.success(`Status diperbarui ke ${STATUS_LABELS[status]}`)
      onStatusChanged()
    } catch {
      toast.error('Gagal memperbarui status')
    } finally {
      hideLoader()
    }
  }

  const img = booking.camera?.images?.[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-outline-variant shadow-2xl flex flex-col max-h-[90vh]"
           style={{ boxShadow: '0 24px 64px -8px rgba(0,0,0,0.15)' }}>
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-white z-10 rounded-t-2xl shrink-0">
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5 font-label-sm">ID #{String(booking.id).padStart(6,'0')}</p>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Detail Pesanan</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${getBadgeStyles(booking.status)}`}>
              {STATUS_LABELS[booking.status]}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Gear Info */}
          <div className="flex gap-3 items-center p-4 rounded-xl bg-surface border border-outline-variant">
            {img ? (
              <img src={`http://localhost:5000${img}`} alt="" className="w-16 h-14 object-cover rounded-lg border border-outline-variant" />
            ) : (
              <div className="w-16 h-14 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant">camera_alt</span>
              </div>
            )}
            <div>
              <p className="font-bold text-on-surface">{booking.camera?.name}</p>
              <p className="text-xs text-on-surface-variant">{booking.camera?.brand} · {booking.camera?.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Penyewa Info */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Data Penyewa</p>
                <p className="font-bold text-on-surface text-sm">{booking.user?.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{booking.user?.email}</p>
              </div>
              <div className="pt-3 border-t border-outline-variant space-y-1">
                <p className="text-xs text-on-surface-variant"><span className="font-bold text-gray-700">Telp:</span> {booking.phone || '-'}</p>
                <p className="text-xs text-on-surface-variant"><span className="font-bold text-gray-700">Alamat:</span> {booking.address || '-'}</p>
              </div>
            </div>

            {/* Total & Pembayaran Info */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tagihan & Durasi</p>
                <p className="font-bold text-primary">{formatRupiah(booking.totalPrice)}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {booking.totalDays} hari ({formatDate(booking.startDate)} — {formatDate(booking.endDate)})
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant space-y-1">
                <p className="text-xs text-on-surface-variant">
                  <span className="font-bold text-gray-700">Metode Bayar:</span> {booking.paymentMethod?.replace('_', ' ') || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Dokumen KTP */}
          {booking.ktpPath && (
            <div className="p-4 rounded-xl bg-surface border border-outline-variant">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Dokumen KTP (Jaminan)</p>
              <a href={`http://localhost:5000${booking.ktpPath}`} target="_blank" rel="noreferrer" className="block max-w-[200px]">
                <img src={`http://localhost:5000${booking.ktpPath}`} alt="KTP Penyewa" className="w-full h-auto object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
              </a>
              <p className="text-[10px] text-gray-400 mt-2 italic">* Klik gambar untuk melihat penuh</p>
            </div>
          )}

          {booking.notes && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wider">Catatan Tambahan</p>
              <p className="text-sm text-amber-900">{booking.notes}</p>
            </div>
          )}

          {/* Action Status */}
          {nextStatuses.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Tindakan Status</p>
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={updating}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      s === 'CANCELLED' ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {updating ? '...' : `Ubah ke ${STATUS_LABELS[s]}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Print Invoice — only for RETURNED */}
          {booking.status === 'RETURNED' && (
            <div className="pt-2 border-t border-outline-variant">
              <p className="text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Struk Penyewaan</p>
              <button
                onClick={() => onPrintInvoice(booking)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Cetak Struk Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddBookingModal({ onClose, onSuccess }) {
  const [users, setUsers] = useState([])
  const [cameras, setCameras] = useState([])
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  const [formData, setFormData] = useState({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    cameraId: '',
    startDate: '',
    endDate: '',
    notes: ''
  })
  const { showLoader, hideLoader } = useLoadingStore()

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [usersRes, camsRes] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getAllCameras()
        ])
        setUsers(usersRes.data.data.users)
        setCameras(camsRes.data.data.cameras.filter(c => c.isAvailable))
      } catch (err) {
        toast.error('Gagal mengambil data referensi')
      } finally {
        setLoading(false)
      }
    }
    fetchSelectData()
  }, [])

  useEffect(() => {
    if (formData.cameraId && formData.startDate && formData.endDate) {
      const cam = cameras.find(c => c.id === parseInt(formData.cameraId))
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (cam && end > start) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        setTotalPrice(days * cam.pricePerDay)
      } else {
        setTotalPrice(0)
      }
    } else {
      setTotalPrice(0)
    }
  }, [formData.cameraId, formData.startDate, formData.endDate, cameras])

  const handleSubmit = async (e) => {
    e.preventDefault()
    showLoader('Membuat Pesanan...')
    try {
      if (!isNewUser && !formData.userId) throw new Error('Harap pilih pengguna')
      
      const payload = {
        cameraId: parseInt(formData.cameraId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes
      }
      
      if (isNewUser) {
        payload.customer = {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        }
      } else {
        payload.userId = parseInt(formData.userId)
      }

      await adminAPI.createOfflineBooking(payload)
      toast.success('Pesanan offline berhasil dibuat')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Gagal membuat pesanan')
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-outline-variant shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-outline-variant flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Tambah Pesanan Offline</h2>
            <p className="text-xs text-on-surface-variant font-label-sm">Buat pesanan untuk pelanggan di toko</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loading ? (
            <div className="py-10 flex justify-center items-center"><Loader /></div>
          ) : (
            <>
              {/* Customer Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                  <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Informasi Pelanggan</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-on-surface-variant">Pelanggan Baru</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isNewUser} onChange={e => setIsNewUser(e.target.checked)} />
                      <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {isNewUser ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Nama Lengkap *</label>
                      <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Email *</label>
                      <input required type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" placeholder="john@example.com" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Nomor HP</label>
                      <input type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" placeholder="08123456789" />
                      <p className="text-[10px] text-on-surface-variant mt-1.5 opacity-70">* Akun akan otomatis terbuat dengan email yg dimasukkan bila belum ada.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Pilih Pelanggan Terdaftar *</label>
                    <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer">
                      <option value="" disabled>-- Pilih Pelanggan --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Order Booking Section */}
              <div className="space-y-4">
                <div className="border-b border-outline-variant pb-2">
                  <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Detail Sewa</h3>
                </div>

                <div>
                  <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Pilih Kamera/Gear *</label>
                  <select required value={formData.cameraId} onChange={e => setFormData({...formData, cameraId: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer">
                    <option value="" disabled>-- Pilih Gear --</option>
                    {cameras.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(c.pricePerDay)}/hari</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Tanggal Mulai *</label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Tanggal Berakhir *</label>
                    <input required type="date" min={formData.startDate} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label-bold text-on-surface-variant mb-1">Catatan Opsional</label>
                  <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/20" placeholder="Cth: Sewa di store langsung..."></textarea>
                </div>
              </div>

            </>
          )}

          <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
            <div>
              <p className="text-xs font-label-bold text-on-surface-variant uppercase">Total Bayar Estimasi</p>
              <p className="font-display-sm font-extrabold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice)}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2 rounded-xl font-label-bold text-on-surface-variant hover:bg-surface transition-all">Batal</button>
              <button type="submit" disabled={submitting || loading || totalPrice <= 0} className="px-6 py-2 bg-primary text-white font-label-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2">
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Orders() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [invoiceBooking, setInvoiceBooking] = useState(null)
  
  const [stats, setStats] = useState({
    totalBookings: 0,
    ongoingBookings: 0,
    pendingBookings: 0,
    completed: 0
  })

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  const limit = 10
  const totalPages = Math.ceil(total / limit)
  const { showLoader, hideLoader } = useLoadingStore()

  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce the search so backend is only called 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllBookings({ page, limit, status: statusFilter, search: debouncedSearch || undefined })
      ])
      
      const s = statsRes.data.data.stats
      setStats({
        totalBookings: s.totalBookings || 0,
        ongoingBookings: s.ongoingBookings || 0,
        pendingBookings: s.pendingBookings || 0,
        completed: (s.totalBookings || 0) - (s.pendingBookings || 0) - (s.ongoingBookings || 0)
      })

      setBookings(bookingsRes.data.data.bookings)
      setTotal(bookingsRes.data.data.total)
    } catch { 
      toast.error('Gagal memuat data') 
    } finally { 
      setLoading(false) 
    }
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleStatusChanged = () => { setSelectedBooking(null); fetchData() }

  const handleQuickStatusChange = async (id, newStatus) => {
    showLoader('Memperbarui Status...')
    try {
      await adminAPI.updateBookingStatus(id, newStatus)
      toast.success(`Status berhasil diperbarui`)
      setOpenDropdown(null)
      fetchData()
    } catch {
      toast.error('Gagal memperbarui status')
    } finally {
      hideLoader()
    }
  }

  // bookings is already filtered from the backend, just use it directly
  const filteredBookings = bookings

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden flex">
      <AdminSidebar />
      
      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex-grow min-h-screen flex flex-col w-full">
        
        {/* TopAppBar */}
        <header className="flex justify-between items-center h-20 px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 w-[320px] font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                placeholder="Cari pesanan atau pelanggan..." 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-sm pl-4">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-label-bold leading-none">{user?.name || 'Admin Lensify'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-headline-md border border-outline-variant">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="p-margin-desktop flex-grow">
          
          {/* Header Section */}
          <section className="mb-xl flex justify-between items-end">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Kelola Sewa</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Pantau dan kelola semua pesanan gear dalam satu dashboard terintegrasi.</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="px-md py-sm bg-primary text-white font-label-bold hover:opacity-90 shadow-lg shadow-primary/25 transition-all rounded-xl flex items-center gap-xs">
              <span className="material-symbols-outlined text-lg">add</span> Tambah Pesanan
            </button>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
            {/* Total Pesanan */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs bln lalu</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Total Pesanan</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">{stats.totalBookings}</h2>
              </div>
            </div>
            
            {/* Pesanan Aktif */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-primary border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">sync</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Aktif</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Pesanan Aktif</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">{stats.ongoingBookings}</h2>
              </div>
            </div>

            {/* Menunggu Konfirmasi */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-yellow-500 border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600">pending_actions</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">Menunggu</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Menunggu Konfirmasi</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">{stats.pendingBookings}</h2>
              </div>
            </div>

            {/* Selesai */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-green-500 border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-green-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">Selesai</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Selesai</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">{stats.completed}</h2>
              </div>
            </div>
          </section>

          {/* Table Management Section */}
          <section className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/50">
            {/* Filter & Search Container */}
            <div className="p-md border-b border-outline-variant flex flex-col md:flex-row items-center justify-between gap-md">
              <div className="flex flex-wrap gap-sm">
                {[
                  { id: '', label: 'Semua' },
                  { id: 'PENDING', label: 'Menunggu' },
                  { id: 'ONGOING', label: 'Aktif' },
                  { id: 'RETURNED', label: 'Selesai' },
                  { id: 'CANCELLED', label: 'Dibatalkan' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                    className={`px-md py-sm rounded-xl font-label-bold text-sm transition-all border ${
                      statusFilter === tab.id 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary' 
                      : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline-variant'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-sm w-full md:w-auto">
                <button className="flex items-center gap-xs px-md py-sm bg-surface text-on-surface-variant font-label-bold rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                </button>
                <select className="bg-surface border border-outline-variant rounded-xl py-sm px-md font-label-bold text-on-surface-variant text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none shadow-sm min-w-[200px]">
                  <option>Urutkan: Terbaru</option>
                  <option>Biaya: Rendah - Tinggi</option>
                  <option>Biaya: Tinggi - Rendah</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest border-b border-outline-variant">
                    <th className="px-md py-4">ID Pesanan</th>
                    <th className="px-md py-4">Pelanggan</th>
                    <th className="px-md py-4">Gear & SN</th>
                    <th className="px-md py-4">Tgl Sewa</th>
                    <th className="px-md py-4">Durasi</th>
                    <th className="px-md py-4">Biaya</th>
                    <th className="px-md py-4">Status</th>
                    <th className="px-md py-4 text-right pr-md">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant min-h-[250px]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-md py-10"><Loader /></td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-md py-16 text-center text-on-surface-variant font-medium">Tidak ada pesanan ditemukan.</td>
                    </tr>
                  ) : filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-md py-5 font-label-bold text-on-surface">#BK-{String(b.id).padStart(4,'0')}</td>
                      <td className="px-md py-5">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {b.user?.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-label-bold max-w-[140px] truncate" title={b.user?.name}>{b.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-md py-5">
                        <p className="font-headline-md text-sm text-on-surface leading-tight max-w-[150px] truncate" title={b.camera?.name}>{b.camera?.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tighter mt-0.5">SN: XXXX</p>
                      </td>
                      <td className="px-md py-5 text-on-surface-variant whitespace-nowrap">
                        {formatDate(b.startDate)}
                      </td>
                      <td className="px-md py-5 text-on-surface-variant">{b.totalDays} Hari</td>
                      <td className="px-md py-5 font-headline-md text-sm text-on-surface">{formatRupiah(b.totalPrice)}</td>
                      <td className="px-md py-5 relative">
                        
                        <div className="relative inline-block">
                          <button 
                            onClick={() => {
                              if (b.status !== 'RETURNED' && b.status !== 'CANCELLED') {
                                setOpenDropdown(openDropdown === b.id ? null : b.id)
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-lg border transition-all uppercase tracking-wider group/status ${getBadgeStyles(b.status)} ${(b.status === 'RETURNED' || b.status === 'CANCELLED') ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span>{STATUS_LABELS[b.status]}</span>
                            {b.status !== 'RETURNED' && b.status !== 'CANCELLED' && (
                              <span className="material-symbols-outlined text-sm">expand_more</span>
                            )}
                          </button>

                          {/* Dropdown status */}
                          {openDropdown === b.id && b.status !== 'RETURNED' && b.status !== 'CANCELLED' && (
                            <div ref={dropdownRef} className="absolute z-[100] w-56 bg-white rounded-xl shadow-xl border border-outline-variant py-2 mt-2 left-0">
                              <p className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Ganti Status</p>
                              
                              <button onClick={() => handleQuickStatusChange(b.id, 'PENDING')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-all">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">Menunggu</span>
                                  <span className="text-[10px] text-on-surface-variant">Kembalikan ke menunggu</span>
                                </div>
                              </button>

                              <button onClick={() => handleQuickStatusChange(b.id, 'ONGOING')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-all">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">Aktif</span>
                                  <span className="text-[10px] text-on-surface-variant">Pesanan mulai berjalan</span>
                                </div>
                              </button>

                              <button onClick={() => handleQuickStatusChange(b.id, 'RETURNED')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-all">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">Selesai</span>
                                  <span className="text-[10px] text-on-surface-variant">Tandai telah dikembalikan</span>
                                </div>
                              </button>

                              <button onClick={() => handleQuickStatusChange(b.id, 'CANCELLED')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-left transition-all mt-1 border-t border-outline-variant pt-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-red-600">Dibatalkan</span>
                                </div>
                              </button>

                            </div>
                          )}
                        </div>

                      </td>
                      <td className="px-md py-5 text-right pr-md">
                        <div className="flex justify-end gap-xs">
                          <button onClick={() => setSelectedBooking(b)} className="p-2 bg-surface hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all rounded-lg border border-outline-variant" title="Detail">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {b.status === 'RETURNED' && (
                            <button onClick={() => setInvoiceBooking(b)} className="p-2 bg-green-50 hover:bg-green-100 text-green-600 transition-all rounded-lg border border-green-200" title="Cetak Struk">
                              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-md py-4 bg-surface border-t border-outline-variant flex justify-between items-center">
              <p className="font-label-sm text-on-surface-variant opacity-60">Menampilkan {bookings.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} dari {total} pesanan</p>
              
              <div className="flex gap-xs">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-label-bold transition-all ${
                      page === i + 1 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Notification Banner */}
          {stats.pendingBookings > 0 && (
            <div className="mt-lg p-md bg-inverse-surface text-white flex items-center justify-between rounded-xl shadow-lg">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="font-body-md">Ada <strong>{stats.pendingBookings} pesanan baru</strong> yang membutuhkan konfirmasi segera.</p>
              </div>
              <button 
                onClick={() => { setStatusFilter('PENDING'); setPage(1); window.scrollTo(0, 0); }}
                className="px-md py-2 bg-primary text-on-primary font-label-bold rounded-xl hover:opacity-90 transition-all"
              >
                Lihat Semua
              </button>
            </div>
          )}

          <div className="h-xl"></div>
        </main>
      </div>
      
      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          onStatusChanged={handleStatusChanged}
          onPrintInvoice={(b) => { setSelectedBooking(null); setInvoiceBooking(b) }}
        />
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <AddBookingModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchData(); }}
        />
      )}

      {/* Admin Invoice Modal (printable) */}
      {invoiceBooking && (
        <AdminInvoiceModal
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}
    </div>
  )
}
