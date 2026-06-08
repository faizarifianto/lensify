import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

/* ── Star Display ───────────────────────────────────────── */
const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s}
        className={`material-symbols-outlined text-base ${s <= rating ? 'text-yellow-400' : 'text-outline'}`}
        style={{ fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}>
        star
      </span>
    ))}
  </div>
)

/* ── Badge ──────────────────────────────────────────────── */
const StatusBadge = ({ replied }) => (
  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border flex-shrink-0 ${
    replied
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-orange-50 text-orange-600 border-orange-200'
  }`}>
    {replied ? 'Dibalas' : 'Belum Dibalas'}
  </span>
)

/* ── Tab Button ─────────────────────────────────────────── */
const TabBtn = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
      active
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : 'bg-white text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
    }`}
  >
    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    {label}
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-surface text-on-surface-variant'}`}>
      {count}
    </span>
  </button>
)

/* ── Main ───────────────────────────────────────────────── */
export default function AdminTestimonials() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('service')           // 'service' | 'gear'
  const [reviews, setReviews] = useState([])          // gear reviews
  const [testimonials, setTestimonials] = useState([]) // service testimonials
  const [loading, setLoading] = useState(true)
  const [replyModal, setReplyModal] = useState(null)  // { type: 'gear'|'service', item }
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filterRating, setFilterRating] = useState('all')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [revRes, testiRes] = await Promise.all([
        adminAPI.getAllReviews(),
        adminAPI.getAllTestimonialsAdmin(),
      ])
      setReviews(revRes.data.data.reviews || [])
      setTestimonials(testiRes.data.data.testimonials || [])
    } catch {
      toast.error('Gagal memuat data testimoni')
    } finally {
      setLoading(false)
    }
  }

  const openReply = (item, type) => {
    setReplyModal({ type, item })
    setReplyText(item.reply || '')
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return toast.error('Balasan tidak boleh kosong')
    setSubmitting(true)
    try {
      if (replyModal.type === 'gear') {
        await adminAPI.replyReview(replyModal.item.id, replyText.trim())
      } else {
        await adminAPI.replyTestimonial(replyModal.item.id, replyText.trim())
      }
      toast.success('Balasan berhasil dikirim!')
      setReplyModal(null)
      fetchAll()
    } catch {
      toast.error('Gagal mengirim balasan')
    } finally {
      setSubmitting(false)
    }
  }

  const activeList = tab === 'gear' ? reviews : testimonials
  const filtered = filterRating === 'all'
    ? activeList
    : activeList.filter(r => r.rating === Number(filterRating))

  const allItems = [...reviews, ...testimonials]
  const totalReplied = allItems.filter(r => r.reply).length
  const totalPending = allItems.filter(r => !r.reply).length
  const avgRating = allItems.length
    ? (allItems.reduce((s, r) => s + r.rating, 0) / allItems.length).toFixed(1)
    : 0

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top Bar ── */}
        <header className="flex justify-between items-center h-20 px-8 sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Testimoni Pelanggan</h1>
            <p className="text-xs text-on-surface-variant">Kelola ulasan gear dan testimoni layanan dari pengguna</p>
          </div>
          <div className="flex items-center gap-lg">
            <div className="text-right hidden md:block">
              <p className="font-label-bold text-label-bold leading-none">{user?.name || 'Admin Lensify'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="px-8 py-6 flex-grow">

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Testi Layanan', value: testimonials.length, icon: 'sentiment_satisfied', color: 'text-blue-500 bg-blue-50' },
              { label: 'Ulasan Gear', value: reviews.length, icon: 'camera_alt', color: 'text-purple-500 bg-purple-50' },
              { label: 'Sudah Dibalas', value: loading ? '—' : totalReplied, icon: 'reply', color: 'text-green-500 bg-green-50' },
              { label: 'Belum Dibalas', value: loading ? '—' : totalPending, icon: 'pending', color: 'text-orange-500 bg-orange-50' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-md flex flex-col gap-3" style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-60">{card.label}</p>
                  <p className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '—' : card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <TabBtn
              active={tab === 'service'}
              onClick={() => { setTab('service'); setFilterRating('all') }}
              icon="sentiment_satisfied"
              label="Testi Layanan"
              count={testimonials.length}
            />
            <TabBtn
              active={tab === 'gear'}
              onClick={() => { setTab('gear'); setFilterRating('all') }}
              icon="camera_alt"
              label="Ulasan Gear"
              count={reviews.length}
            />
            {/* Avg Rating badge */}
            <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
              <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold text-amber-700 text-sm">{loading ? '—' : avgRating}</span>
              <span className="text-xs text-amber-600">rata-rata</span>
            </div>
          </div>

          {/* ── Filter Rating ── */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm font-bold text-on-surface-variant">Filter:</span>
            {['all', '5', '4', '3', '2', '1'].map(r => (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  filterRating === r
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                }`}
              >
                {r === 'all' ? 'Semua' : `${r} ⭐`}
              </button>
            ))}
          </div>

          {/* ── Content Panel ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
            >
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl opacity-30">
                      {tab === 'service' ? 'sentiment_satisfied' : 'camera_alt'}
                    </span>
                  </div>
                  <p className="font-label-bold text-base">Belum ada {tab === 'service' ? 'testimoni layanan' : 'ulasan gear'}</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {filtered.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-6 hover:bg-surface/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">

                          {/* Avatar */}
                          <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {item.user?.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* User info row */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-label-bold text-on-surface">{item.user?.name}</span>
                              <span className="text-xs text-on-surface-variant">{item.user?.email}</span>
                              <StarDisplay rating={item.rating} />
                            </div>

                            {/* Meta */}
                            <p className="text-xs text-on-surface-variant mb-2 flex items-center gap-1.5">
                              {tab === 'service' ? (
                                <>
                                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span>
                                  <span className="font-semibold text-primary">Layanan Lensify</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-xs">camera_alt</span>
                                  <span>{item.camera?.name}</span>
                                </>
                              )}
                              <span className="text-outline">·</span>
                              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>

                            {/* Message / Comment */}
                            {(item.message || item.comment) && (
                              <p className="text-sm text-on-surface bg-surface rounded-xl p-3 leading-relaxed mb-2">
                                "{item.message || item.comment}"
                              </p>
                            )}

                            {/* Admin Reply */}
                            {item.reply && (
                              <div className="ml-4 border-l-4 border-primary pl-4 bg-primary/5 rounded-r-xl py-2 pr-3">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                  Balasan Admin
                                </p>
                                <p className="text-sm text-on-surface">{item.reply}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <StatusBadge replied={!!item.reply} />
                          <button
                            onClick={() => openReply(item, tab === 'gear' ? 'gear' : 'service')}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              item.reply
                                ? 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                                : 'border-primary text-primary bg-primary/5 hover:bg-primary hover:text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">reply</span>
                            {item.reply ? 'Edit Balasan' : 'Balas'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Reply Modal ── */}
      <AnimatePresence>
        {replyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setReplyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  replyModal.type === 'service' ? 'bg-blue-50' : 'bg-purple-50'
                }`}>
                  <span className={`material-symbols-outlined text-xl ${
                    replyModal.type === 'service' ? 'text-blue-500' : 'text-purple-500'
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {replyModal.type === 'service' ? 'sentiment_satisfied' : 'camera_alt'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Balas Testimoni</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {replyModal.type === 'service' ? 'Testimoni Layanan' : 'Ulasan Gear'}
                    {' '}dari <strong>{replyModal.item.user?.name}</strong>
                  </p>
                </div>
              </div>

              {/* Original content */}
              <div className="bg-surface rounded-2xl p-4 mb-5">
                <StarDisplay rating={replyModal.item.rating} />
                <p className="text-sm text-on-surface mt-2 leading-relaxed">
                  "{replyModal.item.message || replyModal.item.comment || '—'}"
                </p>
              </div>

              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Tulis balasan Anda kepada pelanggan..."
                rows={4}
                className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-sm font-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setReplyModal(null)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-bold text-sm hover:bg-surface transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={submitting || !replyText.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-label-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-sm">send</span>}
                  {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
