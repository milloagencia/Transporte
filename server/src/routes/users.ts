import express from 'express';
import { authenticateToken, requireRole, requireAdminOrOwner } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get user profile
router.get('/profile/:userId', authenticateToken, requireAdminOrOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Update user profile
router.put('/profile/:userId', authenticateToken, requireAdminOrOwner, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'whatsappNumber', 'address', 'profileImage'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    
    const updateData: any = {};
    updates.forEach(key => updateData[key] = req.body[key]);

    const user = await User.findByIdAndUpdate(req.params.userId, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get users list (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, city, province, status } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (city) filter['address.city'] = { $regex: city as string, $options: 'i' };
    if (province) filter['address.province'] = { $regex: province as string, $options: 'i' };
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'blacklisted') filter.isBlacklisted = true;

    const users = await User.find(filter)
      .select('-password')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;