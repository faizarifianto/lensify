import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import Loader from '../../components/ui/Loader'

/* ── Helpers ──────────────────────────────────────────────── */
const formatRupiahShort = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}<span class="text-2xl">jt</span>`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
  return String(n)
}

const STATUS_LABEL = {
  PENDING:   { label: 'Pending',     bg: 'bg-amber-100',  text: 'text-amber-700'  },
  CONFIRMED: { label: 'Confirmed',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
  ONGOING:   { label: 'In Progress', bg: 'bg-orange-100', text: 'text-primary'    },
  RETURNED:  { label: 'Completed',   bg: 'bg-green-100',  text: 'text-green-700'  },
  CANCELLED: { label: 'Cancelled',   bg: 'bg-red-100',    text: 'text-red-600'    },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_LABEL[status] || { label: status, bg: 'bg-surface', text: 'text-on-surface-variant' }
  return (
    <span className={`px-3 py-1 ${s.bg} ${s.text} text-[10px] font-bold uppercase rounded-full tracking-wider`}>
      {s.label}
    </span>
  )
}

/* ── Bar Chart ────────────────────────────────────────────── */
const InventoryChart = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return <div className="text-sm text-on-surface-variant">Belum ada data</div>;
  }

  const mappedColor = {
    'KAMERA': 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    'LENSA': 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    'LIGHTING': 'bg-gradient-to-t from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    'AKSESORIS': 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
  };

  const maxCount = Math.max(...distribution.map(d => d._count), 1);
  
  const bars = distribution.map(d => ({
    label: `${d.category.charAt(0) + d.category.slice(1).toLowerCase()} (${d._count})`,
    pct: (d._count / maxCount) * 100,
    colorClass: mappedColor[d.category] || 'bg-gradient-to-t from-gray-500 to-gray-400 shadow-sm'
  }));

  return (
    <div className="w-full aspect-[2/1] flex items-end justify-around gap-4 px-4 pb-4">
      {bars.map((bar, i) => (
        <div
          key={i}
          title={bar.label}
          className={`w-1/4 transition-all duration-300 rounded-t-lg cursor-pointer opacity-80 hover:opacity-100 ${bar.colorClass}`}
          style={{ height: `${Math.max(bar.pct, 5)}%` }}
        />
      ))}
    </div>
  )
}

/* ── Main Dashboard ───────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getAllBookings({ limit: 5 }),
    ])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data.data.stats)
        setRecentBookings(bookingsRes.data.data.bookings || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  /* revenue formatted */
  const revenueVal = stats?.monthlyRevenue || 0
  let revenueDisplay = '0'
  let revenueSuffix = ''
  if (revenueVal >= 1_000_000_000) { revenueDisplay = (revenueVal / 1_000_000_000).toFixed(1); revenueSuffix = 'M' }
  else if (revenueVal >= 1_000_000) { revenueDisplay = (revenueVal / 1_000_000).toFixed(1); revenueSuffix = 'jt' }
  else if (revenueVal >= 1_000) { revenueDisplay = (revenueVal / 1_000).toFixed(0); revenueSuffix = 'rb' }
  else { revenueDisplay = String(revenueVal) }

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      {/* ── Sidebar ────────────────────────────── */}
      <AdminSidebar />

      {/* ── Main wrapper offset by sidebar ─────── */}
      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top App Bar ────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          {/* Search */}
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari gear atau pesanan..."
                className="bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-sm pl-4">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-label-bold leading-none">{user?.name || 'Admin Lensify'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Super Admin</p>
              </div>
              {/* Avatar circle */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-outline-variant">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ─────────────────────── */}
        <main className="px-8 py-6 flex-grow">

          {/* Page header + Quick Actions */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Utama</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Selamat datang kembali, berikut ringkasan performa hari ini.
              </p>
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-6">

            {/* Card 1 — Total Gear */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 cursor-pointer"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">camera_alt</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                  Total Gear
                </p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : (stats?.totalCameras ?? 0)}
                </h2>
              </div>
            </div>

            {/* Card 2 — Active Bookings */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 cursor-pointer"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">shopping_cart</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Aktif</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                  Active Bookings
                </p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : (stats?.ongoingBookings ?? 0)}
                </h2>
              </div>
            </div>

            {/* Card 3 — Revenue */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 cursor-pointer"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">payments</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">
                  Bulan Ini
                </span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                  Revenue
                </p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : (
                    <>
                      {revenueDisplay}
                      {revenueSuffix && <span className="text-2xl">{revenueSuffix}</span>}
                    </>
                  )}
                </h2>
              </div>
            </div>

            {/* Card 4 — Maintenance */}
            <div
              className="bg-white p-md rounded-2xl flex flex-col justify-between group transition-all hover:-translate-y-1 cursor-pointer"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">build</span>
                </div>
                <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-full">Segera</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                  Maintenance
                </p>
                <h2 className="font-display-xl-mobile text-display-xl-mobile mt-xs text-on-surface">
                  {loading ? '—' : (stats?.maintenanceCameras ?? 0)}
                </h2>
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

            {/* Pesanan Terbaru */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="p-md border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Pesanan Terbaru</h3>
                <Link
                  to="/admin/orders"
                  className="text-primary font-label-bold text-sm hover:underline transition-all"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest">
                      <th className="px-md py-4">Customer</th>
                      <th className="px-md py-4">Gear Type</th>
                      <th className="px-md py-4">Durasi</th>
                      <th className="px-md py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-10">
                          <Loader />
                        </td>
                      </tr>
                    ) : recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-md py-12 text-center text-on-surface-variant text-sm">
                          Belum ada pesanan
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-surface transition-colors group cursor-pointer"
                          onClick={() => navigate('/admin/orders')}
                        >
                          <td className="px-md py-4 flex items-center gap-2">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {b.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-label-bold">{b.user?.name}</span>
                          </td>
                          <td className="px-md py-4 font-body-md text-on-surface-variant">{b.camera?.name}</td>
                          <td className="px-md py-4 font-body-md text-on-surface-variant">{b.totalDays} Hari</td>
                          <td className="px-md py-4 text-right">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Distribusi Inventaris */}
            <div
              className="bg-white rounded-2xl flex flex-col overflow-hidden"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              <div className="p-md border-b border-outline-variant">
                <h3 className="font-headline-md text-headline-md text-on-surface">Distribusi Inventaris</h3>
              </div>

              {/* Chart */}
              <div className="p-md flex-grow flex items-center justify-center relative overflow-hidden h-[200px]">
                <InventoryChart distribution={stats?.categoryDistribution} />
              </div>

              {/* Legend */}
              <div className="p-md bg-surface grid grid-cols-2 gap-sm text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" /> Kamera
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" /> Lensa
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> Lighting
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" /> Aksesoris
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-8" />
        </main>
      </div>
    </div>
  )
}
