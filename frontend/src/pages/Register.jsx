import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useLoadingStore from '../store/loadingStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading } = useAuthStore()
  const { showLoader, hideLoader } = useLoadingStore()
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    showLoader('Membuat Akun...')
    const result = await register(form)
    hideLoader()
    if (result.success) {
      toast.success('Akun Lensify berhasil dibuat! Silakan login terlebih dahulu 🎉')
      navigate('/login')
    } else {
      toast.error(result.message)
    }
  }

  const inputClass =
    'w-full bg-surface-container-low border border-surface-variant hover:border-outline-variant focus:border-primary focus:bg-white rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder-outline/60 outline-none transition-all duration-200 focus:shadow-sm focus:shadow-primary/10'

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── Left Panel ─── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col overflow-hidden bg-primary flex-shrink-0">
        {/* Background photo overlay */}
        <div className="absolute inset-0">
          <img
            alt=""
            className="w-full h-full object-cover mix-blend-overlay opacity-30"
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80"
          />
        </div>

        {/* Branding top-left */}
        <div className="relative z-10 p-10 lg:p-16">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter text-white lowercase">
            lensify.co
          </Link>
        </div>

        {/* Hero text at bottom */}
        <div className="relative z-10 px-10 lg:px-16 pb-16 mt-auto">
          <h1 className="font-extrabold text-5xl xl:text-6xl leading-none uppercase tracking-tight text-white mb-6">
            CAPTURE THE <span className="text-white/80">FUTURE.</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Experience the evolution of photography management with Lensify's precision-engineered platform.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:px-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-[480px]">

          {/* Mobile branding */}
          <div className="md:hidden mb-10">
            <Link to="/" className="text-3xl font-extrabold text-primary tracking-tighter">
              Lensify.co
            </Link>
          </div>

          {/* Back to home */}
          <div className="mb-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Kembali ke Beranda
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Buat Akun Baru
            </h2>
            <p className="text-on-surface-variant">
              Mulai perjalanan kreatif Anda bersama kami.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
                NAMA LENGKAP
              </label>
              <input id="name" name="name" type="text" placeholder="John Doe" required value={form.name} onChange={handleChange} className={inputClass} />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
                ALAMAT EMAIL
              </label>
              <input id="email" name="email" type="email" placeholder="john@lensify.co" required value={form.email} onChange={handleChange} className={inputClass} />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
                NOMOR TELEPON
              </label>
              <input id="phone" name="phone" type="tel" placeholder="+62 812 ..." value={form.phone} onChange={handleChange} className={inputClass} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
                KATA SANDI
              </label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 karakter" required
                  value={form.password} onChange={handleChange}
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input id="terms" type="checkbox" required
                className="mt-1 w-4 h-4 rounded border-surface-variant text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0" />
              <label htmlFor="terms" className="text-sm text-on-surface-variant leading-relaxed cursor-pointer">
                Saya menyetujui{' '}
                <Link to="#" className="text-primary font-bold underline underline-offset-4 decoration-1 hover:decoration-2 transition-all">
                  Syarat dan Ketentuan
                </Link>{' '}serta Kebijakan Privasi.
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full text-white font-bold text-sm py-4 rounded-full shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-[#ff6a00] hover:shadow-primary/40 transition-all duration-200 active:scale-[0.98] uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Memproses...</>
                : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-on-surface-variant mt-10 pt-8 border-t border-surface-variant">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-bold underline underline-offset-4 decoration-2 hover:no-underline transition-all">
              Login ke Akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
