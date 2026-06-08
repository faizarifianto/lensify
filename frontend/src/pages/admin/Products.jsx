import { useState, useEffect, useRef } from 'react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/ui/Loader'
import useLoadingStore from '../../store/loadingStore'

/* ── Constants ─────────────────────────────────────────────── */
const CATEGORY_TABS = ['Semua', 'Kamera', 'Lensa', 'Lighting', 'Aksesoris']
const ALL_CATEGORIES = ['KAMERA', 'LENSA', 'LIGHTING', 'AKSESORIS']
const ITEMS_PER_PAGE = 10

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const emptyForm = {
  name: '', brand: '', category: 'KAMERA', description: '',
  specs: '', pricePerDay: '', stock: '1', isAvailable: 'true',
  serialNumber: '',
}

/* ── Status helpers ─────────────────────────────────────────── */
const getStatusDisplay = (camera) => {
  if (!camera.isAvailable) {
    return {
      label: 'Maintenance',
      icon: 'build',
      fill: true,
      colorClass: 'text-yellow-600',
    }
  }
  const hasActiveBooking = camera._count?.bookings > 0
  if (hasActiveBooking) {
    return {
      label: 'Rented',
      icon: 'sync',
      fill: false,
      colorClass: 'text-primary',
      sub: 'In Use',
    }
  }
  return {
    label: 'Available',
    icon: 'check_circle',
    fill: true,
    colorClass: 'text-green-600',
  }
}

const categoryMatchesTab = (category, tab) => {
  if (tab === 'Semua') return true
  const map = {
    Kamera: ['KAMERA', 'DSLR', 'MIRRORLESS', 'ACTION_CAM', 'FILM', 'MEDIUM_FORMAT'],
    Lensa: ['LENSA'],
    Lighting: ['LIGHTING'],
    Aksesoris: ['AKSESORIS', 'ACCESSORIES'],
  }
  return (map[tab] || []).includes(category?.toUpperCase())
}

/* ── Add / Edit Modal ─────────────────────────────────────── */
function GearModal({ mode, camera, onClose, onSaved }) {
  const [form, setForm] = useState(
    mode === 'edit'
      ? {
          name: camera.name,
          brand: camera.brand,
          category: camera.category,
          description: camera.description || '',
          specs: (() => {
            if (typeof camera.specs === 'object') {
              return Object.entries(camera.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
            }
            if (typeof camera.specs === 'string' && camera.specs.trim().startsWith('{')) {
              try {
                const obj = JSON.parse(camera.specs)
                return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n')
              } catch { return camera.specs || '' }
            }
            return camera.specs || ''
          })(),
          pricePerDay: camera.pricePerDay,
          stock: camera.stock,
          isAvailable: String(camera.isAvailable),
          serialNumber: camera.serialNumber || '',
        }
      : emptyForm
  )
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState(mode === 'edit' ? camera.images || [] : [])
  const { showLoader, hideLoader } = useLoadingStore()
  const fileRef = useRef()

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.brand || !form.pricePerDay) {
      toast.error('Nama, brand, dan harga wajib diisi')
      return
    }
    showLoader('Menyimpan Gear...')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach((f) => fd.append('images', f))
      if (mode === 'edit') {
        await adminAPI.updateCamera(camera.id, fd)
        toast.success('Gear berhasil diperbarui')
      } else {
        await adminAPI.createCamera(fd)
        toast.success('Gear berhasil ditambahkan')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 24px 64px -8px rgba(0,0,0,0.2)' }}
      >
        {/* Modal Header */}
        <div className="px-md py-md border-b border-outline-variant flex justify-between items-center bg-surface sticky top-0 z-10">
          <h3 className="font-headline-md text-xl text-on-surface">
            {mode === 'edit' ? 'Edit Gear' : 'Tambah Gear Baru'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-md flex flex-col gap-md">
          {/* Nama Gear */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-bold text-sm text-on-surface-variant">Nama Gear</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
              placeholder="Contoh: Sony Alpha A7 IV"
              required
            />
          </div>

          {/* Kategori + Serial Number */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Kategori</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Serial Number</label>
              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
                placeholder="SN-XXXXX"
              />
            </div>
          </div>

          {/* Status + Harga */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Status</label>
              <select
                name="isAvailable"
                value={form.isAvailable}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
              >
                <option value="true">Available</option>
                <option value="false">Maintenance</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Harga per Hari</label>
              <input
                name="pricePerDay"
                type="number"
                value={form.pricePerDay}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
                placeholder="Rp"
                required
              />
            </div>
          </div>

          {/* Brand + Stok */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Brand</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
                placeholder="Sony, Canon, dll"
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-sm text-on-surface-variant">Stok</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm"
                min="1"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-bold text-sm text-on-surface-variant">Deskripsi</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm resize-none"
              placeholder="Deskripsi singkat gear..."
            />
          </div>

          {/* Spesifikasi Teknis */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-bold text-sm text-on-surface-variant">Spesifikasi Teknis</label>
            <textarea
              name="specs"
              value={form.specs}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary px-md py-2.5 font-body-md bg-surface text-sm resize-none"
              placeholder="Contoh:&#10;Resolusi: 24.2 MP&#10;Sensor: Full-Frame&#10;Video: 4K 60fps"
            />
          </div>

          {/* Foto Upload */}
          <div className="flex flex-col gap-xs mt-2">
            <label className="font-label-bold text-sm text-on-surface-variant flex items-center justify-between">
              <span>Foto Gear <span className="text-primary">*</span></span>
              {previews.length > 0 && <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{previews.length} Foto</span>}
            </label>
            
            {previews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-outline-variant">
                      <img
                        src={src.startsWith('blob:') || src.startsWith('http') ? src : `http://localhost:5000${src}`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button type="button"
                        onClick={() => {
                          const newPreviews = previews.filter((_, idx) => idx !== i)
                          const newFiles = files.filter((_, idx) => idx !== i)
                          setPreviews(newPreviews)
                          setFiles(newFiles)
                          if (newPreviews.length === 0 && fileRef.current) fileRef.current.value = ''
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title="Hapus Foto"
                      >
                        <span className="material-symbols-outlined text-[16px] block">close</span>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50/50 transition-all group"
                  >
                    <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100">add_photo_alternate</span>
                    <span className="text-[11px] font-bold mt-1">Tambah Foto</span>
                  </button>
                </div>
                <p className="text-[13px] text-green-600 font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Klik gambar untuk mengelola atau tambah foto lain.
                </p>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50/50 transition-all group"
              >
                <div className="bg-surface p-3 rounded-full group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[36px] group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100 block">image</span>
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-base font-bold text-gray-600 group-hover:text-primary block">Klik untuk memilih foto dari perangkat</span>
                  <span className="text-sm text-gray-400 block">Format didukung: JPG, PNG. Maksimal 5 foto.</span>
                </div>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </div>

          {/* Actions */}
          <div className="flex gap-md mt-xs">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-outline-variant rounded-xl font-label-bold text-on-surface-variant hover:bg-surface transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-white rounded-xl font-label-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Simpan Gear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete Confirm Modal ─────────────────────────────────── */
function DeleteModal({ camera, onClose, onDeleted }) {
  const { showLoader, hideLoader } = useLoadingStore()

  const handleDelete = async () => {
    showLoader('Menghapus Gear...')
    try {
      await adminAPI.deleteCamera(camera.id)
      toast.success('Gear berhasil dihapus')
      onDeleted()
    } catch {
      toast.error('Gagal menghapus gear')
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl border border-red-200 p-md max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-500">delete</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">Hapus Gear?</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            <span className="font-bold text-on-surface">{camera.name}</span> akan dihapus secara permanen dari katalog.
          </p>
          <div className="flex gap-md">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant bg-white text-on-surface font-semibold text-sm hover:bg-surface transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Products Page ───────────────────────────────────── */
export default function Products() {
  const { user } = useAuthStore()
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Semua')
  const [sortOption, setSortOption] = useState('terbaru')
  const [modal, setModal] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCameras = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllCameras()
      setCameras(res.data.data.cameras)
    } catch {
      toast.error('Gagal memuat katalog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCameras() }, [])

  /* ── Derived stats ─── */
  const totalGear = cameras.length
  const tersedia = cameras.filter((c) => c.isAvailable && (c._count?.bookings === 0 || !c._count?.bookings)).length
  const disewa = cameras.filter((c) => c.isAvailable && c._count?.bookings > 0).length
  const maintenance = cameras.filter((c) => !c.isAvailable).length

  /* ── Filtering & Sorting ─── */
  const filtered = cameras
    .filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        (c.brand || '').toLowerCase().includes(q) ||
        (c.serialNumber || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      const matchTab = categoryMatchesTab(c.category, activeTab)
      return matchSearch && matchTab
    })
    .sort((a, b) => {
      if (sortOption === 'harga-asc') return a.pricePerDay - b.pricePerDay
      if (sortOption === 'harga-desc') return b.pricePerDay - a.pricePerDay
      if (sortOption === 'available') return (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  /* ── Pagination ─── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1) }
  const handleSaved = () => { setModal(null); fetchCameras() }
  const handleDeleted = () => { setModal(null); fetchCameras() }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      <AdminSidebar />

      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top App Bar ─────────────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-8 sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Cari gear, serial number..."
                className="bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 w-80 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-sm pl-4">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-sm font-bold leading-none">{user?.name || 'Admin Lensify'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-outline-variant">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="px-8 py-6 flex-grow">

          {/* Page Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Inventaris Alat</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Manajemen stok kamera, lensa, dan aksesoris Lensify.
              </p>
            </div>
            <button
              onClick={() => setModal({ type: 'add' })}
              className="px-md py-sm bg-primary text-white font-label-bold hover:opacity-90 shadow-lg shadow-primary/25 transition-all rounded-xl flex items-center gap-xs text-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tambah Gear Baru
            </button>
          </div>

          {/* ── Stats Cards ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">

            {/* Total Gear */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 border border-outline-variant/50"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{cameras.filter(c => {
                    const d = new Date(c.createdAt)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }).length} bulan ini
                </span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Total Gear</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : totalGear}
                </h2>
              </div>
            </div>

            {/* Tersedia */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-green-500 border border-outline-variant/50"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-green-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-green-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">
                  {totalGear > 0 ? Math.round((tersedia / totalGear) * 100) : 0}% Stock
                </span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Tersedia</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : tersedia}
                </h2>
              </div>
            </div>

            {/* Disewa */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-primary border border-outline-variant/50"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">sync</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">In Use</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Disewa</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : disewa}
                </h2>
              </div>
            </div>

            {/* Maintenance */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-yellow-500 border border-outline-variant/50"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                </div>
                <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-full">Segera</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Maintenance</p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : maintenance}
                </h2>
              </div>
            </div>
          </div>

          {/* ── Filters & Sorting ───────────────────────────── */}
          <div
            className="bg-white rounded-2xl p-md mb-gutter border border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-md"
            style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
          >
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-sm">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-md py-sm rounded-xl font-label-bold text-sm transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border border-transparent hover:border-outline-variant'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex gap-sm w-full md:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full md:w-64 bg-surface border border-outline-variant rounded-xl py-sm px-md font-label-bold text-on-surface-variant text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none shadow-sm"
              >
                <option value="terbaru">Urutkan: Terbaru</option>
                <option value="harga-asc">Harga: Rendah – Tinggi</option>
                <option value="harga-desc">Harga: Tinggi – Rendah</option>
                <option value="available">Status: Available</option>
              </select>
            </div>
          </div>

          {/* ── Inventory Table ──────────────────────────────── */}
          <div
            className="bg-white rounded-2xl overflow-hidden border border-outline-variant/50"
            style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest border-b border-outline-variant">
                    <th className="px-md py-4">Nama Gear</th>
                    <th className="px-md py-4">Kategori</th>
                    <th className="px-md py-4">Status</th>
                    <th className="px-md py-4">Harga Sewa / Hari</th>
                    <th className="px-md py-4 text-right pr-md">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10">
                        <Loader />
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-md py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">inventory_2</span>
                        <p className="text-on-surface-variant text-sm">
                          {search || activeTab !== 'Semua' ? 'Tidak ada gear yang cocok' : 'Belum ada gear terdaftar'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((camera) => {
                      const status = getStatusDisplay(camera)
                      const imgSrc = camera.images?.[0]
                        ? (camera.images[0].startsWith('http') ? camera.images[0] : `http://localhost:5000${camera.images[0]}`)
                        : null

                      return (
                        <tr key={camera.id} className="hover:bg-surface/50 transition-colors group">
                          {/* Nama Gear */}
                          <td className="px-md py-5">
                            <div className="flex items-center gap-md">
                              <div className="w-14 h-14 bg-surface rounded-lg overflow-hidden border border-outline-variant shadow-sm flex-shrink-0">
                                {imgSrc ? (
                                  <img src={imgSrc} alt={camera.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-surface-variant/30 text-2xl">camera_alt</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-headline-md text-base text-on-surface leading-tight">{camera.name}</p>
                                <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tighter mt-0.5">
                                  {camera.brand && `Brand: ${camera.brand}`}
                                  {camera.serialNumber ? ` · SN: ${camera.serialNumber}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Kategori */}
                          <td className="px-md py-5">
                            <span className="px-2 py-0.5 bg-inverse-surface text-white text-[9px] font-extrabold rounded uppercase tracking-widest">
                              {camera.category}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-md py-5">
                            <div className={`flex items-center gap-xs ${status.colorClass}`}>
                              <span
                                className="material-symbols-outlined text-[18px]"
                                style={status.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                {status.icon}
                              </span>
                              <span className="font-label-bold text-xs uppercase">{status.label}</span>
                            </div>
                            {status.sub && (
                              <span className="text-[9px] text-on-surface-variant font-bold ml-6 uppercase opacity-60 block">{status.sub}</span>
                            )}
                          </td>

                          {/* Harga */}
                          <td className="px-md py-5">
                            <p className="font-headline-md text-base text-on-surface">
                              {formatRupiah(camera.pricePerDay)}
                            </p>
                          </td>

                          {/* Aksi */}
                          <td className="px-md py-5 text-right pr-md">
                            <div className="flex justify-end gap-xs">
                              <button
                                onClick={() => setModal({ type: 'edit', camera })}
                                title="Edit"
                                className="p-2 bg-surface hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all rounded-lg border border-outline-variant"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => setModal({ type: 'delete', camera })}
                                title="Hapus"
                                className="p-2 bg-surface hover:bg-error/10 text-on-surface-variant hover:text-error transition-all rounded-lg border border-outline-variant"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────── */}
            {!loading && filtered.length > 0 && (
              <div className="px-md py-4 bg-surface border-t border-outline-variant flex justify-between items-center">
                <p className="font-label-sm text-on-surface-variant opacity-60 text-xs">
                  Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} gear
                </p>
                <div className="flex gap-xs">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>

                  {/* Page Numbers */}
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let page
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-label-bold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-white hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8" />
        </main>
      </div>

      {/* ── Modals ────────────────────────────────────────── */}
      {modal?.type === 'add' && (
        <GearModal mode="add" onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'edit' && (
        <GearModal mode="edit" camera={modal.camera} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal camera={modal.camera} onClose={() => setModal(null)} onDeleted={handleDeleted} />
      )}
    </div>
  )
}
