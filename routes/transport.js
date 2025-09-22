const express = require('express');
const { body, validationResult } = require('express-validator');
const TransportListing = require('../models/TransportListing');
const Booking = require('../models/Booking');
const { auth, driverAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/transport/listings
// @desc    Create transport listing
// @access  Private (Drivers/Transport businesses)
router.post('/listings', driverAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').isIn(['passenger', 'cargo']).withMessage('Type must be passenger or cargo'),
  body('origin.address').trim().notEmpty().withMessage('Origin address is required'),
  body('origin.city').trim().notEmpty().withMessage('Origin city is required'),
  body('origin.province').trim().notEmpty().withMessage('Origin province is required'),
  body('destination.address').trim().notEmpty().withMessage('Destination address is required'),
  body('destination.city').trim().notEmpty().withMessage('Destination city is required'),
  body('destination.province').trim().notEmpty().withMessage('Destination province is required'),
  body('schedule.departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('schedule.departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid departure time is required'),
  body('capacity.total').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price.amount').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const listingData = {
      ...req.body,
      owner: req.user.id,
      capacity: {
        ...req.body.capacity,
        available: req.body.capacity.total
      }
    };

    const listing = new TransportListing(listingData);
    await listing.save();

    await listing.populate('owner', 'name phone rating');

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transport/listings
// @desc    Get transport listings with filters
// @access  Public
router.get('/listings', async (req, res) => {
  try {
    const {
      type,
      originCity,
      destinationCity,
      originProvince,
      destinationProvince,
      departureDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    const query = { status: 'active' };

    if (type) query.type = type;
    if (originCity) query['origin.city'] = { $regex: originCity, $options: 'i' };
    if (destinationCity) query['destination.city'] = { $regex: destinationCity, $options: 'i' };
    if (originProvince) query['origin.province'] = { $regex: originProvince, $options: 'i' };
    if (destinationProvince) query['destination.province'] = { $regex: destinationProvince, $options: 'i' };
    
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query['schedule.departureDate'] = {
        $gte: date,
        $lt: nextDay
      };
    }

    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    // Only show listings from non-blacklisted users
    const listings = await TransportListing.find(query)
      .populate({
        path: 'owner',
        match: { blacklisted: false },
        select: 'name phone rating verified vehicleInfo businessInfo'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sort]: -1 });

    // Filter out listings with blacklisted owners
    const validListings = listings.filter(listing => listing.owner);

    const total = await TransportListing.countDocuments(query);

    res.json({
      listings: validListings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transport/listings/:id
// @desc    Get specific transport listing
// @access  Public
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await TransportListing.findById(req.params.id)
      .populate('owner', 'name phone rating verified vehicleInfo businessInfo address');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.owner.blacklisted) {
      return res.status(404).json({ message: 'Listing not available' });
    }

    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/transport/listings/:id
// @desc    Update transport listing
// @access  Private (Owner or Admin)
router.put('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await TransportListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing or is admin
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = [
      'title', 'description', 'schedule', 'capacity', 'price', 
      'cargoDetails', 'amenities', 'requirements', 'contactPreferences', 'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedListing = await TransportListing.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('owner', 'name phone rating');

    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transport/listings/:id
// @desc    Delete transport listing
// @access  Private (Owner or Admin)
router.delete('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await TransportListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing or is admin
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await TransportListing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transport/my-listings
// @desc    Get current user's listings
// @access  Private
router.get('/my-listings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const listings = await TransportListing.find({ owner: req.user.id })
      .populate('owner', 'name phone rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await TransportListing.countDocuments({ owner: req.user.id });

    res.json({
      listings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;