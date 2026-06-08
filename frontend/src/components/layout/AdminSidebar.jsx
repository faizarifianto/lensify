import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin',                icon: 'dashboard',      label: 'Dashboard',     exact: true },
  { to: '/admin/products',       icon: 'camera_roll',    label: 'Kelola Katalog' },
  { to: '/admin/orders',         icon: 'event_available',label: 'Kelola Sewa'    },
  { to: '/admin/reports',        icon: 'description',    label: 'Laporan',       badge: 'Baru' },
  { to: '/admin/testimonials',   icon: 'reviews',        label: 'Testimoni'      },
  { to: '/admin/settings',       icon: 'settings',       label: 'Settings'       },
]

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hiddenBadges, setHiddenBadges] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingTestimonials, setPendingTestimonials] = useState(0)
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const stored = localStorage.getItem('lensify_hidden_badges')
    if (stored) setHiddenBadges(JSON.parse(stored))
  }, [])

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await adminAPI.getStats();
        if (res.data?.success) {
          setPendingCount(res.data.data.stats.pendingBookings || 0);
          setPendingTestimonials(res.data.data.stats.pendingTestimonials || 0);
        }
      } catch (error) {
        console.error('Failed to fetch pending stats', error);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout')
    navigate('/')
  }

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)

  const SidebarContent = () => (
    <div className="flex flex-col gap-2 py-8 px-6 h-full">
      {/* Brand */}
      <div className="mb-6">
        <Link to="/admin" className="block">
          <span className="font-headline-md text-headline-md font-extrabold uppercase tracking-tighter text-primary">
            Lensify
          </span>
          <p className="font-label-sm text-label-sm opacity-60 mt-0.5">Admin Portal</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-xs flex-grow">
        {navItems.map((item) => {
          const active = isActive(item)
          const isKelolaSewa = item.label === 'Kelola Sewa'
          const isTestimoni = item.label === 'Testimoni'
          
          let displayBadgeText = item.badge
          let showBadge = item.badge && !hiddenBadges.includes(item.label)

          if (isKelolaSewa && pendingCount > 0) {
            displayBadgeText = `+${pendingCount}`
            showBadge = true
          } else if (isTestimoni && pendingTestimonials > 0) {
            displayBadgeText = `+${pendingTestimonials}`
            showBadge = true
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                setMobileOpen(false)
                if (item.badge && !hiddenBadges.includes(item.label) && !isKelolaSewa && !isTestimoni) {
                  const newHidden = [...hiddenBadges, item.label]
                  setHiddenBadges(newHidden)
                  localStorage.setItem('lensify_hidden_badges', JSON.stringify(newHidden))
                }
              }}
              className={`font-label-bold px-md py-sm rounded-xl flex items-center gap-sm transition-all duration-200 ${active
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                } ${showBadge ? 'justify-between' : ''}`}
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {showBadge && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {displayBadgeText}
                </span>
              )}
            </Link>
          )
        })}
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
          Lensify
        </span>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`h-full w-72 flex flex-col fixed left-0 top-0 bg-white border-r border-outline-variant z-50
          transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
