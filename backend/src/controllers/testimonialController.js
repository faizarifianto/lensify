const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/testimonials — submit general service testimonial
const createTestimonial = async (req, res) => {
  try {
    const { rating, message } = req.body;
    const userId = req.userId;

    if (!rating || !message) {
      return res.status(400).json({ success: false, message: 'Rating dan pesan wajib diisi' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating harus antara 1–5' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Pesan minimal 10 karakter' });
    }

    const testimonial = await prisma.testimonial.create({
      data: { userId, rating: parseInt(rating), message: message.trim() },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });

    res.status(201).json({ success: true, message: 'Testimoni layanan berhasil dikirim!', data: { testimonial } });
  } catch (error) {
    console.error('CreateTestimonial error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/testimonials/my — get user's own testimonials
const getMyTestimonials = async (req, res) => {
  try {
    const userId = req.userId;
    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { testimonials } });
  } catch (error) {
    console.error('GetMyTestimonials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/testimonials — get all (public, for landing page)
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ success: true, data: { testimonials } });
  } catch (error) {
    console.error('GetAllTestimonials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createTestimonial, getMyTestimonials, getAllTestimonials };
