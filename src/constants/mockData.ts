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
  { id: 'sport_6', name: 'שחייה', iconName: '🏊‍♂️', isActive: true },
  { id: 'sport_7', name: 'רב תכליתי', iconName: '🏟️', isActive: true }
];

// ===== Mock Fields =====
export const MOCK_FIELDS: Field[] = [
  {
    id: 'field_1',
    name: 'אצטדיון כדורגל פרימיום',
    description: 'אצטדיון כדורגל מקצועי עם דשא סינטטי איכותי מהדור החדש, תאורת LED מלאה, יציעים מקוריים ל-500 צופים. המתקן כולל מערכת השקיה אוטומטית ומסכי תוצאות דיגיטליים.',
    sportType: 'כדורגל',
    city: 'הרצליה',
    address: 'רחוב ההסתדרות 45, הרצליה',
    coordinates: { latitude: 32.1624, longitude: 34.8443 },
    pricePerHour: 150,
    peakPricePerHour: 200,
    offPeakPricePerHour: 120,
    capacity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800'
    ],
    businessOwnerId: 'business_1',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזנון', 'שירותים'],
    specialFeatures: ['תאורת לילה מלאה', 'יציעים מקוריים', 'מערכת כריזה', 'מסך תוצאות', 'צילום ווידאו של המשחק'],
    rating: 4.8,
    reviewCount: 234,
    isActive: true,
    availableHours: {
      '0': { start: '06:00', end: '23:00' },
      '1': { start: '06:00', end: '23:00' },
      '2': { start: '06:00', end: '23:00' },
      '3': { start: '06:00', end: '23:00' },
      '4': { start: '06:00', end: '23:00' },
      '5': { start: '06:00', end: '01:00' },
      '6': { start: '07:00', end: '01:00' }
    }
  },
  {
    id: 'field_2',
    name: 'מרכז הטניס פרימיום',
    description: 'מתחם טניס יוקרתי עם 6 מגרשי הארד קורט מקצועיים, 2 מגרשים מקורים עם מיזוג אוויר. המתקן כולל Pro Shop, מסעדה כשרה ואקדמיה למתחילים ומתקדמים.',
    sportType: 'טניס',
    city: 'רעננה',
    address: 'רחוב אחוזה 12, רעננה',
    coordinates: { latitude: 32.1847, longitude: 34.8708 },
    pricePerHour: 90,
    peakPricePerHour: 120,
    offPeakPricePerHour: 70,
    capacity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800'
    ],
    businessOwnerId: 'business_2',
    amenities: ['חניה', 'מלתחות', 'מזנון', 'שירותים'],
    specialFeatures: ['מגרשים מקורים עם מיזוג', 'מצלמות לניתוח משחק', 'מכונת כדורים', 'אזור צפייה ממוזג', 'WiFi מהיר'],
    rating: 4.7,
    reviewCount: 156,
    isActive: true,
    availableHours: {
      '0': { start: '06:00', end: '22:00' },
      '1': { start: '06:00', end: '22:00' },
      '2': { start: '06:00', end: '22:00' },
      '3': { start: '06:00', end: '22:00' },
      '4': { start: '06:00', end: '22:00' },
      '5': { start: '06:00', end: '15:00' },
      '6': { start: '19:00', end: '23:00' }
    }
  },
  {
    id: 'field_3',
    name: 'היכל הכדורסל הלאומי',
    description: 'היכל כדורסל מקצועי עם פרקט NBA סטנדרט, מיזוג אוויר מלא, יציעים ל-1000 צופים. מתאים למשחקי ליגה, אימונים מקצועיים וטורנירים.',
    sportType: 'כדורסל',
    city: 'תל אביב',
    address: 'רחוב יהודה הלוי 23, תל אביב',
    coordinates: { latitude: 32.0668, longitude: 34.7647 },
    pricePerHour: 120,
    peakPricePerHour: 180,
    offPeakPricePerHour: 90,
    capacity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
      'https://images.unsplash.com/photo-1519861155730-0b5fbf0dd889?w=800'
    ],
    businessOwnerId: 'business_1',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזנון', 'שירותים', 'WiFi'],
    specialFeatures: ['פרקט מקצועי NBA', 'מיזוג אוויר מלא', 'תאורת LED', 'מצלמות שידור', 'חדר עיתונאים', 'אזור VIP'],
    rating: 4.9,
    reviewCount: 312,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '23:00' },
      '1': { start: '07:00', end: '23:00' },
      '2': { start: '07:00', end: '23:00' },
      '3': { start: '07:00', end: '23:00' },
      '4': { start: '07:00', end: '23:00' },
      '5': { start: '08:00', end: '15:00' },
      '6': { start: '20:00', end: '23:00' }
    }
  },
  {
    id: 'field_4',
    name: 'מועדון הפדל היוקרתי',
    description: 'מתחם פדל יוקרתי עם 6 מגרשים מקורים וממוזגים, 2 מגרשי פדל חוף עם נוף לים. המועדון כולל אקדמיה מקצועית, חנות ציוד ומסעדת שף.',
    sportType: 'פדל',
    city: 'קיסריה',
    address: 'שדרות רוטשילד 8, קיסריה',
    coordinates: { latitude: 32.5042, longitude: 34.8965 },
    pricePerHour: 160,
    peakPricePerHour: 220,
    offPeakPricePerHour: 130,
    capacity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800'
    ],
    businessOwnerId: 'business_3',
    amenities: ['חניה', 'מלתחות', 'מזנון', 'שירותים'],
    specialFeatures: ['מגרשי חוף עם נוף לים', 'תאורת LED מקצועית', 'מערכת קירור ערפל', 'שירות מגבות', 'אזור VIP עם שירות מלצרים'],
    rating: 4.9,
    reviewCount: 423,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '23:00' },
      '1': { start: '07:00', end: '23:00' },
      '2': { start: '07:00', end: '23:00' },
      '3': { start: '07:00', end: '23:00' },
      '4': { start: '07:00', end: '23:00' },
      '5': { start: '07:00', end: '15:00' },
      '6': { start: '19:00', end: '23:00' }
    }
  }
];

// ===== Additional Mock Fields =====
const ADDITIONAL_FIELDS: Field[] = [
  {
    id: 'field_5',
    name: 'בריכת גורדון',
    description: 'בריכה אולימפית מקורה וממוזגת עם 8 מסלולים, בריכת פעוטות, ואזור ג\'קוזי. מתקן מודרני עם מערכת סינון מתקדמת וצוות מצילים מקצועי.',
    sportType: 'שחייה',
    city: 'תל אביב',
    address: 'רחוב גורדון 14, תל אביב',
    coordinates: { latitude: 32.0819, longitude: 34.7671 },
    pricePerHour: 60,
    imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800',
      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800'
    ],
    businessOwnerId: 'business_4',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזנון', 'שירותים', 'סאונה'],
    rating: 4.6,
    reviewCount: 267,
    isActive: true,
    availableHours: {
      '0': { start: '06:00', end: '22:00' },
      '1': { start: '05:30', end: '22:00' },
      '2': { start: '05:30', end: '22:00' },
      '3': { start: '05:30', end: '22:00' },
      '4': { start: '05:30', end: '22:00' },
      '5': { start: '06:00', end: '15:00' },
      '6': { start: '19:00', end: '22:00' }
    }
  },
  {
    id: 'field_6',
    name: 'מרכז ספורט רב תכליתי',
    description: 'מתחם ספורט ענק הכולל אולם כדורסל/כדורעף, מגרש כדורגל מיני, חדר כושר מאובזר, סטודיו למחול ויוגה. מתאים לאירועי ספורט גדולים.',
    sportType: 'רב תכליתי',
    city: 'ירושלים',
    address: 'רחוב בן צבי 34, ירושלים',
    coordinates: { latitude: 31.7683, longitude: 35.2137 },
    pricePerHour: 200,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800'
    ],
    businessOwnerId: 'business_5',
    amenities: ['חניה רחבה', 'מלתחות גברים/נשים', 'מקלחות', 'קפיטריה כשרה', 'חדר עזרה ראשונה', 'משרד מנהל', 'חדרי ישיבות', 'מערכת כריזה', 'WiFi'],
    rating: 4.7,
    reviewCount: 189,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '23:00' },
      '1': { start: '06:00', end: '23:00' },
      '2': { start: '06:00', end: '23:00' },
      '3': { start: '06:00', end: '23:00' },
      '4': { start: '06:00', end: '23:00' },
      '5': { start: '07:00', end: '15:00' },
      '6': { start: '20:00', end: '23:00' }
    }
  },
  {
    id: 'field_7',
    name: 'מגרשי כדורעף חוף',
    description: 'מתחם כדורעף חוף מקצועי עם 4 מגרשים בחול ים טבעי. ממוקם על קו החוף עם נוף מרהיב לים. כולל תאורה למשחקי לילה ומקלחות חיצוניות.',
    sportType: 'כדורעף',
    city: 'הרצליה',
    address: 'חוף אכדיה, הרצליה',
    coordinates: { latitude: 32.1624, longitude: 34.7964 },
    pricePerHour: 80,
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800',
      'https://images.unsplash.com/photo-1553005746-9245ba190489?w=800',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800'
    ],
    businessOwnerId: 'business_6',
    amenities: ['חניית חוף', 'מקלחות חיצוניות', 'שירותים', 'מתקן שטיפת רגליים', 'שמשיות', 'כיסאות חוף', 'בר חוף'],
    rating: 4.8,
    reviewCount: 342,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '23:00' },
      '1': { start: '07:00', end: '23:00' },
      '2': { start: '07:00', end: '23:00' },
      '3': { start: '07:00', end: '23:00' },
      '4': { start: '07:00', end: '23:00' },
      '5': { start: '06:00', end: '01:00' },
      '6': { start: '06:00', end: '01:00' }
    }
  },
  {
    id: 'field_8',
    name: 'מגרש כדורגל חמישיות',
    description: 'מגרש כדורגל חמישיות מקורה עם דשא סינטטי חדיש. מתאים למשחקים מהירים ואינטנסיביים. ממוקם במרכז העיר עם נגישות מצוינת.',
    sportType: 'כדורגל',
    city: 'חיפה',
    address: 'רחוב הנמל 22, חיפה',
    coordinates: { latitude: 32.8191, longitude: 34.9983 },
    pricePerHour: 100,
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800'
    ],
    businessOwnerId: 'business_7',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזנון', 'כדורים', 'אפודים'],
    rating: 4.5,
    reviewCount: 178,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '23:00' },
      '1': { start: '08:00', end: '23:00' },
      '2': { start: '08:00', end: '23:00' },
      '3': { start: '08:00', end: '23:00' },
      '4': { start: '08:00', end: '23:00' },
      '5': { start: '08:00', end: '15:00' },
      '6': { start: '20:00', end: '23:00' }
    }
  },
  {
    id: 'field_9',
    name: 'מגרשי טניס פארק הירקון',
    description: 'מתחם טניס ציבורי בלב פארק הירקון עם 8 מגרשי טניס חיצוניים. סביבה ירוקה ונעימה, מתאים למשחקים בכל הרמות.',
    sportType: 'טניס',
    city: 'תל אביב',
    address: 'פארק הירקון, תל אביב',
    coordinates: { latitude: 32.0924, longitude: 34.7747 },
    pricePerHour: 70,
    imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=800',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800'
    ],
    businessOwnerId: 'business_8',
    amenities: ['חניה חינם', 'שירותים', 'מתקני שתייה', 'ספסלים', 'תאורה'],
    rating: 4.2,
    reviewCount: 245,
    isActive: true,
    availableHours: {
      '0': { start: '06:00', end: '22:00' },
      '1': { start: '06:00', end: '22:00' },
      '2': { start: '06:00', end: '22:00' },
      '3': { start: '06:00', end: '22:00' },
      '4': { start: '06:00', end: '22:00' },
      '5': { start: '06:00', end: '15:00' },
      '6': { start: '08:00', end: '22:00' }
    }
  },
  {
    id: 'field_10',
    name: 'אולם כדורסל מודרני',
    description: 'אולם כדורסל חדיש עם פרקט מקצועי, מתאים למשחקי ליגה ואימונים. כולל מערכת סטטיסטיקה דיגיטלית ולוח תוצאות מתקדם.',
    sportType: 'כדורסל',
    city: 'נס ציונה',
    address: 'רחוב הבנים 45, נס ציונה',
    coordinates: { latitude: 31.9305, longitude: 34.7948 },
    pricePerHour: 110,
    imageUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800',
      'https://images.unsplash.com/photo-1577416237456-62bc836e21f8?w=800'
    ],
    businessOwnerId: 'business_9',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מזגן', 'קפיטריה', 'חדר מאמן'],
    rating: 4.6,
    reviewCount: 134,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '22:00' },
      '1': { start: '07:00', end: '22:00' },
      '2': { start: '07:00', end: '22:00' },
      '3': { start: '07:00', end: '22:00' },
      '4': { start: '07:00', end: '22:00' },
      '5': { start: '08:00', end: '15:00' },
      '6': { start: '20:00', end: '22:00' }
    }
  },
  {
    id: 'field_11',
    name: 'מגרש כדורגל מלא',
    description: 'מגרש כדורגל מלא עם דשא טבעי מטופח. מתאים למשחקי ליגה וטורנירים גדולים. כולל יציעים ל-2000 צופים ומערכות מקצועיות.',
    sportType: 'כדורגל',
    city: 'באר שבע',
    address: 'רחוב השלום 67, באר שבע',
    coordinates: { latitude: 31.2530, longitude: 34.7915 },
    pricePerHour: 250,
    imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800'
    ],
    businessOwnerId: 'business_10',
    amenities: ['חניה ענקית', 'מלתחות קבוצתיות', 'מקלחות', 'חדר שופטים', 'חדר רפואה', 'קיוסק', 'VIP'],
    rating: 4.7,
    reviewCount: 298,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '22:00' },
      '1': { start: '07:00', end: '22:00' },
      '2': { start: '07:00', end: '22:00' },
      '3': { start: '07:00', end: '22:00' },
      '4': { start: '07:00', end: '22:00' },
      '5': { start: '07:00', end: '15:00' },
      '6': { start: '19:00', end: '22:00' }
    }
  },
  {
    id: 'field_12',
    name: 'מתחם פדל מודרני',
    description: 'מועדון פדל חדש ומודרני עם 3 מגרשים מקוריים. אווירה משפחתית וחברותית, מתאים לכל הרמות מתחילים עד מקצועניים.',
    sportType: 'פדל',
    city: 'מודיעין',
    address: 'רחוב עמק החולה 12, מודיעין',
    coordinates: { latitude: 31.8928, longitude: 35.0102 },
    pricePerHour: 140,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1611251126118-b1d4a99c5e70?w=800',
      'https://images.unsplash.com/photo-1599586120429-48e3e6a25c04?w=800'
    ],
    businessOwnerId: 'business_11',
    amenities: ['חניה חינם', 'מלתחות', 'מקלחות', 'Pro Shop', 'בית קפה', 'השכרת ציוד', 'מאמנים'],
    rating: 4.8,
    reviewCount: 167,
    isActive: true,
    availableHours: {
      '0': { start: '07:00', end: '23:00' },
      '1': { start: '06:00', end: '23:00' },
      '2': { start: '06:00', end: '23:00' },
      '3': { start: '06:00', end: '23:00' },
      '4': { start: '06:00', end: '23:00' },
      '5': { start: '07:00', end: '15:00' },
      '6': { start: '20:00', end: '23:00' }
    }
  },
  {
    id: 'field_13',
    name: 'בריכת השחייה העירונית',
    description: 'מתחם בריכות מודרני הכולל בריכה אולימפית, בריכת ילדים ובריכת שכשוך. מים מחוממים בחורף ואזורי צל בקיץ.',
    sportType: 'שחייה',
    city: 'אשדוד',
    address: 'רחוב הגבורה 23, אשדוד',
    coordinates: { latitude: 31.8044, longitude: 34.6553 },
    pricePerHour: 50,
    imageUrl: 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1621888050493-a2aebfa324f3?w=800',
      'https://images.unsplash.com/photo-1594658582751-d10a711b7725?w=800'
    ],
    businessOwnerId: 'business_12',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'מציל', 'קפיטריה', 'אזורי צל', 'כיסאות נוח'],
    rating: 4.4,
    reviewCount: 287,
    isActive: true,
    availableHours: {
      '0': { start: '06:00', end: '20:00' },
      '1': { start: '05:30', end: '20:00' },
      '2': { start: '05:30', end: '20:00' },
      '3': { start: '05:30', end: '20:00' },
      '4': { start: '05:30', end: '20:00' },
      '5': { start: '06:00', end: '15:00' },
      '6': { start: '19:00', end: '20:00' }
    }
  },
  {
    id: 'field_14',
    name: 'מגרש כדורעף מקורה',
    description: 'אולם כדורעף מקצועי עם רצפת PVC ספורט. מתאים לאימונים ומשחקי ליגה. גובה תקרה 12 מטר ותאורה מצוינת.',
    sportType: 'כדורעף',
    city: 'רמת גן',
    address: 'רחוב ביאליק 89, רמת גן',
    coordinates: { latitude: 32.0868, longitude: 34.8034 },
    pricePerHour: 90,
    imageUrl: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1629909390838-9e1562129f9f?w=800',
      'https://images.unsplash.com/photo-1616702010570-b67d7d7aff09?w=800'
    ],
    businessOwnerId: 'business_13',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'ציוד אימון', 'מיזוג', 'שופט'],
    rating: 4.6,
    reviewCount: 145,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '22:00' },
      '1': { start: '07:00', end: '22:00' },
      '2': { start: '07:00', end: '22:00' },
      '3': { start: '07:00', end: '22:00' },
      '4': { start: '07:00', end: '22:00' },
      '5': { start: '08:00', end: '15:00' },
      '6': { start: '20:00', end: '22:00' }
    }
  },
  {
    id: 'field_15',
    name: 'מגרש כדורגל דשא מלאכותי',
    description: 'מגרש כדורגל 7 על 7 עם דשא מלאכותי מהדור החדש. מערכת ניקוז מעולה ותאורת LED חסכונית. מיקום מרכזי ונוח.',
    sportType: 'כדורגל',
    city: 'נתניה',
    address: 'רחוב הרצל 34, נתניה',
    coordinates: { latitude: 32.3328, longitude: 34.8554 },
    pricePerHour: 130,
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    additionalImages: [
      'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
    ],
    businessOwnerId: 'business_14',
    amenities: ['חניה', 'מלתחות', 'מקלחות', 'כדורים', 'אפודים', 'מזנון', 'WiFi'],
    rating: 4.5,
    reviewCount: 223,
    isActive: true,
    availableHours: {
      '0': { start: '08:00', end: '23:00' },
      '1': { start: '08:00', end: '23:00' },
      '2': { start: '08:00', end: '23:00' },
      '3': { start: '08:00', end: '23:00' },
      '4': { start: '08:00', end: '23:00' },
      '5': { start: '08:00', end: '15:00' },
      '6': { start: '20:00', end: '23:00' }
    }
  }
];

// Merge original and additional fields
MOCK_FIELDS.push(...ADDITIONAL_FIELDS);

// ===== Venue Packages =====
export const VENUE_PACKAGES = [
  {
    id: 'package_1',
    fieldId: 'field_1',
    type: 'hourly',
    name: 'שעה בודדת',
    price: 150,
    duration: 1,
    description: 'השכרה לשעה אחת בלבד'
  },
  {
    id: 'package_2',
    fieldId: 'field_1',
    type: 'half_day',
    name: 'חצי יום (4 שעות)',
    price: 500,
    duration: 4,
    description: 'חצי יום אימונים או טורניר קטן',
    discount: '17%'
  },
  {
    id: 'package_3',
    fieldId: 'field_1',
    type: 'full_day',
    name: 'יום שלם (8 שעות)',
    price: 900,
    duration: 8,
    description: 'שימוש בלעדי ליום שלם כולל ציוד',
    discount: '25%'
  },
  {
    id: 'package_4',
    fieldId: 'field_2',
    type: 'hourly',
    name: 'שעה בודדת',
    price: 90,
    duration: 1,
    description: 'השכרה לשעה אחת בלבד'
  },
  {
    id: 'package_5',
    fieldId: 'field_2',
    type: 'coaching',
    name: 'שיעור עם מאמן',
    price: 200,
    duration: 1,
    description: 'שיעור פרטי עם מאמן מקצועי כולל כדורים'
  }
];

// ===== Venue Reviews =====
export const VENUE_REVIEWS = [
  {
    id: 'review_1',
    fieldId: 'field_1',
    userId: 'user_1',
    userName: 'דניאל כהן',
    rating: 5,
    comment: 'אצטדיון מדהים! הדשא מעולה והמתקנים ברמה גבוהה. האווירה במשחקי הלילה פשוט מושלמת.',
    date: '2024-01-20',
    helpful: 15
  },
  {
    id: 'review_2',
    fieldId: 'field_1',
    userId: 'user_2',
    userName: 'מיכל ברק',
    rating: 4,
    comment: 'מקום נהדר למשחקים. החניה קצת רחוקה אבל בסך הכל חוויה מעולה.',
    date: '2024-01-18',
    helpful: 8
  },
  {
    id: 'review_3',
    fieldId: 'field_2',
    userId: 'user_3',
    userName: 'אבי לוי',
    rating: 5,
    comment: 'מגרשי הטניס הטובים ביותר באזור! המאמנים מקצועיים והשירות ברמה גבוהה.',
    date: '2024-01-15',
    helpful: 12
  },
  {
    id: 'review_4',
    fieldId: 'field_3',
    userId: 'user_4',
    userName: 'שרה גולד',
    rating: 5,
    comment: 'היכל כדורסל מדהים עם פרקט מושלם. המיזוג עובד מצוין גם בקיץ החם.',
    date: '2024-01-14',
    helpful: 9
  },
  {
    id: 'review_5',
    fieldId: 'field_4',
    userId: 'user_5',
    userName: 'רון דוד',
    rating: 5,
    comment: 'מועדון הפדל הטוב ביותר! אווירה יוקרתית ושירות ברמה עולמית.',
    date: '2024-01-12',
    helpful: 18
  }
];

// ===== Popular Times =====
export const POPULAR_TIMES = [
  {
    id: 'times_1',
    fieldId: 'field_1',
    busyHours: {
      '0': [18, 19, 20, 21], // Sunday
      '1': [17, 18, 19, 20], // Monday
      '2': [17, 18, 19, 20], // Tuesday
      '3': [17, 18, 19, 20], // Wednesday
      '4': [17, 18, 19, 20], // Thursday
      '5': [9, 10, 11, 12], // Friday
      '6': [20, 21, 22] // Saturday
    },
    peakHours: [19, 20, 21]
  },
  {
    id: 'times_2',
    fieldId: 'field_2',
    busyHours: {
      '0': [8, 9, 17, 18, 19],
      '1': [7, 8, 17, 18, 19],
      '2': [7, 8, 17, 18, 19],
      '3': [7, 8, 17, 18, 19],
      '4': [7, 8, 17, 18, 19],
      '5': [8, 9, 10, 11],
      '6': [19, 20, 21]
    },
    peakHours: [8, 18, 19]
  },
  {
    id: 'times_3',
    fieldId: 'field_5',
    busyHours: {
      '0': [6, 7, 8, 12, 13, 19, 20],
      '1': [6, 7, 8, 12, 13, 18, 19, 20],
      '2': [6, 7, 8, 12, 13, 18, 19, 20],
      '3': [6, 7, 8, 12, 13, 18, 19, 20],
      '4': [6, 7, 8, 12, 13, 18, 19, 20],
      '5': [7, 8, 9, 10, 11, 12, 13],
      '6': [19, 20, 21]
    },
    peakHours: [7, 8, 19, 20]
  }
];

// ===== Mock Bookings =====
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    userId: 'user_1',
    fieldId: 'field_1',
    fieldName: 'אצטדיון כדורגל פרימיום',
    fieldImageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    date: '2024-01-28',
    startTime: '20:00',
    endTime: '22:00',
    duration: 2,
    totalPrice: 400,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'group',
    participants: 16,
    specialNotes: 'כולל ציוד מקצועי ושופט',
    createdAt: '2024-01-25T14:30:00Z',
    friends: ['friend_1', 'friend_2', 'friend_3']
  },
  {
    id: 'booking_2',
    userId: 'user_1',
    fieldId: 'field_2',
    fieldName: 'מרכז הטניס פרימיום',
    fieldImageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    date: '2024-01-30',
    startTime: '18:00',
    endTime: '19:30',
    duration: 1.5,
    totalPrice: 180,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'coaching',
    participants: 2,
    specialNotes: 'כולל מאמן פרטי וכדורים חדשים',
    createdAt: '2024-01-28T09:15:00Z',
    friends: ['friend_2']
  },
  {
    id: 'booking_3',
    userId: 'user_1',
    fieldId: 'field_3',
    fieldName: 'היכל הכדורסל הלאומי',
    fieldImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    date: '2024-01-15',
    startTime: '19:00',
    endTime: '21:00',
    duration: 2,
    totalPrice: 240,
    status: 'completed',
    paymentStatus: 'paid',
    bookingType: 'tournament',
    participants: 10,
    specialNotes: 'משחק חצי גמר - כולל צילום',
    createdAt: '2024-01-13T16:45:00Z'
  },
  {
    id: 'booking_4',
    userId: 'user_1',
    fieldId: 'field_5',
    fieldName: 'בריכת גורדון',
    fieldImageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
    date: '2024-01-31',
    startTime: '07:00',
    endTime: '08:00',
    duration: 1,
    totalPrice: 60,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'single',
    participants: 1,
    specialNotes: 'אימון בוקר - מסלול 4',
    createdAt: '2024-01-29T21:30:00Z'
  },
  {
    id: 'booking_5',
    userId: 'user_1',
    fieldId: 'field_7',
    fieldName: 'מגרשי כדורעף חוף',
    fieldImageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    date: '2024-02-02',
    startTime: '16:00',
    endTime: '18:00',
    duration: 2,
    totalPrice: 160,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'group',
    participants: 8,
    specialNotes: 'טורניר חוף - כולל מקלחות',
    createdAt: '2024-01-30T14:20:00Z',
    friends: ['friend_1', 'friend_3']
  },
  {
    id: 'booking_6',
    userId: 'user_1',
    fieldId: 'field_4',
    fieldName: 'מועדון הפדל היוקרתי',
    fieldImageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    date: '2024-01-12',
    startTime: '19:00',
    endTime: '20:30',
    duration: 1.5,
    totalPrice: 330,
    status: 'completed',
    paymentStatus: 'paid',
    bookingType: 'vip',
    participants: 4,
    specialNotes: 'מגרש VIP עם שירות מלצרים',
    createdAt: '2024-01-10T16:45:00Z',
    friends: ['friend_1', 'friend_2']
  },
  {
    id: 'booking_7',
    userId: 'user_1',
    fieldId: 'field_11',
    fieldName: 'מגרש כדורגל מלא',
    fieldImageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    date: '2024-02-05',
    startTime: '15:00',
    endTime: '17:00',
    duration: 2,
    totalPrice: 500,
    status: 'confirmed',
    paymentStatus: 'pending',
    bookingType: 'league',
    participants: 22,
    specialNotes: 'משחק ליגה רשמי - כולל שופטים',
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'booking_8',
    userId: 'user_1',
    fieldId: 'field_9',
    fieldName: 'מגרשי טניס פארק הירקון',
    fieldImageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800',
    date: '2024-02-03',
    startTime: '09:00',
    endTime: '10:30',
    duration: 1.5,
    totalPrice: 105,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'recurring',
    participants: 2,
    specialNotes: 'אימון שבועי - מגרש 3',
    isRecurring: true,
    recurringDays: ['Sunday'],
    createdAt: '2024-01-28T08:15:00Z',
    friends: ['friend_2']
  },
  {
    id: 'booking_9',
    userId: 'user_1',
    fieldId: 'field_13',
    fieldName: 'בריכת השחייה העירונית',
    fieldImageUrl: 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=800',
    date: '2024-01-25',
    startTime: '06:00',
    endTime: '07:00',
    duration: 1,
    totalPrice: 50,
    status: 'completed',
    paymentStatus: 'paid',
    bookingType: 'single',
    participants: 1,
    specialNotes: 'שחייה בוקר - מסלולים 1-2',
    createdAt: '2024-01-24T20:45:00Z'
  },
  {
    id: 'booking_10',
    userId: 'user_1',
    fieldId: 'field_6',
    fieldName: 'מרכז ספורט רב תכליתי',
    fieldImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    date: '2024-02-08',
    startTime: '14:00',
    endTime: '18:00',
    duration: 4,
    totalPrice: 800,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'event',
    participants: 80,
    specialNotes: 'אירוע חברה - כולל קייטרינג',
    createdAt: '2024-02-05T11:30:00Z'
  },
  {
    id: 'booking_11',
    userId: 'user_1',
    fieldId: 'field_8',
    fieldName: 'מגרש כדורגל חמישיות',
    fieldImageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
    date: '2024-01-18',
    startTime: '20:30',
    endTime: '21:30',
    duration: 1,
    totalPrice: 100,
    status: 'cancelled',
    paymentStatus: 'refunded',
    bookingType: 'group',
    participants: 10,
    specialNotes: 'בוטל עקב מזג אויר',
    createdAt: '2024-01-16T19:20:00Z',
    cancelledAt: '2024-01-18T15:00:00Z',
    friends: ['friend_1', 'friend_3']
  },
  {
    id: 'booking_12',
    userId: 'user_1',
    fieldId: 'field_12',
    fieldName: 'מתחם פדל מודרני',
    fieldImageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    date: '2024-02-10',
    startTime: '11:00',
    endTime: '12:30',
    duration: 1.5,
    totalPrice: 210,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingType: 'coaching',
    participants: 2,
    specialNotes: 'שיעור למתחילים עם מאמן',
    createdAt: '2024-02-07T16:10:00Z',
    friends: ['friend_2']
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
    type: 'booking_payment',
    amount: 120,
    description: 'תשלום עבור מגרש כדורגל הרצליה',
    category: 'sports',
    status: 'completed',
    relatedBookingId: 'booking_1',
    relatedFieldId: 'field_1',
    paymentMethod: 'credit_card',
    metadata: {
      fieldName: 'אצטדיון כדורגל פרימיום',
      sportType: 'כדורגל',
      duration: 60,
      participants: ['דניאל כהן']
    },
    createdAt: '2024-01-25T16:35:00Z',
    updatedAt: '2024-01-25T16:35:30Z'
  },
  {
    id: 'trans_2',
    userId: 'user_1',
    type: 'wallet_charge',
    amount: 200,
    description: 'הוספת כסף לארנק',
    category: 'deposit',
    status: 'completed',
    paymentMethod: 'credit_card',
    createdAt: '2024-01-24T12:20:00Z',
    updatedAt: '2024-01-24T12:20:15Z'
  },
  {
    id: 'trans_3',
    userId: 'user_1',
    type: 'booking_payment',
    amount: 80,
    description: 'תשלום עבור מגרש טניס רעננה',
    category: 'sports',
    status: 'completed',
    relatedBookingId: 'booking_2',
    relatedFieldId: 'field_2',
    paymentMethod: 'apple_pay',
    metadata: {
      fieldName: 'מרכז הטניס פרימיום',
      sportType: 'טניס',
      duration: 60,
      participants: ['דניאל כהן', 'אריאל לוי']
    },
    createdAt: '2024-01-23T11:20:00Z',
    updatedAt: '2024-01-23T11:20:05Z'
  },
  {
    id: 'trans_4',
    userId: 'user_1',
    type: 'bonus',
    amount: 50,
    description: 'זיכוי הפנייה - חבר חדש',
    category: 'reward',
    status: 'completed',
    createdAt: '2024-01-22T14:15:00Z',
    updatedAt: '2024-01-22T14:15:00Z'
  },
  {
    id: 'trans_5',
    userId: 'user_1',
    type: 'refund',
    amount: 30,
    description: 'החזר עבור ביטול הזמנה',
    category: 'refund',
    status: 'completed',
    relatedBookingId: 'booking_cancelled',
    paymentMethod: 'credit_card',
    createdAt: '2024-01-21T09:45:00Z',
    updatedAt: '2024-01-21T09:46:00Z'
  },
  {
    id: 'trans_6',
    userId: 'user_1',
    type: 'booking_payment',
    amount: 100,
    description: 'תשלום עבור מגרש כדורסל תל אביב',
    category: 'sports',
    status: 'completed',
    relatedBookingId: 'booking_3',
    relatedFieldId: 'field_3',
    paymentMethod: 'google_pay',
    metadata: {
      fieldName: 'היכל הכדורסל הלאומי',
      sportType: 'כדורסל',
      duration: 90,
      participants: ['דניאל כהן', 'מיכל ברק', 'רון כהן']
    },
    createdAt: '2024-01-20T18:30:00Z',
    updatedAt: '2024-01-20T18:30:15Z'
  },
  {
    id: 'trans_7',
    userId: 'user_1',
    type: 'wallet_charge',
    amount: 300,
    description: 'הוספת כסף לארנק',
    category: 'deposit',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:30Z'
  },
  {
    id: 'trans_8',
    userId: 'user_1',
    type: 'transfer_out',
    amount: 25,
    description: 'העברה לחבר - אריאל לוי',
    category: 'transfer',
    status: 'completed',
    relatedUserId: 'user_friend_1',
    createdAt: '2024-01-18T15:20:00Z',
    updatedAt: '2024-01-18T15:20:05Z'
  },
  {
    id: 'trans_9',
    userId: 'user_1',
    type: 'booking_payment',
    amount: 160,
    description: 'תשלום עבור מגרש פדל קיסריה',
    category: 'sports',
    status: 'completed',
    relatedBookingId: 'booking_4',
    relatedFieldId: 'field_4',
    paymentMethod: 'credit_card',
    metadata: {
      fieldName: 'מועדון הפדל היוקרתי',
      sportType: 'פדל',
      duration: 120,
      participants: ['דניאל כהן', 'שרה גולדברג']
    },
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-17T16:45:10Z'
  },
  {
    id: 'trans_10',
    userId: 'user_1',
    type: 'penalty',
    amount: 15,
    description: 'עמלת ביטול מאוחר',
    category: 'fee',
    status: 'completed',
    relatedBookingId: 'booking_late_cancel',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z'
  },
  {
    id: 'trans_11',
    userId: 'user_1',
    type: 'wallet_charge',
    amount: 100,
    description: 'הוספת כסף לארנק',
    category: 'deposit',
    status: 'pending',
    paymentMethod: 'credit_card',
    createdAt: '2024-01-25T20:15:00Z'
  },
  {
    id: 'trans_12',
    userId: 'user_1',
    type: 'transfer_in',
    amount: 40,
    description: 'העברה מחבר - תום אלקלעי',
    category: 'transfer',
    status: 'completed',
    relatedUserId: 'user_friend_2',
    createdAt: '2024-01-15T11:30:00Z',
    updatedAt: '2024-01-15T11:30:02Z'
  }
];

// ===== Mock Games =====
export const MOCK_GAMES: Game[] = [
  {
    id: 'game_1',
    title: 'משחק כדורגל ערב',
    sport: 'כדורגל',
    fieldId: 'field_1',
    fieldName: 'אצטדיון כדורגל פרימיום',
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
    fieldName: 'מרכז הטניס פרימיום',
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
    fieldName: 'היכל הכדורסל הלאומי',
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
    fieldName: 'מועדון הפדל היוקרתי',
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
    fieldName: 'אצטדיון כדורגל פרימיום',
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
  'ירושלים',
  'חיפה',
  'נס ציונה',
  'באר שבע',
  'מודיעין',
  'אשדוד',
  'רמת גן',
  'נתניה',
  'קיסריה',
  'כפר סבא',
  'ראשון לציון',
  'רחובות',
  'פתח תקווה',
  'גבעתיים'
];