import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Camera, Shield, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (result.success) {
      if (result.user.role !== 'ADMIN') {
        toast.error('Akses ditolak. Bukan akun admin.')
        useAuthStore.getState().logout()
        return
      }
      toast.success('Selamat datang, Admin!')
      navigate('/admin')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-950">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Lensify <span className="text-gray-500 text-sm font-normal">Admin</span></span>
        </Link>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-accent-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Admin Panel</h1>
              <p className="text-gray-500 text-xs">Akses terbatas</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Admin</label>
              <input id="admin-email" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@lensify.co" className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input id="admin-password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" className="input pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-accent btn-lg w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : <><Shield size={16} /> Masuk Admin</>}
            </button>
          </form>

          <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/20 rounded-xl text-xs text-gray-400">
            <p className="font-medium text-accent-400 mb-1">Demo:</p>
            <p>admin@lensify.co / admin123</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Kembali ke Lensify.co</Link>
        </p>
      </div>
    </div>
  )
}
