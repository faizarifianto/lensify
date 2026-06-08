import { Link } from 'react-router-dom'
import Tooltip from '../ui/Tooltip'

export default function Footer() {
  return (
    <footer className="bg-white py-16 border-t border-surface-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
        <div className="col-span-1 md:col-span-1 lg:pr-8">
          <Link to="/" className="text-3xl font-display font-extrabold text-primary tracking-tighter">
            Lensify.co
          </Link>
          <p className="text-sm text-secondary mt-6 leading-relaxed">
            Solusi penyewaan kamera profesional terbaik untuk fotografer dan videografer di seluruh Indonesia.
          </p>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase tracking-widest text-xs text-on-surface">Layanan</h5>
          <ul className="space-y-4">
            <li><Link to="/catalog" className="text-secondary hover:text-primary transition-colors text-sm">Katalog</Link></li>
            <li><a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Pengiriman</a></li>
            <li><a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Bantuan</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase tracking-widest text-xs text-on-surface">Perusahaan</h5>
          <ul className="space-y-4">
            <li><a href="#tentang-kami" className="text-secondary hover:text-primary transition-colors text-sm">Tentang Kami</a></li>
            <li><a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Kebijakan Privasi</a></li>
            <li><a href="#" className="text-secondary hover:text-primary transition-colors text-sm">Syarat & Ketentuan</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase tracking-widest text-xs text-on-surface">Kontak</h5>
          <p className="text-secondary mb-2 text-sm">Jakarta, Indonesia</p>
          <p className="text-secondary mb-6 text-sm">halo@lensify.co</p>
          <div className="flex gap-4 -ml-2">
            <Tooltip />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-surface-variant flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-secondary text-center md:text-left">© {new Date().getFullYear()} Lensify.co Camera Rentals. Hak Cipta Dilindungi.</p>
        <p className="text-sm text-secondary mt-2 md:mt-0 font-medium">✨ Build with precision</p>
      </div>
    </footer>
  )
}
