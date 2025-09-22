import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import User from '../models/User';
import Incident from '../models/Incident';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const blacklistedUsers = await User.countDocuments({ isBlacklisted: true });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    
    const openIncidents = await Incident.countDocuments({ status: 'open' });
    const criticalIncidents = await Incident.countDocuments({ 
      status: { $in: ['open', 'under_review'] }, 
      severity: 'critical' 
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        blacklistedUsers,
        pendingVerifications,
        openIncidents,
        criticalIncidents
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Blacklist user
router.post('/blacklist/:userId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(req.params.userId, {
      isBlacklisted: true,
      blacklistReason: reason,
      blacklistedBy: (req as any).user._id,
      blacklistedAt: new Date(),
      isActive: false
    }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario añadido a lista negra exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Remove from blacklist
router.post('/unblacklist/:userId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      isBlacklisted: false,
      blacklistReason: undefined,
      blacklistedBy: undefined,
      blacklistedAt: undefined,
      isActive: true
    }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario removido de lista negra exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get incidents
router.get('/incidents', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const incidents = await Incident.find(filter)
      .populate('reporter', 'firstName lastName email')
      .populate('reported', 'firstName lastName email')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Incident.countDocuments(filter);

    res.json({
      incidents,
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

// Resolve incident
router.post('/incidents/:id/resolve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { action, duration, reason } = req.body;
    
    const incident = await Incident.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      adminNotes: req.body.adminNotes,
      resolution: {
        action,
        duration,
        reason,
        resolvedBy: (req as any).user._id,
        resolvedAt: new Date()
      }
    }, { new: true });

    if (!incident) {
      return res.status(404).json({ message: 'Incidente no encontrado' });
    }

    // Apply action if necessary
    if (action === 'blacklist') {
      await User.findByIdAndUpdate(incident.reported, {
        isBlacklisted: true,
        blacklistReason: reason,
        blacklistedBy: (req as any).user._id,
        blacklistedAt: new Date(),
        isActive: false
      });
    } else if (action === 'suspension') {
      const suspensionEnd = new Date();
      suspensionEnd.setDate(suspensionEnd.getDate() + (duration || 7));
      
      await User.findByIdAndUpdate(incident.reported, {
        isActive: false,
        // Could add suspendedUntil field to User model
      });
    }

    res.json({ message: 'Incidente resuelto exitosamente', incident });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;