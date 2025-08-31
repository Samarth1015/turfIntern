import { Router, Request, Response } from 'express';
import { Booking } from '../model/Booking';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/bookings - Get all bookings (protected)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/bookings/my-bookings - Get user's own bookings (protected)
router.get('/my-bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    // Find user by clerkId first, then get their bookings
    // This will be implemented once we have the User model working
    res.json({ success: true, data: [], message: 'User bookings endpoint - to be implemented' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/bookings/:id - Get booking by ID (protected)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/bookings/court/:courtId - Get bookings for a specific court (protected)
router.get('/court/:courtId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const bookings = await Booking.findByCourtId(courtId);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/bookings/date/:date - Get bookings for a specific date (protected)
router.get('/date/:date', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);
    
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format' 
      });
    }
    
    const bookings = await Booking.findByDate(selectedDate);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// POST /api/bookings - Create new booking (protected)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    const { courtId, timeSlotId, customerName, customerEmail, customerPhone, bookingDate } = req.body;
    
    if (!courtId || !timeSlotId || !customerName || !customerEmail || !bookingDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Court ID, time slot ID, customer name, customer email, and booking date are required' 
      });
    }
    
    const selectedDate = new Date(bookingDate);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking date format' 
      });
    }
    
    // Check if booking date is in the future
    if (selectedDate <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Booking date must be in the future' 
      });
    }
    
    const booking = await Booking.create({
      courtId,
      timeSlotId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: selectedDate
    });
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// PUT /api/bookings/:id - Update booking (protected)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, customerName, customerEmail, customerPhone } = req.body;
    
    const booking = await Booking.update(id, { status, customerName, customerEmail, customerPhone });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking (protected)
router.put('/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.cancel(id);
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// DELETE /api/bookings/:id - Delete booking (protected)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Booking.delete(id);
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export default router;
