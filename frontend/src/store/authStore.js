import { create } from 'zustand'
import { authAPI } from '../services/api'

// Read token from sessionStorage synchronously (needed for API calls)
const storedToken = (() => {
  const t = sessionStorage.getItem('lensify_token')
  return t && t !== 'null' && t !== 'undefined' ? t : null
})()

const useAuthStore = create((set, get) => ({
  // Start with null user — will be populated after server verification
  user: null,
  token: storedToken,
  isLoading: false,
  // If no token, no need to verify — mark as initialized immediately
  isInitialized: !storedToken,

  setUser: (user) => {
    set({ user })
    sessionStorage.setItem('lensify_user', JSON.stringify(user))
  },

  setToken: (token) => {
    set({ token })
    sessionStorage.setItem('lensify_token', token)
  },

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.login(credentials)
      const { user, token } = res.data.data
      sessionStorage.setItem('lensify_token', token)
      sessionStorage.setItem('lensify_user', JSON.stringify(user))
      set({ user, token, isLoading: false, isInitialized: true })
      return { success: true, user }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.register(data)
      const { user } = res.data.data
      set({ isLoading: false })
      return { success: true, user }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.googleLogin(credential)
      const { user, token } = res.data.data
      sessionStorage.setItem('lensify_token', token)
      sessionStorage.setItem('lensify_user', JSON.stringify(user))
      set({ user, token, isLoading: false, isInitialized: true })
      return { success: true, user }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Google login failed' }
    }
  },

  logout: () => {
    sessionStorage.removeItem('lensify_token')
    sessionStorage.removeItem('lensify_user')
    set({ user: null, token: null })
  },

  refreshUser: async () => {
    try {
      const res = await authAPI.getMe()
      const user = res.data.data.user
      sessionStorage.setItem('lensify_user', JSON.stringify(user))
      set({ user, isInitialized: true })
    } catch {
      // Token invalid/expired — clear everything
      sessionStorage.removeItem('lensify_token')
      sessionStorage.removeItem('lensify_user')
      set({ user: null, token: null, isInitialized: true })
    }
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'ADMIN',
}))

export default useAuthStore
