import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('lensify_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('lensify_token')
      sessionStorage.removeItem('lensify_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ─── Cameras ────────────────────────────────────────────
export const cameraAPI = {
  getTop: () => api.get('/cameras/top'),
  getAll: (params) => api.get('/cameras', { params }),
  getById: (id) => api.get(`/cameras/${id}`),
}

// ─── Bookings ───────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
}

// ─── Reviews ────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByCameraId: (cameraId) => api.get(`/reviews/camera/${cameraId}`),
  getMyReviews: () => api.get('/reviews/my'),
}

// ─── Testimonials (General Service) ─────────────────────
export const testimonialAPI = {
  create: (data) => api.post('/testimonials', data),
  getMy: () => api.get('/testimonials/my'),
  getAll: () => api.get('/testimonials'),
}

// ─── Admin ──────────────────────────────────────────────
export const adminAPI = {
  getStats: (params) => api.get('/admin/stats', { params }),
  // Users
  getAllUsers: () => api.get('/admin/users'),
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  createOfflineBooking: (data) => api.post('/admin/bookings', data),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }),
  // Cameras
  getAllCameras: () => api.get('/admin/cameras'),
  createCamera: (data) => api.post('/admin/cameras', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCamera: (id, data) => api.put(`/admin/cameras/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCamera: (id) => api.delete(`/admin/cameras/${id}`),
  // Reviews / Testimonials (gear)
  getAllReviews: () => api.get('/admin/reviews'),
  replyReview: (id, reply) => api.put(`/admin/reviews/${id}/reply`, { reply }),
  // Testimonials (general service)
  getAllTestimonialsAdmin: () => api.get('/admin/testimonials'),
  replyTestimonial: (id, reply) => api.put(`/admin/testimonials/${id}/reply`, { reply }),
}

export default api
