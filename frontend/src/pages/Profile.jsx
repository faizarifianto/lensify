import { useState, useRef } from 'react'
import { User, Mail, Phone, Camera, Save, Edit3 } from 'lucide-react'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import useLoadingStore from '../store/loadingStore'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const { showLoader, hideLoader } = useLoadingStore()
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileRef = useRef()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    showLoader('Menyimpan Profil...')
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      if (avatarFile) formData.append('avatar', avatarFile)
      const res = await authAPI.updateProfile(formData)
      setUser(res.data.data.user)
      toast.success('Profil berhasil diperbarui!')
      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal memperbarui profil')
    } finally { 
      hideLoader() 
    }
  }

  const avatarSrc = avatarPreview || (user?.avatar ? `http://localhost:5000${user.avatar}` : null)

  return (
    <div className="pt-24 pb-20 page-container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title mb-2">Profil Saya</h1>
          <p className="text-gray-500">Kelola informasi akun Lensify-mu</p>
        </div>

        {/* Avatar card */}
        <div className="glass rounded-3xl p-8 mb-5">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600/40 to-accent-500/40 flex items-center justify-center border-2 border-white/10">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-4xl text-white">{user?.name?.charAt(0)}</span>
                )}
              </div>
              {editing && (
                <button onClick={() => fileRef.current.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className={`badge mt-2 ${user?.role === 'ADMIN' ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-primary-500/20 text-primary-400 border-primary-500/30'} border`}>
                {user?.role === 'ADMIN' ? '👑 Admin' : '📷 Member'}
              </span>
            </div>
            <div className="sm:ml-auto">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn btn-secondary btn-md">
                  <Edit3 size={14} /> Edit Profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarFile(null) }}
                    className="btn btn-secondary btn-sm">Batal</button>
                  <button onClick={handleSave} className="btn btn-primary btn-sm">
                    <><Save size={14} /> Simpan</>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1"><User size={12} /> Nama Lengkap</label>
              {editing ? (
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              ) : (
                <div className="input bg-white/3 cursor-default">{user?.name}</div>
              )}
            </div>
            <div>
              <label className="label flex items-center gap-1"><Mail size={12} /> Email</label>
              <div className="input bg-white/3 cursor-default text-gray-500">{user?.email}</div>
              <p className="text-xs text-gray-600 mt-1">Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Phone size={12} /> Nomor Telepon</label>
              {editing ? (
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" className="input" />
              ) : (
                <div className="input bg-white/3 cursor-default">{user?.phone || <span className="text-gray-600">Belum diisi</span>}</div>
              )}
            </div>
            <div>
              <label className="label">Bergabung Sejak</label>
              <div className="input bg-white/3 cursor-default text-gray-400">
                {user?.createdAt ? format(new Date(user.createdAt), 'dd MMMM yyyy') : '-'}
              </div>
            </div>
          </div>

          {editing && avatarPreview && (
            <p className="text-xs text-primary-400 mt-3 flex items-center gap-1">
              <Camera size={11} /> Foto profil baru dipilih — simpan untuk mengubah
            </p>
          )}
        </div>

        {/* Security info */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3">Keamanan Akun</h3>
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <p className="text-sm text-white">Password</p>
              <p className="text-xs text-gray-500">Terakhir diubah: —</p>
            </div>
            <span className="text-xs text-gray-600">••••••••</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-white">Status Akun</p>
              <p className="text-xs text-gray-500">Akun aktif dan terverifikasi</p>
            </div>
            <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  )
}
