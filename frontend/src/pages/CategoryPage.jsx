import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cameraAPI } from '../services/api'
import UserSidebar from '../components/layout/UserSidebar'
import useAuthStore from '../store/authStore'
import Loader from '../components/ui/Loader'
import useCartStore from '../store/cartStore'
import CartDrawer from '../components/features/CartDrawer'
import toast from 'react-hot-toast'

/* ── Category metadata ──────────────────────────────────── */
const CATEGORY_META = {
  kamera: {
    key: 'KAMERA',
    label: 'Kamera',
    icon: 'camera_alt',
    desc: 'DSLR, Mirrorless, & Cinema Camera profesional untuk segala kebutuhan visual Anda.',
    heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAONIQ-bXwp2p4AVBqmY5s_tC_ejBt4V4HDNVTWQacMtbJqJZr0qArG7ttfrTq6ZPEmtBEZDrNo5F55Q6VvLKJ2q70ODo1bD20rtpx0uAgD-rFkbsbkazR80Mzx8LwcOoHEyR4txD7DbZZ6T0c0jyeMLOgxWjQDoJk3mE-36WIG9ds5kC_jiWI49wQKnCsM0RjoHwRAzRVsfoewLPwCAOHkZUakR8E9DeUMpcBiv02M_6RWUhXIeoIVGE7qP6-2agW0v-ORKp9rP4I',
    tips: ['Pilih body dengan sensor terbesar untuk hasil maksimal', 'Pertimbangkan kebutuhan video vs foto', 'Cek kompatibilitas lensa yang kamu punya'],
  },
  lensa: {
    key: 'LENSA',
    label: 'Lensa',
    icon: 'lens',
    desc: 'Wide, Tele, dan Prime lens terbaik untuk menghasilkan foto yang tajam dan bokeh yang memukau.',
    heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCV2AU8FyUvBOVckl9DtnVKoFKWTgzCMiJFjLvoJ2ZfzWd_lY_QlXjm9uOwXRQ3B7Q3MGDP3jjnVSqvxwYlWgiOWF5wHosfakte70x1KBa3t5hcts5kxsP_WzqcCk8U3Vn7r0CLS3-2jqLOeEa__LnyV6lLepUa9DSS87MOxLU2gzIVqjjzVRBfNiqpKZuq6Yp-KKscb9GXSVn1SHS683PWkuMG-5QLp2gvQUp8N1cdpg2DcyN_4hzjchbm8VrpeTw2h6C-BdV3C0',
    tips: ['Pilih focal length sesuai genre fotografi', 'Lensa prime = lebih tajam, zoom = lebih fleksibel', 'Periksa mount compatibility dengan body kamera'],
  },
  lighting: {
    key: 'LIGHTING',
    label: 'Lighting',
    icon: 'lightbulb',
    desc: 'Studio Continuous Light dan Strobe Flash profesional untuk foto dan video berkualitas sinema.',
    heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRxLjdmj68x0nEG9ZDm0oQDGO2ddhuMHAfNKJ3D_fEAgwHGhYW993Rfc8hLIHL0WmrpF7fBptKbltgRvSmZf6DzysX9wXuUJsb10dKr6h0CCIpLngJrO5k4AB6HsH5cjYYig75D7xvJoOrgolthWH7eC6UxlsWiT2ZCueji11HWcPAJhZWdAw_WXHAlQKuBl9GDffWgiFNK8wkcZIQ67nDsz0dWFyGBudkhukIqYQgNT8VhOsvlKiM9DNvMR8nY77ask9eaoLKO-E',
    tips: ['Continuous light cocok untuk video', 'Strobe dibutuhkan untuk freeze motion', 'Selalu bawa diffuser untuk cahaya lebih lembut'],
  },
  aksesoris: {
    key: 'AKSESORIS',
    label: 'Aksesoris',
    icon: 'settings_suggest',
    desc: 'Tripod, Gimbal, Storage, dan berbagai aksesoris pelengkap untuk produksi visual tanpa batas.',
    heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbMpJnrUfRZf_wPf5UanaxzH19mZ1JI-TsSbMKpWkkgG3qKn1ApA8W8w4ftSkjxHoOMQTAiFBPzV6EJwDlnFIhkNVPnzTHmjBkMhSgaIlh1HA76uCxduDrih-p48fNsV232vw2mTymTu0tJtCZmrRfyeNhONzCuY8jCYBpyeFHYMJxzXJ5MwEpAmMHjnm8hkpt-iplv19pyi6qjPyqy1jSUhZBad1IKz05jJcrxj5SP3ZymPx-Z3UZsG8RNzAgxJDa6-25GpZaopE',
    tips: ['Tripod karbon = ringan & kuat', 'Gimbal 3-axis untuk video sinematik', 'Filter ND wajib untuk outdoor'],
  },
}

/* ── Sort options ───────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'price_asc',  label: 'Harga: Termurah' },
  { value: 'price_desc', label: 'Harga: Termahal'  },
  { value: 'name_asc',   label: 'Nama: A–Z'        },
]

/* ── Product Card ───────────────────────────────────────── */
function ProductCard({ cam, onRent, onAddToCart, inCart }) {
  const imgSrc =
    cam.image ||
    (cam.images && cam.images.length > 0
      ? cam.images[0].startsWith('http')
        ? cam.images[0]
        : `http://localhost:5000${cam.images[0]}`
      : 'https://placehold.co/400x400?text=No+Image')

  return (
    <article
      onClick={() => onRent(cam.id)}
      className="cursor-pointer bg-white rounded-2xl overflow-hidden border border-transparent hover:border-primary transition-all duration-300 hover:-translate-y-1 group flex flex-col"
      style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-surface aspect-[4/3]">
        <img
          src={imgSrc}
          alt={cam.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
            {cam.category}
          </span>
        </div>
        {/* Stock badge */}
        {cam.stock <= 1 && cam.stock > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              Sisa {cam.stock}
            </span>
          </div>
        )}
        {cam.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-xl uppercase tracking-wider">
              Tidak Tersedia
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-md flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">
            {cam.brand}
          </p>
          <h3 className="font-label-bold text-label-bold text-on-surface group-hover:text-primary transition-colors leading-snug mb-2">
            {cam.name}
          </h3>
          {cam.description && (
            <p className="text-xs text-on-surface-variant opacity-70 leading-relaxed line-clamp-2 mb-3">
              {cam.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-md border-t border-outline-variant mt-2">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-on-surface-variant opacity-60">
              Mulai Dari
            </span>
            <span className="text-primary font-bold text-base">
              Rp {cam.pricePerDay?.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-on-surface-variant">/hari</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(cam); }}
              disabled={cam.stock === 0}
              title={inCart ? 'Sudah di keranjang' : 'Tambah ke keranjang'}
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                inCart
                  ? 'border-primary bg-primary text-white'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined text-lg">
                {inCart ? 'shopping_cart_checkout' : 'add_shopping_cart'}
              </span>
            </button>
            {/* Rent Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRent(cam.id); }}
              disabled={cam.stock === 0}
              className="px-md py-2 border-2 border-primary text-primary font-label-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary transition-all rounded-xl text-sm"
            >
              Sewa
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function CategoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addItem, removeItem, isInCart, items } = useCartStore()

  const meta = CATEGORY_META[slug] || CATEGORY_META['kamera']

  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState('price_asc')
  const [globalSearch, setGlobalSearch] = useState('')
  const [cartOpen, setCartOpen]   = useState(false)

  const handleAddToCart = (cam) => {
    if (isInCart(cam.id)) {
      removeItem(cam.id)
      toast('Dihapus dari keranjang', { icon: '🗑️' })
    } else {
      addItem(cam)
      toast.success('Ditambahkan ke keranjang!')
    }
  }

  useEffect(() => {
    setLoading(true)
    setSearch('')
    cameraAPI.getAll({ category: meta.key })
      .then((res) => setProducts(res.data.data.cameras || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slug])

  /* Apply search + sort */
  const displayed = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'price_asc')  return a.pricePerDay - b.pricePerDay
      if (sort === 'price_desc') return b.pricePerDay - a.pricePerDay
      if (sort === 'name_asc')   return a.name.localeCompare(b.name)
      return 0
    })

  const firstName = user?.name?.split(' ')[0] || 'User'
  const tierLabel = user?.role === 'ADMIN' ? 'SUPER ADMIN' : 'LENS FRIEND'

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      <UserSidebar activeCategorySlug={slug} />

      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top App Bar ──────────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-6 md:px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value)
                  setSearch(e.target.value)
                }}
                placeholder={`Cari ${meta.label}...`}
                className="bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 w-64 md:w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-md">
              <Link to="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface" title="Dashboard">
                home
              </Link>
              <Link to="/bookings" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface" title="Riwayat">
                notifications
              </Link>
              {/* Cart icon with badge */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface transition-all"
                title="Keranjang Sewa"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant" />
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

        {/* ── Main Content ──────────────────────────────── */}
        <main className="flex-grow">

          {/* ── Hero Banner ──────────────────────────────── */}
          <div className="relative h-52 md:h-64 overflow-hidden">
            <img
              src={meta.heroImg}
              alt={meta.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/80 via-on-surface/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-margin-desktop pb-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-3">
                <Link to="/dashboard" className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                  Dashboard
                </Link>
                <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
                <span className="text-white text-xs font-bold uppercase tracking-widest">{meta.label}</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">{meta.icon}</span>
                </div>
                <div>
                  <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white leading-tight">
                    {meta.label}
                  </h1>
                  <p className="text-white/80 text-sm mt-0.5 max-w-xl hidden md:block">{meta.desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-8">

            {/* ── Tips Strip ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
              {meta.tips.map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl px-md py-sm flex items-center gap-sm"
                  style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">tips_and_updates</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-tight">{tip}</p>
                </div>
              ))}
            </div>

            {/* ── Toolbar: count + sort ─────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md mb-md">
              <div>
                <h2 className="font-headline-md text-headline-md">Semua {meta.label}</h2>
                {!loading && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {displayed.length} item tersedia
                    {search && ` · hasil pencarian "${search}"`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Urutkan:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-white border border-outline rounded-xl py-2 px-md text-sm font-body-md focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Product Grid ──────────────────────────────── */}
            {loading ? (
              <Loader />
            ) : displayed.length === 0 ? (
              <div
                className="text-center py-24 bg-white rounded-2xl"
                style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
              >
                <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 block mb-4">
                  {meta.icon}
                </span>
                <p className="font-headline-md text-on-surface-variant opacity-40">
                  {search ? `Tidak ada hasil untuk "${search}"` : `Belum ada ${meta.label}`}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(''); setGlobalSearch('') }}
                    className="mt-4 text-primary font-label-bold text-sm hover:underline"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
                {displayed.map((cam) => (
                  <ProductCard
                    key={cam.id}
                    cam={cam}
                    onRent={(id) => navigate(`/cameras/${id}`)}
                    onAddToCart={handleAddToCart}
                    inCart={isInCart(cam.id)}
                  />
                ))}
              </div>
            )}

            <div className="h-xl" />
          </div>
        </main>
      </div>

      {/* ── FAB ──────────────────────────── */}
      <div className="fixed bottom-lg right-lg z-50 group">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
        </button>
        <span className="absolute right-full mr-md bg-on-surface text-inverse-on-surface text-label-sm px-md py-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2">
          Ke Dashboard
        </span>
      </div>

      {/* ── Cart Drawer ──────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
