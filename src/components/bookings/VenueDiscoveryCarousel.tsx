import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate,
  FadeIn,
  SlideInRight
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, VStack } from '@gluestack-ui/themed';
import { VenueCard } from './VenueCard';

interface Venue {
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
  isFeatured?: boolean;
  isTrending?: boolean;
  category: string;
}

interface VenueDiscoveryCarouselProps {
  venues: Venue[];
  nearbyVenues: Venue[];
  featuredVenues: Venue[];
  onVenuePress?: (id: string) => void;
  onQuickBook?: (id: string) => void;
  onCategoryPress?: (category: string) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'הכל', icon: 'view-grid' },
  { id: 'football', name: 'כדורגל', icon: 'soccer' },
  { id: 'basketball', name: 'כדורסל', icon: 'basketball' },
  { id: 'tennis', name: 'טניס', icon: 'tennis' },
  { id: 'padel', name: 'פאדל', icon: 'tennis-ball' },
  { id: 'volleyball', name: 'כדורעף', icon: 'volleyball' },
];

export const VenueDiscoveryCarousel: React.FC<VenueDiscoveryCarouselProps> = ({
  venues,
  nearbyVenues,
  featuredVenues,
  onVenuePress,
  onQuickBook,
  onCategoryPress,
  style,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = useSharedValue(0);

  const filteredVenues = venues.filter(venue => 
    selectedCategory === 'all' || venue.category === selectedCategory
  );

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryPress?.(categoryId);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    currentIndex.value = index;
  };

  const renderCategoryFilter = () => (
    <Animated.View entering={FadeIn} style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map((category, index) => (
          <Animated.View 
            key={category.id}
            entering={SlideInRight.delay(index * 100)}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={20}
                color={
                  selectedCategory === category.id 
                    ? designTokens.colors.text.inverse 
                    : designTokens.colors.text.secondary
                }
              />
              <RTLText 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </RTLText>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderSectionHeader = (title: string, subtitle?: string, showAll?: boolean) => (
    <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
      <VStack>
        <RTLText style={styles.sectionTitle}>{title}</RTLText>
        {subtitle && (
          <RTLText style={styles.sectionSubtitle}>{subtitle}</RTLText>
        )}
      </VStack>
      {showAll && (
        <TouchableOpacity style={styles.showAllButton}>
          <RTLText style={styles.showAllText}>הצג הכל</RTLText>
          <MaterialCommunityIcons
            name="chevron-left"
            size={16}
            color={designTokens.colors.primary[600]}
          />
        </TouchableOpacity>
      )}
    </HStack>
  );

  const renderVenueList = (venueList: Venue[], horizontal = true) => {
    if (horizontal) {
      return (
        <FlatList
          data={venueList}
          renderItem={({ item }) => (
            <VenueCard
              {...item}
              onPress={onVenuePress}
              onQuickBook={onQuickBook}
              style={styles.venueCardHorizontal}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          ItemSeparatorComponent={() => <View style={{ width: designTokens.spacing.md }} />}
        />
      );
    }

    return (
      <VStack space="md">
        {venueList.map((venue) => (
          <VenueCard
            key={venue.id}
            {...venue}
            onPress={onVenuePress}
            onQuickBook={onQuickBook}
          />
        ))}
      </VStack>
    );
  };

  const renderTrendingIndicator = () => (
    <View style={styles.trendingIndicator}>
      <MaterialCommunityIcons
        name="trending-up"
        size={16}
        color={designTokens.colors.warning[600]}
      />
      <RTLText style={styles.trendingText}>פופולרי</RTLText>
    </View>
  );

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Category Filters */}
      {renderCategoryFilter()}

      {/* Featured Venues */}
      {featuredVenues.length > 0 && (
        <VStack style={styles.section}>
          {renderSectionHeader('מובחרים', 'המגרשים הטובים ביותר באזורך', true)}
          {renderVenueList(featuredVenues)}
        </VStack>
      )}

      {/* Near You Section */}
      {nearbyVenues.length > 0 && (
        <VStack style={styles.section}>
          {renderSectionHeader('קרוב אליך', 'מגרשים במרחק של עד 5 ק"מ', true)}
          {renderVenueList(nearbyVenues)}
        </VStack>
      )}

      {/* Trending Section */}
      <VStack style={styles.section}>
        <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" space="sm">
            <RTLText style={styles.sectionTitle}>פופולריים השבוע</RTLText>
            {renderTrendingIndicator()}
          </HStack>
          <TouchableOpacity style={styles.showAllButton}>
            <RTLText style={styles.showAllText}>הצג הכל</RTLText>
            <MaterialCommunityIcons
              name="chevron-left"
              size={16}
              color={designTokens.colors.primary[600]}
            />
          </TouchableOpacity>
        </HStack>
        {renderVenueList(
          filteredVenues.filter(venue => venue.isTrending).slice(0, 5)
        )}
      </VStack>

      {/* All Venues by Category */}
      <VStack style={styles.section}>
        {renderSectionHeader(
          selectedCategory === 'all' ? 'כל המגרשים' : CATEGORIES.find(c => c.id === selectedCategory)?.name || 'מגרשים',
          `${filteredVenues.length} מגרשים זמינים`
        )}
        {renderVenueList(filteredVenues, false)}
      </VStack>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  categoryContainer: {
    paddingVertical: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.secondary,
  },
  categoryScrollContent: {
    paddingHorizontal: designTokens.spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
    marginRight: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    ...designTokens.shadows.xs,
  },
  categoryChipActive: {
    backgroundColor: designTokens.colors.primary[600],
    borderColor: designTokens.colors.primary[600],
  },
  categoryText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
    marginLeft: designTokens.spacing.xs,
  },
  categoryTextActive: {
    color: designTokens.colors.text.inverse,
  },
  section: {
    marginBottom: designTokens.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.md,
  },
  sectionTitle: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    marginTop: designTokens.spacing.xs,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showAllText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
    marginRight: designTokens.spacing.xs,
  },
  horizontalListContent: {
    paddingHorizontal: designTokens.spacing.lg,
  },
  venueCardHorizontal: {
    marginRight: 0,
  },
  trendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.warning[100],
    borderRadius: designTokens.borderRadius.full,
  },
  trendingText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.warning[700],
    fontWeight: designTokens.typography.weights.medium,
    marginLeft: designTokens.spacing.xs,
  },
  bottomSpacing: {
    height: designTokens.spacing.xxxl,
  },
});