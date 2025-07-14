import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RTLText } from '../../components/RTLText';
import { ThemeStatusBar } from '../../components/common/ThemeStatusBar';
import { useTheme } from '../../contexts/ThemeContext';
import { uiTokens, rtlHelpers } from '../../constants/theme';
import { texts } from '../../constants/hebrewTexts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GRID_PADDING = 16; // designTokens.spacing.lg
const GRID_GAP = 12; // designTokens.spacing.md
// Balanced responsive grid: 2 columns with proper spacing for readability
const CARD_SIZE = Math.max(
  (screenWidth - GRID_PADDING * 3) / 2, // ~140px for optimal balance
  140 // Minimum size for accessibility and readability
);

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MenuScreenProps {
  navigation: any;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  description?: string;
  color?: string;
  badge?: string;
  accessibilityHint?: string;
}

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

interface ThemeToggleProps {
  onToggle: () => void;
  currentMode: 'light' | 'dark';
}

const MenuScreen: React.FC<MenuScreenProps> = ({ navigation }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check for first-time usage
  useEffect(() => {
    // TODO: Check AsyncStorage for first-time flag
    setTimeout(() => setIsFirstTime(false), 3000);
  }, []);

  // Enhanced Menu Card Component with Accessibility
  const MenuCard: React.FC<MenuCardProps> = ({ item, index }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }); // Subtle scale for feedback
      opacity.value = withTiming(0.9, { duration: 100 }); // Gentle opacity fade
      translateY.value = withSpring(-2, { damping: 15, stiffness: 300 }); // Subtle lift effect
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    };

    const getCardColor = () => {
      if (item.color) return item.color;
      const colors = [
        theme.colors.primary[600],
        theme.colors.success[600],
        theme.colors.warning[600],
        theme.colors.info[600],
        theme.colors.error[500],
        theme.colors.secondary[600],
      ];
      return colors[index % colors.length];
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 120).springify()}>
        <TouchableOpacity
          style={[
            styles.menuCard,
            animatedStyle,
            {
              backgroundColor: theme.colors.background.elevated,
              borderColor: theme.colors.border.light, // Subtle border for separation
              shadowColor: theme.colors.text.primary,
            },
          ]}
          onPress={item.onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityHint={item.accessibilityHint || item.description}
        accessibilityState={{ selected: false }}
      >
        {/* Badge for notifications/new features */}
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error[500] }]}>
            <RTLText style={styles.badgeText}>{item.badge}</RTLText>
          </View>
        )}
        
        {/* Centered card structure with prominent icon */}
        <View style={[styles.cardContainer, { alignItems: 'center' }]}>
          {/* Icon positioned at top-center with enhanced visibility */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getCardColor()}15` },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={36} // Larger icon for better recognition and visual impact
              color={getCardColor()}
              accessible={false}
            />
          </View>
          
          {/* Text content centered with clear hierarchy */}
          <View style={[styles.textContainer, { alignItems: 'center' }]}>
            <RTLText
              center
              style={[
                styles.cardTitle, 
                { color: theme.colors.text.primary }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </RTLText>
            
            {item.description && (
              <RTLText
                center
                style={[
                  styles.cardDescription, 
                  { color: theme.colors.text.secondary }
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.description}
              </RTLText>
            )}
          </View>
        </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Theme Toggle Component
  const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle, currentMode }) => {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      rotation.value = withSpring(360, { damping: 15, stiffness: 200 });
      
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        rotation.value = withSpring(0, { damping: 15, stiffness: 200 });
      }, 200);
      
      onToggle();
    };

    return (
      <AnimatedTouchable
        style={[
          styles.themeToggle,
          animatedStyle,
          {
            backgroundColor: theme.colors.background.elevated,
            shadowColor: theme.colors.text.primary,
            ...theme.shadows.sm,
          },
        ]}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`עבור ל${currentMode === 'dark' ? 'מצב יום' : 'מצב לילה'}`}
        accessibilityHint="מחליף בין מצב יום ולילה"
      >
        <View style={[styles.themeToggleContent, rtlHelpers.flexDirection]}>
          <Ionicons
            name={currentMode === 'dark' ? 'sunny' : 'moon'}
            size={20}
            color={theme.colors.primary[600]}
            style={rtlHelpers.marginLeft(8)}
          />
          <RTLText
            style={[
              styles.themeToggleText,
              { color: theme.colors.text.primary }
            ]}
          >
            {currentMode === 'dark' ? 'מצב יום' : 'מצב לילה'}
          </RTLText>
        </View>
      </AnimatedTouchable>
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'tournaments',
      title: 'טורנירים',
      icon: 'trophy-outline',
      description: 'הצטרף לטורנירים וזכה בפרסים',
      color: theme.colors.warning[600],
      // Removed badge for cleaner compact layout
      accessibilityHint: 'עבור לעמוד הטורנירים',
      onPress: () => {
        console.log('Navigate to tournaments');
        // TODO: Navigate to tournaments screen
      },
    },
    {
      id: 'join-game',
      title: 'הצטרפות למשחק',
      icon: 'people-outline',
      description: 'מצא משחקים פתוחים בקרבתך',
      color: theme.colors.success[600],
      accessibilityHint: 'עבור לעמוד הצטרפות למשחקים',
      onPress: () => {
        console.log('Navigate to join games');
        // TODO: Navigate to join games screen
      },
    },
    {
      id: 'book-field',
      title: 'הזמנת מגרש',
      icon: 'location-outline',
      description: 'הזמן מגרש ספורט בקרבתך',
      color: theme.colors.primary[600],
      accessibilityHint: 'עבור לעמוד הזמנת מגרשים',
      onPress: () => {
        console.log('Navigate to book field');
        // TODO: Navigate to book field screen
      },
    },
    {
      id: 'friends',
      title: 'חברים',
      icon: 'heart-outline',
      description: 'נהל את רשימת החברים שלך',
      color: theme.colors.error[500],
      accessibilityHint: 'עבור לעמוד החברים',
      onPress: () => {
        navigation.navigate('Friends');
      },
    },
    {
      id: 'profile',
      title: 'פרופיל אישי',
      icon: 'person-outline',
      description: 'ערוך את הפרטים האישיים שלך',
      color: theme.colors.info[600],
      accessibilityHint: 'ערוך את הפרופיל האישי',
      onPress: () => {
        console.log('Navigate to profile');
        // TODO: Navigate to profile screen
      },
    },
    {
      id: 'settings',
      title: 'הגדרות',
      icon: 'settings-outline',
      description: 'התאם את האפליקציה לטעמך',
      color: theme.colors.secondary[600],
      accessibilityHint: 'עבור לעמוד ההגדרות',
      onPress: () => {
        console.log('Navigate to settings');
        // TODO: Navigate to settings screen
      },
    },
  ];

  // Grid view helper
  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < menuItems.length; i += 2) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          <MenuCard item={menuItems[i]} index={i} />
          {menuItems[i + 1] && <MenuCard item={menuItems[i + 1]} index={i + 1} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <>
      <ThemeStatusBar />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: uiTokens.navigation.height + insets.bottom + 40 } // Dynamic bottom padding
          ]}
          accessibilityLabel="תפריט ראשי"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={[styles.header, { alignItems: 'flex-start' }]}
          >
            <RTLText
              style={[
                styles.pageTitle, 
                { color: theme.colors.text.primary }
              ]}
              accessibilityRole="header"
            >
              {texts.tabs.menu || 'תפריט'}
            </RTLText>
            <RTLText
              style={[
                styles.pageSubtitle, 
                { color: theme.colors.text.tertiary }
              ]}
            >
              בחר את הפעולה שתרצה לבצע
            </RTLText>
          </Animated.View>

          {/* Header divider */}
          <View style={[styles.headerDivider, { backgroundColor: theme.colors.border.light }]} />

          {/* Menu Grid */}
          <View style={styles.menuGrid}>
            {renderGrid()}
          </View>

          {/* Divider before theme toggle */}
          <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border.light }]} />

          {/* Theme Toggle */}
          <Animated.View
            entering={FadeInDown.delay(800).springify()}
            style={styles.themeToggleContainer}
          >
            <ThemeToggle onToggle={toggleTheme} currentMode={themeMode} />
          </Animated.View>

          {/* First-time user tooltip */}
          {isFirstTime && (
            <Animated.View
              entering={FadeInDown.delay(1000)}
              style={[
                styles.tooltip,
                {
                  backgroundColor: theme.colors.primary[50],
                  borderColor: theme.colors.primary[200],
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={16}
                color={theme.colors.primary[600]}
                style={rtlHelpers.marginLeft(8)}
              />
              <RTLText
                style={[
                  styles.tooltipText,
                  { color: theme.colors.primary[600] }
                ]}
              >
                טיפ: לחץ על כל כרטיס לגשת לתכונה
              </RTLText>
            </Animated.View>
          )}
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
    paddingBottom: uiTokens.navigation.height + 40, // Space for overlaid tab bar + extra margin for accessibility
  },
  header: {
    padding: GRID_PADDING,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 36,
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerDivider: {
    height: 1,
    marginHorizontal: GRID_PADDING,
    marginBottom: 24,
    opacity: 0.3,
  },
  menuGrid: {
    paddingHorizontal: GRID_PADDING,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
    gap: GRID_GAP, // Add gap for consistent spacing
  },
  menuCard: {
    width: CARD_SIZE,
    height: CARD_SIZE, // Perfect square (~140x140px)
    borderRadius: 16, // Comfortable rounded corners
    padding: 12, // designTokens.spacing.md - proper breathing room
    justifyContent: 'flex-start', // Align content to top for RTL flow
    minHeight: 48, // Accessibility minimum
    position: 'relative',
    // Enhanced visual separation and affordance
    borderWidth: 1,
    borderColor: 'transparent', // Will be set dynamically
    // Improved shadows for better depth perception
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8, // Note: left for RTL
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'space-between', // Better distribution of content
    alignItems: 'center', // Center alignment for balanced layout
  },
  iconContainer: {
    width: 56, // Larger container for 36px icons with proper breathing room
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // Center icon horizontally
  },
  textContainer: {
    alignItems: 'center', // Center-align text for balanced layout
    justifyContent: 'flex-end', // Anchor text to bottom
    gap: 4, // designTokens.spacing.xs - proper spacing between title and description
    width: '100%', // Ensure full width for proper centering
  },
  cardTitle: {
    fontSize: 16, // designTokens.typography.sizes.md - readable and accessible
    fontWeight: '700', // Bold for clear hierarchy
    lineHeight: 20, // Comfortable lineHeight (1.25) for readability
    // RTL text alignment handled by RTLText component
  },
  cardDescription: {
    fontSize: 12, // designTokens.typography.sizes.xs - compact but readable
    lineHeight: 16, // lineHeight (1.33) for good readability
    opacity: 0.7, // Clear hierarchy while maintaining readability
    // RTL text alignment handled by RTLText component
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: GRID_PADDING,
    marginVertical: 24,
    opacity: 0.3,
  },
  themeToggleContainer: {
    paddingHorizontal: GRID_PADDING,
    marginTop: 8,
  },
  themeToggle: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minHeight: 48, // Accessibility minimum
  },
  themeToggleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  tooltip: {
    margin: GRID_PADDING,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});

export default MenuScreen;