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

// ===== Game Types =====
export interface Game {
  id: string;
  title?: string;
  sport: string;
  fieldId: string;
  fieldName: string;
  fieldImageUrl?: string;
  organizerId: string;
  organizerName: string;
  date: string;
  time: string;
  duration: number;
  maxPlayers: number;
  currentPlayers: number;
  pricePerPlayer: number;
  description?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  status: 'open' | 'full' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  participants: string[];
}

// ===== Wallet Types =====
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'booking_payment' | 'wallet_charge' | 'refund' | 'transfer_in' | 'transfer_out' | 'penalty' | 'bonus';
  amount: number;
  description: string;
  category: 'sports' | 'deposit' | 'refund' | 'transfer' | 'fee' | 'reward';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  relatedBookingId?: string;
  relatedFieldId?: string;
  relatedUserId?: string; // For transfers
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay';
  receiptUrl?: string;
  metadata?: {
    fieldName?: string;
    sportType?: string;
    duration?: number;
    participants?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface WalletBalance {
  current: number;
  pending: number;
  available: number;
  lastUpdated: string;
}

export interface SpendingInsights {
  currentMonth: {
    totalSpent: number;
    totalDeposited: number;
    transactionCount: number;
    topCategory: string;
    compared_to_last_month: {
      spent_change: number;
      deposited_change: number;
    };
  };
  categories: {
    [category: string]: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
  trends: {
    weekly: number[];
    monthly: number[];
  };
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