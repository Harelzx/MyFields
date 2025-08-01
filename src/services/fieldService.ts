import { supabase } from './supabase';
import { 
  Field, 
  FieldFormData, 
  FieldSearchFilters, 
  ApiResponse, 
  PaginatedResponse,
  Sport,
  City,
  Amenity,
  FieldType,
  BusinessProfile,
  FieldPricing,
  FieldOperatingHour
} from '@types/database';

// ==============================================
// FIELD MANAGEMENT SERVICE
// ==============================================

/**
 * Create a new field for a business owner
 */
export const createField = async (fieldData: FieldFormData): Promise<ApiResponse<Field>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get business profile for the user
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (businessError || !businessProfile) {
      return { success: false, error: 'Business profile not found' };
    }

    // Start a transaction
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .insert({
        business_id: businessProfile.id,
        name: fieldData.name,
        description: fieldData.description,
        sport_id: fieldData.sport_id,
        field_type_id: fieldData.field_type_id,
        city_id: fieldData.city_id,
        address: fieldData.address,
        coordinates: fieldData.coordinates ? 
          `POINT(${fieldData.coordinates.longitude} ${fieldData.coordinates.latitude})` : null,
        postal_code: fieldData.postal_code,
        capacity: fieldData.capacity,
        length_meters: fieldData.length_meters,
        width_meters: fieldData.width_meters,
        surface_type: fieldData.surface_type,
        primary_image_url: fieldData.primary_image_url,
        image_urls: fieldData.image_urls,
        special_features: fieldData.special_features,
        rules_and_policies: fieldData.rules_and_policies,
        cancellation_policy: fieldData.cancellation_policy
      })
      .select()
      .single();

    if (fieldError) {
      return { success: false, error: fieldError.message };
    }

    // Insert amenities
    if (fieldData.amenity_ids.length > 0) {
      const amenityInserts = fieldData.amenity_ids.map(amenityId => ({
        field_id: field.id,
        amenity_id: amenityId,
        is_included: true
      }));

      const { error: amenityError } = await supabase
        .from('field_amenities')
        .insert(amenityInserts);

      if (amenityError) {
        console.warn('Failed to insert amenities:', amenityError);
      }
    }

    // Insert operating hours
    const operatingHours = Object.entries(fieldData.operating_hours).map(([day, hours]) => ({
      field_id: field.id,
      day_of_week: parseInt(day),
      is_closed: hours.is_closed,
      open_time: hours.open_time || '09:00',
      close_time: hours.close_time || '17:00'
    }));

    const { error: hoursError } = await supabase
      .from('field_operating_hours')
      .insert(operatingHours);

    if (hoursError) {
      console.warn('Failed to insert operating hours:', hoursError);
    }

    // Insert pricing
    if (fieldData.pricing.length > 0) {
      const pricingInserts = fieldData.pricing.map((pricing, index) => ({
        field_id: field.id,
        pricing_type: pricing.pricing_type,
        name: pricing.name,
        base_price: pricing.base_price,
        applies_to_days: pricing.applies_to_days,
        start_time: pricing.start_time,
        end_time: pricing.end_time,
        priority: index
      }));

      const { error: pricingError } = await supabase
        .from('field_pricing')
        .insert(pricingInserts);

      if (pricingError) {
        console.warn('Failed to insert pricing:', pricingError);
      }
    }

    return { success: true, data: field };
  } catch (error) {
    return { success: false, error: 'Failed to create field' };
  }
};

/**
 * Search and filter fields
 */
export const searchFields = async (
  filters: FieldSearchFilters = {},
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<PaginatedResponse<Field>>> => {
  try {
    let query = supabase
      .from('fields')
      .select(`
        *,
        business:business_profiles(
          business_name,
          is_verified
        ),
        sport:sports(name, icon_name),
        field_type:field_types(name),
        city:cities(name, region),
        amenities:field_amenities(
          amenity:amenities(name, icon_name, category)
        ),
        operating_hours:field_operating_hours(*),
        pricing:field_pricing(*)
      `)
      .eq('is_active', true);

    // Apply filters
    if (filters.sport_id) {
      query = query.eq('sport_id', filters.sport_id);
    }

    if (filters.city_id) {
      query = query.eq('city_id', filters.city_id);
    }

    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    if (filters.capacity_min) {
      query = query.gte('capacity', filters.capacity_min);
    }

    if (filters.capacity_max) {
      query = query.lte('capacity', filters.capacity_max);
    }

    if (filters.surface_type && filters.surface_type.length > 0) {
      query = query.in('surface_type', filters.surface_type);
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    // Location-based search
    if (filters.coordinates) {
      const { latitude, longitude, radius_km = 10 } = filters.coordinates;
      query = query.rpc('fields_within_radius', {
        lat: latitude,
        lng: longitude,
        radius_km: radius_km
      });
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Filter by pricing if specified
    let filteredData = data || [];
    if (filters.max_price) {
      filteredData = filteredData.filter(field => {
        const pricing = field.pricing || [];
        const minPrice = pricing.length > 0 ? Math.min(...pricing.map(p => p.base_price)) : 0;
        return minPrice <= filters.max_price!;
      });
    }

    // Filter by amenities if specified
    if (filters.amenity_ids && filters.amenity_ids.length > 0) {
      filteredData = filteredData.filter(field => {
        const fieldAmenityIds = field.amenities?.map(fa => fa.amenity?.id) || [];
        return filters.amenity_ids!.every(id => fieldAmenityIds.includes(id));
      });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      success: true,
      data: {
        data: filteredData,
        total: totalCount,
        page,
        per_page: perPage,
        total_pages: totalPages
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to search fields' };
  }
};

/**
 * Get field details by ID
 */
export const getFieldById = async (fieldId: string): Promise<ApiResponse<Field>> => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select(`
        *,
        business:business_profiles(
          business_name,
          is_verified,
          website_url,
          description
        ),
        sport:sports(name, icon_name),
        field_type:field_types(name, description),
        city:cities(name, region),
        amenities:field_amenities(
          is_included,
          additional_cost,
          amenity:amenities(name, icon_name, category)
        ),
        operating_hours:field_operating_hours(*),
        pricing:field_pricing(*),
        packages:field_packages(*),
        reviews:field_reviews(
          *,
          user:user_profiles(first_name, last_name, profile_image_url)
        )
      `)
      .eq('id', fieldId)
      .eq('is_active', true)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to get field details' };
  }
};

/**
 * Get fields owned by current business user
 */
export const getMyFields = async (): Promise<ApiResponse<Field[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('fields')
      .select(`
        *,
        sport:sports(name, icon_name),
        city:cities(name),
        amenities:field_amenities(
          amenity:amenities(name, icon_name)
        ),
        operating_hours:field_operating_hours(*),
        pricing:field_pricing(*)
      `)
      .eq('business_profiles.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to get fields' };
  }
};

/**
 * Update field information
 */
export const updateField = async (
  fieldId: string, 
  updates: Partial<FieldFormData>
): Promise<ApiResponse<Field>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify ownership
    const { data: field, error: ownershipError } = await supabase
      .from('fields')
      .select('business_id, business_profiles!inner(owner_id)')
      .eq('id', fieldId)
      .eq('business_profiles.owner_id', user.id)
      .single();

    if (ownershipError || !field) {
      return { success: false, error: 'Field not found or access denied' };
    }

    // Update field
    const { data: updatedField, error: updateError } = await supabase
      .from('fields')
      .update({
        name: updates.name,
        description: updates.description,
        sport_id: updates.sport_id,
        field_type_id: updates.field_type_id,
        city_id: updates.city_id,
        address: updates.address,
        coordinates: updates.coordinates ? 
          `POINT(${updates.coordinates.longitude} ${updates.coordinates.latitude})` : undefined,
        postal_code: updates.postal_code,
        capacity: updates.capacity,
        length_meters: updates.length_meters,
        width_meters: updates.width_meters,
        surface_type: updates.surface_type,
        primary_image_url: updates.primary_image_url,
        image_urls: updates.image_urls,
        special_features: updates.special_features,
        rules_and_policies: updates.rules_and_policies,
        cancellation_policy: updates.cancellation_policy
      })
      .eq('id', fieldId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: updatedField };
  } catch (error) {
    return { success: false, error: 'Failed to update field' };
  }
};

/**
 * Check field availability for a specific date and time
 */
export const checkFieldAvailability = async (
  fieldId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<ApiResponse<{ available: boolean; conflicts?: any[] }>> => {
  try {
    // Check operating hours
    const dayOfWeek = new Date(date).getDay();
    
    const { data: operatingHours, error: hoursError } = await supabase
      .from('field_operating_hours')
      .select('*')
      .eq('field_id', fieldId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (hoursError) {
      return { success: false, error: 'Failed to check operating hours' };
    }

    if (operatingHours.is_closed || 
        startTime < operatingHours.open_time || 
        endTime > operatingHours.close_time) {
      return { 
        success: true, 
        data: { 
          available: false, 
          conflicts: ['Outside operating hours'] 
        } 
      };
    }

    // Check for existing bookings
    const { data: conflicts, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('field_id', fieldId)
      .eq('booking_date', date)
      .in('status', ['confirmed', 'active'])
      .or(`and(start_time.lte.${endTime},end_time.gt.${startTime})`);

    if (bookingError) {
      return { success: false, error: 'Failed to check bookings' };
    }

    const available = !conflicts || conflicts.length === 0;

    return {
      success: true,
      data: {
        available,
        conflicts: available ? [] : conflicts
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to check availability' };
  }
};

// ==============================================
// REFERENCE DATA SERVICES
// ==============================================

/**
 * Get all sports
 */
export const getSports = async (): Promise<ApiResponse<Sport[]>> => {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to get sports' };
  }
};

/**
 * Get all cities
 */
export const getCities = async (): Promise<ApiResponse<City[]>> => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to get cities' };
  }
};

/**
 * Get all amenities
 */
export const getAmenities = async (): Promise<ApiResponse<Amenity[]>> => {
  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to get amenities' };
  }
};

/**
 * Get field types by sport
 */
export const getFieldTypesBySport = async (sportId: string): Promise<ApiResponse<FieldType[]>> => {
  try {
    const { data, error } = await supabase
      .from('field_types')
      .select('*, sport:sports(name)')
      .eq('sport_id', sportId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to get field types' };
  }
};