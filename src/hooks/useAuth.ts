import { useState, useEffect } from 'react';
import { supabase, auth } from '@services/supabase';
import { useUserStore } from '@store/userStore';

export interface AuthState {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const { setUser, setLoading, setError } = useUserStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          return;
        }

        setAuthState({
          user: session?.user || null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });

        // If user is authenticated, fetch profile
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setAuthState({
          user: session?.user || null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });

        if (event === 'SIGNED_IN' && session?.user) {
          fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setError]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name || data.email,
          email: data.email,
          avatar: data.avatar,
          phone: data.phone,
          preferredSports: data.preferred_sports || [],
          balance: data.balance || 0,
          isBusinessOwner: data.is_business_owner || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signUp(email, password, metadata);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await auth.signOut();
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await auth.resetPassword(email);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile: () => authState.user?.id && fetchUserProfile(authState.user.id),
  };
};