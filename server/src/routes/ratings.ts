import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Rating from '../models/Rating';
import User from '../models/User';

const router = express.Router();

// Create rating
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rated, trip, rating, review, categories, type } = req.body;
    
    // Check if rating already exists
    const existingRating = await Rating.findOne({
      rater: (req as any).user._id,
      rated,
      trip
    });

    if (existingRating) {
      return res.status(400).json({ message: 'Ya has calificado este viaje' });
    }

    const newRating = new Rating({
      rater: (req as any).user._id,
      rated,
      trip,
      rating,
      review,
      categories,
      type
    });

    await newRating.save();

    // Update user's average rating
    const allRatings = await Rating.find({ rated });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await User.findByIdAndUpdate(rated, {
      'rating.average': averageRating,
      'rating.totalRatings': allRatings.length
    });

    res.status(201).json({ message: 'Calificación creada exitosamente', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get user ratings
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const ratings = await Rating.find({ rated: req.params.userId })
      .populate('rater', 'firstName lastName profileImage')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Rating.countDocuments({ rated: req.params.userId });

    res.json({
      ratings,
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