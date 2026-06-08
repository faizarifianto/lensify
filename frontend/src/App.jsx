import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Global Loader
import GlobalLoader from './components/ui/GlobalLoader'

// User Pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import CameraDetail from './pages/CameraDetail'
import Checkout from './pages/Checkout'
import BookingHistory from './pages/BookingHistory'
import Profile from './pages/Profile'
import UserDashboard from './pages/UserDashboard'
import UserSettings from './pages/UserSettings'
import CategoryPage from './pages/CategoryPage'
import Auth from './pages/Auth'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import AdminTestimonials from './pages/admin/AdminTestimonials'

// Testimonials
import UserTestimonials from './pages/UserTestimonials'

// Unauthorized
import Unauthorized from './pages/Unauthorized'

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Unauthorized />
  }

  if (userOnly && user?.role === 'ADMIN') {
    return <Unauthorized />
  }

  return children
}

const AnimatedPage = ({ children }) => {
  const location = useLocation()
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Admin layout — no animation wrapper (fixed sidebar conflicts with AnimatePresence)
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-surface">
    {children}
  </div>
)

// Main layout wrapper
const MainLayout = ({ children, hideNavbar = false }) => (
  <div className="min-h-screen flex flex-col">
    {!hideNavbar && <Navbar />}
    <main className="flex-1 flex flex-col">
      <AnimatedPage>{children}</AnimatedPage>
    </main>
    <Footer />
  </div>
)

export default function App() {
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const token = useAuthStore((s) => s.token)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    // Always verify token with server on first load
    if (token) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Block render until auth state has been verified with server
  if (!isInitialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #f97316',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <GlobalLoader />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/catalog" element={<MainLayout hideNavbar><Catalog /></MainLayout>} />
        <Route path="/cameras/:id" element={<MainLayout hideNavbar><CameraDetail /></MainLayout>} />
        <Route path="/login" element={
          token ? <Navigate to={useAuthStore.getState().user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace /> : <Auth />
        } />
        <Route path="/register" element={
          token ? <Navigate to={useAuthStore.getState().user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace /> : <Auth />
        } />

        {/* Protected user routes */}
        <Route path="/dashboard" element={<ProtectedRoute userOnly><UserDashboard /></ProtectedRoute>} />
        <Route path="/category/:slug" element={<ProtectedRoute userOnly><CategoryPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute userOnly><MainLayout hideNavbar><Checkout /></MainLayout></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute userOnly><BookingHistory /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute userOnly><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/settings"      element={<ProtectedRoute userOnly><UserSettings /></ProtectedRoute>} />
        <Route path="/testimonials"  element={<ProtectedRoute userOnly><UserTestimonials /></ProtectedRoute>} />

        {/* Admin routes — pages own their layout (fixed sidebar) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><Orders /></ProtectedRoute>} />
        <Route path="/admin/reports"       element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings"      element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
        <Route path="/admin/testimonials"  element={<ProtectedRoute adminOnly><AdminTestimonials /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Unauthorized code="404" text="NOT FOUND" title="Halaman Tidak Ditemukan" desc="Maaf, halaman yang Anda tuju tidak ada atau alamat URL salah." />} />
      </Routes>
    </BrowserRouter>
  )
}
