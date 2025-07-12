// ===== User Types =====
export interface User {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phone: string;
  userType: 'player' | 'business_owner';
  profileImageUrl?: string;
  walletBalance: number;
  isVerified: boolean;
  createdAt: string;
  onboardingCompleted: boolean;
  preferredSports: string[];
}

// ===== Sport Types =====
export interface Sport {
  id: string;
  name: string;
  iconName: string;
  isActive: boolean;
}

// ===== Field Types =====
export interface Field {
  id: string;
  name: string;
  description: string;
  sportType: string;
  city: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pricePerHour: number;
  imageUrl: string;
  additionalImages: string[];
  businessOwnerId: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  availableHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
}

// ===== Booking Types =====
export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  fieldName: string;
  fieldImageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  friends?: string[];
}

// ===== Friend Types =====
export interface Friend {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  phoneNumber: string;
  favoriteSpots: string[];
  isOnline: boolean;
  lastActive?: string;
}

// ===== Wallet Types =====
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  relatedBookingId?: string;
  createdAt: string;
}

// ===== Search Types =====
export interface SearchFilters {
  sportType?: string;
  city?: string;
  maxPrice?: number;
  minRating?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== Business Types =====
export interface BusinessExpense {
  id: string;
  businessId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}