import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken, authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido'),
  body('phone').notEmpty().withMessage('Teléfono requerido'),
  body('role').isIn(['driver', 'passenger', 'cargo_business', 'transport_business']).withMessage('Rol válido requerido'),
  body('address.street').notEmpty().withMessage('Dirección requerida'),
  body('address.city').notEmpty().withMessage('Ciudad requerida'),
  body('address.province').notEmpty().withMessage('Provincia requerida')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, role, address, whatsappNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Usuario ya existe con este email o teléfono' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      role,
      address
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject() as any;
    delete userResponse.password;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Cuenta desactivada' });
    }

    // Check if user is blacklisted
    if (user.isBlacklisted) {
      return res.status(403).json({ 
        message: 'Usuario en lista negra', 
        reason: user.blacklistReason 
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject() as any;
    delete userResponse.password;

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const userResponse = user.toObject() as any;
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error: any) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({ token });
  } catch (error: any) {
    console.error('Error refrescando token:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Change password
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error: any) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;