import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  FadeIn,
  SlideInUp
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, VStack, Badge } from '@gluestack-ui/themed';

interface RebookSuggestion {
  id: string;
  venueName: string;
  venueImage?: string;
  lastBookedDate: string;
  preferredTime: string;
  bookingCount: number;
  avgRating: number;
  lastPrice: number;
  currency: string;
  availableSlots: string[];
  distance?: string;
  isPopular?: boolean;
}

interface QuickRebookCardProps {
  suggestions: RebookSuggestion[];
  onRebook?: (suggestion: RebookSuggestion, timeSlot: string) => void;
  onViewMore?: () => void;
  style?: any;
}

export const QuickRebookCard: React.FC<QuickRebookCardProps> = ({
  suggestions,
  onRebook,
  onViewMore,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatLastBooking = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  };

  const getFrequencyText = (count: number) => {
    if (count === 1) return 'הזמנה ראשונה';
    if (count < 5) return `${count} הזמנות`;
    if (count < 10) return 'לקוח קבוע';
    return 'לקוח VIP';
  };

  const renderSuggestionCard = (suggestion: RebookSuggestion, index: number) => (
    <Animated.View 
      key={suggestion.id}
      entering={SlideInUp.delay(index * 100)}
      style={styles.suggestionCard}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <HStack space="md" alignItems="flex-start">
          {/* Venue Image */}
          <View style={styles.venueImageContainer}>
            {suggestion.venueImage ? (
              <Image source={{ uri: suggestion.venueImage }} style={styles.venueImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons 
                  name="soccer-field" 
                  size={24} 
                  color={designTokens.colors.text.tertiary} 
                />
              </View>
            )}
            
            {/* Popularity Badge */}
            {suggestion.isPopular && (
              <View style={styles.popularBadge}>
                <MaterialCommunityIcons 
                  name="fire" 
                  size={12} 
                  color={designTokens.colors.warning[600]} 
                />
              </View>
            )}
          </View>

          {/* Venue Info */}
          <VStack flex={1} space="xs">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1}>
                <RTLText style={styles.venueName} numberOfLines={1}>
                  {suggestion.venueName}
                </RTLText>
                <RTLText style={styles.lastBooking}>
                  הזמנה אחרונה: {formatLastBooking(suggestion.lastBookedDate)}
                </RTLText>
              </VStack>
              
              {suggestion.distance && (
                <View style={styles.distanceBadge}>
                  <RTLText style={styles.distanceText}>{suggestion.distance}</RTLText>
                </View>
              )}
            </HStack>

            {/* Stats */}
            <HStack space="lg" alignItems="center">
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="star" 
                  size={14} 
                  color={designTokens.colors.warning[500]} 
                />
                <RTLText style={styles.rating}>
                  {suggestion.avgRating.toFixed(1)}
                </RTLText>
              </HStack>
              
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="repeat" 
                  size={14} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.frequency}>
                  {getFrequencyText(suggestion.bookingCount)}
                </RTLText>
              </HStack>
            </HStack>

            {/* Preferred Time & Price */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={14} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.preferredTime}>
                  בדרך כלל: {suggestion.preferredTime}
                </RTLText>
              </HStack>
              
              <RTLText style={styles.lastPrice}>
                {suggestion.currency}{suggestion.lastPrice}
              </RTLText>
            </HStack>

            {/* Available Time Slots */}
            <VStack space="xs">
              <RTLText style={styles.slotsLabel}>זמנים זמינים היום:</RTLText>
              <HStack space="xs" flexWrap="wrap">
                {suggestion.availableSlots.slice(0, 3).map((slot, slotIndex) => (
                  <TouchableOpacity
                    key={slotIndex}
                    style={styles.timeSlot}
                    onPress={() => onRebook?.(suggestion, slot)}
                  >
                    <RTLText style={styles.timeSlotText}>{slot}</RTLText>
                  </TouchableOpacity>
                ))}
                {suggestion.availableSlots.length > 3 && (
                  <TouchableOpacity style={styles.moreSlots}>
                    <RTLText style={styles.moreSlotsText}>
                      +{suggestion.availableSlots.length - 3}
                    </RTLText>
                  </TouchableOpacity>
                )}
              </HStack>
            </VStack>
          </VStack>
        </HStack>
      </TouchableOpacity>
    </Animated.View>
  );

  if (suggestions.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={48} 
            color={designTokens.colors.text.tertiary} 
          />
          <RTLText style={styles.emptyTitle}>אין הזמנות קודמות</RTLText>
          <RTLText style={styles.emptySubtitle}>
            לאחר ההזמנה הראשונה, נציג כאן הצעות להזמנה מהירה
          </RTLText>
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={[styles.container, style]}>
      {/* Header */}
      <HStack style={styles.header} justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" space="sm">
          <MaterialCommunityIcons 
            name="clock-fast" 
            size={24} 
            color={designTokens.colors.primary[600]} 
          />
          <VStack>
            <RTLText style={styles.headerTitle}>הזמנה מהירה</RTLText>
            <RTLText style={styles.headerSubtitle}>בהתבסס על ההיסטוריה שלך</RTLText>
          </VStack>
        </HStack>
        
        {suggestions.length > 2 && (
          <TouchableOpacity onPress={onViewMore}>
            <RTLText style={styles.viewMoreText}>הצג הכל</RTLText>
          </TouchableOpacity>
        )}
      </HStack>

      {/* Suggestions */}
      <VStack space="md">
        {suggestions.slice(0, 2).map((suggestion, index) => 
          renderSuggestionCard(suggestion, index)
        )}
      </VStack>

      {/* AI Insight */}
      <View style={styles.aiInsight}>
        <LinearGradient
          colors={[designTokens.colors.primary[50], designTokens.colors.primary[100]]}
          style={styles.aiInsightGradient}
        >
          <HStack space="sm" alignItems="center">
            <MaterialCommunityIcons 
              name="brain" 
              size={20} 
              color={designTokens.colors.primary[600]} 
            />
            <VStack flex={1}>
              <RTLText style={styles.aiInsightTitle}>💡 המלצה חכמה</RTLText>
              <RTLText style={styles.aiInsightText}>
                {suggestions[0] ? 
                  `אתה בדרך כלל מזמין ב-${suggestions[0].preferredTime}. יש זמנים פנויים בזמן זה השבוע!` :
                  'בהתבסס על ההעדפות שלך, מצאנו מגרשים מתאימים באזורך'
                }
              </RTLText>
            </VStack>
          </HStack>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.md,
  },
  header: {
    marginBottom: designTokens.spacing.lg,
  },
  headerTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  viewMoreText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
  },
  suggestionCard: {
    backgroundColor: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  venueImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: designTokens.borderRadius.md,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: designTokens.colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.warning[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: designTokens.colors.background.card,
  },
  venueName: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  lastBooking: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  distanceBadge: {
    backgroundColor: designTokens.colors.secondary[100],
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.full,
  },
  distanceText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
  },
  rating: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.primary,
    fontWeight: designTokens.typography.weights.medium,
  },
  frequency: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  preferredTime: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  lastPrice: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
  },
  slotsLabel: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.primary,
    fontWeight: designTokens.typography.weights.medium,
  },
  timeSlot: {
    backgroundColor: designTokens.colors.primary[600],
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.full,
    ...designTokens.shadows.xs,
  },
  timeSlotText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.inverse,
    fontWeight: designTokens.typography.weights.medium,
  },
  moreSlots: {
    backgroundColor: designTokens.colors.secondary[200],
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.full,
  },
  moreSlotsText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
  },
  aiInsight: {
    marginTop: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  aiInsightGradient: {
    padding: designTokens.spacing.md,
  },
  aiInsightTitle: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.primary[700],
  },
  aiInsightText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.primary[600],
    marginTop: designTokens.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xxxl,
  },
  emptyTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginTop: designTokens.spacing.md,
  },
  emptySubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.lg,
  },
});