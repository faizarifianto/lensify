import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Reports() {
  const { user } = useAuthStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const [period, setPeriod] = useState('this_month')
  const [chartView, setChartView] = useState('monthly')

  // Fetch real data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await adminAPI.getStats({ period })
        setStats(res.data.data)
      } catch (error) {
        toast.error("Gagal memuat statistik laporan")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [period])

  const formatRupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

  // Top metric calculations formatting
  const metrics = stats?.stats || {
    totalBookingsToday: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    totalCameras: 0
  }

  const formatDailyDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d} ${monthNames[parseInt(m) - 1]}`
  }

  // Generate complete daily range with gap-filling
  const getCompleteDailyData = () => {
    const today = new Date()
    let start, end

    if (period === 'last_month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end = new Date(today.getFullYear(), today.getMonth(), 0)
    } else if (period === 'this_year') {
      start = new Date(today.getFullYear(), 0, 1)
      end = today
    } else if (period === 'all_time') {
      if (!stats?.dailyChart?.length) return []
      const sorted = [...stats.dailyChart].sort((a, b) => a.day.localeCompare(b.day))
      const [sy, sm, sd] = sorted[0].day.split('-').map(Number)
      const [ey, em, ed] = sorted[sorted.length - 1].day.split('-').map(Number)
      start = new Date(sy, sm - 1, sd)
      end = new Date(ey, em - 1, ed)
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = today
    }

    const dataMap = {}
    ;(stats?.dailyChart || []).forEach(d => {
      dataMap[d.day] = { count: d.count, revenue: d.revenue }
    })

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const result = []
    const current = new Date(start)
    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
      const entry = dataMap[key] || { count: 0, revenue: 0 }
      result.push({ label: formatDailyDate(key), value: entry.count, revenue: entry.revenue, isCurrent: key === todayKey })
      current.setDate(current.getDate() + 1)
    }
    return result
  }

  // Generate complete monthly range with gap-filling
  const getCompleteMonthlyData = () => {
    const today = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

    let months = []
    if (period === 'this_year' || period === 'all_time') {
      months = Array.from({ length: 12 }, (_, i) => `${today.getFullYear()}-${String(i + 1).padStart(2, '0')}`)
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      }
    }

    const dataMap = {}
    ;(stats?.monthlyChart || []).forEach(m => {
      dataMap[m.month] = { count: m.count, revenue: m.revenue }
    })

    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    return months.map(m => {
      const [, mon] = m.split('-')
      const entry = dataMap[m] || { count: 0, revenue: 0 }
      return { label: monthNames[parseInt(mon) - 1], value: entry.count, revenue: entry.revenue, isCurrent: m === currentMonthKey }
    })
  }

  // Chart data based on toggle
  let chartData = []
  if (chartView === 'monthly') {
    chartData = getCompleteMonthlyData()
  } else {
    chartData = getCompleteDailyData()
  }

  const maxVal = Math.max(...chartData.map(d => d.value), 1)

  const handleExportPDF = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    const loadingToast = toast.loading('Sedang memproses dokumen PDF...');
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan-Bisnis-Lensify.pdf`);
      
      toast.success('Laporan PDF berhasil diunduh', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal mengekspor laporan', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden flex">
      <style>{`@media print { body { background: white !important; } .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; } }`}</style>
      <div className="print:hidden relative z-50"><AdminSidebar /></div>

      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex-grow min-h-screen flex flex-col w-full print-area">
        {/* TopAppBar */}
        <header className="flex justify-between items-center h-20 px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40 print:hidden">
          <div className="flex items-center gap-md">
            <div className={`relative transition-transform duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="bg-surface border-none rounded-xl px-10 py-2.5 w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Search analytics..."
                type="text"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
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
        <div id="report-content" className="bg-surface">
          <main className="p-margin-desktop flex-grow">
          {/* Header Section */}
          <section className="mb-xl flex justify-between items-end">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Laporan Analitik</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Pantau performa bisnis dan keuangan Lensify.</p>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-outline-variant px-4 py-2.5 rounded-xl cursor-pointer hover:bg-surface-container-high transition-all shadow-sm font-label-bold text-on-surface text-sm outline-none appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%234B5563%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010H7Z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]"
              >
                <option value="this_month">Bulan Ini</option>
                <option value="last_month">Bulan Lalu</option>
                <option value="this_year">Tahun Ini</option>
                <option value="all_time">Semua Waktu</option>
              </select>
              <button onClick={handleExportPDF} className="px-md py-sm bg-primary text-white font-label-bold hover:opacity-90 shadow-lg shadow-primary/25 transition-all rounded-xl flex items-center gap-xs">
                <span className="material-symbols-outlined text-lg">download</span> Unduh Laporan PDF
              </button>
            </div>
          </section>

          {/* Stats Grid (Summary Cards) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
            {/* Total Pendapatan */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">payments</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5% vs bln lalu</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Total Pendapatan</p>
                <h2 className="font-headline-md text-headline-md mt-xs text-on-surface">
                  {loading ? '...' : formatRupiah(metrics.monthlyRevenue)}
                </h2>
              </div>
            </div>

            {/* Rata-rata Sewa */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-primary border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">event_available</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{metrics.totalBookingsToday} Hari Ini</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Total volume sewa</p>
                <h2 className="font-headline-md text-headline-md mt-xs text-on-surface">{loading ? '...' : `${metrics.totalBookings} Unit`}</h2>
              </div>
            </div>

            {/* Pertumbuhan Bulanan */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-yellow-500 border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600">insights</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">Katalog Aktif</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Jumlah Gear Tersedia</p>
                <h2 className="font-headline-md text-headline-md mt-xs text-on-surface">{loading ? '...' : metrics.totalCameras} Set</h2>
              </div>
            </div>

            {/* Biaya Maintenance */}
            <div className="bg-white p-md rounded-[1rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all hover:-translate-y-1 border-l-4 border-l-green-500 border-t border-r border-b border-outline-variant/50">
              <div className="flex justify-between items-start">
                <div className="bg-green-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-green-600">build</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded-full">-2.1% efficiency</span>
              </div>
              <div className="mt-md">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold opacity-60">Biaya Maintenance</p>
                <h2 className="font-headline-md text-headline-md mt-xs text-on-surface">Rp 0</h2>
              </div>
            </div>
          </section>

          {/* Stunning Framer Motion Chart Section */}
          <section className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 p-lg mb-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">bar_chart</span>
                  Tren Penyewaan
                </h3>
                <p className="text-on-surface-variant text-body-md mt-1">Visualisasi dinamis volume sewa dan pendapatan bulanan.</p>
              </div>
              <div className="flex bg-surface p-1 rounded-xl border border-outline-variant print:hidden">
                <button onClick={() => setChartView('daily')} className={`px-5 py-2 font-label-bold text-sm transition-colors rounded-lg ${chartView === 'daily' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-on-surface-variant hover:text-primary'}`}>Harian</button>
                <button onClick={() => setChartView('monthly')} className={`px-5 py-2 font-label-bold text-sm transition-colors rounded-lg ${chartView === 'monthly' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-on-surface-variant hover:text-primary'}`}>Bulanan</button>
              </div>
            </div>

            <div className="h-[360px] w-full flex items-end justify-between px-2 md:px-10 relative">
              {/* Target/Max line marker */}
              <div className="absolute top-8 left-0 right-0 border-t border-dashed border-outline-variant w-full flex justify-end px-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 -mt-2.5 bg-white pl-2">Peak Vol: {maxVal}</span>
              </div>

              {/* Chart Bars */}
              {!loading && chartData.map((data, i) => {
                const heightPercent = data.value > 0 ? (data.value / maxVal) * 100 : 5
                const hasData = data.value > 0
                const showLabel = chartData.length <= 16 || i % Math.ceil(chartData.length / 16) === 0
                const animDelay = i * (chartData.length > 15 ? 0.03 : 0.08)

                return (
                  <div key={i} className="flex flex-col items-center flex-1 group z-10 min-w-0">
                    <div className="w-full relative h-[300px] flex items-end justify-center rounded-2xl hover:bg-surface/60 transition-colors pt-12 pb-4">

                      {/* Tooltip Overlay */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-on-surface text-white px-4 py-2 rounded-xl shadow-xl flex flex-col items-center pointer-events-none transition-all duration-300 z-50 whitespace-nowrap scale-95 group-hover:scale-100 transform origin-bottom">
                        <span className="font-headline-md text-base">{data.value} Unit</span>
                        <span className="text-[11px] font-label-bold text-primary-fixed-dim">{formatRupiah(data.revenue)}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface"></div>
                      </div>

                      {/* Animated Rounded Bar Graph */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${heightPercent}%`, opacity: 1 }}
                        transition={{ duration: 0.8, delay: animDelay, type: 'spring', bounce: 0.4 }}
                        className={`w-3/4 max-w-[3.5rem] rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300
                          ${data.isCurrent
                            ? 'bg-gradient-to-t from-primary/40 to-primary shadow-[0_4px_24px_-4px_rgba(255,77,0,0.4)]'
                            : hasData
                              ? 'bg-gradient-to-t from-gray-200 to-gray-300 group-hover:from-primary/40 group-hover:to-primary group-hover:shadow-[0_4px_24px_-4px_rgba(255,77,0,0.4)]'
                              : 'bg-gradient-to-t from-gray-100 to-gray-200 opacity-50 group-hover:from-primary/20 group-hover:to-primary/40 group-hover:opacity-80 group-hover:shadow-[0_4px_16px_-4px_rgba(255,77,0,0.2)]'
                          }`}
                      >
                        {/* Shimmer on hover */}
                        <div className="absolute top-0 right-0 left-0 h-4 bg-white/0 group-hover:bg-white/30 rounded-t-2xl transition-all duration-300"></div>
                      </motion.div>
                    </div>
                    {/* X-Axis Label */}
                    <span className={`mt-2 font-label-bold transition-colors group-hover:text-primary ${data.isCurrent ? 'text-primary font-extrabold' : 'text-on-surface-variant'} ${chartData.length > 16 ? 'text-[8px]' : 'text-xs'} ${showLabel ? '' : chartData.length > 20 ? 'invisible' : ''}`}>
                      {data.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>



          {/* Detailed Reports Table */}
          <section className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/50">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Top Performa Katalog</h3>
              <button className="text-primary font-label-bold text-sm flex items-center gap-1 hover:underline">
                Lihat Semua
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest border-b border-outline-variant">
                    <th className="px-md py-4">Peralatan</th>
                    <th className="px-md py-4">Kategori</th>
                    <th className="px-md py-4 text-center">Total Sewa</th>
                    <th className="px-md py-4">Pendapatan</th>
                    <th className="px-md py-4">Status</th>
                    <th className="px-md py-4 text-right pr-md">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {stats?.topPerformers && stats.topPerformers.length > 0 ? (
                    stats.topPerformers.map((item, index) => (
                      <tr key={index} className="hover:bg-surface-container-high transition-colors">
                        <td className="px-md py-3 flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image.startsWith('http') ? item.image : item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-outline-variant" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant text-lg">camera_alt</span>
                            </div>
                          )}
                          <div>
                            <p className="font-label-bold text-sm text-on-surface">{item.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{item.brand}</p>
                          </div>
                        </td>
                        <td className="px-md py-3 text-sm text-on-surface-variant">{item.category}</td>
                        <td className="px-md py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {item.totalRented}
                          </span>
                        </td>
                        <td className="px-md py-3 font-bold text-on-surface">{formatRupiah(item.revenue)}</td>
                        <td className="px-md py-3">
                          <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full ${item.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-md py-3 text-right pr-md">
                          <button className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-md py-12 text-center text-on-surface-variant text-sm">
                        Belum ada data performa katalog (Belum ada yang tersewa pada periode ini)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Simple Footer */}
            <div className="px-md py-4 bg-surface border-t border-outline-variant flex justify-end">
              <button className="flex items-center gap-1 text-primary font-label-bold text-sm hover:underline">
                Unduh Laporan Lengkap
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          </section>

          <div className="h-xl"></div>
        </main>
        </div>
      </div>
    </div>
  )
}
