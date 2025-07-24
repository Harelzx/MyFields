# MyFields App Implementation Plan

## Overview
This plan details the step-by-step process to build MyFields app with the exact UI/UX from MyFieldsApp using React Native CLI and Supabase.

## Phase 1: Initialize React Native CLI Project (Day 1)

### Step 1.1: Create New Project
```bash
# Create new React Native project with TypeScript
npx react-native@latest init MyFields --template react-native-template-typescript

# Navigate to project
cd MyFields
```

### Step 1.2: iOS Setup
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Test iOS build
npx react-native run-ios
```

### Step 1.3: Android Setup
```bash
# Test Android build
npx react-native run-android
```

### Step 1.4: Project Structure Setup
```bash
# Create folder structure
mkdir -p app/{auth,user,business,booking,wallet,friends}
mkdir -p components/{common,layout,navigation}
mkdir -p entities
mkdir -p services
mkdir -p store
mkdir -p hooks
mkdir -p constants
mkdir -p i18n
mkdir -p assets/{images,fonts}
mkdir -p utils
```

## Phase 2: Core Dependencies Installation (Day 1-2)

### Step 2.1: Navigation
```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler

# iOS setup
cd ios && pod install && cd ..
```

### Step 2.2: UI Framework (Gluestack)
```bash
npm install @gluestack-ui/themed @gluestack-ui/config
npm install react-native-svg
npm install react-native-linear-gradient
```

### Step 2.3: State Management & Data Fetching
```bash
npm install zustand
npm install @tanstack/react-query
```

### Step 2.4: Animations & Utilities
```bash
npm install react-native-reanimated
npm install react-native-haptic-feedback
npm install lucide-react-native
npm install date-fns
```

### Step 2.5: Hebrew RTL Support
```bash
# No i18n needed - Hebrew only app!
# Just ensure RTL support is properly configured
```

## Phase 3: Supabase Setup (Day 2)

### Step 3.1: Install Supabase
```bash
npm install @supabase/supabase-js
npm install react-native-url-polyfill
npm install @react-native-async-storage/async-storage
npm install react-native-keychain  # For secure token storage
```

### Step 3.2: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Get API keys (anon key and service role key)

### Step 3.3: Database Schema
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('player', 'business')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  phone TEXT,
  preferred_sports TEXT[],
  location TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sport fields table
CREATE TABLE public.sport_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  images TEXT[],
  amenities TEXT[],
  availability_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  field_id UUID REFERENCES public.sport_fields(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  invited_friends UUID[],
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friendships table
CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.users(id),
  addressee_id UUID REFERENCES public.users(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Business requests table
CREATE TABLE public.business_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  sports_offered TEXT[],
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for users table)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

### Step 3.4: Initialize Supabase Client
```typescript
// services/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Phase 4: Export UI Components (Day 3-4)

### Step 4.1: Copy Theme System
```bash
# Copy theme files from MyFieldsApp
cp MyFieldsApp/constants/theme.ts MyFields/constants/
cp MyFieldsApp/constants/mockData.ts MyFields/constants/
cp -r MyFieldsApp/utils/* MyFields/utils/
```

### Step 4.2: Copy Base Components
```bash
# Copy common components
cp -r MyFieldsApp/components/common/* MyFields/components/common/
cp -r MyFieldsApp/components/layout/* MyFields/components/layout/
cp -r MyFieldsApp/components/navigation/* MyFields/components/navigation/

# Copy specialized components
cp MyFieldsApp/components/HapticTab.tsx MyFields/components/
cp MyFieldsApp/components/HelloWave.tsx MyFields/components/
cp MyFieldsApp/components/Collapsible.tsx MyFields/components/
cp MyFieldsApp/components/ThemedText.tsx MyFields/components/
cp MyFieldsApp/components/RTLText.tsx MyFields/components/
```

### Step 4.3: Update Import Paths
```typescript
// Update all import paths from @/ to relative paths
// Example: @/components/common/WoltButton -> ../components/common/WoltButton
```

### Step 4.4: Configure TypeScript Paths
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./components/*"],
      "@constants/*": ["./constants/*"],
      "@utils/*": ["./utils/*"],
      "@services/*": ["./services/*"],
      "@hooks/*": ["./hooks/*"],
      "@store/*": ["./store/*"]
    }
  }
}
```

## Phase 5: Navigation Implementation (Day 4-5)

### Step 5.1: Root Navigator Setup
```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import screens
import WelcomeScreen from './app/auth/WelcomeScreen';
import OnboardingScreen from './app/auth/OnboardingScreen';
import MainTabs from './navigation/MainTabs';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
```

### Step 5.2: Tab Navigator Setup
```typescript
// navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabNavigator } from '../components/navigation/CustomTabNavigator';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabNavigator {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={UserHomeScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
    </Tab.Navigator>
  );
}
```

## Phase 6: Hebrew-Only & RTL Setup (Day 5)

### Step 6.1: RTL Configuration (No i18n needed!)
```typescript
// utils/bootstrap.ts
import { I18nManager } from 'react-native';

export const initializeRTL = () => {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
};

// Call in App.tsx
import { initializeRTL } from './utils/bootstrap';
initializeRTL();
```

### Step 6.2: Hebrew Text Constants
```typescript
// constants/hebrewTexts.ts
export const texts = {
  // Welcome Screen
  welcome: {
    title: 'ברוכים הבאים ל-MyFields',
    subtitle: 'הזמינו מגרשי ספורט בקלות',
    loginButton: 'התחברות',
    businessButton: 'לבעלי עסקים'
  },
  
  // Navigation
  tabs: {
    home: 'בית',
    bookings: 'ההזמנות שלי',
    friends: 'חברים',
    wallet: 'ארנק'
  },
  
  // Home Screen
  home: {
    greeting: 'שלום',
    bookField: 'הזמן מגרש',
    myBookings: 'ההזמנות שלי',
    friends: 'חברים',
    wallet: 'ארנק',
    recentBookings: 'הזמנות אחרונות',
    upcomingTournaments: 'טורנירים קרובים'
  },
  
  // Booking
  booking: {
    selectDate: 'בחר תאריך',
    selectTime: 'בחר שעה',
    inviteFriends: 'הזמן חברים',
    payment: 'תשלום',
    confirmBooking: 'אשר הזמנה',
    cancelBooking: 'בטל הזמנה'
  },
  
  // Common
  common: {
    save: 'שמור',
    cancel: 'ביטול',
    confirm: 'אישור',
    search: 'חיפוש',
    filter: 'סינון',
    sort: 'מיון',
    loading: 'טוען...',
    error: 'שגיאה',
    retry: 'נסה שוב',
    success: 'הצלחה!'
  }
};
```

### Step 6.3: RTL Text Component
```typescript
// components/RTLText.tsx
import React from 'react';
import { Text, TextProps, I18nManager } from 'react-native';

export const RTLText: React.FC<TextProps> = ({ style, ...props }) => {
  return (
    <Text
      {...props}
      style={[
        { writingDirection: 'rtl', textAlign: 'right' },
        style
      ]}
    />
  );
};
```

## Phase 7: Core Features Implementation (Day 6-8)

### Step 7.1: Authentication Flow
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
```

### Step 7.2: Booking System
```typescript
// hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export const useBookings = (userId: string) => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, field:sport_fields(*)')
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (booking: NewBooking) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};
```

## Phase 8: Payment Integration (Day 9-10)

### Step 8.1: Stripe Setup
```bash
npm install @stripe/stripe-react-native
```

### Step 8.2: Apple Pay Configuration
```typescript
// iOS: Add to Info.plist
// <key>NSApplePayMerchantID</key>
// <string>merchant.com.myfields</string>
```

### Step 8.3: Payment Hook
```typescript
// hooks/usePayment.ts
import { useStripe } from '@stripe/stripe-react-native';

export const usePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const processPayment = async (amount: number, bookingId: string) => {
    // 1. Create payment intent on backend
    // 2. Initialize payment sheet
    // 3. Present payment sheet
    // 4. Update booking status
  };

  return { processPayment };
};
```

## Phase 9: Testing & Optimization (Day 11-12)

### Step 9.1: Component Testing
```bash
npm install --save-dev @testing-library/react-native jest
npm install --save-dev @types/jest
```

### Step 9.2: Performance Optimization
- Implement React.memo for heavy components
- Add proper list optimizations
- Implement image caching
- Add proper error boundaries

### Step 9.3: Build & Deploy
```bash
# iOS
cd ios && pod install
npx react-native run-ios --configuration Release

# Android
cd android && ./gradlew assembleRelease
```

## Key Deliverables by Phase

### Week 1 Deliverables:
- ✅ Initialized React Native CLI project
- ✅ All UI components from MyFieldsApp exported
- ✅ Navigation structure implemented
- ✅ Hebrew-only RTL support configured (no i18n needed)
- ✅ Supabase backend connected

### Week 2 Deliverables:
- ✅ User authentication flow
- ✅ Booking system functional
- ✅ Wallet system implemented
- ✅ Payment integration complete
- ✅ App tested and optimized

## Success Metrics
- UI matches MyFieldsApp exactly
- RTL works properly in Hebrew
- All core features functional
- Performance meets standards (<3s load time)
- Zero critical bugs in production

## Next Steps
1. Start with Phase 1 immediately
2. Daily progress updates
3. Testing at each phase completion
4. User feedback integration