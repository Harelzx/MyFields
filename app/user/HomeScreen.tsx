import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { UserProfileDropdown } from '../../components/home/UserProfileDropdown';
import { ThemeStatusBar } from '../../components/common/ThemeStatusBar';
import { RTLText } from '../../components/RTLText';
import { WoltButton } from '../../components/common/WoltButton';
import { useTheme } from '../../contexts/ThemeContext';
import { texts } from '../../constants/hebrewTexts';
import { uiTokens, rtlHelpers } from '../../constants/theme';
import { searchFields, searchGames } from '../../services/mockApi';
import { Field, Game } from '../../utils/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Responsive card sizing based on screen width
const HORIZONTAL_PADDING = 20;
const CARD_SPACING = 16;
const CARDS_PER_VIEW = 2.2; // Show 2.2 cards to indicate scrollability (wider cards)
const CARD_SIZE = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_SPACING * 2) / CARDS_PER_VIEW;
const CARD_FULL_WIDTH = CARD_SIZE + CARD_SPACING;

interface HomeScreenProps {
  navigation: any;
}

interface FieldCardProps {
  field: Field;
  index: number;
  onPress: () => void;
}

interface GameCardProps {
  game: Game;
  index: number;
  onPress: () => void;
}

interface CompactButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'outline';
  accessibilityHint?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentUser] = useState('דניאל כהן'); // TODO: Get from auth context
  const [isFirstUse, setIsFirstUse] = useState(true);
  const scrollY = useSharedValue(0);

  // Compact Button Component for navigation
  const CompactButton: React.FC<CompactButtonProps> = ({ 
    title, 
    onPress, 
    icon, 
    variant = 'outline',
    accessibilityHint 
  }) => {
    const opacity = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      opacity.value = withTiming(0.7, { duration: 100 });
    };

    const handlePressOut = () => {
      opacity.value = withTiming(1, { duration: 150 });
    };

    return (
      <AnimatedTouchable
        style={[
          styles.compactButton,
          variant === 'primary' ? {
            backgroundColor: theme.colors.primary[600],
          } : {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.border.medium,
          },
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        accessibilityLiveRegion="polite"
      >
        <View style={[styles.compactButtonContent, { flexDirection: 'row-reverse' }]}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={14} 
              color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary[600]}
              style={rtlHelpers.marginLeft(4)}
            />
          )}
          <RTLText 
            style={[
              styles.compactButtonText,
              {
                color: variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary[600],
              },
            ]}
          >
            {title}
          </RTLText>
        </View>
      </AnimatedTouchable>
    );
  };

  // Enhanced Field Card Component with RTL and Accessibility
  const FieldCard: React.FC<FieldCardProps> = ({ field, index, onPress }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.85, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    const getSportImage = (sportType: string) => {
      const sportImages: Record<string, string> = {
        'כדורגל': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&q=80',
        'טניס': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop&q=80',
        'כדורסל': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&q=80',
        'פדל': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop&q=80',
        'כדורעף': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop&q=80',
      };
      return sportImages[sportType] || sportImages['כדורגל'];
    };

    const getAvailabilityColor = () => {
      // Mock availability logic
      const availability = Math.random();
      if (availability > 0.7) return theme.colors.success[500];
      if (availability > 0.3) return theme.colors.warning[500];
      return theme.colors.error[500];
    };

    const getAvailabilityText = () => {
      const availability = Math.random();
      if (availability > 0.7) return 'זמין';
      if (availability > 0.3) return 'מוגבל';
      return 'תפוס';
    };

    return (
      <Animated.View entering={FadeInRight.delay(index * 150).springify()}>
        <TouchableOpacity
          style={[styles.fieldCard, animatedStyle, {
            backgroundColor: theme.colors.background.elevated,
            ...theme.shadows.md,
          }]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`מגרש ${field.name}, ${field.sportType}`}
        accessibilityHint={`₪${field.pricePerHour} לשעה, דירוג ${field.rating} כוכבים`}
        accessibilityState={{ selected: false }}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: getSportImage(field.sportType) }}
            style={styles.cardImage}
            resizeMode="cover"
            accessibilityRole="image"
            accessible={false}
          />
          <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor() }]}>
            <RTLText style={styles.availabilityText}>
              {getAvailabilityText()}
            </RTLText>
          </View>
        </View>
        
        <View style={[styles.cardContent, { alignItems: 'flex-start' }]}>
          <RTLText 
            style={[styles.fieldName, { color: theme.colors.text.primary }]}
          >
            {field.name}
          </RTLText>
          
          <RTLText 
            style={[styles.fieldType, { color: theme.colors.text.secondary }]}
          >
            {field.sportType}
          </RTLText>
          
          <View style={[styles.priceRow, { flexDirection: 'row-reverse' }]}>
            <RTLText style={[styles.price, { color: theme.colors.primary[600] }]}>
              ₪{field.pricePerHour}/שעה
            </RTLText>
            <View style={[styles.rating, { flexDirection: 'row-reverse' }]}>
              <Ionicons 
                name="star" 
                size={12} 
                color={theme.colors.warning[500]} 
                style={rtlHelpers.marginLeft(2)}
              />
              <RTLText style={[styles.ratingText, { color: theme.colors.text.tertiary }]}>
                {field.rating}
              </RTLText>
            </View>
          </View>
        </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Enhanced Game Card Component with Status Color Coding
  const GameCard: React.FC<GameCardProps> = ({ game, index, onPress }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.85, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    const getSportIcon = (sport: string): keyof typeof Ionicons.glyphMap => {
      const sportIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
        'כדורגל': 'football',
        'טניס': 'tennisball',
        'כדורסל': 'basketball',
        'פדל': 'tennisball',
        'כדורעף': 'american-football',
      };
      return sportIcons[sport] || 'football';
    };

    const getGameStatus = () => {
      const percentage = (game.currentPlayers / game.maxPlayers) * 100;
      if (percentage >= 90) return {
        color: theme.colors.error[500],
        text: 'כמעט מלא',
        bgColor: `${theme.colors.error[500]}15`,
      };
      if (percentage >= 70) return {
        color: theme.colors.warning[500],
        text: 'מתמלא',
        bgColor: `${theme.colors.warning[500]}15`,
      };
      return {
        color: theme.colors.success[500],
        text: 'פתוח',
        bgColor: `${theme.colors.success[500]}15`,
      };
    };

    const gameStatus = getGameStatus();

    return (
      <Animated.View entering={FadeInRight.delay(index * 150 + 300).springify()}>
        <TouchableOpacity
          style={[styles.gameCard, animatedStyle, {
            backgroundColor: theme.colors.background.elevated,
            ...theme.shadows.md,
            borderRightWidth: 3,
            borderRightColor: gameStatus.color,
          }]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`משחק ${game.sport}, ${game.time}`}
        accessibilityHint={`ב${game.fieldName}, ${game.currentPlayers} מתוך ${game.maxPlayers} שחקנים`}
        accessibilityState={{ selected: false }}
      >
        <View style={[styles.gameHeader, { alignItems: 'flex-start' }]}>
          <View style={[styles.sportIconContainer, { backgroundColor: gameStatus.bgColor }]}>
            <Ionicons 
              name={getSportIcon(game.sport)} 
              size={28} 
              color={gameStatus.color}
              accessible={false}
            />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: gameStatus.bgColor }]}>
            <RTLText style={[styles.statusText, { color: gameStatus.color }]}>
              {gameStatus.text}
            </RTLText>
          </View>
        </View>
        
        <View style={[styles.cardContent, { alignItems: 'flex-start' }]}>
          <RTLText 
            style={[styles.gameSport, { color: theme.colors.text.primary }]}
          >
            {game.sport}
          </RTLText>
          
          <RTLText 
            style={[styles.gameTime, { color: theme.colors.text.secondary }]}
          >
            {game.time}
          </RTLText>
          
          <RTLText 
            style={[styles.gameLocation, { color: theme.colors.text.tertiary }]}
          >
            {game.fieldName}
          </RTLText>
          
          <View style={[styles.playersInfo, { flexDirection: 'row-reverse' }]}>
            <Ionicons 
              name="people" 
              size={14} 
              color={gameStatus.color}
              style={rtlHelpers.marginLeft(4)}
              accessible={false}
            />
            <RTLText style={[styles.playersText, { color: gameStatus.color }]}>
              {game.currentPlayers}/{game.maxPlayers}
            </RTLText>
          </View>
        </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Load data on component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const [fieldsResponse, gamesResponse] = await Promise.all([
        searchFields(),
        searchGames()
      ]);
      
      if (fieldsResponse.success && fieldsResponse.data) {
        setFields(fieldsResponse.data.slice(0, 3));
      }
      
      if (gamesResponse.success && gamesResponse.data) {
        setGames(gamesResponse.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldPress = (field: Field) => {
    console.log('Field pressed:', field.id);
    // TODO: Navigate to field details screen
  };

  const handleGamePress = (game: Game) => {
    console.log('Game pressed:', game.id);
    // TODO: Navigate to game details screen
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
    // TODO: Navigate to profile screen
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    // TODO: Navigate to settings screen
  };

  const handleLogoutPress = () => {
    console.log('Logout pressed');
    // TODO: Implement logout
  };

  const handleViewAllFields = () => {
    console.log('View all fields');
    // TODO: Navigate to field booking page
  };

  const handleViewAllGames = () => {
    console.log('View all games');
    // TODO: Navigate to join games page
  };

  return (
    <>
      <ThemeStatusBar />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: uiTokens.navigation.height + insets.bottom + 20 } // Dynamic bottom padding
          ]}
        >
          <View style={styles.content}>
            {/* Welcome Message with Profile Dropdown */}
            <Animated.View 
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.welcomeSection}
            >
              {/* Profile Dropdown at top right */}
              <View style={styles.profileHeader}>
                <UserProfileDropdown
                  username={currentUser}
                  onProfilePress={handleProfilePress}
                  onSettingsPress={handleSettingsPress}
                  onLogoutPress={handleLogoutPress}
                />
              </View>
              
              <RTLText style={[styles.greeting, { color: theme.colors.text.primary }]}>
                {texts.home.goodMorning},
              </RTLText>
              <RTLText style={[styles.userName, { color: theme.colors.text.primary }]}>
                {currentUser}
              </RTLText>
              <RTLText style={[styles.subtitle, { color: theme.colors.text.tertiary }]}>
                מה תרצה לעשות היום?
              </RTLText>
            </Animated.View>

            {/* Join Games Section */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { alignItems: 'flex-start' }]}>
                <RTLText 
                  style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
                  accessibilityRole="header"
                >
                  הצטרף למשחק
                </RTLText>
                <CompactButton
                  title="הצטרף למשחק"
                  onPress={handleViewAllGames}
                  icon="people-outline"
                  variant="outline"
                  accessibilityHint="עבור לעמוד הצטרפות למשחקים"
                />
              </View>
              
              {/* Section divider */}
              <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border.light }]} />
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_FULL_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.cardsContainer}
                style={[styles.horizontalScroll, { flexDirection: 'row-reverse' }]}
                accessibilityLabel="רשימת משחקים זמינים"
              >
                {games.map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    index={index}
                    onPress={() => handleGamePress(game)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Nearby Fields Section */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { alignItems: 'flex-start' }]}>
                <RTLText 
                  style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
                  accessibilityRole="header"
                >
                  מגרשים בקרבתך
                </RTLText>
                <CompactButton
                  title="הזמן מגרש"
                  onPress={handleViewAllFields}
                  icon="add-outline"
                  variant="outline"
                  accessibilityHint="עבור לעמוד הזמנת מגרשים"
                />
              </View>
              
              {/* Section divider */}
              <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border.light }]} />
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_FULL_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.cardsContainer}
                style={[styles.horizontalScroll, { flexDirection: 'row-reverse' }]}
                accessibilityLabel="רשימת מגרשים זמינים"
              >
                {fields.map((field, index) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    onPress={() => handleFieldPress(field)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Dynamic padding for overlaid tab bar based on safe area insets
    paddingBottom: uiTokens.navigation.height + 20, // Base space + extra margin
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    alignItems: 'flex-end', // RTL alignment
    position: 'relative',
  },
  welcomeSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 32, // Increased spacing
    marginTop: 8, // Minimal top margin
    paddingTop: 8, // Small padding for breathing room
    alignItems: 'flex-start', // TESTING: flex-start might be visual right in RTL mode
  },
  profileHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10, // Lower than dropdown zIndex (1000)
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: 'inherit', // Will be overridden by inline style
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 40, // Increased spacing between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Push items to opposite ends
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    // Removed flex: 1 so title doesn't stretch
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 16,
    opacity: 0.3,
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32, // Compact size
    justifyContent: 'center',
    minWidth: 48, // Accessibility minimum
  },
  compactButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButtonText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  cardsContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_SPACING,
  },
  fieldCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: CARD_SPACING / 2,
  },
  gameCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: CARD_SPACING / 2,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: Math.round(CARD_SIZE * 0.45), // 45% of card height
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  fieldType: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  priceRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
  },
  rating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
  },
  gameHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  gameSport: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  gameTime: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 16,
  },
  gameLocation: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  playersInfo: {
    alignItems: 'center',
    marginTop: 6,
  },
  playersText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;