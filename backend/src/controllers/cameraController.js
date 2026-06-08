const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/cameras
const getCameras = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, startDate, endDate } = req.query;

    const where = {
      isDeleted: false,
      isAvailable: true
    };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } }
      ];
    }
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
    }

    let cameras = await prisma.camera.findMany({
      where,
      include: {
        reviews: { select: { rating: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by availability on date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookingsInRange = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] },
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        },
        select: { cameraId: true }
      });

      const bookedCameraIds = new Set(bookingsInRange.map(b => b.cameraId));
      cameras = cameras.filter(c => !bookedCameraIds.has(c.id));
    }

    // Add average rating to each camera
    const camerasWithRating = cameras.map(camera => {
      const avgRating = camera.reviews.length > 0
        ? camera.reviews.reduce((sum, r) => sum + r.rating, 0) / camera.reviews.length
        : 0;
      const { reviews, ...cameraData } = camera;
      return {
        ...cameraData,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: camera.reviews.length,
        images: JSON.parse(camera.images || '[]')
      };
    });

    res.json({ success: true, data: { cameras: camerasWithRating } });
  } catch (error) {
    console.error('GetCameras error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/cameras/:id
const getCameraById = async (req, res) => {
  try {
    const { id } = req.params;

    const camera = await prisma.camera.findFirst({
      where: { id: parseInt(id), isDeleted: false },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        bookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] } },
          select: { startDate: true, endDate: true }
        }
      }
    });

    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }

    const avgRating = camera.reviews.length > 0
      ? camera.reviews.reduce((sum, r) => sum + r.rating, 0) / camera.reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        camera: {
          ...camera,
          images: JSON.parse(camera.images || '[]'),
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: camera.reviews.length
        }
      }
    });
  } catch (error) {
    console.error('GetCameraById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/cameras/top
const getTopCameras = async (req, res) => {
  try {
    const topPerformersGrp = await prisma.booking.groupBy({
      by: ['cameraId'],
      _count: { id: true },
      where: {
        status: { in: ['CONFIRMED', 'ONGOING', 'RETURNED'] },
      },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 3
    });

    if (topPerformersGrp.length === 0) {
      const fallbackCameras = await prisma.camera.findMany({
        where: { isDeleted: false, isAvailable: true },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      const data = fallbackCameras.map(c => ({
        ...c,
        images: JSON.parse(c.images || '[]'),
        rentedCount: 0
      }));
      return res.json({ success: true, data: { cameras: data } });
    }

    const topCamIds = topPerformersGrp.map(g => g.cameraId);
    const topCams = await prisma.camera.findMany({ where: { id: { in: topCamIds } } });
    
    const sortedCams = topPerformersGrp.map(g => {
      const c = topCams.find(cam => cam.id === g.cameraId);
      return {
        ...c,
        images: c.images ? JSON.parse(c.images) : [],
        rentedCount: g._count.id
      };
    });

    res.json({ success: true, data: { cameras: sortedCams } });
  } catch (error) {
    console.error('GetTopCameras error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCameras, getCameraById, getTopCameras };
