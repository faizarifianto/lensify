import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { cameraAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import Loader from '../components/ui/Loader'

export default function Catalog() {
  const token = useAuthStore(state => state.token)
  const isAuthenticated = !!token && token !== 'null' && token !== 'undefined'
  const [searchParams, setSearchParams] = useSearchParams()
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('price_asc')
  const [search, setSearch] = useState(searchParams.get('q') || '')

  useEffect(() => { fetchCameras() }, [category, sort])

  const fetchCameras = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category) params.category = category
      const res = await cameraAPI.getAll(params)
      let data = res.data.data.cameras
      if (sort === 'price_asc') data = [...data].sort((a, b) => a.pricePerDay - b.pricePerDay)
      if (sort === 'price_desc') data = [...data].sort((a, b) => b.pricePerDay - a.pricePerDay)
      setCameras(data)
    } catch (e) {
        setCameras([]) 
    } finally { 
        setLoading(false) 
    }
  }

  const displayCameras = cameras.filter(cam => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      cam.name?.toLowerCase().includes(q) ||
      cam.brand?.toLowerCase().includes(q) ||
      cam.category?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="py-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto selection:bg-primary-container selection:text-on-primary">
      {/* Page Header */}
      <header className="mb-xl">
        <div className="mb-md">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-variant text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 font-label-bold group">
            <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="uppercase tracking-wider text-xs">Kembali ke Beranda</span>
          </Link>
        </div>
        <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl mb-sm uppercase leading-[1.1] text-primary">KATALOG GEAR PROFESIONAL</h1>
        <p className="font-body-lg text-body-lg max-w-2xl text-on-surface-variant">Akses perangkat visual kelas dunia dengan standar industri. Kami menyediakan solusi sewa yang fleksibel untuk kebutuhan sinematografi, fotografi, dan produksi live event profesional Anda.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Main Content Area */}
        <section className="flex-grow">
          {/* Search & Sort Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg">
            {/* Search Input */}
            <div className="relative w-full md:flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama gear, brand..."
                className="w-full pl-10 pr-4 py-sm bg-white border border-surface-variant rounded-full font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none shadow-sm transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-sm w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-sm">
                <span className="font-label-sm text-label-sm uppercase whitespace-nowrap text-on-surface-variant">Kategori:</span>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full md:w-48 bg-white border border-surface-variant rounded-full focus:border-primary focus:ring-1 focus:ring-primary/20 font-body-md py-sm px-md shadow-sm"
                >
                  <option value="">Semua</option>
                  <option value="KAMERA">Kamera</option>
                  <option value="LENSA">Lensa</option>
                  <option value="LIGHTING">Lighting</option>
                  <option value="AKSESORI">Aksesoris</option>
                </select>
              </div>
              
              <div className="flex items-center gap-sm">
                <span className="font-label-sm text-label-sm uppercase whitespace-nowrap text-on-surface-variant">Urutkan:</span>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full md:w-48 bg-white border border-surface-variant rounded-full focus:border-primary focus:ring-1 focus:ring-primary/20 font-body-md py-sm px-md shadow-sm"
                >
                  <option value="price_asc">Harga Termurah</option>
                  <option value="price_desc">Harga Termahal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
              {displayCameras.map((cam, idx) => {
                const imageSrc = cam.image || (cam.images && cam.images.length > 0 ? cam.images[0] : 'https://placehold.co/400x400?text=No+Image');
                
                return (
                  <article key={cam.id || idx} className="bg-white p-md rounded-xl border border-surface-variant text-left hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div>
                      <div className="aspect-square bg-surface-container-low rounded-lg mb-md overflow-hidden relative">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={imageSrc} alt={cam.name} />
                        <div className="absolute top-sm left-sm bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{cam.category || 'Kategori'}</div>
                      </div>
                      <h4 className="font-bold text-lg mb-xs group-hover:text-primary transition-colors">{cam.name}</h4>
                    </div>
                    <div>
                      <div className="flex items-center justify-between pt-md border-t border-surface-variant mt-2">
                        <div>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-secondary">Mulai Dari</span>
                          <span className="text-primary font-bold text-lg">Rp {cam.pricePerDay?.toLocaleString('id-ID')}<span className="text-xs font-normal text-secondary">/hari</span></span>
                        </div>
                      </div>
                    <Link
                        to={isAuthenticated ? `/cameras/${cam.id}` : '/login'}
                        className="w-full mt-md bg-primary text-white font-label-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group-hover:scale-[0.98] active:scale-95"
                      >
                        <span>Sewa Sekarang</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {cameras.length === 0 && !loading && (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-20 block mb-4">camera_alt</span>
              <p className="font-body-lg">Belum ada kamera di katalog</p>
            </div>
          )}
          {cameras.length > 0 && displayCameras.length === 0 && !loading && (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-20 block mb-4">search_off</span>
              <p className="font-body-lg">Tidak ada gear yang cocok dengan pencarian</p>
              <button onClick={() => { setSearch(''); setCategory('') }} className="mt-4 text-primary text-sm font-bold hover:underline">Reset Filter</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
