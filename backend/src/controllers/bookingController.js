const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { items, startDate, endDate, notes, address, phone, paymentMethod } = req.body;
    const userId = req.userId;
    const ktpPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!items || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Items, start date, and end date are required' });
    }
    if (!ktpPath) {
      return res.status(400).json({ success: false, message: 'KTP photo is required' });
    }

    let cameraIds;
    try {
      cameraIds = JSON.parse(items);
      if (!Array.isArray(cameraIds)) throw new Error('Not an array');
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid items format' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const cameras = await prisma.camera.findMany({
      where: { id: { in: cameraIds.map(id => parseInt(id)) }, isDeleted: false, isAvailable: true }
    });

    if (cameras.length !== cameraIds.length) {
      return res.status(404).json({ success: false, message: 'Some cameras not found or not available' });
    }

    for (const id of cameraIds) {
      const overlap = await prisma.booking.findFirst({
        where: {
          cameraId: parseInt(id),
          status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] },
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        }
      });

      if (overlap) {
        const camera = cameras.find(c => c.id === parseInt(id));
        return res.status(409).json({ success: false, message: `${camera?.name || 'Camera'} is already booked for the selected dates` });
      }
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const bookings = await prisma.$transaction(
      cameraIds.map(id => {
        const camera = cameras.find(c => c.id === parseInt(id));
        const totalPrice = totalDays * camera.pricePerDay;
        return prisma.booking.create({
          data: {
            userId,
            cameraId: parseInt(id),
            startDate: start,
            endDate: end,
            totalDays,
            totalPrice,
            status: 'PENDING',
            notes: notes || null,
            address: address || null,
            phone: phone || null,
            paymentMethod: paymentMethod || null,
            ktpPath: ktpPath
          },
          include: {
            camera: { select: { id: true, name: true, brand: true, images: true, pricePerDay: true } }
          }
        });
      })
    );

    const firstOrderId = bookings.length > 0 ? bookings[0].id : null;

    res.status(201).json({
      success: true,
      message: 'Checkout successful',
      data: { orderId: firstOrderId, bookings: bookings.map(b => ({ ...b, camera: { ...b.camera, images: JSON.parse(b.camera.images || '[]') } })) }
    });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      include: {
        camera: { select: { id: true, name: true, brand: true, category: true, images: true } },
        review: { select: { id: true, rating: true, comment: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const bookingsWithParsed = bookings.map(b => ({
      ...b,
      camera: { ...b.camera, images: JSON.parse(b.camera.images || '[]') }
    }));

    res.json({ success: true, data: { bookings: bookingsWithParsed } });
  } catch (error) {
    console.error('GetMyBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(id), userId: req.userId },
      include: {
        camera: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        review: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: {
        booking: { ...booking, camera: { ...booking.camera, images: JSON.parse(booking.camera.images || '[]') } }
      }
    });
  } catch (error) {
    console.error('GetBookingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(id), userId: req.userId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled' });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Booking cancelled', data: { booking: updated } });
  } catch (error) {
    console.error('CancelBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
