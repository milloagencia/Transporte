const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const TransportListing = require('../models/TransportListing');
const Booking = require('../models/Booking');
const Rating = require('../models/Rating');
const { adminAuth, auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalRatings,
      activeUsers,
      blacklistedUsers,
      pendingVerifications,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      TransportListing.countDocuments(),
      Booking.countDocuments(),
      Rating.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ blacklisted: true }),
      User.countDocuments({ verified: false }),
      Booking.find().populate('passenger', 'name').populate('driver', 'name').sort({ createdAt: -1 }).limit(10)
    ]);

    // User distribution by role
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Booking status distribution
    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalListings,
        totalBookings,
        totalRatings,
        activeUsers,
        blacklistedUsers,
        pendingVerifications
      },
      userRoles,
      bookingStatus,
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with admin controls
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      verified, 
      blacklisted, 
      search 
    } = req.query;

    const query = {};
    
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (blacklisted !== undefined) query.blacklisted = blacklisted === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/blacklist
// @desc    Blacklist/unblacklist a user
// @access  Private (Admin only)
router.put('/users/:id/blacklist', adminAuth, [
  body('blacklisted').isBoolean().withMessage('Blacklisted must be true or false'),
  body('reason').optional().trim().isLength({ min: 5 }).withMessage('Reason must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { blacklisted, reason } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blacklisted = blacklisted;
    if (blacklisted && reason) {
      user.blacklistReason = reason;
    } else if (!blacklisted) {
      user.blacklistReason = undefined;
    }

    await user.save();

    // If blacklisting, also suspend their active listings
    if (blacklisted) {
      await TransportListing.updateMany(
        { owner: userId, status: 'active' },
        { status: 'suspended' }
      );
    } else {
      // If unblacklisting, reactivate their suspended listings
      await TransportListing.updateMany(
        { owner: userId, status: 'suspended' },
        { status: 'active' }
      );
    }

    res.json({
      message: `User ${blacklisted ? 'blacklisted' : 'removed from blacklist'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        blacklisted: user.blacklisted,
        blacklistReason: user.blacklistReason
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify/unverify a user
// @access  Private (Admin only)
router.put('/users/:id/verify', adminAuth, [
  body('verified').isBoolean().withMessage('Verified must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { verified } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { verified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for admin review
// @access  Private (Admin only)
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      disputed = false 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (disputed === 'true') query.status = 'disputed';

    const bookings = await Booking.find(query)
      .populate('passenger', 'name email phone')
      .populate('driver', 'name email phone')
      .populate('listing', 'title type origin destination')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/bookings/:id/resolve
// @desc    Resolve disputed booking
// @access  Private (Admin only)
router.put('/bookings/:id/resolve', adminAuth, [
  body('resolution').isIn(['favour_passenger', 'favour_driver', 'partial_refund']).withMessage('Invalid resolution'),
  body('notes').trim().isLength({ min: 10 }).withMessage('Resolution notes must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resolution, notes } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'completed';
    booking.notes.admin = `Dispute resolved: ${resolution}. ${notes}`;

    await booking.save();

    res.json({
      message: 'Dispute resolved successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/ratings/reported
// @desc    Get reported ratings for review
// @access  Private (Admin only)
router.get('/ratings/reported', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const ratings = await Rating.find({ reported: true })
      .populate('ratedUser', 'name email')
      .populate('ratedBy', 'name email')
      .populate('booking', 'createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Rating.countDocuments({ reported: true });

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/ratings/:id/moderate
// @desc    Moderate reported rating
// @access  Private (Admin only)
router.put('/ratings/:id/moderate', adminAuth, [
  body('action').isIn(['approve', 'remove']).withMessage('Action must be approve or remove'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, notes } = req.body;
    const ratingId = req.params.id;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    if (action === 'approve') {
      rating.reported = false;
      rating.reportReason = undefined;
    } else {
      rating.verified = false;
      // Update user's rating after removing this rating
      await updateUserRating(rating.ratedUser);
    }

    await rating.save();

    res.json({
      message: `Rating ${action === 'approve' ? 'approved' : 'removed'} successfully`,
      rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private (Admin only)
router.get('/system/health', adminAuth, async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    
    // Get some basic system metrics
    const metrics = {
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };

    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await User.findOne().lean();
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
}

// Helper function to update user rating (same as in ratings.js)
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
      'rating.average': Math.round(averageScore * 10) / 10,
      'rating.count': totalRatings
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}

module.exports = router;