import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      clerkId: decoded.clerkId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export const generateToken = (userData: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(userData, secret, { expiresIn: '24h' });
};
