import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import Trip from '../models/Trip';

const router = express.Router();

// Create trip
router.post('/', authenticateToken, requireRole('driver', 'transport_business'), async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      driver: (req as any).user._id
    };

    const trip = new Trip(tripData);
    await trip.save();
    
    await trip.populate('driver', 'firstName lastName phone rating');

    res.status(201).json({ message: 'Viaje creado exitosamente', trip });
  } catch (error) {
    console.error('Error creando viaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Get trips
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      origin, 
      destination, 
      date, 
      type, 
      maxPrice 
    } = req.query;

    const filter: any = { status: { $in: ['planned', 'active'] } };
    
    if (origin) {
      filter.$or = [
        { 'origin.city': { $regex: origin as string, $options: 'i' } },
        { 'origin.province': { $regex: origin as string, $options: 'i' } }
      ];
    }
    
    if (destination) {
      if (!filter.$or) filter.$or = [];
      filter.$or.push(
        { 'destination.city': { $regex: destination as string, $options: 'i' } },
        { 'destination.province': { $regex: destination as string, $options: 'i' } }
      );
    }
    
    if (date) {
      const searchDate = new Date(date as string);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);
      filter.departureDate = { $gte: searchDate, $lt: nextDay };
    }
    
    if (type) filter.type = type;
    
    if (maxPrice) {
      filter.$or = [
        { 'pricing.passengerPrice': { $lte: Number(maxPrice) } },
        { 'pricing.cargoPrice': { $lte: Number(maxPrice) } }
      ];
    }

    const trips = await Trip.find(filter)
      .populate('driver', 'firstName lastName phone rating verificationStatus')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ departureDate: 1 });

    const total = await Trip.countDocuments(filter);

    res.json({
      trips,
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

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driver', 'firstName lastName phone rating verificationStatus profileImage')
      .populate('passengers.user', 'firstName lastName phone rating')
      .populate('cargo.business', 'firstName lastName phone rating');

    if (!trip) {
      return res.status(404).json({ message: 'Viaje no encontrado' });
    }

    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Book passenger seat
router.post('/:id/book-passenger', authenticateToken, requireRole('passenger'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Viaje no encontrado' });
    }

    if (trip.availableSeats <= 0) {
      return res.status(400).json({ message: 'No hay asientos disponibles' });
    }

    // Check if user already booked
    const existingBooking = trip.passengers.find(p => 
      p.user.toString() === (req as any).user._id.toString()
    );

    if (existingBooking) {
      return res.status(400).json({ message: 'Ya tienes una reserva en este viaje' });
    }

    const { pickupLocation, dropoffLocation } = req.body;

    trip.passengers.push({
      user: (req as any).user._id,
      pickupLocation,
      dropoffLocation,
      pricePaid: trip.pricing.passengerPrice || 0,
      status: 'booked'
    } as any);

    trip.availableSeats -= 1;
    await trip.save();

    res.json({ message: 'Asiento reservado exitosamente', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;