import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, VStack } from '@gluestack-ui/themed';

interface VenueCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance?: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  amenities: string[];
  availableToday: boolean;
  onPress?: (id: string) => void;
  onQuickBook?: (id: string) => void;
  isFavorite?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;

const AMENITY_ICONS: Record<string, string> = {
  'parking': 'car',
  'shower': 'shower',
  'lights': 'lightbulb-on',
  'grass': 'grass',
  'synthetic': 'texture-box',
  'indoor': 'home-roof',
  'outdoor': 'weather-sunny',
  'changing-room': 'hanger',
  'water': 'water',
  'wifi': 'wifi',
  'cafeteria': 'coffee',
  'equipment': 'soccer',
};

export const VenueCard: React.FC<VenueCardProps> = ({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  location,
  distance,
  priceRange,
  amenities,
  availableToday,
  onPress,
  onQuickBook,
  isFavorite = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const getPriceRangeIndicator = () => {
    const avgPrice = (priceRange.min + priceRange.max) / 2;
    if (avgPrice < 100) return '₪';
    if (avgPrice < 200) return '₪₪';
    return '₪₪₪';
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress?.(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Hero Image with Gradient */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons 
                name="soccer-field" 
                size={60} 
                color={designTokens.colors.text.tertiary} 
              />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          
          {/* Availability Badge */}
          {availableToday && (
            <View style={styles.availabilityBadge}>
              <RTLText style={styles.availabilityText}>זמין היום</RTLText>
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? designTokens.colors.error[500] : designTokens.colors.text.inverse}
            />
          </TouchableOpacity>
          
          {/* Distance Badge */}
          {distance && (
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={14} 
                color={designTokens.colors.text.inverse} 
              />
              <RTLText style={styles.distanceText}>{distance}</RTLText>
            </View>
          )}
        </View>

        {/* Content */}
        <VStack style={styles.content} space="sm">
          {/* Header */}
          <HStack style={styles.header} justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space="xs">
              <RTLText style={styles.name} numberOfLines={1}>{name}</RTLText>
              <RTLText style={styles.location} numberOfLines={1}>{location}</RTLText>
            </VStack>
            
            {/* Rating */}
            <HStack style={styles.ratingContainer} alignItems="center" space="xs">
              <MaterialCommunityIcons 
                name="star" 
                size={16} 
                color={designTokens.colors.warning[500]} 
              />
              <RTLText style={styles.rating}>{rating.toFixed(1)}</RTLText>
              <RTLText style={styles.reviewCount}>({reviewCount})</RTLText>
            </HStack>
          </HStack>

          {/* Amenities */}
          <HStack style={styles.amenitiesContainer} space="xs">
            {amenities.slice(0, 4).map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <MaterialCommunityIcons
                  name={AMENITY_ICONS[amenity] || 'check'}
                  size={16}
                  color={designTokens.colors.text.secondary}
                />
              </View>
            ))}
            {amenities.length > 4 && (
              <View style={styles.amenityChip}>
                <RTLText style={styles.moreAmenities}>+{amenities.length - 4}</RTLText>
              </View>
            )}
          </HStack>

          {/* Footer */}
          <HStack style={styles.footer} justifyContent="space-between" alignItems="center">
            {/* Price Range */}
            <VStack>
              <HStack alignItems="baseline" space="xs">
                <RTLText style={styles.priceIndicator}>{getPriceRangeIndicator()}</RTLText>
                <RTLText style={styles.priceRange}>
                  {priceRange.currency}{priceRange.min}-{priceRange.max}
                </RTLText>
                <RTLText style={styles.priceUnit}>/ שעה</RTLText>
              </HStack>
            </VStack>

            {/* Quick Book Button */}
            <TouchableOpacity 
              style={styles.quickBookButton}
              onPress={(e) => {
                e.stopPropagation();
                onQuickBook?.(id);
              }}
            >
              <RTLText style={styles.quickBookText}>הזמנה מהירה</RTLText>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    ...designTokens.shadows.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: designTokens.colors.secondary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  availabilityBadge: {
    position: 'absolute',
    top: designTokens.spacing.md,
    left: designTokens.spacing.md,
    backgroundColor: designTokens.colors.success[600],
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.full,
  },
  availabilityText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.semibold,
  },
  favoriteButton: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    width: 40,
    height: 40,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: designTokens.spacing.md,
    left: designTokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.overlay,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.full,
  },
  distanceText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    marginLeft: designTokens.spacing.xs,
  },
  content: {
    padding: designTokens.spacing.lg,
  },
  header: {
    marginBottom: designTokens.spacing.xs,
  },
  name: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  location: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
  },
  ratingContainer: {
    marginLeft: designTokens.spacing.md,
  },
  rating: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  reviewCount: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    marginVertical: designTokens.spacing.sm,
  },
  amenityChip: {
    backgroundColor: designTokens.colors.secondary[100],
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: 28,
  },
  moreAmenities: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
  },
  footer: {
    marginTop: designTokens.spacing.sm,
  },
  priceIndicator: {
    fontSize: designTokens.typography.sizes.lg,
    color: designTokens.colors.text.tertiary,
    fontWeight: designTokens.typography.weights.semibold,
  },
  priceRange: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
  },
  priceUnit: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  quickBookButton: {
    backgroundColor: designTokens.colors.primary[600],
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.full,
    ...designTokens.shadows.sm,
  },
  quickBookText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
  },
});