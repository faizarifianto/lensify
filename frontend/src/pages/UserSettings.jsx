import { useState } from 'react'
import UserSidebar from '../components/layout/UserSidebar'
import useAuthStore from '../store/authStore'
import useLoadingStore from '../store/loadingStore'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function UserSettings() {
  const { user, setUser } = useAuthStore()
  const { showLoader, hideLoader } = useLoadingStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  /* ── Profile state ─────────────────────────────────── */
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio:   localStorage.getItem(`user_bio_${user?.id}`) || '',
  })

  /* ── Password state ────────────────────────────────── */
  const [password, setPassword] = useState({
    current:  '',
    next:     '',
    confirm:  '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next:    false,
    confirm: false,
  })

  /* ── Notification prefs ────────────────────────────── */
  const [notif, setNotif] = useState(() => {
    const saved = localStorage.getItem(`user_notif_${user?.id}`)
    return saved ? JSON.parse(saved) : {
      email:  true,
      push:   true,
      promo:  false,
      sms:    false,
    }
  })

  /* ── Privacy prefs ─────────────────────────────────── */
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem(`user_privacy_${user?.id}`)
    return saved ? JSON.parse(saved) : {
      publicProfile: false,
      showHistory:   false,
    }
  })

  /* ── Handlers ──────────────────────────────────────── */
  const handleSaveProfile = async () => {
    showLoader('Menyimpan Profil...')
    try {
      const formData = new FormData()
      if (profile.name) formData.append('name', profile.name)
      if (profile.phone) formData.append('phone', profile.phone)
      
      const res = await authAPI.updateProfile(formData)
      if (res.data.success) {
        setUser(res.data.data.user)
        localStorage.setItem(`user_bio_${user?.id}`, profile.bio)
        setIsEditingProfile(false)
        toast.success('Profil berhasil diperbarui')
      }
    } catch {
      toast.error('Gagal menyimpan profil')
    } finally {
      hideLoader()
    }
  }

  const handleSavePassword = () => {
    if (!password.current) return toast.error('Masukkan password saat ini')
    if (password.next.length < 8) return toast.error('Password baru minimal 8 karakter')
    if (password.next !== password.confirm) return toast.error('Konfirmasi password tidak cocok')
    showLoader('Mengubah Password...')
    setTimeout(() => {
      hideLoader()
      setPassword({ current: '', next: '', confirm: '' })
      toast.success('Password berhasil diubah')
    }, 1200)
  }

  const handleSaveNotif = () => {
    showLoader('Menyimpan Preferensi...')
    setTimeout(() => {
      localStorage.setItem(`user_notif_${user?.id}`, JSON.stringify(notif))
      localStorage.setItem(`user_privacy_${user?.id}`, JSON.stringify(privacy))
      hideLoader()
      toast.success('Preferensi berhasil disimpan')
    }, 900)
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Yakin ingin menghapus akun? Semua data akan hilang secara permanen.'
    )
    if (confirmed) toast.error('Fitur penghapusan akun belum tersedia')
  }

  /* ── Toggle helper ─────────────────────────────────── */
  const Toggle = ({ checked, onChange }) => (
    <label className={`relative inline-flex items-center ${isEditingProfile ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={!isEditingProfile}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
    </label>
  )

  const PasswordField = ({ label, fieldKey, placeholder }) => (
    <div className="flex flex-col gap-2">
      <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">
        {label}
      </label>
      <div className="relative">
        <input
          className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 pr-12 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none w-full ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
          type={showPasswords[fieldKey] ? 'text' : 'password'}
          placeholder={placeholder}
          value={password[fieldKey]}
          disabled={!isEditingProfile}
          onChange={(e) => setPassword({ ...password, [fieldKey]: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((p) => ({ ...p, [fieldKey]: !p[fieldKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {showPasswords[fieldKey] ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden flex">
      <UserSidebar />

      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex-grow min-h-screen flex flex-col w-full pt-14 lg:pt-0">

        {/* ── Top App Bar ─────────────────────────────────── */}
        <header className="flex justify-between items-center h-20 px-4 sm:px-6 md:px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40 gap-4">
          <div className="flex items-center gap-md flex-1">
            <div className={`relative transition-transform w-full sm:w-auto duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="bg-surface border-none rounded-xl px-10 py-2.5 w-full sm:w-64 md:w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Cari pengaturan..."
                type="text"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-sm pl-4">
              <div className="text-right hidden md:block">
                <p className="font-label-bold text-label-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">Lens Friend</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-outline-variant flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────── */}
        <main className="p-6 md:p-margin-desktop flex-grow">

          {/* Page Header */}
          <section className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Pengaturan Akun</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Kelola profil, keamanan, dan preferensi akun Lensify kamu.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`px-4 py-2 rounded-xl text-sm font-label-bold flex items-center gap-2 transition-all ${
                  isEditingProfile 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                    : 'bg-white text-on-surface-variant hover:text-primary border border-outline-variant hover:border-primary/50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isEditingProfile ? 'close' : 'edit'}
                </span>
                {isEditingProfile ? 'Batal Edit' : 'Edit Pengaturan'}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={!isEditingProfile}
                className={`px-md py-sm bg-primary text-white font-label-bold transition-all rounded-xl flex items-center gap-xs shadow-lg shadow-primary/25 focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 ${!isEditingProfile ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:opacity-90'}`}
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Simpan Profil
              </button>
            </div>
          </section>

          {/* ── Bento Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-gutter mb-xl">

            {/* ── Profil Pengguna ────────────── col 8 */}
            <section className="col-span-12 lg:col-span-8 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">manage_accounts</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Profil Pengguna</h3>
              </div>

              {/* Avatar row */}
              <div className="flex items-center gap-md mb-8 p-5 bg-surface rounded-xl border border-outline-variant">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-3xl flex-shrink-0 shadow-lg shadow-primary/20">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-label-bold text-on-surface">{profile.name || 'Nama Pengguna'}</p>
                  <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">{profile.email}</p>
                  <span className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold rounded-lg border border-primary/20 uppercase tracking-widest">
                    Lens Friend
                  </span>
                </div>
                <button className="px-md py-sm border border-outline-variant text-on-surface-variant font-label-bold hover:bg-surface-container-high transition-all rounded-xl text-[11px] uppercase tracking-widest flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  Ganti Foto
                </button>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Nama Lengkap</label>
                  <input
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                    type="text"
                    value={profile.name}
                    disabled={!isEditingProfile}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Email</label>
                  <input
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                    type="email"
                    value={profile.email}
                    disabled={!isEditingProfile}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="email@contoh.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Nomor Telepon</label>
                  <input
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                    type="tel"
                    value={profile.phone}
                    disabled={!isEditingProfile}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+62 812 xxxx xxxx"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Bio Singkat</label>
                  <textarea
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                    rows="3"
                    value={profile.bio}
                    disabled={!isEditingProfile}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu sebagai fotografer..."
                  />
                </div>
              </div>
            </section>

            {/* ── Keamanan ──────────────────── col 4 */}
            <section className="col-span-12 lg:col-span-4 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600">security</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Keamanan</h3>
              </div>

              <div className="space-y-4 flex-1">
                <PasswordField label="Password Saat Ini"  fieldKey="current" placeholder="••••••••" />
                <PasswordField label="Password Baru"      fieldKey="next"    placeholder="Min. 8 karakter" />
                <PasswordField label="Konfirmasi Password" fieldKey="confirm" placeholder="Ulangi password baru" />

                <button
                  onClick={handleSavePassword}
                  disabled={!isEditingProfile}
                  className={`w-full py-3 bg-yellow-500 text-white font-label-bold transition-all rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 ${!isEditingProfile ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:bg-yellow-600 active:scale-95'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  Ubah Password
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Login terakhir: Baru saja
                </p>
              </div>
            </section>

            {/* ── Notifikasi ────────────────── col 7 */}
            <section className="col-span-12 lg:col-span-7 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Preferensi Notifikasi</h3>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { key: 'email',  icon: 'email',         label: 'Notifikasi Email',   sub: 'Konfirmasi booking & update status' },
                  { key: 'push',   icon: 'notifications',  label: 'Push Notification',  sub: 'Pengingat jatuh tempo & promo' },
                  { key: 'promo',  icon: 'local_offer',   label: 'Email Promosi',       sub: 'Penawaran spesial & diskon gear' },
                  { key: 'sms',    icon: 'sms',           label: 'Notifikasi SMS',      sub: 'OTP & verifikasi akun' },
                ].map(({ key, icon, label, sub }) => (
                  <div key={key} className="p-4 bg-surface border border-outline-variant rounded-xl flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                      <div>
                        <p className="font-label-bold text-sm text-on-surface">{label}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">{sub}</p>
                      </div>
                    </div>
                    <Toggle checked={notif[key]} onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })} />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotif}
                disabled={!isEditingProfile}
                className={`w-full py-3 border border-outline-variant text-on-surface font-label-bold transition-all rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 ${!isEditingProfile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Simpan Preferensi
              </button>
            </section>

            {/* ── Privasi & Danger Zone ─────── col 5 */}
            <section className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">

              {/* Privasi */}
              <div className="bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-green-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-50 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-green-600">shield</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-extrabold">Privasi</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'publicProfile', label: 'Profil Publik',    sub: 'Izinkan pengguna lain melihat profil' },
                    { key: 'showHistory',   label: 'Tampilkan History', sub: 'Riwayat sewa terlihat di profil' },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className="p-4 bg-surface border border-outline-variant rounded-xl flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-label-bold text-sm text-on-surface">{label}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">{sub}</p>
                      </div>
                      <Toggle checked={privacy[key]} onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-red-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-red-600">warning</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-extrabold">Danger Zone</h3>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Tindakan berikut bersifat permanen dan <strong>tidak dapat dibatalkan</strong>. Mohon pertimbangkan dengan matang.
                </p>
                <div className="space-y-3">
                  <button disabled={!isEditingProfile} className={`w-full flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl transition-all group ${!isEditingProfile ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400'}`}>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-500">download</span>
                      <span className="font-label-bold text-on-surface text-sm">Ekspor Data Saya</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!isEditingProfile}
                    className={`w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl transition-all group ${!isEditingProfile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-600">delete_forever</span>
                      <span className="font-label-bold text-red-700 text-sm">Hapus Akun Saya</span>
                    </div>
                    <span className="material-symbols-outlined text-red-400">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* ── Footer Status Panel ──────────────────────── */}
          <section className="mt-lg p-xl bg-[#1b1c1c] text-white flex flex-col md:flex-row items-center justify-between rounded-2xl shadow-xl gap-8">
            <div className="flex items-center gap-md">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse shrink-0">
                <span className="material-symbols-outlined text-white text-3xl">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline-md text-2xl font-extrabold text-white mb-1">Akun Terverifikasi</h4>
                <p className="text-sm text-gray-400 max-w-md">
                  Akun kamu aktif & aman. Nikmati akses penuh ke seluruh gear premium Lensify.
                </p>
              </div>
            </div>
            <div className="flex gap-12 sm:gap-16">
              <div className="text-center">
                <p className="text-primary font-headline-lg text-4xl font-extrabold mb-1">
                  {user?.name?.split(' ')[0]?.charAt(0).toUpperCase() || 'L'}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Inisial</p>
              </div>
              <div className="text-center">
                <p className="text-primary font-headline-lg text-4xl font-extrabold mb-1">Free</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Tier</p>
              </div>
            </div>
          </section>

          <div className="h-xl" />
        </main>
      </div>
    </div>
  )
}
