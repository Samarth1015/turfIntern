import { Router, Request, Response } from 'express';
import { User } from '../model/User';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/sync-user - Sync user data from Clerk
router.post('/sync-user', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Clerk ID and email are required' 
      });
    }
    
    const user = await User.upsertByClerkId(clerkId, {
      clerkId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined
    });
    
    // Generate JWT token
    const token = generateToken({
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined
    });
    
    res.json({ 
      success: true, 
      data: { user, token },
      message: 'User synced successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const user = await User.findByClerkId(req.user.clerkId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// PUT /api/auth/profile - Update user profile (protected route)
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const { firstName, lastName } = req.body;
    
    const user = await User.update(req.user.clerkId, {
      firstName: firstName || undefined,
      lastName: lastName || undefined
    });
    
    res.json({ 
      success: true, 
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const user = await User.findByClerkId(req.user.clerkId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Generate new token
    const token = generateToken({
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined
    });
    
    res.json({ 
      success: true, 
      data: { token },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export default router;
