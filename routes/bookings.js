const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const TransportListing = require('../models/TransportListing');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, [
  body('listing').isMongoId().withMessage('Valid listing ID is required'),
  body('passengers.count').isInt({ min: 1 }).withMessage('At least 1 passenger is required'),
  body('pickup.address').optional().trim().notEmpty().withMessage('Pickup address cannot be empty'),
  body('dropoff.address').optional().trim().notEmpty().withMessage('Dropoff address cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listing: listingId, passengers, cargoDetails, pickup, dropoff, payment, notes } = req.body;

    // Get the listing
    const listing = await TransportListing.findById(listingId).populate('owner');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'Listing is not active' });
    }

    if (listing.owner.blacklisted) {
      return res.status(400).json({ message: 'This service is not available' });
    }

    // Check availability
    if (listing.capacity.available < passengers.count) {
      return res.status(400).json({ message: 'Not enough capacity available' });
    }

    // Calculate payment amount
    const totalAmount = listing.price.amount * passengers.count;

    const booking = new Booking({
      listing: listingId,
      passenger: req.user.id,
      driver: listing.owner._id,
      passengers,
      cargoDetails: listing.type === 'cargo' ? cargoDetails : undefined,
      pickup: pickup || {
        address: listing.origin.address,
        date: listing.schedule.departureDate,
        time: listing.schedule.departureTime
      },
      dropoff: dropoff || {
        address: listing.destination.address,
        date: listing.schedule.arrivalDate || listing.schedule.departureDate,
        time: listing.schedule.arrivalTime || listing.schedule.departureTime
      },
      payment: {
        ...payment,
        amount: totalAmount,
        currency: listing.price.currency
      },
      notes: {
        passenger: notes
      }
    });

    await booking.save();

    // Update listing capacity
    listing.capacity.available -= passengers.count;
    await listing.save();

    await booking.populate([
      { path: 'listing', select: 'title type origin destination schedule' },
      { path: 'passenger', select: 'name phone' },
      { path: 'driver', select: 'name phone rating' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type = 'all' } = req.query;

    let query = {};
    
    if (type === 'passenger') {
      query.passenger = req.user.id;
    } else if (type === 'driver') {
      query.driver = req.user.id;
    } else {
      query.$or = [
        { passenger: req.user.id },
        { driver: req.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('listing', 'title type origin destination schedule price')
      .populate('passenger', 'name phone rating')
      .populate('driver', 'name phone rating')
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

// @route   GET /api/bookings/:id
// @desc    Get specific booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('passenger', 'name phone rating address')
      .populate('driver', 'name phone rating address vehicleInfo');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is involved in this booking
    if (booking.passenger._id.toString() !== req.user.id && 
        booking.driver._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', auth, [
  body('status').isIn(['confirmed', 'in-progress', 'completed', 'cancelled', 'disputed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization based on status change
    let authorized = false;
    if (req.user.role === 'admin') {
      authorized = true;
    } else if (status === 'confirmed' && booking.driver.toString() === req.user.id) {
      authorized = true;
    } else if (status === 'cancelled' && 
               (booking.passenger.toString() === req.user.id || booking.driver.toString() === req.user.id)) {
      authorized = true;
    } else if (['in-progress', 'completed'].includes(status) && booking.driver.toString() === req.user.id) {
      authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({ message: 'Not authorized to update this booking status' });
    }

    // Handle capacity restoration for cancelled bookings
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const listing = await TransportListing.findById(booking.listing);
      if (listing) {
        listing.capacity.available += booking.passengers.count;
        await listing.save();
      }
    }

    booking.status = status;
    if (reason) {
      const userType = booking.passenger.toString() === req.user.id ? 'passenger' : 'driver';
      booking.notes[userType] = reason;
    }

    await booking.save();

    await booking.populate([
      { path: 'listing', select: 'title type origin destination schedule' },
      { path: 'passenger', select: 'name phone' },
      { path: 'driver', select: 'name phone rating' }
    ]);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/message
// @desc    Send message in booking
// @access  Private
router.post('/:id/message', auth, [
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, type = 'text' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is involved in this booking
    if (booking.passenger.toString() !== req.user.id && 
        booking.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.communication.messages.push({
      sender: req.user.id,
      message,
      type,
      timestamp: new Date()
    });

    await booking.save();

    await booking.populate('communication.messages.sender', 'name');

    res.json(booking.communication.messages[booking.communication.messages.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/payment
// @desc    Update payment status
// @access  Private
router.post('/:id/payment', auth, [
  body('status').isIn(['paid', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only driver can mark as paid, admin can refund
    if (status === 'paid' && booking.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the driver can confirm payment' });
    }

    if (status === 'refunded' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can process refunds' });
    }

    booking.payment.status = status;
    if (status === 'paid') {
      booking.payment.paidAt = new Date();
    }

    await booking.save();

    res.json({ message: `Payment ${status} successfully`, payment: booking.payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;