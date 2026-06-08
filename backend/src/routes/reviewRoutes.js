const express = require('express');
const router = express.Router();
const { createReview, getCameraReviews, getMyReviews } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createReview);
router.get('/camera/:cameraId', getCameraReviews);
router.get('/my', authMiddleware, getMyReviews);

module.exports = router;
