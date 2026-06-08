import { useState } from 'react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import useAuthStore from '../../store/authStore'
import useLoadingStore from '../../store/loadingStore'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuthStore()
  const { showLoader, hideLoader } = useLoadingStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Settings State
  const [businessProfile, setBusinessProfile] = useState(() => {
    const saved = localStorage.getItem('admin_businessProfile')
    return saved ? JSON.parse(saved) : {
      storeName: 'Lensify Gear Rental',
      email: 'admin@lensify.co',
      phone: '+62 812 3456 7890',
      address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan, 12190'
    }
  })

  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('admin_security')
    return saved ? JSON.parse(saved) : {
      twoFactor: true
    }
  })

  const [rentalConfig, setRentalConfig] = useState(() => {
    const saved = localStorage.getItem('admin_rentalConfig')
    return saved ? JSON.parse(saved) : {
      minDuration: 24,
      lateFee: '50.000',
      deposit: '500.000'
    }
  })

  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('admin_paymentMethods')
    return saved ? JSON.parse(saved) : {
      transfer: true,
      ewallet: true,
      creditCard: false
    }
  })

  const handleSave = () => {
    showLoader('Menyimpan Pengaturan...')
    setTimeout(() => {
      localStorage.setItem('admin_businessProfile', JSON.stringify(businessProfile))
      localStorage.setItem('admin_security', JSON.stringify(security))
      localStorage.setItem('admin_rentalConfig', JSON.stringify(rentalConfig))
      localStorage.setItem('admin_paymentMethods', JSON.stringify(paymentMethods))
      setIsEditingProfile(false)
      hideLoader()
      toast.success('Pengaturan berhasil disimpan')
    }, 1000)
  }

  const handleIncreaseDuration = () => {
    setRentalConfig(prev => ({ ...prev, minDuration: prev.minDuration + 12 }))
  }

  const handleDecreaseDuration = () => {
    setRentalConfig(prev => ({ 
      ...prev, 
      minDuration: prev.minDuration > 12 ? prev.minDuration - 12 : 12 
    }))
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased overflow-x-hidden flex">
      <AdminSidebar />
      
      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex-grow min-h-screen flex flex-col w-full">
        {/* TopAppBar */}
        <header className="flex justify-between items-center h-20 px-margin-desktop sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant z-40">
          <div className="flex items-center gap-md">
            <div className={`relative transition-transform duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="bg-surface border-none rounded-xl px-10 py-2.5 w-80 font-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                placeholder="Search settings, users, or logs..." 
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">{user?.role === 'ADMIN' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-headline-md border border-outline-variant">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="p-margin-desktop flex-grow">
          {/* Header Section */}
          <section className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Pengaturan Sistem</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Kelola konfigurasi platform, akun, dan preferensi Lensify.</p>
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
                onClick={handleSave}
                disabled={!isEditingProfile}
                className={`px-md py-sm bg-primary text-white font-label-bold transition-all rounded-xl flex items-center gap-xs shadow-lg shadow-primary/25 focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 ${!isEditingProfile ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:opacity-90'}`}
              >
                <span className="material-symbols-outlined text-lg">save</span> 
                Simpan Perubahan
              </button>
            </div>
          </section>

          {/* Bento Grid Layout for Settings */}
          <div className="grid grid-cols-12 gap-gutter mb-xl">
            {/* Profil Bisnis */}
            <section className="col-span-12 lg:col-span-8 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">store</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Profil Bisnis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Nama Toko</label>
                  <input 
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`} 
                    type="text" 
                    value={businessProfile.storeName}
                    disabled={!isEditingProfile}
                    onChange={(e) => setBusinessProfile({...businessProfile, storeName: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Email Bisnis</label>
                  <input 
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`} 
                    type="email" 
                    value={businessProfile.email}
                    disabled={!isEditingProfile}
                    onChange={(e) => setBusinessProfile({...businessProfile, email: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Telepon</label>
                  <input 
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`} 
                    type="tel" 
                    value={businessProfile.phone}
                    disabled={!isEditingProfile}
                    onChange={(e) => setBusinessProfile({...businessProfile, phone: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-bold text-on-surface-variant text-xs uppercase tracking-widest font-bold opacity-60">Alamat Pusat</label>
                  <textarea 
                    className={`bg-surface border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`} 
                    rows="3"
                    value={businessProfile.address}
                    disabled={!isEditingProfile}
                    onChange={(e) => setBusinessProfile({...businessProfile, address: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Keamanan */}
            <section className="col-span-12 lg:col-span-4 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col h-full border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600">security</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Keamanan</h3>
              </div>
              <div className="space-y-4 flex-1">
                <button className="w-full flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl hover:border-primary transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-all">lock_reset</span>
                    <span className="font-label-bold text-on-surface text-sm">Ubah Password</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
                <div className="p-4 bg-surface border border-outline-variant rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-bold text-on-surface text-sm">2FA Authentication</span>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">Aktifkan keamanan ekstra</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={security.twoFactor}
                      disabled={!isEditingProfile}
                      onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                    />
                    <div className={`w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Login terakhir: Baru saja (Jakarta, ID)
                </p>
              </div>
            </section>

            {/* Konfigurasi Sewa */}
            <section className="col-span-12 lg:col-span-7 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">settings_input_component</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Konfigurasi Sewa</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-surface rounded-xl border border-outline-variant flex-wrap gap-4">
                  <div>
                    <span className="font-label-bold text-on-surface block text-sm">Minimum Durasi Sewa</span>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Waktu penyewaan terkecil per transaksi</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleDecreaseDuration}
                      disabled={!isEditingProfile}
                      className={`w-10 h-10 rounded-xl border border-outline-variant bg-white flex items-center justify-center transition-all ${!isEditingProfile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white active:scale-95'}`}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="text-center w-16">
                      <span className="font-headline-md text-3xl font-extrabold text-primary block">{rentalConfig.minDuration}</span>
                      <span className="font-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Jam</span>
                    </div>
                    <button 
                      onClick={handleIncreaseDuration}
                      disabled={!isEditingProfile}
                      className={`w-10 h-10 rounded-xl border border-outline-variant bg-white flex items-center justify-center transition-all ${!isEditingProfile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white active:scale-95'}`}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface p-5 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <label className="font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-3">Denda Keterlambatan</label>
                    <div className="flex items-baseline gap-2">
                      <span className="font-label-bold text-primary text-sm">Rp</span>
                      <input 
                        className={`bg-transparent border-none p-0 focus:ring-0 font-headline-md text-2xl font-extrabold w-full text-on-surface outline-none ${!isEditingProfile ? 'cursor-not-allowed opacity-60' : ''}`}
                        type="text" 
                        value={rentalConfig.lateFee}
                        disabled={!isEditingProfile}
                        onChange={(e) => setRentalConfig({...rentalConfig, lateFee: e.target.value})}
                      />
                      <span className="text-xs font-bold text-on-surface-variant opacity-60">/jam</span>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <label className="font-label-bold text-on-surface-variant text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-3">Deposit Wajib</label>
                    <div className="flex items-baseline gap-2">
                      <span className="font-label-bold text-primary text-sm">Rp</span>
                      <input 
                        className={`bg-transparent border-none p-0 focus:ring-0 font-headline-md text-2xl font-extrabold w-full text-on-surface outline-none ${!isEditingProfile ? 'cursor-not-allowed opacity-60' : ''}`}
                        type="text" 
                        value={rentalConfig.deposit}
                        disabled={!isEditingProfile}
                        onChange={(e) => setRentalConfig({...rentalConfig, deposit: e.target.value})}
                      />
                      <span className="text-xs font-bold text-on-surface-variant opacity-60">/item</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Metode Pembayaran */}
            <section className="col-span-12 lg:col-span-5 bg-white p-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-outline-variant/50 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-green-50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-green-600">account_balance_wallet</span>
                </div>
                <h3 className="font-headline-md text-xl font-extrabold">Metode Pembayaran</h3>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="p-4 flex flex-wrap items-center justify-between gap-4 bg-surface rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                    <div>
                      <p className="font-label-bold text-sm text-on-surface">Bank Transfer (Manual)</p>
                      <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">BCA, Mandiri, BNI</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold rounded-lg border border-primary/20 uppercase tracking-widest">AKTIF</span>
                </li>
                <li className="p-4 flex flex-wrap items-center justify-between gap-4 bg-surface rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                    <div>
                      <p className="font-label-bold text-sm text-on-surface">E-Wallet (Xendit)</p>
                      <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">GoPay, OVO, Dana</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={paymentMethods.ewallet}
                      disabled={!isEditingProfile}
                      onChange={(e) => setPaymentMethods({...paymentMethods, ewallet: e.target.checked})}
                    />
                    <div className={`w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}></div>
                  </label>
                </li>
                <li className="p-4 flex flex-wrap items-center justify-between gap-4 bg-surface rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                    <div>
                      <p className="font-label-bold text-sm text-on-surface">Credit Card</p>
                      <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">Visa, Mastercard</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={paymentMethods.creditCard}
                      disabled={!isEditingProfile}
                      onChange={(e) => setPaymentMethods({...paymentMethods, creditCard: e.target.checked})}
                    />
                    <div className={`w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}></div>
                  </label>
                </li>
              </ul>
              <button className="w-full py-3 border border-outline-variant text-on-surface font-label-bold hover:bg-surface-container-high transition-all rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">settings_suggest</span>
                Kelola Gateway
              </button>
            </section>
          </div>

          {/* Footer Section (Status Panel) */}
          <section className="mt-lg p-xl bg-[#1b1c1c] text-white flex flex-col md:flex-row items-center justify-between rounded-2xl shadow-xl gap-8">
            <div className="flex items-center gap-md">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse shrink-0">
                <span className="material-symbols-outlined text-white text-3xl">hub</span>
              </div>
              <div>
                <h4 className="font-headline-md text-2xl font-extrabold text-white mb-1">Status Server & API</h4>
                <p className="text-sm text-gray-400 max-w-md">Seluruh sistem beroperasi dengan normal. Infrastruktur cloud dipantau secara real-time.</p>
              </div>
            </div>
            <div className="flex gap-12 sm:gap-16">
              <div className="text-center">
                <p className="text-primary font-headline-lg text-4xl font-extrabold mb-1">99.9%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-primary font-headline-lg text-4xl font-extrabold mb-1">12ms</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Latency</p>
              </div>
            </div>
          </section>

          <div className="h-xl"></div>
        </main>
      </div>
    </div>
  )
}
