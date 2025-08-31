import { Router, Request, Response } from 'express';
import { TimeSlot } from '../model/TimeSlot';

const router = Router();

// GET /api/timeslots/court/:courtId - Get time slots for a specific court
router.get('/court/:courtId', async (req: Request, res: Response) => {
  try {
    const { courtId } = req.params;
    const timeSlots = await TimeSlot.findByCourtId(courtId);
    res.json({ success: true, data: timeSlots });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/timeslots/available/:courtId - Get available slots for a specific court and date
router.get('/available/:courtId', async (req: Request, res: Response) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Date parameter is required' 
      });
    }
    
    const selectedDate = new Date(date as string);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format' 
      });
    }
    
    const availableSlots = await TimeSlot.findAvailableSlots(courtId, selectedDate);
    res.json({ success: true, data: availableSlots });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/timeslots/:id - Get time slot by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timeSlot = await TimeSlot.findById(id);
    
    if (!timeSlot) {
      return res.status(404).json({ 
        success: false, 
        error: 'Time slot not found' 
      });
    }
    
    res.json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// POST /api/timeslots - Create new time slot
router.post('/', async (req: Request, res: Response) => {
  try {
    const { courtId, startTime, endTime, dayOfWeek } = req.body;
    
    if (!courtId || !startTime || !endTime || dayOfWeek === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Court ID, start time, end time, and day of week are required' 
      });
    }
    
    // Validate day of week (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' 
      });
    }
    
    const timeSlot = await TimeSlot.create({ courtId, startTime, endTime, dayOfWeek });
    res.status(201).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// PUT /api/timeslots/:id - Update time slot
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, dayOfWeek, isActive } = req.body;
    
    const timeSlot = await TimeSlot.update(id, { startTime, endTime, dayOfWeek, isActive });
    res.json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// DELETE /api/timeslots/:id - Delete time slot (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TimeSlot.delete(id);
    res.json({ success: true, message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export default router;
