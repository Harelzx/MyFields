import { supabase } from './supabase';
import { 
  UserProfile, 
  BusinessProfile, 
  BusinessOwnerSignupData,
  ApiResponse,
  Sport,
  City
} from '@types/database';

// ==============================================
// AUTHENTICATION SERVICE
// ==============================================

export interface PlayerSignupData {
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

export interface BusinessOwnerSignupFormData {
  // Personal info
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  city_id: string;
  address?: string;
  
  // Business info
  business_name: string;
  business_type?: 'sports_complex' | 'private_field' | 'public_facility';
  website_url?: string;
  business_description?: string;
  
  // Field info
  field_name: string;
  sport_id: string;
  field_type_id?: string;
  field_address: string;
  field_coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity?: number;
  surface_type?: string;
  field_description?: string;
  amenity_ids: string[];
  
  // Operating hours (day 0 = Sunday, 6 = Saturday)
  operating_hours: {
    [key: number]: {
      is_closed: boolean;
      open_time?: string;
      close_time?: string;
    };
  };
  
  // Pricing
  base_price: number;
  pricing_name?: string;
  pricing_type?: string;
}

/**
 * Register a new player
 */
export const registerPlayer = async (userData: PlayerSignupData): Promise<ApiResponse<UserProfile>> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          user_type: 'player'
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone_number: userData.phone_number,
        user_type: 'player',
        city_id: userData.city_id,
        address: userData.address,
        profile_image_url: userData.profile_image_url,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        onboarding_completed: true
      })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    // Add preferred sports
    if (userData.preferred_sports.length > 0) {
      const sportsInserts = userData.preferred_sports.map(sportId => ({
        user_id: authData.user.id,
        sport_id: sportId,
        skill_level: 'intermediate' as const // Default skill level
      }));

      const { error: sportsError } = await supabase
        .from('user_sports')
        .insert(sportsInserts);

      if (sportsError) {
        console.warn('Failed to insert user sports:', sportsError);
      }
    }

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

/**
 * Register a new business owner with their first field
 */
export const registerBusinessOwner = async (
  userData: BusinessOwnerSignupFormData
): Promise<ApiResponse<{ user: UserProfile; business: BusinessProfile }>> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          user_type: 'business_owner'
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone_number: userData.phone_number,
        user_type: 'business_owner',
        city_id: userData.city_id,
        address: userData.address,
        onboarding_completed: true
      })
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    // Create business profile
    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .insert({
        owner_id: authData.user.id,
        business_name: userData.business_name,
        business_type: userData.business_type,
        website_url: userData.website_url,
        description: userData.business_description
      })
      .select()
      .single();

    if (businessError) {
      return { success: false, error: businessError.message };
    }

    // Create the first field
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .insert({
        business_id: business.id,
        name: userData.field_name,
        description: userData.field_description,
        sport_id: userData.sport_id,
        field_type_id: userData.field_type_id,
        city_id: userData.city_id,
        address: userData.field_address,
        coordinates: userData.field_coordinates ? 
          `POINT(${userData.field_coordinates.longitude} ${userData.field_coordinates.latitude})` : null,
        capacity: userData.capacity,
        surface_type: userData.surface_type
      })
      .select()
      .single();

    if (fieldError) {
      return { success: false, error: fieldError.message };
    }

    // Add amenities to the field
    if (userData.amenity_ids.length > 0) {
      const amenityInserts = userData.amenity_ids.map(amenityId => ({
        field_id: field.id,
        amenity_id: amenityId,
        is_included: true
      }));

      await supabase
        .from('field_amenities')
        .insert(amenityInserts);
    }

    // Add operating hours
    const operatingHours = Object.entries(userData.operating_hours).map(([day, hours]) => ({
      field_id: field.id,
      day_of_week: parseInt(day),
      is_closed: hours.is_closed,
      open_time: hours.open_time || '09:00',
      close_time: hours.close_time || '17:00'
    }));

    await supabase
      .from('field_operating_hours')
      .insert(operatingHours);

    // Add basic pricing
    await supabase
      .from('field_pricing')
      .insert({
        field_id: field.id,
        pricing_type: userData.pricing_type || 'hourly',
        name: userData.pricing_name || 'Standard Rate',
        base_price: userData.base_price,
        is_active: true,
        priority: 1
      });

    return { 
      success: true, 
      data: { 
        user: profile, 
        business: business 
      } 
    };
  } catch (error) {
    return { success: false, error: 'Business registration failed' };
  }
};

/**
 * Sign in user
 */
export const signIn = async (
  email: string, 
  password: string
): Promise<ApiResponse<UserProfile>> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        city:cities(name, region),
        preferred_sports:user_sports(
          sport:sports(name, icon_name),
          skill_level
        )
      `)
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Sign in failed' };
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Sign out failed' };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserProfile | null>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: true, data: null };
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        city:cities(name, region),
        preferred_sports:user_sports(
          sport:sports(name, icon_name),
          skill_level
        ),
        business_profile:business_profiles(*)
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to get current user' };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  updates: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
};

/**
 * Update user preferred sports
 */
export const updateUserSports = async (
  sportsData: { sport_id: string; skill_level: 'beginner' | 'intermediate' | 'advanced' }[]
): Promise<ApiResponse<boolean>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delete existing sports
    await supabase
      .from('user_sports')
      .delete()
      .eq('user_id', user.id);

    // Insert new sports
    if (sportsData.length > 0) {
      const inserts = sportsData.map(sport => ({
        user_id: user.id,
        sport_id: sport.sport_id,
        skill_level: sport.skill_level
      }));

      const { error } = await supabase
        .from('user_sports')
        .insert(inserts);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: 'Failed to update sports preferences' };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Failed to send reset email' };
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Failed to update password' };
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string, type: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Mark user as verified in profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ is_verified: true })
        .eq('id', user.id);
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'Email verification failed' };
  }
};

/**
 * Check if email exists
 */
export const checkEmailExists = async (email: string): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data?.length || 0) > 0 };
  } catch (error) {
    return { success: false, error: 'Failed to check email' };
  }
};

/**
 * Check if phone number exists
 */
export const checkPhoneExists = async (phoneNumber: string): Promise<ApiResponse<boolean>> => {
  try {
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('phone_number', cleanPhone)
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data?.length || 0) > 0 };
  } catch (error) {
    return { success: false, error: 'Failed to check phone number' };
  }
};