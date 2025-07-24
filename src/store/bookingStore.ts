import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  fieldName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  invitedFriends: string[];
  confirmedFriends: string[];
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearBookings: () => void;
  
  // Selectors
  getBookingById: (id: string) => Booking | undefined;
  getUpcomingBookings: () => Booking[];
  getPastBookings: () => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
  getTotalSpent: () => number;
}

export const useBookingStore = create<BookingState>()(
  subscribeWithSelector((set, get) => ({
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
    
    setBookings: (bookings) => set({ bookings, error: null }),
    
    addBooking: (booking) => set((state) => ({
      bookings: [...state.bookings, booking],
      error: null
    })),
    
    updateBooking: (id, updates) => set((state) => ({
      bookings: state.bookings.map(booking => 
        booking.id === id ? { ...booking, ...updates } : booking
      ),
      currentBooking: state.currentBooking?.id === id 
        ? { ...state.currentBooking, ...updates } 
        : state.currentBooking
    })),
    
    cancelBooking: (id) => set((state) => ({
      bookings: state.bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'cancelled' as const } : booking
      )
    })),
    
    setCurrentBooking: (currentBooking) => set({ currentBooking }),
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
    
    clearBookings: () => set({ bookings: [], currentBooking: null }),
    
    // Selectors
    getBookingById: (id) => get().bookings.find(b => b.id === id),
    
    getUpcomingBookings: () => {
      const now = new Date();
      return get().bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= now && booking.status !== 'cancelled';
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    
    getPastBookings: () => {
      const now = new Date();
      return get().bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate < now;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    getBookingsByStatus: (status) => get().bookings.filter(b => b.status === status),
    
    getTotalSpent: () => get().bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((total, booking) => total + booking.price, 0),
  }))
);