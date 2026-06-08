import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import UserSidebar from '../components/layout/UserSidebar'
import useAuthStore from '../store/authStore'
import { testimonialAPI, reviewAPI } from '../services/api'
import toast from 'react-hot-toast'

/* ── Star Picker ────────────────────────────────────────── */
const StyledWrapper = styled.div`
  .rating {
    display: inline-block;
  }

  .rating > input {
    display: none;
  }

  .rating:not(:checked) > label {
    float: right;
    cursor: pointer;
    font-size: 30px;
    color: #d1d5db; /* gray-300 */
    transition: color 0.2s;
  }

  .rating:not(:checked) > label:before {
    content: '★';
  }

  .rating > input:checked + label:hover,
  .rating > input:checked + label:hover ~ label,
  .rating > input:checked ~ label:hover,
  .rating > input:checked ~ label:hover ~ label,
  .rating > label:hover ~ input:checked ~ label {
    color: #e58e09;
  }

  .rating:not(:checked) > label:hover,
  .rating:not(:checked) > label:hover ~ label {
    color: #ff9e0b;
  }

  .rating > input:checked ~ label {
    color: #ffa723;
  }
`;

const StarPicker = ({ value, onChange }) => (
  <StyledWrapper>
    <div className="rating">
      {[5, 4, 3, 2, 1].map(s => (
        <React.Fragment key={s}>
          <input
            value={s}
            name="rate"
            id={`star${s}`}
            type="radio"
            checked={value === s}
            onChange={() => onChange(s)}
          />
          <label title={`${s} stars`} htmlFor={`star${s}`} />
        </React.Fragment>
      ))}
    </div>
  </StyledWrapper>
)

/* ── Star Display ───────────────────────────────────────── */
const StarDisplay = ({ rating, size = 'text-base' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <span
        key={s}
        className={`material-symbols-outlined ${size} ${s <= rating ? 'text-yellow-400' : 'text-outline'}`}
        style={{ fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}
      >
        star
      </span>
    ))}
  </div>
)

const RATING_LABELS = ['', 'Sangat Buruk 😞', 'Buruk 😕', 'Cukup 😐', 'Bagus 😊', 'Sangat Bagus 🤩']

/* ── Section Header ──────────────────────────────────────── */
const SectionHeader = ({ icon, title, iconFill = true, badge }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span
        className="material-symbols-outlined text-primary text-xl"
        style={{ fontVariationSettings: iconFill ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
    </div>
    <div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface m-0 flex items-center gap-2">
        {title}
        {badge != null && badge > 0 && (
          <span className="text-xs font-bold bg-primary text-white rounded-full px-2 py-0.5">{badge}</span>
        )}
      </h2>
    </div>
  </div>
)

/* ── Main Component ─────────────────────────────────────── */
export default function UserTestimonials() {
  const { user } = useAuthStore()
  const [myTestimonials, setMyTestimonials] = useState([])
  const [myGearReviews, setMyGearReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Service testimonial form state
  const [svcRating, setSvcRating] = useState(5)
  const [svcMessage, setSvcMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [testiRes, gearRes] = await Promise.all([
        testimonialAPI.getMy(),
        reviewAPI.getMyReviews(),
      ])
      setMyTestimonials(testiRes.data.data.testimonials || [])
      setMyGearReviews(gearRes.data.data.reviews || [])
    } catch {
      toast.error('Gagal memuat data testimoni')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitService = async (e) => {
    e.preventDefault()
    if (!svcMessage.trim() || svcMessage.trim().length < 10) {
      return toast.error('Pesan minimal 10 karakter')
    }
    setSubmitting(true)
    try {
      await testimonialAPI.create({ rating: svcRating, message: svcMessage.trim() })
      toast.success('Testimoni layanan berhasil dikirim! Terima kasih 🙏')
      setSvcRating(5)
      setSvcMessage('')
      await fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim testimoni')
    } finally {
      setSubmitting(false)
    }
  }

  const avgServiceRating = myTestimonials.length
    ? (myTestimonials.reduce((s, t) => s + t.rating, 0) / myTestimonials.length).toFixed(1)
    : null

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      <UserSidebar />
      <div className="lg:ml-72 min-h-screen flex flex-col pt-14 lg:pt-0">

        {/* ── Top Bar ─────────────────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-8 sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Testimoni Saya</h1>
            <p className="text-xs text-on-surface-variant">Bagikan pengalaman penyewaan Anda di Lensify</p>
          </div>
          <div className="flex items-center gap-lg">
            <div className="text-right hidden md:block">
              <p className="font-label-bold text-label-bold leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Member</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-8 py-8 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-10">

              {/* ══════════════════════════════════════════════
                 SECTION 1: Form Testimoni Layanan (always visible)
              ══════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SectionHeader icon="rate_review" title="Testimoni Layanan Lensify" />

                {/* Form + Preview side by side on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                  {/* ── Left: Form ── */}
                  <div className="lg:col-span-3">
                    <div
                      className="bg-white rounded-3xl p-8 relative overflow-hidden"
                      style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.12)' }}
                    >
                      {/* Decorative gradient blob */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline-variant">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/25">
                          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            sentiment_satisfied
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline-md text-headline-md text-on-surface">Tulis Testimoni</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">Bagikan pengalaman <span className="font-bold text-primary">keseluruhan layanan</span> Lensify</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmitService} className="flex flex-col gap-6">
                        {/* Rating */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                            Rating Keseluruhan <span className="text-error">*</span>
                          </label>
                          <StarPicker value={svcRating} onChange={setSvcRating} />
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={svcRating}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-sm font-bold text-primary mt-2"
                            >
                              {RATING_LABELS[svcRating]}
                            </motion.p>
                          </AnimatePresence>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                            Pesan &amp; Kesan <span className="text-error">*</span>
                          </label>
                          <textarea
                            value={svcMessage}
                            onChange={e => setSvcMessage(e.target.value)}
                            placeholder="Ceritakan pengalaman Anda menggunakan layanan Lensify — kualitas gear, pelayanan tim, kecepatan pengiriman, kemudahan pemesanan..."
                            rows={5}
                            className="w-full bg-surface border-2 border-outline-variant rounded-2xl p-4 text-sm font-body-md text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all placeholder:text-on-surface-variant/40"
                          />
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-on-surface-variant">
                              {svcMessage.trim().length < 10 && svcMessage.length > 0
                                ? <span className="text-error">Minimal 10 karakter</span>
                                : 'Minimal 10 karakter'}
                            </p>
                            <p className="text-xs text-on-surface-variant">{svcMessage.length} karakter</p>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={submitting || svcMessage.trim().length < 10}
                          className="w-full py-4 rounded-2xl bg-primary text-white font-label-bold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                        >
                          {submitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                              Kirim Testimoni Layanan
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ── Right: Info card ── */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Stats card */}
                    <div
                      className="bg-white rounded-3xl p-6"
                      style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Statistik Anda</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-2xl">
                          <p className="font-display text-3xl font-extrabold text-primary">{myTestimonials.length}</p>
                          <p className="text-xs text-on-surface-variant mt-1">Testi Layanan</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-2xl">
                          <p className="font-display text-3xl font-extrabold text-amber-500">
                            {avgServiceRating ?? '–'}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">Rating Rata-rata</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-2xl col-span-2">
                          <p className="font-display text-3xl font-extrabold text-green-600">{myGearReviews.length}</p>
                          <p className="text-xs text-on-surface-variant mt-1">Ulasan Gear</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div
                      className="bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 rounded-3xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Tips Menulis Testi</p>
                      </div>
                      <ul className="text-xs text-on-surface-variant space-y-2">
                        {[
                          'Ceritakan pengalaman spesifik yang berkesan',
                          'Sebutkan aspek yang paling Anda sukai',
                          'Berikan saran konstruktif untuk perbaikan',
                          'Testi Anda membantu pengguna lain buat keputusan',
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-xs mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ══════════════════════════════════════════════
                 SECTION 2 + 3: Riwayat — side by side on desktop
              ══════════════════════════════════════════════ */}
              <motion.div
                className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >

                {/* ── Riwayat Testimoni Layanan ── */}
                <section>
                  <SectionHeader
                    icon="history_edu"
                    title="Riwayat Testi Layanan"
                    badge={myTestimonials.length}
                  />

                  {myTestimonials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant bg-white rounded-3xl border-2 border-dashed border-outline-variant"
                      style={{ boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)' }}
                    >
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl opacity-30">reviews</span>
                      </div>
                      <p className="font-label-bold text-base text-on-surface">Belum ada testi layanan</p>
                      <p className="text-sm text-center max-w-xs">
                        Isi form di atas untuk berbagi pengalaman menggunakan layanan Lensify.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myTestimonials.map((testi, i) => (
                        <motion.div
                          key={testi.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="bg-white rounded-2xl p-5"
                          style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-label-bold text-on-surface text-sm">{user?.name}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {new Date(testi.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                              Layanan
                            </span>
                          </div>

                          <StarDisplay rating={testi.rating} size="text-sm" />

                          {testi.message && (
                            <div className="bg-surface rounded-xl p-3 mt-3">
                              <p className="text-sm text-on-surface leading-relaxed">"{testi.message}"</p>
                            </div>
                          )}

                          {testi.reply ? (
                            <div className="border-l-4 border-primary ml-4 pl-4 py-2 bg-primary/5 rounded-r-xl mt-3">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                Balasan Admin Lensify
                              </p>
                              <p className="text-sm text-on-surface">{testi.reply}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface-variant/50 italic ml-1 mt-3">
                              Belum ada balasan dari admin
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Riwayat Ulasan Gear ── */}
                <section>
                  <SectionHeader
                    icon="camera_alt"
                    title="Riwayat Ulasan Gear"
                    badge={myGearReviews.length}
                  />

                  {myGearReviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant bg-white rounded-3xl border-2 border-dashed border-outline-variant"
                      style={{ boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)' }}
                    >
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl opacity-30">camera_alt</span>
                      </div>
                      <p className="font-label-bold text-base text-on-surface">Belum ada ulasan gear</p>
                      <p className="text-sm text-center max-w-xs">
                        Selesaikan penyewaan dan beri ulasan dari halaman Riwayat Sewa.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myGearReviews.map((review, i) => {
                        const img = review.camera?.images?.[0]
                        return (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-white rounded-2xl p-5"
                            style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                {img ? (
                                  <img
                                    src={`http://localhost:5000${img}`}
                                    alt={review.camera?.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-outline-variant flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">camera_alt</span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-label-bold text-on-surface text-sm">{review.camera?.name}</p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">
                                    {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                                Terkirim
                              </span>
                            </div>

                            <StarDisplay rating={review.rating} size="text-sm" />

                            {review.comment && (
                              <div className="bg-surface rounded-xl p-3 mt-3">
                                <p className="text-sm text-on-surface leading-relaxed">"{review.comment}"</p>
                              </div>
                            )}

                            {review.reply ? (
                              <div className="border-l-4 border-primary ml-4 pl-4 py-2 bg-primary/5 rounded-r-xl mt-3">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                  Balasan Admin Lensify
                                </p>
                                <p className="text-sm text-on-surface">{review.reply}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-on-surface-variant/50 italic ml-1 mt-3">
                                Belum ada balasan dari admin
                              </p>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </section>
              </motion.div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
