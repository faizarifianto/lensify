const express = require('express');
const router = express.Router();
const { createTestimonial, getMyTestimonials, getAllTestimonials } = require('../controllers/testimonialController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTestimonial);
router.get('/my', authMiddleware, getMyTestimonials);
router.get('/', getAllTestimonials);

module.exports = router;
