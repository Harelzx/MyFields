# MyFields API Documentation

## Overview

This document describes the API structure and database schema for the MyFields platform. The platform supports both players and business owners with advanced field management, booking, and social features.

## Database Schema Overview

### Core Entities

1. **Users & Authentication**
   - `user_profiles` - Extended user information
   - `user_sports` - User sport preferences
   - `business_profiles` - Business owner information

2. **Field Management**
   - `fields` - Sports venues/courts
   - `field_amenities` - Venue facilities
   - `field_operating_hours` - Business hours
   - `field_pricing` - Pricing structures
   - `field_packages` - Package deals

3. **Booking System**
   - `bookings` - Venue reservations
   - `booking_participants` - Group booking members

4. **Reference Data**
   - `sports` - Available sports
   - `cities` - Supported cities
   - `amenities` - Available facilities
   - `field_types` - Sport-specific field types

## Authentication API

### Player Registration

```typescript
interface PlayerSignupData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  city_id: string;
  address?: string;
  profile_image_url?: string;
  preferred_sports: string[]; // sport IDs
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

// Usage
const result = await registerPlayer({
  first_name: "דוד",
  last_name: "כהן",
  email: "david@example.com",
  phone_number: "050-1234567",
  password: "securePassword123",
  city_id: "uuid-of-tel-aviv",
  preferred_sports: ["uuid-of-football", "uuid-of-basketball"],
  gender: "male"
});
```

### Business Owner Registration

```typescript
interface BusinessOwnerSignupFormData {
  // Personal info
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  city_id: string;
  
  // Business info
  business_name: string;
  business_type?: 'sports_complex' | 'private_field' | 'public_facility';
  website_url?: string;
  business_description?: string;
  
  // First field info
  field_name: string;
  sport_id: string;
  field_address: string;
  capacity?: number;
  surface_type?: string;
  amenity_ids: string[];
  
  // Operating hours (0 = Sunday, 6 = Saturday)
  operating_hours: {
    [key: number]: {
      is_closed: boolean;
      open_time?: string; // "HH:MM"
      close_time?: string; // "HH:MM"
    };
  };
  
  // Pricing
  base_price: number;
  pricing_name?: string;
}

// Usage
const result = await registerBusinessOwner({
  first_name: "משה",
  last_name: "לוי",
  email: "moshe@sportscomplex.com",
  phone_number: "052-9876543",
  password: "businessPass123",
  city_id: "uuid-of-tel-aviv",
  business_name: "מתחם הספורט הרצליה",
  business_type: "sports_complex",
  field_name: "מגרש כדורגל מרכזי",
  sport_id: "uuid-of-football",
  field_address: "רחוב ההסתדרות 45, הרצליה",
  capacity: 22,
  surface_type: "artificial_turf",
  amenity_ids: ["uuid-parking", "uuid-showers", "uuid-lighting"],
  operating_hours: {
    0: { is_closed: false, open_time: "06:00", close_time: "23:00" }, // Sunday
    1: { is_closed: false, open_time: "06:00", close_time: "23:00" }, // Monday
    // ... other days
    5: { is_closed: false, open_time: "06:00", close_time: "15:00" }, // Friday
    6: { is_closed: false, open_time: "20:00", close_time: "23:00" }  // Saturday
  },
  base_price: 150
});
```

## Field Management API

### Field Search with Advanced Filters

```typescript
interface FieldSearchFilters {
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
    radius_km?: number; // Default: 10km
  };
}

// Search fields with filters
const result = await searchFields({
  sport_id: "uuid-of-football",
  city_id: "uuid-of-tel-aviv",
  max_price: 200,
  min_rating: 4.0,
  amenity_ids: ["uuid-parking", "uuid-lighting"],
  capacity_min: 10,
  coordinates: {
    latitude: 32.0853,
    longitude: 34.7818,
    radius_km: 5
  }
}, 1, 20); // page 1, 20 items per page
```

### Create New Field (Business Owners)

```typescript
interface FieldFormData {
  name: string;
  description?: string;
  sport_id: string;
  field_type_id?: string;
  city_id: string;
  address: string;
  coordinates?: { latitude: number; longitude: number; };
  postal_code?: string;
  capacity?: number;
  length_meters?: number;
  width_meters?: number;
  surface_type?: string;
  primary_image_url?: string;
  image_urls: string[];
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
  
  // Pricing tiers
  pricing: {
    pricing_type: string;
    name: string;
    base_price: number;
    applies_to_days?: number[];
    start_time?: string;
    end_time?: string;
  }[];
  
  rules_and_policies?: string;
  cancellation_policy?: string;
}

// Create a new field
const result = await createField({
  name: "מגרש טניס פרימיום",
  description: "מגרש טניס מקצועי עם תאורה מלאה",
  sport_id: "uuid-of-tennis",
  city_id: "uuid-of-raanana",
  address: "רחוב אחוזה 12, רעננה",
  coordinates: { latitude: 32.1847, longitude: 34.8708 },
  capacity: 4,
  surface_type: "hardcourt",
  image_urls: ["https://example.com/image1.jpg"],
  special_features: ["מגרש מקורה", "מיזוג אוויר"],
  amenity_ids: ["uuid-parking", "uuid-showers"],
  operating_hours: {
    0: { is_closed: false, open_time: "06:00", close_time: "22:00" },
    // ... other days
  },
  pricing: [
    {
      pricing_type: "hourly",
      name: "Peak Hours",
      base_price: 120,
      applies_to_days: [1, 2, 3, 4], // Mon-Thu
      start_time: "17:00",
      end_time: "22:00"
    },
    {
      pricing_type: "hourly",
      name: "Off-Peak",
      base_price: 80,
      applies_to_days: [1, 2, 3, 4], // Mon-Thu
      start_time: "06:00",
      end_time: "17:00"
    }
  ]
});
```

## Structured Data Benefits

### 1. Operating Hours Management

Instead of free text like "ראשון-חמישי 08:00-22:00", the system now uses:

```sql
-- Structured operating hours
CREATE TABLE field_operating_hours (
    field_id UUID,
    day_of_week INTEGER, -- 0=Sunday, 6=Saturday
    open_time TIME,      -- "08:00"
    close_time TIME,     -- "22:00"
    is_closed BOOLEAN
);
```

**Benefits:**
- Easy availability checking
- Automated booking validation
- Multi-language support
- Integration with calendar systems

### 2. Advanced Pricing Models

Instead of "100 ש״ח לשעה", the system supports:

```sql
-- Flexible pricing structure
CREATE TABLE field_pricing (
    field_id UUID,
    pricing_type VARCHAR(50), -- 'hourly', 'per_game', 'daily'
    name VARCHAR(100),        -- 'Peak Hours', 'Weekend Rate'
    base_price DECIMAL(10,2),
    applies_to_days INTEGER[], -- [1,2,3,4,5] = weekdays
    start_time TIME,          -- "18:00"
    end_time TIME,            -- "23:00"
    valid_from DATE,
    valid_until DATE,
    priority INTEGER
);
```

**Benefits:**
- Peak/off-peak pricing
- Seasonal pricing
- Time-based rates
- Package deals
- Dynamic pricing support

### 3. Standardized Amenities

Instead of free text amenities, structured data allows:

```sql
-- Standardized amenities
CREATE TABLE amenities (
    id UUID PRIMARY KEY,
    name VARCHAR(100),    -- "חניה", "מקלחות"
    icon_name VARCHAR(50), -- "parking", "shower"
    category VARCHAR(50)   -- "facilities", "services"
);

-- Field-specific amenity details
CREATE TABLE field_amenities (
    field_id UUID,
    amenity_id UUID,
    is_included BOOLEAN,
    additional_cost DECIMAL(8,2),
    notes TEXT
);
```

**Benefits:**
- Consistent search filters
- Multi-language support
- Cost transparency
- Better UI/UX

### 4. Geographic Search

Structured location data enables:

```sql
-- PostGIS geography for precise location queries
CREATE TABLE fields (
    coordinates GEOGRAPHY(POINT, 4326),
    -- other fields...
);

-- Find fields within 5km radius
SELECT * FROM fields 
WHERE ST_DWithin(
    coordinates, 
    ST_GeogFromText('POINT(34.7818 32.0853)'), 
    5000
);
```

**Benefits:**
- Radius-based search
- Distance calculations
- Map integration
- Location-based recommendations

## Booking System

### Check Availability

```typescript
const availability = await checkFieldAvailability(
  "field-uuid",
  "2024-02-15", // date
  "18:00",      // start time
  "20:00"       // end time
);

if (availability.data?.available) {
  // Proceed with booking
} else {
  // Show conflicts
  console.log(availability.data?.conflicts);
}
```

### Create Booking

```typescript
const booking = await createBooking({
  field_id: "field-uuid",
  booking_date: "2024-02-15",
  start_time: "18:00",
  end_time: "20:00",
  expected_participants: 4,
  special_requests: "נא להכין כדורים חדשים"
});
```

## Reference Data APIs

### Get All Sports

```typescript
const sports = await getSports();
// Returns: [
//   { id: "uuid", name: "כדורגל", icon_name: "⚽", is_active: true },
//   { id: "uuid", name: "כדורסל", icon_name: "🏀", is_active: true },
//   ...
// ]
```

### Get Cities

```typescript
const cities = await getCities();
// Returns: [
//   { id: "uuid", name: "תל אביב", region: "מרכז" },
//   { id: "uuid", name: "הרצליה", region: "מרכז" },
//   ...
// ]
```

### Get Amenities by Category

```typescript
const amenities = await getAmenities();
// Returns: [
//   { id: "uuid", name: "חניה", category: "facilities", icon_name: "parking" },
//   { id: "uuid", name: "מקלחות", category: "facilities", icon_name: "shower" },
//   { id: "uuid", name: "מאמן", category: "services", icon_name: "coach" },
//   ...
// ]
```

## Advanced Features Enabled

### 1. Smart Search & Filtering

```typescript
// Find football fields in Tel Aviv with parking and lighting,
// available this weekend, under 150 ILS/hour, within 3km of user
const results = await searchFields({
  sport_id: "football-uuid",
  city_id: "tel-aviv-uuid",
  max_price: 150,
  amenity_ids: ["parking-uuid", "lighting-uuid"],
  date: "2024-02-17", // Saturday
  start_time: "19:00",
  end_time: "21:00",
  coordinates: {
    latitude: 32.0853,
    longitude: 34.7818,
    radius_km: 3
  }
});
```

### 2. Dynamic Pricing Display

```typescript
// Get pricing for specific time/date
const pricing = await getFieldPricing("field-uuid", {
  date: "2024-02-15",
  start_time: "18:00",
  duration_minutes: 120,
  participants: 10
});

// Returns appropriate pricing tier based on:
// - Day of week
// - Time of day
// - Season
// - Participant count
// - Package deals
```

### 3. Availability Calendar

```typescript
// Get availability for entire month
const availability = await getFieldAvailability("field-uuid", {
  start_date: "2024-02-01",
  end_date: "2024-02-29"
});

// Returns availability matrix for calendar display
```

### 4. Booking Analytics

```typescript
// For business owners
const analytics = await getBusinessAnalytics("business-uuid", {
  period: "month",
  start_date: "2024-02-01",
  end_date: "2024-02-29"
});

// Returns:
// - Revenue by field
// - Peak hours analysis
// - Booking trends
// - Popular amenities
// - Customer demographics
```

## Security Features

### Row Level Security (RLS)

The database uses PostgreSQL's RLS to ensure data security:

```sql
-- Users can only see their own data
CREATE POLICY "users_own_data" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Business owners can only manage their fields
CREATE POLICY "business_own_fields" ON fields
    FOR ALL USING (
        business_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Everyone can view active fields
CREATE POLICY "public_active_fields" ON fields
    FOR SELECT USING (is_active = true);
```

### API Security

- All endpoints require authentication
- Business operations require business owner role
- Input validation on all forms
- SQL injection protection via Supabase
- Real-time subscriptions with RLS

## Migration from Current System

### Data Migration Steps

1. **Sports Data**
   ```sql
   -- Migrate from string array to structured sports
   INSERT INTO sports (name, icon_name, display_order)
   SELECT DISTINCT unnest(preferred_sports), '⚽', 1 
   FROM current_users;
   ```

2. **User Profiles**
   ```sql
   -- Split fullName into first_name/last_name
   UPDATE user_profiles SET 
       first_name = split_part(full_name, ' ', 1),
       last_name = split_part(full_name, ' ', 2);
   ```

3. **Field Information**
   ```sql
   -- Parse operating hours from text to structured data
   -- Parse pricing from text to structured pricing tiers
   -- Extract amenities from text to amenity relationships
   ```

### Frontend Updates Required

1. **Signup Form Updates**
   - Replace sport checkboxes with sport selector from database
   - Replace city text input with city dropdown
   - Add structured operating hours input for business owners
   - Add pricing tier management
   - Add amenity selector

2. **Search Interface**
   - Add advanced filters (price range, amenities, location radius)
   - Implement map-based search
   - Add availability calendar

3. **Field Management**
   - Rich field creation/editing forms
   - Pricing management interface
   - Operating hours management
   - Analytics dashboard

This structured approach provides a solid foundation for advanced features while maintaining data integrity and enabling powerful search and filtering capabilities.