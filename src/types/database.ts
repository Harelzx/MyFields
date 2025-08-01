// ==============================================
// Database Types for MyFields Platform
// Corresponding to the Supabase schema
// ==============================================

// ==============================================
// LOOKUP/REFERENCE TYPES
// ==============================================

export interface Sport {
  id: string;
  name: string;
  icon_name?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon_name?: string;
  category: 'facilities' | 'equipment' | 'services';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface FieldType {
  id: string;
  sport_id: string;
  name: string;
  description?: string;
  typical_capacity?: number;
  is_active: boolean;
  created_at: string;
  sport?: Sport;
}

// ==============================================
// USER TYPES
// ==============================================

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: 'player' | 'business_owner';
  city_id?: string;
  address?: string;
  profile_image_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  wallet_balance: number;
  is_verified: boolean;
  onboarding_completed: boolean;
  notification_preferences: Record<string, any>;
  privacy_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Relations
  city?: City;
  preferred_sports?: UserSport[];
  business_profile?: BusinessProfile;
}

export interface UserSport {
  id: string;
  user_id: string;
  sport_id: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  
  // Relations
  sport?: Sport;
}

// ==============================================
// BUSINESS TYPES
// ==============================================

export interface BusinessProfile {
  id: string;
  owner_id: string;
  business_name: string;
  business_type?: 'sports_complex' | 'private_field' | 'public_facility';
  tax_id?: string;
  website_url?: string;
  description?: string;
  logo_url?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  owner?: UserProfile;
  fields?: Field[];
}

// ==============================================
// FIELD TYPES
// ==============================================

export interface Field {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sport_id?: string;
  field_type_id?: string;
  city_id?: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  postal_code?: string;
  
  // Physical attributes
  capacity?: number;
  length_meters?: number;
  width_meters?: number;
  surface_type?: 'natural_grass' | 'artificial_turf' | 'hardcourt' | 'sand' | 'concrete';
  
  // Media
  primary_image_url?: string;
  image_urls: string[];
  
  // Status and ratings
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  
  // Additional info
  special_features: string[];
  rules_and_policies?: string;
  cancellation_policy?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  business?: BusinessProfile;
  sport?: Sport;
  field_type?: FieldType;
  city?: City;
  amenities?: FieldAmenity[];
  operating_hours?: FieldOperatingHour[];
  pricing?: FieldPricing[];
  packages?: FieldPackage[];
  reviews?: FieldReview[];
}

export interface FieldAmenity {
  id: string;
  field_id: string;
  amenity_id: string;
  is_included: boolean;
  additional_cost: number;
  notes?: string;
  created_at: string;
  
  // Relations
  amenity?: Amenity;
}

// ==============================================
// OPERATING HOURS TYPES
// ==============================================

export interface FieldOperatingHour {
  id: string;
  field_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  is_closed: boolean;
  created_at: string;
}

export interface FieldExceptionHour {
  id: string;
  field_id: string;
  date: string; // YYYY-MM-DD format
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  reason?: string;
  created_at: string;
}

// ==============================================
// PRICING TYPES
// ==============================================

export interface FieldPricing {
  id: string;
  field_id: string;
  pricing_type: 'hourly' | 'per_game' | 'daily' | 'package';
  name: string;
  base_price: number;
  currency: string;
  
  // Time conditions
  applies_to_days?: number[];
  start_time?: string;
  end_time?: string;
  
  // Date conditions
  valid_from?: string;
  valid_until?: string;
  
  // Special conditions
  minimum_duration?: number; // in minutes
  maximum_duration?: number; // in minutes
  minimum_participants?: number;
  maximum_participants?: number;
  
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface FieldPackage {
  id: string;
  field_id: string;
  name: string;
  description?: string;
  package_type: 'bulk_hours' | 'membership' | 'tournament';
  price: number;
  included_hours?: number;
  validity_days?: number;
  max_bookings_per_day?: number;
  terms_and_conditions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==============================================
// BOOKING TYPES
// ==============================================

export interface Booking {
  id: string;
  user_id: string;
  field_id: string;
  package_id?: string;
  
  // Booking details
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  
  // Pricing
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  
  // Participants
  expected_participants: number;
  actual_participants?: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  
  // Additional info
  special_requests?: string;
  internal_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  // Relations
  user?: UserProfile;
  field?: Field;
  package?: FieldPackage;
  participants?: BookingParticipant[];
  reviews?: FieldReview[];
}

export interface BookingParticipant {
  id: string;
  booking_id: string;
  user_id?: string;
  participant_name?: string;
  phone_number?: string;
  status: 'invited' | 'confirmed' | 'declined' | 'no_show';
  invited_at: string;
  responded_at?: string;
  
  // Relations
  user?: UserProfile;
}

// ==============================================
// REVIEW TYPES
// ==============================================

export interface FieldReview {
  id: string;
  field_id: string;
  user_id: string;
  booking_id?: string;
  
  rating: number; // 1-5
  title?: string;
  comment?: string;
  
  // Aspect ratings
  cleanliness_rating?: number;
  facilities_rating?: number;
  location_rating?: number;
  value_rating?: number;
  
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: UserProfile;
  field?: Field;
  booking?: Booking;
  votes?: ReviewVote[];
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

// ==============================================
// WALLET TYPES
// ==============================================

export interface WalletTransaction {
  id: string;
  user_id: string;
  
  // Transaction details
  transaction_type: 'booking_payment' | 'wallet_charge' | 'refund' | 'transfer_in' | 'transfer_out' | 
                   'penalty' | 'bonus' | 'cashback' | 'commission';
  amount: number;
  currency: string;
  description: string;
  category?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // References
  related_booking_id?: string;
  related_field_id?: string;
  related_user_id?: string;
  
  // Payment info
  payment_method?: string;
  payment_provider?: string;
  external_transaction_id?: string;
  receipt_url?: string;
  
  // Metadata
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: UserProfile;
  related_booking?: Booking;
  related_field?: Field;
  related_user?: UserProfile;
}

// ==============================================
// SOCIAL TYPES
// ==============================================

export interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  requested_at: string;
  responded_at?: string;
  
  // Relations
  requester?: UserProfile;
  addressee?: UserProfile;
}

export interface Game {
  id: string;
  organizer_id: string;
  field_id: string;
  sport_id?: string;
  
  title: string;
  description?: string;
  
  // Game timing
  game_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes: number;
  
  // Participants
  max_players: number;
  current_players: number;
  min_skill_level?: 'beginner' | 'intermediate' | 'advanced';
  max_skill_level?: 'beginner' | 'intermediate' | 'advanced';
  
  // Pricing
  price_per_player: number;
  
  // Settings
  is_public: boolean;
  requires_approval: boolean;
  allow_late_join: boolean;
  
  status: 'open' | 'full' | 'active' | 'completed' | 'cancelled';
  
  created_at: string;
  updated_at: string;
  
  // Relations
  organizer?: UserProfile;
  field?: Field;
  sport?: Sport;
  participants?: GameParticipant[];
}

export interface GameParticipant {
  id: string;
  game_id: string;
  user_id: string;
  status: 'pending' | 'joined' | 'declined' | 'kicked' | 'no_show';
  joined_at: string;
  left_at?: string;
  
  // Relations
  user?: UserProfile;
}

// ==============================================
// UTILITY TYPES FOR API RESPONSES
// ==============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ==============================================
// SEARCH AND FILTER TYPES
// ==============================================

export interface FieldSearchFilters {
  sport_id?: string;
  city_id?: string;
  max_price?: number;
  min_rating?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  amenity_ids?: string[];
  capacity_min?: number;
  capacity_max?: number;
  surface_type?: string[];
  is_featured?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  };
}

export interface GameSearchFilters {
  sport_id?: string;
  city_id?: string;
  date?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  max_price?: number;
  available_spots_only?: boolean;
}

// ==============================================
// FORM DATA TYPES (for signup and field creation)
// ==============================================

export interface FieldFormData {
  // Basic info
  name: string;
  description?: string;
  sport_id: string;
  field_type_id?: string;
  
  // Location
  city_id: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  postal_code?: string;
  
  // Physical attributes
  capacity?: number;
  length_meters?: number;
  width_meters?: number;
  surface_type?: string;
  
  // Media
  primary_image_url?: string;
  image_urls: string[];
  
  // Features and amenities
  special_features: string[];
  amenity_ids: string[];
  
  // Operating hours
  operating_hours: {
    [key: number]: {
      is_closed: boolean;
      open_time?: string;
      close_time?: string;
    };
  };
  
  // Pricing
  pricing: {
    pricing_type: string;
    name: string;
    base_price: number;
    applies_to_days?: number[];
    start_time?: string;
    end_time?: string;
  }[];
  
  // Policies
  rules_and_policies?: string;
  cancellation_policy?: string;
}

export interface BusinessOwnerSignupData extends UserProfile {
  business_profile: {
    business_name: string;
    business_type?: string;
    description?: string;
    website_url?: string;
  };
  
  field_data: FieldFormData;
}

// ==============================================
// DASHBOARD AND ANALYTICS TYPES
// ==============================================

export interface BusinessDashboardStats {
  total_fields: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
  
  recent_bookings: Booking[];
  recent_reviews: FieldReview[];
  
  monthly_revenue: {
    month: string;
    revenue: number;
  }[];
  
  booking_trends: {
    date: string;
    bookings: number;
  }[];
  
  popular_fields: {
    field: Field;
    booking_count: number;
    revenue: number;
  }[];
}

export interface UserDashboardStats {
  total_bookings: number;
  total_spent: number;
  favorite_sports: string[];
  wallet_balance: number;
  
  recent_bookings: Booking[];
  upcoming_bookings: Booking[];
  available_games: Game[];
  
  spending_by_sport: {
    sport: string;
    amount: number;
  }[];
  
  monthly_activity: {
    month: string;
    bookings: number;
    spent: number;
  }[];
}