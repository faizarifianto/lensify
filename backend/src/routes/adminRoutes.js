const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllCamerasAdmin,
  createCamera,
  updateCamera,
  deleteCamera,
  getAllUsers,
  createOfflineBooking,
  getAllReviews,
  replyReview,
  getAllTestimonialsAdmin,
  replyTestimonial
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);

// Bookings
router.get('/bookings', getAllBookings);
router.post('/bookings', createOfflineBooking);
router.put('/bookings/:id/status', updateBookingStatus);

// Cameras
router.get('/cameras', getAllCamerasAdmin);
router.post('/cameras', upload.array('images', 5), createCamera);
router.put('/cameras/:id', upload.array('images', 5), updateCamera);
router.delete('/cameras/:id', deleteCamera);

// Reviews (gear)
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/reply', replyReview);

// Testimonials (general service)
router.get('/testimonials', getAllTestimonialsAdmin);
router.put('/testimonials/:id/reply', replyTestimonial);

module.exports = router;

