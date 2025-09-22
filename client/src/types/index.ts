export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'driver' | 'passenger' | 'cargo_business' | 'transport_business';
  firstName: string;
  lastName: string;
  phone: string;
  whatsappNumber?: string;
  profileImage?: string;
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  address: {
    street: string;
    city: string;
    province: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rating: {
    average: number;
    totalRatings: number;
  };
  joinedAt: string;
  lastActive: string;
}

export interface Trip {
  _id: string;
  driver: User;
  type: 'passenger' | 'cargo' | 'mixed';
  origin: {
    address: string;
    city: string;
    province: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    address: string;
    city: string;
    province: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  departureDate: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  vehicle: {
    type: 'car' | 'van' | 'bus' | 'truck' | 'motorcycle';
    model: string;
    year: number;
    licensePlate: string;
    capacity: {
      passengers?: number;
      cargoWeight?: number;
      cargoVolume?: number;
    };
    features: string[];
  };
  pricing: {
    passengerPrice?: number;
    cargoPrice?: number;
    priceType: 'fixed' | 'per_km' | 'per_kg' | 'negotiable';
    currency: 'CUP' | 'USD';
  };
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  availableSeats: number;
  availableCargoSpace: {
    weight: number;
    volume?: number;
  };
  route: {
    distance: number;
    estimatedDuration: number;
  };
  communication: {
    allowWhatsApp: boolean;
    allowSMS: boolean;
    allowCalls: boolean;
  };
  createdAt: string;
}

export interface Rating {
  _id: string;
  rater: User;
  rated: User;
  trip: Trip;
  rating: number;
  review: string;
  categories: {
    punctuality?: number;
    communication?: number;
    vehicleCondition?: number;
    safety?: number;
    courtesy?: number;
    cargoHandling?: number;
  };
  type: 'driver_to_passenger' | 'passenger_to_driver' | 'business_to_driver' | 'driver_to_business';
  createdAt: string;
}

export interface Incident {
  _id: string;
  reporter: User;
  reported: User;
  trip?: Trip;
  type: 'safety' | 'fraud' | 'harassment' | 'vehicle_issue' | 'no_show' | 'payment_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolution?: {
    action: 'warning' | 'suspension' | 'blacklist' | 'no_action';
    reason: string;
    resolvedBy: User;
    resolvedAt: string;
  };
  createdAt: string;
}