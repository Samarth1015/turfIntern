import { Router, Request, Response } from 'express';
import { Court } from '../model/Court';

const router = Router();

// GET /api/courts - Get all courts
router.get('/', async (req: Request, res: Response) => {
  try {
    const courts = await Court.findAll();
    res.json({ success: true, data: courts });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/courts/:id - Get court by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const court = await Court.findById(id);
    
    if (!court) {
      return res.status(404).json({ 
        success: false, 
        error: 'Court not found' 
      });
    }
    
    res.json({ success: true, data: court });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// POST /api/courts - Create new court
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Court name is required' 
      });
    }
    
    const court = await Court.create({ name, description });
    res.status(201).json({ success: true, data: court });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// PUT /api/courts/:id - Update court
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const court = await Court.update(id, { name, description, isActive });
    res.json({ success: true, data: court });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// DELETE /api/courts/:id - Delete court (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Court.delete(id);
    res.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export default router;
