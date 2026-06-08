const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'this_month' } = req.query;
    const today = new Date();
    
    let startDate, endDate;
    if (period === 'last_month') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    } else if (period === 'this_year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
    } else if (period === 'all_time') {
      startDate = new Date(2020, 0, 1);
      endDate = new Date(today.getFullYear() + 1, 0, 1);
    } else { // this_month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    }

    const [
      totalBookingsToday,
      pendingBookings,
      ongoingBookings,
      periodRevenue,
      totalBookings,
      totalCameras,
      totalUsers,
      maintenanceCameras,
      monthlyBookings,
      dailyBookingsRes,
      categoryDistribution,
      unrepliedTestimonials,
      unrepliedReviews
    ] = await Promise.all([
      prisma.booking.count({
        where: { createdAt: { gte: new Date(today.setHours(0,0,0,0)) } }
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ONGOING' } }),
      prisma.booking.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'ONGOING', 'RETURNED'] },
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { totalPrice: true }
      }),
      prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.camera.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.camera.count({ where: { isDeleted: false, isAvailable: false } }),
      // bookings per month for last 6 months globally for tren
      prisma.booking.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true, totalPrice: true, status: true }
      }),
      // explicit daily bookings within the selected period
      prisma.booking.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, totalPrice: true, status: true }
      }),
      // category distribution
      prisma.camera.groupBy({
        by: ['category'],
        _count: true,
        where: { isDeleted: false }
      }),
      prisma.testimonial.count({ where: { reply: null } }),
      prisma.review.count({ where: { reply: null } })
    ]);

    // Group monthly bookings
    const monthlyData = {};
    monthlyBookings.forEach(b => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { month: key, count: 0, revenue: 0 };
      monthlyData[key].count++;
      if (['CONFIRMED', 'ONGOING', 'RETURNED'].includes(b.status)) {
        monthlyData[key].revenue += b.totalPrice;
      }
    });

    // Group daily bookings
    const dailyData = {};
    dailyBookingsRes.forEach(b => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}-${String(b.createdAt.getDate()).padStart(2, '0')}`;
      if (!dailyData[key]) dailyData[key] = { day: key, count: 0, revenue: 0 };
      dailyData[key].count++;
      if (['CONFIRMED', 'ONGOING', 'RETURNED'].includes(b.status)) {
        dailyData[key].revenue += b.totalPrice;
      }
    });

    // Top performers (Gears)
    const topPerformersGrp = await prisma.booking.groupBy({
      by: ['cameraId'],
      _count: { id: true },
      _sum: { totalPrice: true },
      where: {
        status: { in: ['CONFIRMED', 'ONGOING', 'RETURNED'] },
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 5
    });

    let topPerformersList = [];
    if (topPerformersGrp.length > 0) {
      const topCamIds = topPerformersGrp.map(g => g.cameraId);
      const topCams = await prisma.camera.findMany({ where: { id: { in: topCamIds } } });
      topPerformersList = topPerformersGrp.map(g => {
        const c = topCams.find(cam => cam.id === g.cameraId);
        let parsedImages = [];
        if (c && c.images) {
          try {
            parsedImages = JSON.parse(c.images);
          } catch (e) {
            parsedImages = [];
          }
        }
        return {
          id: c?.id,
          name: c?.name || 'Unknown',
          brand: c?.brand || '',
          category: c?.category || '',
          image: parsedImages?.[0] || null,
          totalRented: g._count.id,
          revenue: g._sum.totalPrice || 0,
          status: c?.isAvailable ? 'Tersedia' : 'Disewa/Nonaktif'
        };
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalBookingsToday,
          pendingBookings,
          ongoingBookings,
          monthlyRevenue: periodRevenue._sum.totalPrice || 0,
          totalBookings,
          totalCameras,
          totalUsers,
          maintenanceCameras,
          categoryDistribution,
          pendingTestimonials: unrepliedTestimonials + unrepliedReviews
        },
        monthlyChart: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
        dailyChart: Object.values(dailyData).sort((a, b) => a.day.localeCompare(b.day)),
        topPerformers: topPerformersList
      }
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { camera: { name: { contains: search } } }
      ];
      const parsedId = parseInt(search);
      if (!isNaN(parsedId)) {
        where.OR.push({ id: parsedId });
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          camera: { select: { id: true, name: true, brand: true, category: true, images: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    const bookingsWithParsed = bookings.map(b => ({
      ...b,
      camera: { ...b.camera, images: JSON.parse(b.camera.images || '[]') }
    }));

    res.json({
      success: true,
      data: { bookings: bookingsWithParsed, total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('GetAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'ONGOING', 'RETURNED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        camera: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, message: 'Booking status updated', data: { booking } });
  } catch (error) {
    console.error('UpdateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/cameras
const getAllCamerasAdmin = async (req, res) => {
  try {
    const cameras = await prisma.camera.findMany({
      where: { isDeleted: false },
      include: {
        _count: { 
          select: { 
            bookings: {
              where: { status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] } }
            }, 
            reviews: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const camerasWithParsed = cameras.map(c => ({
      ...c,
      images: JSON.parse(c.images || '[]')
    }));

    res.json({ success: true, data: { cameras: camerasWithParsed } });
  } catch (error) {
    console.error('GetAllCamerasAdmin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/cameras
const createCamera = async (req, res) => {
  try {
    const { name, brand, category, description, specs, pricePerDay, stock } = req.body;

    if (!name || !brand || !category || !description || !pricePerDay) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const specsValue = specs || '{}';

    const camera = await prisma.camera.create({
      data: {
        name,
        brand,
        category,
        description,
        specs: specsValue,
        pricePerDay: parseFloat(pricePerDay),
        stock: parseInt(stock) || 1,
        images: JSON.stringify(images)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Camera added',
      data: { camera: { ...camera, images } }
    });
  } catch (error) {
    console.error('CreateCamera error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/cameras/:id
const updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, description, specs, pricePerDay, stock, isAvailable } = req.body;

    const existing = await prisma.camera.findFirst({ where: { id: parseInt(id), isDeleted: false } });
    if (!existing) return res.status(404).json({ success: false, message: 'Camera not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (brand) updateData.brand = brand;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (specs) updateData.specs = specs;
    if (pricePerDay) updateData.pricePerDay = parseFloat(pricePerDay);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;

    if (req.files && req.files.length > 0) {
      const images = req.files.map(f => `/uploads/${f.filename}`);
      updateData.images = JSON.stringify(images);
    }

    const camera = await prisma.camera.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Camera updated',
      data: { camera: { ...camera, images: JSON.parse(camera.images || '[]') } }
    });
  } catch (error) {
    console.error('UpdateCamera error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/cameras/:id  (soft delete)
const deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.camera.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true }
    });

    res.json({ success: true, message: 'Camera deleted' });
  } catch (error) {
    console.error('DeleteCamera error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/bookings
const createOfflineBooking = async (req, res) => {
  try {
    const { cameraId, startDate, endDate, notes, userId, customer } = req.body;
    let finalUserId = userId;

    if (!finalUserId && customer) {
      // Create new user
      const existing = await prisma.user.findUnique({ where: { email: customer.email } });
      if (existing) {
        finalUserId = existing.id;
      } else {
        const hashedPassword = await bcrypt.hash('lensify123', 12);
        const newUser = await prisma.user.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            password: hashedPassword
          }
        });
        finalUserId = newUser.id;
      }
    }

    if (!finalUserId) {
      return res.status(400).json({ success: false, message: 'User ID or customer data is required' });
    }

    if (!cameraId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Camera, start date, and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const camera = await prisma.camera.findFirst({
      where: { id: parseInt(cameraId), isDeleted: false, isAvailable: true }
    });
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found or not available' });
    }

    const overlap = await prisma.booking.findFirst({
      where: {
        cameraId: parseInt(cameraId),
        status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } }
        ]
      }
    });

    if (overlap) {
      return res.status(409).json({ success: false, message: 'Camera is already booked for the selected dates' });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * camera.pricePerDay;

    const booking = await prisma.booking.create({
      data: {
        userId: finalUserId,
        cameraId: parseInt(cameraId),
        startDate: start,
        endDate: end,
        totalDays,
        totalPrice,
        status: 'ONGOING',
        notes: notes || null
      },
      include: {
        camera: { select: { id: true, name: true, brand: true, images: true, pricePerDay: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Offline booking created successfully',
      data: { booking: { ...booking, camera: { ...booking.camera, images: JSON.parse(booking.camera.images || '[]') } } }
    });
  } catch (error) {
    console.error('CreateOfflineBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
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
    console.error('GetAllReviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/reviews/:id/reply
const replyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply is required' });
    }

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { reply },
      include: {
        user: { select: { name: true } },
        camera: { select: { name: true } }
      }
    });

    res.json({ success: true, message: 'Reply sent successfully', data: { review } });
  } catch (error) {
    console.error('ReplyReview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/testimonials
const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { testimonials } });
  } catch (error) {
    console.error('GetAllTestimonialsAdmin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/testimonials/:id/reply
const replyTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ success: false, message: 'Reply is required' });

    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: { reply },
      include: { user: { select: { name: true } } }
    });

    res.json({ success: true, message: 'Reply sent', data: { testimonial } });
  } catch (error) {
    console.error('ReplyTestimonial error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
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
};
