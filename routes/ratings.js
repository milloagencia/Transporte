const express = require('express');
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Create new rating
// @access  Private
router.post('/', auth, [
  body('ratedUser').isMongoId().withMessage('Valid user ID is required'),
  body('booking').isMongoId().withMessage('Valid booking ID is required'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be 500 characters or less')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ratedUser, booking: bookingId, score, comment, categories } = req.body;

    // Verify the booking exists and user is involved
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is involved in this booking
    if (booking.passenger.toString() !== req.user.id && booking.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only rate users from your bookings' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only rate completed bookings' });
    }

    // Check if user is trying to rate the correct person
    const expectedRatedUser = booking.passenger.toString() === req.user.id ? 
                             booking.driver.toString() : booking.passenger.toString();
    
    if (ratedUser !== expectedRatedUser) {
      return res.status(400).json({ message: 'Invalid user to rate for this booking' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      ratedUser,
      ratedBy: req.user.id,
      booking: bookingId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user for this booking' });
    }

    // Create the rating
    const rating = new Rating({
      ratedUser,
      ratedBy: req.user.id,
      booking: bookingId,
      score,
      comment,
      categories
    });

    await rating.save();

    // Update user's average rating
    await updateUserRating(ratedUser);

    // Update booking with rating info
    const userType = booking.passenger.toString() === req.user.id ? 'passengerRating' : 'driverRating';
    booking.rating[userType] = {
      score,
      comment,
      date: new Date()
    };
    await booking.save();

    await rating.populate([
      { path: 'ratedUser', select: 'name' },
      { path: 'ratedBy', select: 'name' }
    ]);

    res.status(201).json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings/user/:userId
// @desc    Get ratings for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ ratedUser: req.params.userId, verified: true })
      .populate('ratedBy', 'name')
      .populate('booking', 'createdAt')
      .select('-reported -reportReason')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Rating.countDocuments({ ratedUser: req.params.userId, verified: true });

    // Calculate rating statistics
    const stats = await Rating.aggregate([
      { $match: { ratedUser: req.params.userId, verified: true } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalRatings: { $sum: 1 },
          scoreDistribution: {
            $push: '$score'
          }
        }
      }
    ]);

    const ratingStats = stats[0] || { averageScore: 0, totalRatings: 0, scoreDistribution: [] };
    
    // Count distribution
    const distribution = [1, 2, 3, 4, 5].map(score => ({
      score,
      count: ratingStats.scoreDistribution.filter(s => s === score).length
    }));

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: {
        ...ratingStats,
        distribution
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ratings/:id/helpful
// @desc    Mark rating as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user already marked this as helpful
    if (rating.helpful.users.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already marked this rating as helpful' });
    }

    rating.helpful.users.push(req.user.id);
    rating.helpful.count += 1;
    
    await rating.save();

    res.json({ message: 'Rating marked as helpful', helpfulCount: rating.helpful.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ratings/:id/report
// @desc    Report inappropriate rating
// @access  Private
router.post('/:id/report', auth, [
  body('reason').trim().isLength({ min: 10 }).withMessage('Report reason must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    rating.reported = true;
    rating.reportReason = reason;
    
    await rating.save();

    res.json({ message: 'Rating reported successfully. It will be reviewed by administrators.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user's average rating
async function updateUserRating(userId) {
  try {
    const stats = await Rating.aggregate([
      { $match: { ratedUser: userId, verified: true } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const { averageScore = 0, totalRatings = 0 } = stats[0] || {};

    await User.findByIdAndUpdate(userId, {
      'rating.average': Math.round(averageScore * 10) / 10, // Round to 1 decimal
      'rating.count': totalRatings
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}

module.exports = router;