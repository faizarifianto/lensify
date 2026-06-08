import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useLoadingStore from '../store/loadingStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const { showLoader, hideLoader } = useLoadingStore()
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    showLoader('Verifikasi Akun...')
    const result = await login(form)
    hideLoader()
    if (result.success) {
      toast.success(`Selamat datang, ${result.user.name}!`)
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/')
    } else {
      toast.error(result.message)
    }
  }

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
              Selamat Datang
            </h2>
            <p className="text-on-surface-variant">
              Masuk ke akun Lensify.co Anda untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60"
              >
                ALAMAT EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-surface-variant hover:border-outline-variant focus:border-primary focus:bg-white rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder-outline/60 outline-none transition-all duration-200 focus:shadow-sm focus:shadow-primary/10"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60"
                >
                  KATA SANDI
                </label>
                <Link
                  to="#"
                  className="text-[10px] font-bold text-primary hover:underline underline-offset-4"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-surface-variant hover:border-outline-variant focus:border-primary focus:bg-white rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder-outline/60 outline-none transition-all duration-200 focus:shadow-sm focus:shadow-primary/10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-surface-variant text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">
                Ingat saya selama 30 hari
              </label>
            </div>

            {/* Demo Accounts */}
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Akun Demo</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-on-surface-variant">
                <div>
                  <p className="font-bold text-on-surface mb-0.5">User</p>
                  <p>demo@lensify.co</p>
                  <p>user123</p>
                </div>
                <div>
                  <p className="font-bold text-on-surface mb-0.5">Admin</p>
                  <p>admin@lensify.co</p>
                  <p>admin123</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold text-sm py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-[#e64500] transition-all duration-200 active:scale-[0.98] uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>Memproses... <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span></>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 border-t border-surface-variant/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">ATAU EMAIL</span>
            <div className="flex-1 border-t border-surface-variant/50" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-surface-variant bg-white hover:bg-surface-container-low transition-all active:scale-[0.99] text-sm font-semibold text-on-surface"
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-on-surface-variant mt-10 pt-8 border-t border-surface-variant">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="text-primary font-bold underline underline-offset-4 decoration-2 hover:no-underline transition-all"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
