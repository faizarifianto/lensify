const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.userId;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(bookingId), userId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'RETURNED') {
      return res.status(400).json({ success: false, message: 'You can only review completed (returned) bookings' });
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId: parseInt(bookingId) }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        cameraId: booking.cameraId,
        bookingId: parseInt(bookingId),
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
  } catch (error) {
    console.error('CreateReview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/reviews/camera/:cameraId
const getCameraReviews = async (req, res) => {
  try {
    const { cameraId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { cameraId: parseInt(cameraId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error('GetCameraReviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/reviews/my
const getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        camera: { select: { id: true, name: true, images: true } },
        booking: { select: { id: true, startDate: true, endDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsedReviews = reviews.map(r => ({
      ...r,
      camera: { ...r.camera, images: JSON.parse(r.camera?.images || '[]') }
    }));

    res.json({ success: true, data: { reviews: parsedReviews } });
  } catch (error) {
    console.error('GetMyReviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createReview, getCameraReviews, getMyReviews };
