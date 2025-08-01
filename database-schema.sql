-- =============================================
-- MyFields Database Schema
-- Designed for Supabase PostgreSQL
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- LOOKUP TABLES (Reference Data)
-- =============================================

-- Sports lookup table
CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities lookup table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) DEFAULT 'Israel',
    region VARCHAR(100),
    coordinates GEOGRAPHY(POINT, 4326),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities lookup table
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    category VARCHAR(50), -- 'facilities', 'equipment', 'services'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field types lookup table (subcategories of sports)
CREATE TABLE field_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sport_id, name)
);

-- =============================================
-- USER MANAGEMENT
-- =============================================

-- Extended user profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('player', 'business_owner')),
    city_id UUID REFERENCES cities(id),
    address TEXT,
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferred sports (many-to-many)
CREATE TABLE user_sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sport_id)
);

-- =============================================
-- FIELD/VENUE MANAGEMENT
-- =============================================

-- Business profiles (for business owners)
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(50), -- 'sports_complex', 'private_field', 'public_facility'
    tax_id VARCHAR(50),
    website_url TEXT,
    description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fields/venues table
CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sport_id UUID REFERENCES sports(id),
    field_type_id UUID REFERENCES field_types(id),
    city_id UUID REFERENCES cities(id),
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    postal_code VARCHAR(20),
    
    -- Capacity and dimensions
    capacity INTEGER,
    length_meters DECIMAL(5,2),
    width_meters DECIMAL(5,2),
    surface_type VARCHAR(50), -- 'natural_grass', 'artificial_turf', 'hardcourt', 'sand', 'concrete'
    
    -- Images
    primary_image_url TEXT,
    image_urls TEXT[],
    
    -- Status and ratings
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Metadata
    special_features TEXT[],
    rules_and_policies TEXT,
    cancellation_policy TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field amenities (many-to-many)
CREATE TABLE field_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    additional_cost DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, amenity_id)
);

-- =============================================
-- OPERATING HOURS & AVAILABILITY
-- =============================================

-- Operating hours for fields
CREATE TABLE field_operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, day_of_week)
);

-- Holiday/exception hours
CREATE TABLE field_exception_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    reason VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, date)
);

-- =============================================
-- PRICING STRUCTURE
-- =============================================

-- Pricing tiers for fields
CREATE TABLE field_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    pricing_type VARCHAR(50) NOT NULL, -- 'hourly', 'per_game', 'daily', 'package'
    name VARCHAR(100) NOT NULL, -- 'Peak Hours', 'Off-Peak', 'Weekend', etc.
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    
    -- Time-based pricing conditions
    applies_to_days INTEGER[], -- Array of day numbers (0-6)
    start_time TIME,
    end_time TIME,
    
    -- Date-based pricing conditions
    valid_from DATE,
    valid_until DATE,
    
    -- Special conditions
    minimum_duration INTEGER, -- in minutes
    maximum_duration INTEGER, -- in minutes
    minimum_participants INTEGER,
    maximum_participants INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority overrides lower
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package deals and offers
CREATE TABLE field_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    package_type VARCHAR(50), -- 'bulk_hours', 'membership', 'tournament'
    price DECIMAL(10,2) NOT NULL,
    included_hours INTEGER,
    validity_days INTEGER,
    max_bookings_per_day INTEGER,
    terms_and_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BOOKING SYSTEM
-- =============================================

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    package_id UUID REFERENCES field_packages(id),
    
    -- Booking details
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Participants
    expected_participants INTEGER DEFAULT 1,
    actual_participants INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    
    -- Additional info
    special_requests TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- Booking participants (for group bookings)
CREATE TABLE booking_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    participant_name VARCHAR(100),
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'no_show')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(booking_id, user_id)
);

-- =============================================
-- REVIEWS AND RATINGS
-- =============================================

-- Field reviews
CREATE TABLE field_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    
    -- Aspect ratings
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    facilities_rating INTEGER CHECK (facilities_rating BETWEEN 1 AND 5),
    location_rating INTEGER CHECK (location_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    
    is_verified BOOLEAN DEFAULT false, -- Based on actual booking
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(field_id, user_id, booking_id)
);

-- Review helpful votes
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES field_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- =============================================
-- WALLET AND PAYMENTS
-- =============================================

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'booking_payment', 'wallet_charge', 'refund', 'transfer_in', 'transfer_out', 
        'penalty', 'bonus', 'cashback', 'commission'
    )),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    description TEXT NOT NULL,
    category VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- References
    related_booking_id UUID REFERENCES bookings(id),
    related_field_id UUID REFERENCES fields(id),
    related_user_id UUID REFERENCES user_profiles(id), -- For transfers
    
    -- Payment method info
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    external_transaction_id VARCHAR(200),
    receipt_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOCIAL FEATURES
-- =============================================

-- Friends/connections
CREATE TABLE user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Games/matches (public games that users can join)
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    sport_id UUID REFERENCES sports(id),
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Game timing
    game_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Participants
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 1,
    min_skill_level VARCHAR(20) CHECK (min_skill_level IN ('beginner', 'intermediate', 'advanced')),
    max_skill_level VARCHAR(20) CHECK (max_skill_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Pricing
    price_per_player DECIMAL(8,2) NOT NULL,
    
    -- Game settings
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    allow_late_join BOOLEAN DEFAULT false,
    
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'full', 'active', 'completed', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game participants
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('pending', 'joined', 'declined', 'kicked', 'no_show')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(game_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User-related indexes
CREATE INDEX idx_user_profiles_city ON user_profiles(city_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX idx_user_sports_sport_id ON user_sports(sport_id);

-- Field-related indexes
CREATE INDEX idx_fields_business_id ON fields(business_id);
CREATE INDEX idx_fields_sport_id ON fields(sport_id);
CREATE INDEX idx_fields_city_id ON fields(city_id);
CREATE INDEX idx_fields_is_active ON fields(is_active);
CREATE INDEX idx_fields_coordinates ON fields USING GIST(coordinates);
CREATE INDEX idx_fields_rating ON fields(rating DESC);

-- Booking-related indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_field_id ON bookings(field_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, start_time);

-- Performance indexes for common queries
CREATE INDEX idx_field_pricing_field_id ON field_pricing(field_id);
CREATE INDEX idx_field_operating_hours_field_id ON field_operating_hours(field_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Business profiles policies
CREATE POLICY "Business owners can manage their business" ON business_profiles
    FOR ALL USING (auth.uid() = owner_id);

-- Fields policies
CREATE POLICY "Everyone can view active fields" ON fields
    FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their fields" ON fields
    FOR ALL USING (
        business_id IN (
            SELECT id FROM business_profiles WHERE owner_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Field owners can view bookings for their fields" ON bookings
    FOR SELECT USING (
        field_id IN (
            SELECT f.id FROM fields f
            JOIN business_profiles bp ON f.business_id = bp.id
            WHERE bp.owner_id = auth.uid()
        )
    );

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Everyone can view reviews" ON field_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON field_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
    );

-- Games policies
CREATE POLICY "Everyone can view public games" ON games
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create games" ON games
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update field ratings when reviews are added/updated
CREATE OR REPLACE FUNCTION update_field_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fields SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM field_reviews 
            WHERE field_id = COALESCE(NEW.field_id, OLD.field_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM field_reviews 
            WHERE field_id = COALESCE(NEW.field_id, OLD.field_id)
        )
    WHERE id = COALESCE(NEW.field_id, OLD.field_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply rating update triggers
CREATE TRIGGER update_field_rating_on_review_change 
    AFTER INSERT OR UPDATE OR DELETE ON field_reviews
    FOR EACH ROW EXECUTE FUNCTION update_field_rating();

-- Function to update wallet balance after transactions
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE user_profiles SET 
            wallet_balance = wallet_balance + 
                CASE 
                    WHEN NEW.transaction_type IN ('wallet_charge', 'refund', 'transfer_in', 'bonus', 'cashback') 
                    THEN NEW.amount
                    ELSE -NEW.amount
                END
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply wallet balance update trigger
CREATE TRIGGER update_wallet_balance_on_transaction
    AFTER UPDATE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert basic sports
INSERT INTO sports (name, icon_name, display_order) VALUES
    ('כדורגל', '⚽', 1),
    ('כדורסל', '🏀', 2),
    ('טניס', '🎾', 3),
    ('פדל', '🏓', 4),
    ('כדורעף', '🏐', 5),
    ('שחייה', '🏊‍♂️', 6),
    ('רב תכליתי', '🏟️', 7);

-- Insert major Israeli cities
INSERT INTO cities (name, region) VALUES
    ('תל אביב', 'מרכז'),
    ('רמת גן', 'מרכז'),
    ('הרצליה', 'מרכז'),
    ('רעננה', 'שרון'),
    ('נתניה', 'חוف השרון'),
    ('ירושלים', 'יהודה'),
    ('חיפה', 'חיפה'),
    ('באר שבע', 'דרום'),
    ('אשדוד', 'דרום'),
    ('פתח תקווה', 'מרכז');

-- Insert common amenities
INSERT INTO amenities (name, category, display_order) VALUES
    ('חניה', 'facilities', 1),
    ('מלתחות', 'facilities', 2),
    ('מקלחות', 'facilities', 3),
    ('תאורה', 'facilities', 4),
    ('מזגן', 'facilities', 5),
    ('קפיטריה', 'services', 6),
    ('WiFi', 'services', 7),
    ('חדר עזרה ראשונה', 'services', 8),
    ('השכרת ציוד', 'services', 9),
    ('מאמן', 'services', 10);