import { 
  MOCK_USER, 
  MOCK_FIELDS, 
  MOCK_BOOKINGS, 
  MOCK_FRIENDS, 
  MOCK_WALLET_TRANSACTIONS,
  MOCK_SPORTS,
  MOCK_CITIES,
  MOCK_GAMES
} from '../constants/mockData';
import { 
  User, 
  Field, 
  Booking, 
  Friend, 
  WalletTransaction, 
  Sport,
  Game,
  SearchFilters,
  ApiResponse 
} from '../utils/types';

// Utility function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== Authentication API =====
export const loginUser = async (email: string, password: string): Promise<ApiResponse<User>> => {
  await delay(1000);
  
  if (email === MOCK_USER.email && password === 'demo123') {
    return {
      success: true,
      data: MOCK_USER,
      message: 'התחברות בוצעה בהצלחה'
    };
  }
  
  return {
    success: false,
    error: 'אימייל או סיסמה שגויים'
  };
};

export const registerUser = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
  await delay(1200);
  
  const newUser: User = {
    ...MOCK_USER,
    ...userData,
    id: `user_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  return {
    success: true,
    data: newUser,
    message: 'המשתמש נרשם בהצלחה'
  };
};

// ===== User API =====
export const fetchUser = async (userId: string): Promise<ApiResponse<User>> => {
  await delay(500);
  
  return {
    success: true,
    data: MOCK_USER,
    message: 'פרטי המשתמש נטענו בהצלחה'
  };
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  await delay(800);
  
  const updatedUser = { ...MOCK_USER, ...userData };
  
  return {
    success: true,
    data: updatedUser,
    message: 'הפרופיל עודכן בהצלחה'
  };
};

// ===== Sports API =====
export const fetchSports = async (): Promise<ApiResponse<Sport[]>> => {
  await delay(300);
  
  return {
    success: true,
    data: MOCK_SPORTS,
    message: 'רשימת הספורטים נטענה בהצלחה'
  };
};

// ===== Fields API =====
export const searchFields = async (filters: SearchFilters = {}): Promise<ApiResponse<Field[]>> => {
  await delay(800);
  
  let filteredFields = [...MOCK_FIELDS];
  
  if (filters.sportType) {
    filteredFields = filteredFields.filter(field => field.sportType === filters.sportType);
  }
  
  if (filters.city) {
    filteredFields = filteredFields.filter(field => field.city === filters.city);
  }
  
  if (filters.maxPrice !== undefined) {
    filteredFields = filteredFields.filter(field => field.pricePerHour <= filters.maxPrice!);
  }
  
  if (filters.minRating !== undefined) {
    filteredFields = filteredFields.filter(field => field.rating >= filters.minRating!);
  }
  
  return {
    success: true,
    data: filteredFields,
    message: `נמצאו ${filteredFields.length} מגרשים`
  };
};

export const fetchFieldById = async (fieldId: string): Promise<ApiResponse<Field>> => {
  await delay(400);
  
  const field = MOCK_FIELDS.find(f => f.id === fieldId);
  
  if (field) {
    return {
      success: true,
      data: field,
      message: 'פרטי המגרש נטענו בהצלחה'
    };
  }
  
  return {
    success: false,
    error: 'מגרש לא נמצא'
  };
};

export const getPopularFields = async (): Promise<ApiResponse<Field[]>> => {
  await delay(600);
  
  const popularFields = MOCK_FIELDS
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  
  return {
    success: true,
    data: popularFields,
    message: 'המגרשים הפופולריים נטענו בהצלחה'
  };
};

// ===== Bookings API =====
export const fetchUserBookings = async (userId: string): Promise<ApiResponse<Booking[]>> => {
  await delay(700);
  
  const userBookings = MOCK_BOOKINGS.filter(booking => booking.userId === userId);
  
  return {
    success: true,
    data: userBookings,
    message: 'ההזמנות נטענו בהצלחה'
  };
};

export const createBooking = async (bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> => {
  await delay(1000);
  
  const newBooking: Booking = {
    id: `booking_${Date.now()}`,
    userId: bookingData.userId || 'user_1',
    fieldId: bookingData.fieldId || '',
    fieldName: bookingData.fieldName || '',
    fieldImageUrl: bookingData.fieldImageUrl || '',
    date: bookingData.date || '',
    startTime: bookingData.startTime || '',
    endTime: bookingData.endTime || '',
    duration: bookingData.duration || 1,
    totalPrice: bookingData.totalPrice || 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
    friends: bookingData.friends || []
  };
  
  return {
    success: true,
    data: newBooking,
    message: 'ההזמנה נוצרה בהצלחה'
  };
};

export const cancelBooking = async (bookingId: string): Promise<ApiResponse<boolean>> => {
  await delay(600);
  
  return {
    success: true,
    data: true,
    message: 'ההזמנה בוטלה בהצלחה'
  };
};

// ===== Friends API =====
export const fetchUserFriends = async (userId: string): Promise<ApiResponse<Friend[]>> => {
  await delay(500);
  
  return {
    success: true,
    data: MOCK_FRIENDS,
    message: 'רשימת החברים נטענה בהצלחה'
  };
};

export const inviteFriend = async (phoneNumber: string): Promise<ApiResponse<boolean>> => {
  await delay(800);
  
  return {
    success: true,
    data: true,
    message: 'ההזמנה נשלחה בהצלחה'
  };
};

// ===== Wallet API =====
export const fetchWalletTransactions = async (userId: string): Promise<ApiResponse<WalletTransaction[]>> => {
  await delay(600);
  
  const userTransactions = MOCK_WALLET_TRANSACTIONS.filter(trans => trans.userId === userId);
  
  return {
    success: true,
    data: userTransactions,
    message: 'היסטוריית הארנק נטענה בהצלחה'
  };
};

export const addMoneyToWallet = async (userId: string, amount: number): Promise<ApiResponse<boolean>> => {
  await delay(1200);
  
  return {
    success: true,
    data: true,
    message: `${amount} ₪ נוספו לארנק בהצלחה`
  };
};

// ===== Games API =====
export const searchGames = async (filters: SearchFilters = {}): Promise<ApiResponse<Game[]>> => {
  await delay(600);
  
  let filteredGames = [...MOCK_GAMES];
  
  // Filter by sport type
  if (filters.sportType) {
    filteredGames = filteredGames.filter(game => game.sport === filters.sportType);
  }
  
  // Filter by city (based on field location)
  if (filters.city) {
    const cityFields = MOCK_FIELDS.filter(field => field.city === filters.city);
    const cityFieldIds = cityFields.map(field => field.id);
    filteredGames = filteredGames.filter(game => cityFieldIds.includes(game.fieldId));
  }
  
  // Filter by date
  if (filters.date) {
    filteredGames = filteredGames.filter(game => game.date === filters.date);
  }
  
  // Only show open games
  filteredGames = filteredGames.filter(game => game.status === 'open');
  
  return {
    success: true,
    data: filteredGames,
    message: `נמצאו ${filteredGames.length} משחקים זמינים`
  };
};

export const fetchGameById = async (gameId: string): Promise<ApiResponse<Game>> => {
  await delay(400);
  
  const game = MOCK_GAMES.find(g => g.id === gameId);
  
  if (game) {
    return {
      success: true,
      data: game,
      message: 'פרטי המשחק נטענו בהצלחה'
    };
  }
  
  return {
    success: false,
    error: 'משחק לא נמצא'
  };
};

export const joinGame = async (gameId: string, userId: string): Promise<ApiResponse<boolean>> => {
  await delay(800);
  
  const game = MOCK_GAMES.find(g => g.id === gameId);
  
  if (!game) {
    return {
      success: false,
      error: 'משחק לא נמצא'
    };
  }
  
  if (game.currentPlayers >= game.maxPlayers) {
    return {
      success: false,
      error: 'המשחק מלא'
    };
  }
  
  if (game.participants.includes(userId)) {
    return {
      success: false,
      error: 'כבר הצטרפת למשחק זה'
    };
  }
  
  return {
    success: true,
    data: true,
    message: 'הצטרפת למשחק בהצלחה!'
  };
};

export const leaveGame = async (gameId: string, userId: string): Promise<ApiResponse<boolean>> => {
  await delay(600);
  
  const game = MOCK_GAMES.find(g => g.id === gameId);
  
  if (!game) {
    return {
      success: false,
      error: 'משחק לא נמצא'
    };
  }
  
  if (!game.participants.includes(userId)) {
    return {
      success: false,
      error: 'לא הצטרפת למשחק זה'
    };
  }
  
  return {
    success: true,
    data: true,
    message: 'יצאת מהמשחק בהצלחה'
  };
};

// ===== Utility API =====
export const fetchCities = async (): Promise<ApiResponse<string[]>> => {
  await delay(200);
  
  return {
    success: true,
    data: MOCK_CITIES,
    message: 'רשימת הערים נטענה בהצלחה'
  };
};