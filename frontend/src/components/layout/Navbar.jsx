import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAuthenticated = !!token && token !== 'null' && token !== 'undefined'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { to: '/catalog', label: 'Katalog' },
    { to: '/#cara-kerja', label: 'Cara Kerja' },
    { to: '/#tentang-kami', label: 'Tentang Kami' },
    { to: '/#lokasi', label: 'Lokasi' },
  ]

  return (
    <nav className={`bg-surface sticky top-0 z-50 w-full border-b border-surface-variant transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">

        {/* Logo */}
        <Link to="/" className="text-2xl md:text-3xl font-display font-extrabold text-primary tracking-tighter">
          Lensify.co
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-secondary font-medium hover:text-primary transition-colors text-sm tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-sm text-secondary hover:text-primary font-medium transition-colors">
                {user?.role === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-primary text-white px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm hover:shadow-lg transition-all active:scale-95"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-primary text-white px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm hover:shadow-lg transition-all active:scale-95">
              Sewa Sekarang
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-surface border-b border-surface-variant ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <div className="px-4 pt-2 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-3 text-secondary font-medium hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-surface-variant">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="block px-4 py-3 text-secondary font-medium hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors text-sm mb-1"
                >
                  {user?.role === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard'}
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-secondary font-medium hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors text-sm mb-2"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-primary text-white px-5 py-3 text-sm font-semibold rounded-xl shadow-sm active:scale-95"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-center bg-primary text-white px-5 py-3 text-sm font-semibold rounded-xl shadow-sm active:scale-95"
              >
                Sewa Sekarang
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
