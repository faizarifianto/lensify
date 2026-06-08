import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Camera, Clock, CheckCircle, ArrowLeft,
  FileText, User, Phone, MapPin, CreditCard, X, Image
} from 'lucide-react'
import { bookingAPI } from '../services/api'
import toast from 'react-hot-toast'
import useLoadingStore from '../store/loadingStore'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { showLoader, hideLoader } = useLoadingStore()
  const fileInputRef = useRef(null)

  const cartItems = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)
  const user = useAuthStore(s => s.user)

  // If navigated from CameraDetail with state.camera, use that. Otherwise use cartItems.
  const itemsToCheckout = state?.camera
    ? [{ ...state.camera }]
    : cartItems

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    startDate: state?.startDate || '',
    endDate: state?.endDate || '',
    notes: '',
    paymentMethod: 'TRANSFER_BCA',
    ktp: null,
  })
  const [ktpPreview, setKtpPreview] = useState(null)

  useEffect(() => {
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      toast.error('Tidak ada barang untuk di-checkout')
      navigate(-1)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!itemsToCheckout || itemsToCheckout.length === 0) return null

  // Calculate totals
  let totalDays = 0
  if (formData.startDate && formData.endDate) {
    const s = new Date(formData.startDate)
    const e = new Date(formData.endDate)
    totalDays = Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
  }
  const itemsTotalPerDay = itemsToCheckout.reduce((acc, item) => acc + (item.pricePerDay || 0), 0)
  const totalPrice = totalDays * itemsTotalPerDay

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'ktp' && files?.[0]) {
      const file = files[0]
      setFormData(prev => ({ ...prev, ktp: file }))
      setKtpPreview(URL.createObjectURL(file))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.address || !formData.startDate || !formData.endDate) {
      return toast.error('Mohon lengkapi semua data yang wajib diisi')
    }
    if (!formData.ktp) {
      return toast.error('Foto KTP wajib diunggah sebagai jaminan')
    }
    if (totalDays <= 0) {
      return toast.error('Tanggal selesai harus lebih dari tanggal mulai')
    }

    showLoader('Memproses Pesanan...')
    try {
      const fd = new FormData()
      const cameraIds = itemsToCheckout.map(i => i.id)
      fd.append('items', JSON.stringify(cameraIds))
      fd.append('startDate', formData.startDate)
      fd.append('endDate', formData.endDate)
      fd.append('notes', formData.notes)
      fd.append('address', formData.address)
      fd.append('phone', formData.phone)
      fd.append('paymentMethod', formData.paymentMethod)
      fd.append('ktp', formData.ktp)

      const res = await bookingAPI.create(fd)
      if (!state?.camera) clearCart()
      toast.success('Checkout Berhasil! Pesanan sedang diproses. 🎉')
      navigate('/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pemesanan')
    } finally {
      hideLoader()
    }
  }



  /* ── PAYMENT METHOD OPTIONS ── */
  const paymentOptions = [
    { value: 'TRANSFER_BCA', label: 'Transfer BCA', icon: '🏦' },
    { value: 'TRANSFER_MANDIRI', label: 'Transfer Mandiri', icon: '🏦' },
    { value: 'GOPAY', label: 'GoPay / E-Wallet', icon: '💳' },
    { value: 'CASH', label: 'Bayar di Tempat', icon: '💵' },
  ]

  /* ── MAIN FORM ── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Minimal Navbar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-display font-extrabold text-primary tracking-tighter">Lensify.co</Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-base text-gray-500 hover:text-primary transition-colors font-medium border border-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-50"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
        </div>
      </header>



      {/* ── Body ── */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Data Diri */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">1</span>
              Informasi Penyewa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className="input pl-12 py-3.5 text-base" placeholder="Nama sesuai KTP" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Nomor Telepon / WA <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="input pl-12 py-3.5 text-base" placeholder="0812xxxxxxxx" required />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea name="address" value={formData.address} onChange={handleInputChange}
                    className="input pl-12 py-3.5 h-28 resize-none text-base"
                    placeholder="Jl. Contoh No. 1, Kel. ..., Kec. ..., Kota ..." required />
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal Sewa */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">2</span>
              Jadwal Sewa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Tanggal Mulai <span className="text-red-500">*</span></label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                  className="input py-3.5 text-base" required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Tanggal Selesai <span className="text-red-500">*</span></label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                  className="input py-3.5 text-base" required min={formData.startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            {totalDays > 0 && (
              <div className="mt-6 flex items-center gap-3 bg-orange-50/50 text-orange-700 border border-orange-100 rounded-2xl p-4 text-base font-medium">
                <Clock size={20} className="text-primary" />
                Total durasi penyewaan gear Anda adalah: <span className="font-extrabold text-lg text-primary">{totalDays} hari</span>
              </div>
            )}
          </div>

          {/* Upload KTP */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-2 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">3</span>
              Upload Foto KTP <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6 ml-11">Sesuai kebijakan keamanan, wajib melampirkan foto KTP penyewa yang masih berlaku.</p>

            <input type="file" name="ktp" accept="image/*" onChange={handleInputChange}
              ref={fileInputRef} className="hidden" />

            {ktpPreview ? (
              <div className="relative group ml-11">
                <img src={ktpPreview} alt="Preview KTP" className="w-full h-56 object-cover rounded-2xl border border-gray-200" />
                <button type="button"
                  onClick={() => { setKtpPreview(null); setFormData(prev => ({ ...prev, ktp: null })); fileInputRef.current.value = '' }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <X size={20} />
                </button>
                <p className="mt-4 text-sm text-green-600 font-bold flex items-center gap-2">
                  <CheckCircle size={18} /> KTP berhasil diunggah. Klik gambar untuk mengganti.
                </p>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full ml-11 w-[calc(100%-2.75rem)] h-44 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50/50 transition-all group">
                <Image size={36} className="group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100" />
                <div className="space-y-1">
                  <span className="text-base font-bold text-gray-600 group-hover:text-primary block">Klik untuk memilih foto dari perangkat</span>
                  <span className="text-sm text-gray-400 block">Format didukung: JPG, PNG, HEIC (Maksimal 5MB)</span>
                </div>
              </button>
            )}
          </div>

          {/* Catatan */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-5 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Catatan <span className="text-gray-400 font-normal text-base">(opsional)</span>
            </h2>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange}
              className="input h-24 resize-none text-base py-3.5"
              placeholder="Ada permintaan khusus? Misal: butuh memory tambahan, pengambilan jam 10 pagi, dsb." />
          </div>

          <div className="h-4"></div>
        </div>

        {/* ── RIGHT COLUMN — ORDER SUMMARY ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sticky top-24 space-y-8">
            <h2 className="font-extrabold text-gray-900 text-xl border-b border-gray-100 pb-5">Ringkasan Pesanan</h2>

            {/* Item list */}
            <div className="space-y-5 max-h-[360px] overflow-y-auto pr-2 pb-2">
              {itemsToCheckout.map(item => (
                <div key={item.id} className="flex gap-4 items-center group">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 group-hover:border-primary/30 transition-colors">
                    {item.images?.[0] ? (
                      <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm font-semibold text-primary mt-0.5">Rp {item.pricePerDay?.toLocaleString('id-ID')} <span className="text-xs text-gray-400 font-normal">/hari</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-primary" /> Pilih Pembayaran
              </label>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === opt.value ? 'border-primary bg-orange-50/50 text-primary shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value={opt.value}
                      checked={formData.paymentMethod === opt.value}
                      onChange={handleInputChange} className="accent-primary w-4 h-4" />
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-base font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-surface-container-low rounded-2xl p-6 space-y-3 border border-surface-variant">
              <div className="flex justify-between text-base text-gray-600">
                <span>Harga sewa per hari</span>
                <span className="font-semibold text-gray-900">Rp {itemsTotalPerDay.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-base text-gray-600">
                <span>Durasi sewa</span>
                <span className="font-semibold text-gray-900">× {totalDays} hari</span>
              </div>
              <div className="border-t-2 border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="text-gray-800 font-bold">Total Pembayaran</span>
                <span className="text-primary text-3xl font-black tracking-tight cursor-default" title={`Rp ${totalPrice.toLocaleString('id-ID')}`}>
                  Rp <span className="text-4xl">{totalPrice.toLocaleString('id-ID')}</span>
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full text-lg py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30 transition-all flex justify-center items-center gap-2">
              <CheckCircle size={22} /> Selesaikan Pesanan
            </button>

            {/* Info pills */}
            <div className="space-y-2 pt-2">
              <p className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle size={16} className="text-green-500" /> Transaksi 100% aman dan terenkripsi
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle size={16} className="text-green-500" /> Pembatalan gratis (status pending)
              </p>
            </div>

          </div>
        </div>

      </form>
    </div>
  )
}
