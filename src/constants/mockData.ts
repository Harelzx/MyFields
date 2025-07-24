import { User, Field, Booking, Friend, WalletTransaction, Sport, Game } from '@types/types';

// ===== Mock User =====
export const MOCK_USER: User = {
  id: 'user_1',
  fullName: 'דניאל כהן',
  firstName: 'דניאל',
  lastName: 'כהן',
  email: 'demo@myfields.com',
  phoneNumber: '050-1234567',
  phone: '0501234567',
  userType: 'player',
  profileImageUrl: undefined,
  walletBalance: 280,
  isVerified: true,
  createdAt: '2024-01-15T10:00:00Z',
  onboardingCompleted: true,
  preferredSports: ['כדורגל', 'כדורסל', 'טניס']
};

// ===== Mock Sports =====
export const MOCK_SPORTS: Sport[] = [
  { id: 'sport_1', name: 'כדורגל', iconName: '⚽', isActive: true },
  { id: 'sport_2', name: 'כדורסל', iconName: '🏀', isActive: true },
  { id: 'sport_3', name: 'טניס', iconName: '🎾', isActive: true },
  { id: 'sport_4', name: 'פדל', iconName: '🏓', isActive: true },
  { id: 'sport_5', name: 'כדורעף', iconName: '🏐', isActive: true },
];

// ===== Mock Fields =====
export const MOCK_FIELDS: Field[] = [
  {
    id: 'field_1',
    name: 'מגרש כדורגל הרצליה',
    description: 'מגרש כדורגל מקצועי עם דשא סינטטי איכותי ותאורה מלאה',
    sportType: 'כדורגל',
    city: 'הרצליה',
    address: 'רחוב ההסתדרות 45, הרצליה',
    coordinates: { latitude: 32.1624, longitude: 34.8443 },
    pricePerHour: 120,
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    additionalImages: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400'
    ],
    businessOwnerId: 'business_1',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזנון'],
    rating: 4.7,
    reviewCount: 89,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '22:00' }, // Sunday
      '1': { start: '08:00', end: '22:00' }, // Monday
      '2': { start: '08:00', end: '22:00' }, // Tuesday
      '3': { start: '08:00', end: '22:00' }, // Wednesday
      '4': { start: '08:00', end: '22:00' }, // Thursday
      '5': { start: '08:00', end: '23:00' }, // Friday
      '6': { start: '08:00', end: '23:00' }, // Saturday
    }
  },
  {
    id: 'field_2',
    name: 'מגרש טניס רעננה',
    description: 'מגרש טניס מקורה עם רצפת הארד קורט איכותית',
    sportType: 'טניס',
    city: 'רעננה',
    address: 'רחוב אחוזה 12, רעננה',
    coordinates: { latitude: 32.1847, longitude: 34.8708 },
    pricePerHour: 80,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    additionalImages: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ],
    businessOwnerId: 'business_2',
    amenities: ['חניה', 'מלתחות', 'השכרת ציוד'],
    rating: 4.3,
    reviewCount: 34,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '21:00' },
      '1': { start: '07:00', end: '21:00' },
      '2': { start: '07:00', end: '21:00' },
      '3': { start: '07:00', end: '21:00' },
      '4': { start: '07:00', end: '21:00' },
      '5': { start: '07:00', end: '22:00' },
      '6': { start: '08:00', end: '22:00' },
    }
  },
  {
    id: 'field_3',
    name: 'מגרש כדורסל תל אביב',
    description: 'מגרש כדורסל עירוני מקורה עם פרקט איכותי',
    sportType: 'כדורסל',
    city: 'תל אביב',
    address: 'רחוב יהודה הלוי 23, תל אביב',
    coordinates: { latitude: 32.0668, longitude: 34.7647 },
    pricePerHour: 100,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    additionalImages: [],
    businessOwnerId: 'business_1',
    amenities: ['חניה', 'מלתחות', 'מקלחות'],
    rating: 4.5,
    reviewCount: 67,
    isActive: true,
    availableHours: {
      '0': { start: '09:00', end: '21:00' },
      '1': { start: '09:00', end: '21:00' },
      '2': { start: '09:00', end: '21:00' },
      '3': { start: '09:00', end: '21:00' },
      '4': { start: '09:00', end: '21:00' },
      '5': { start: '09:00', end: '22:00' },
      '6': { start: '09:00', end: '22:00' },
    }
  },
  {
    id: 'field_4',
    name: 'מתחם פדל קיסריה',
    description: 'מתחם פדל מקורה עם 4 מגרשים ברמה גבוהה',
    sportType: 'פדל',
    city: 'קיסריה',
    address: 'שדרות רוטשילד 8, קיסריה',
    coordinates: { latitude: 32.5042, longitude: 34.8965 },
    pricePerHour: 150,
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    additionalImages: [],
    businessOwnerId: 'business_3',
    amenities: ['חניה', 'מלתחות', 'השכרת ציוד', 'מאמן'],
    rating: 4.9,
    reviewCount: 156,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '22:00' },
      '1': { start: '08:00', end: '22:00' },
      '2': { start: '08:00', end: '22:00' },
      '3': { start: '08:00', end: '22:00' },
      '4': { start: '08:00', end: '22:00' },
      '5': { start: '08:00', end: '23:00' },
      '6': { start: '08:00', end: '23:00' },
    }
  }
];

// ===== Mock Bookings =====
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    userId: 'user_1',
    fieldId: 'field_1',
    fieldName: 'מגרש כדורגל הרצליה',
    fieldImageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    date: '2024-01-20',
    startTime: '20:00',
    endTime: '21:00',
    duration: 1,
    totalPrice: 120,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2024-01-18T14:30:00Z',
    friends: ['friend_1', 'friend_2']
  },
  {
    id: 'booking_2',
    userId: 'user_1',
    fieldId: 'field_2',
    fieldName: 'מגרש טניס רעננה',
    fieldImageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    date: '2024-01-22',
    startTime: '18:00',
    endTime: '19:30',
    duration: 1.5,
    totalPrice: 120,
    status: 'active',
    paymentStatus: 'paid',
    createdAt: '2024-01-19T09:15:00Z'
  },
  {
    id: 'booking_3',
    userId: 'user_1',
    fieldId: 'field_3',
    fieldName: 'מגרש כדורסל תל אביב',
    fieldImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    date: '2024-01-15',
    startTime: '19:00',
    endTime: '20:00',
    duration: 1,
    totalPrice: 100,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2024-01-13T16:45:00Z'
  }
];

// ===== Mock Friends =====
export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend_1',
    fullName: 'יוסי לוי',
    profileImageUrl: undefined,
    phoneNumber: '050-2345678',
    favoriteSpots: ['כדורגל', 'כדורסל'],
    isOnline: true
  },
  {
    id: 'friend_2',
    fullName: 'מיכל אברהם',
    profileImageUrl: undefined,
    phoneNumber: '050-3456789',
    favoriteSpots: ['טניס', 'פדל'],
    isOnline: false,
    lastActive: '2024-01-19T15:30:00Z'
  },
  {
    id: 'friend_3',
    fullName: 'רועי דוד',
    profileImageUrl: undefined,
    phoneNumber: '050-4567890',
    favoriteSpots: ['כדורגל'],
    isOnline: true
  }
];

// ===== Mock Wallet Transactions =====
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'trans_1',
    userId: 'user_1',
    type: 'debit',
    amount: 120,
    description: 'תשלום עבור מגרש כדורגל הרצליה',
    relatedBookingId: 'booking_1',
    createdAt: '2024-01-18T16:35:00Z'
  },
  {
    id: 'trans_2',
    userId: 'user_1',
    type: 'credit',
    amount: 200,
    description: 'הוספת כסף לארנק',
    createdAt: '2024-01-17T12:20:00Z'
  },
  {
    id: 'trans_3',
    userId: 'user_1',
    type: 'debit',
    amount: 120,
    description: 'תשלום עבור מגרש טניס רעננה',
    relatedBookingId: 'booking_2',
    createdAt: '2024-01-19T11:20:00Z'
  },
  {
    id: 'trans_4',
    userId: 'user_1',
    type: 'credit',
    amount: 50,
    description: 'זיכוי הפנייה - חבר חדש',
    createdAt: '2024-01-16T14:15:00Z'
  },
  {
    id: 'trans_5',
    userId: 'user_1',
    type: 'credit',
    amount: 30,
    description: 'מבצע השבת כסף - הזמנה ראשונה',
    createdAt: '2024-01-15T09:45:00Z'
  }
];

// ===== Mock Games =====
export const MOCK_GAMES: Game[] = [
  {
    id: 'game_1',
    title: 'משחק כדורגל ערב',
    sport: 'כדורגל',
    fieldId: 'field_1',
    fieldName: 'מגרש כדורגל הרצליה',
    fieldImageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    organizerId: 'user_2',
    organizerName: 'אלון גרין',
    date: '2024-01-25',
    time: '20:00',
    duration: 2,
    maxPlayers: 10,
    currentPlayers: 7,
    pricePerPlayer: 25,
    description: 'משחק כדורגל חברי ברמה בינונית. מתאים לכל הגילאים!',
    skill_level: 'intermediate',
    status: 'open',
    createdAt: '2024-01-20T10:30:00Z',
    participants: ['user_2', 'user_3', 'user_4', 'user_5', 'user_6', 'user_7', 'user_8']
  },
  {
    id: 'game_2',
    title: 'טניס זוגות',
    sport: 'טניס',
    fieldId: 'field_2',
    fieldName: 'מגרש טניס רעננה',
    fieldImageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    organizerId: 'user_3',
    organizerName: 'שרה כהן',
    date: '2024-01-24',
    time: '18:30',
    duration: 1.5,
    maxPlayers: 4,
    currentPlayers: 3,
    pricePerPlayer: 30,
    description: 'זוגות טניס ברמה טובה, מחפשים רביעי',
    skill_level: 'advanced',
    status: 'open',
    createdAt: '2024-01-21T14:15:00Z',
    participants: ['user_3', 'user_9', 'user_10']
  },
  {
    id: 'game_3',
    title: 'כדורסל 3x3',
    sport: 'כדורסל',
    fieldId: 'field_3',
    fieldName: 'מגרש כדורסל תל אביב',
    organizerId: 'user_4',
    organizerName: 'דני לוי',
    date: '2024-01-26',
    time: '19:00',
    duration: 1,
    maxPlayers: 6,
    currentPlayers: 4,
    pricePerPlayer: 20,
    description: 'משחק כדורסל מהיר וכיפי, מתאימים לכל הרמות',
    skill_level: 'any',
    status: 'open',
    createdAt: '2024-01-22T09:45:00Z',
    participants: ['user_4', 'user_11', 'user_12', 'user_13']
  },
  {
    id: 'game_4',
    title: 'פדל למתחילים',
    sport: 'פדל',
    fieldId: 'field_4',
    fieldName: 'מתחם פדל קיסריה',
    organizerId: 'user_5',
    organizerName: 'רוני אברהם',
    date: '2024-01-27',
    time: '16:00',
    duration: 1,
    maxPlayers: 4,
    currentPlayers: 2,
    pricePerPlayer: 40,
    description: 'משחק פדל למתחילים עם הדרכה בסיסית',
    skill_level: 'beginner',
    status: 'open',
    createdAt: '2024-01-23T11:20:00Z',
    participants: ['user_5', 'user_14']
  },
  {
    id: 'game_5',
    title: 'כדורגל שישיות',
    sport: 'כדורגל',
    fieldId: 'field_1',
    fieldName: 'מגרש כדורגל הרצליה',
    fieldImageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    organizerId: 'user_6',
    organizerName: 'מיכאל דוד',
    date: '2024-01-28',
    time: '21:00',
    duration: 1.5,
    maxPlayers: 12,
    currentPlayers: 10,
    pricePerPlayer: 15,
    description: 'משחק כדורגל שישיות בערב, אווירה נהדרת מובטחת!',
    skill_level: 'intermediate',
    status: 'open',
    createdAt: '2024-01-24T16:00:00Z',
    participants: ['user_6', 'user_15', 'user_16', 'user_17', 'user_18', 'user_19', 'user_20', 'user_21', 'user_22', 'user_23']
  }
];

// ===== Mock Cities =====
export const MOCK_CITIES = [
  'תל אביב',
  'הרצליה',
  'רעננה',
  'כפר סבא',
  'ראשון לציון',
  'רחובות',
  'פתח תקווה',
  'גבעתיים',
  'קיסריה',
  'נתניה'
];