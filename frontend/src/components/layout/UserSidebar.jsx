import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const catalogSubItems = [
  { to: '/category/kamera',    label: 'Kamera',     slug: 'kamera'    },
  { to: '/category/lensa',     label: 'Lensa',      slug: 'lensa'     },
  { to: '/category/lighting',  label: 'Lighting',   slug: 'lighting'  },
  { to: '/category/aksesoris', label: 'Aksesoris',  slug: 'aksesoris' },
]

const navItems = [
  { to: '/bookings',      icon: 'history',         label: 'Riwayat Sewa' },
  { to: '/testimonials',  icon: 'reviews',         label: 'Testimoni'    },
  { to: '/settings',      icon: 'manage_accounts', label: 'Settings'     },
]

export default function UserSidebar() {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(true)
  const { logout } = useAuthStore()
  const navigate   = useNavigate()
  const location   = useLocation()

  // detect active category from URL
  const { slug } = useParams()
  const isCategoryPage = location.pathname.startsWith('/category/')

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout')
    navigate('/')
  }

  const isCatalogActive = location.pathname === '/catalog' || isCategoryPage
  const isNavActive = (path) => location.pathname === path

  useEffect(() => {
    setCatalogOpen(isCatalogActive)
  }, [location.pathname, isCategoryPage])

  const SidebarContent = () => (
    <div className="flex flex-col gap-2 py-8 px-6 h-full">

      {/* Brand */}
      <div className="mb-6">
        <Link to="/dashboard" className="block">
          <span className="font-headline-md text-headline-md font-extrabold uppercase tracking-tighter text-primary">
            Lensify.co
          </span>
          <p className="font-label-sm text-label-sm opacity-60 mt-0.5">Camera Rentals</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-xs flex-grow">

        {/* ── Dashboard link ── */}
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`font-label-bold px-md py-sm rounded-xl flex items-center gap-sm transition-all duration-200 mb-xs ${
            location.pathname === '/dashboard'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>

        {/* ── Catalog Dropdown ── */}
        <div className="relative">
          <button
            onClick={() => setCatalogOpen(!catalogOpen)}
            className={`w-full font-label-bold px-md py-sm rounded-xl flex items-center justify-between transition-all duration-200 ${
              isCatalogActive
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">grid_view</span>
              <span>Catalog</span>
            </div>
            <span
              className="material-symbols-outlined transition-transform duration-300"
              style={{ transform: catalogOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '20px' }}
            >
              expand_more
            </span>
          </button>

          <AnimatePresence initial={false}>
            {catalogOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2 ml-4 flex flex-col gap-xs pb-1">
                  {catalogSubItems.map((item) => {
                    const isActive = location.pathname === item.to
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`font-label-bold px-md py-sm rounded-xl flex items-center gap-sm transition-all duration-200 text-sm ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isActive ? 'bg-primary' : 'bg-on-surface-variant/30'
                          }`}
                        />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Other nav items ── */}
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`font-label-bold px-md py-sm rounded-xl flex items-center gap-sm transition-all duration-200 ${
              isNavActive(item.to)
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-md border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="w-full text-on-surface-variant font-label-bold px-md py-sm hover:bg-error/10 hover:text-error transition-all rounded-xl flex items-center gap-sm"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-outline-variant h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
        <span className="font-headline-md text-xl font-extrabold uppercase tracking-tighter text-primary">
          Lensify.co
        </span>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-full w-72 flex flex-col fixed left-0 top-0 bg-white border-r border-outline-variant z-50
          transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
