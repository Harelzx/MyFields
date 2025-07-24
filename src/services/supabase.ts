import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// TODO: Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh
    autoRefreshToken: true,
    // Persist session in local storage
    persistSession: true,
    // Detect session in URL hash
    detectSessionInUrl: false,
  },
  realtime: {
    // Configure realtime options
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Update user profile
  updateUser: async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },
};

// Database helper functions
export const db = {
  // Users table
  users: {
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    updateProfile: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    updateBalance: async (userId: string, balance: number) => {
      const { data, error } = await supabase
        .from('users')
        .update({ balance })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Bookings table
  bookings: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      return { data, error };
    },

    create: async (booking: any) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    cancel: async (id: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Friends table
  friends: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      return { data, error };
    },

    sendRequest: async (userId: string, friendId: string) => {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({ user_id: userId, friend_id: friendId })
        .select()
        .single();
      return { data, error };
    },

    acceptRequest: async (requestId: string) => {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Transactions table
  transactions: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (transaction: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      return { data, error };
    },
  },
};

// Realtime subscriptions
export const realtime = {
  // Subscribe to user profile changes
  subscribeToUserProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('user-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to booking changes
  subscribeToBookings: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to friend requests
  subscribeToFriendRequests: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `friend_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to wallet changes
  subscribeToWallet: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};