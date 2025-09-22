import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'cuba-load-board-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cuba-load-board-secret') as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Cuenta desactivada' });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ 
        message: 'Usuario en lista negra', 
        reason: user.blacklistReason 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }

    next();
  };
};

export const requireAdminOrOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ message: 'Permisos insuficientes' });
  }
};

export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({ 
      message: 'Verificación de cuenta requerida',
      verificationStatus: req.user.verificationStatus
    });
  }

  next();
};