import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Haptics } from 'expo-haptics';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { NotificationCard } from './NotificationCard';
import { useNotificationCarouselAnimations } from '@components/animations/NotificationCarouselAnimations';
import { TouchDelegationManager, useTouchDelegation, TouchSession, InteractionZone } from './TouchDelegationManager';
import { AccessibilityEnhancedCarousel } from './AccessibilityEnhancedCarousel';
import { NotificationData } from '../../types/notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 120;
const CAROUSEL_HEIGHT = CARD_HEIGHT + 80; // Extra space for shadows and indicators

interface NotificationCarouselProps {
  notifications: NotificationData[];
  onNotificationPress?: (notification: NotificationData) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onNotificationAction?: (notificationId: string, action: string) => void;
  onSwipeComplete?: (direction: 'next' | 'prev', currentIndex: number) => void;
  autoPlayInterval?: number; // Auto-advance interval in ms (0 to disable)
  enableHaptics?: boolean;
  showIndicators?: boolean;
  
  // Enhanced full-width touch options
  enableFullWidthTouch?: boolean; // Enable the new full-width touch system
  enableAccessibilityFeatures?: boolean; // Enable accessibility enhancements
  enableAlternativeNavigation?: boolean; // Show alternative navigation buttons
  touchSensitivity?: 'low' | 'medium' | 'high'; // Adjust touch sensitivity
  debugMode?: boolean; // Show debug overlays and information
  
  style?: any;
}

export const NotificationCarousel: React.FC<NotificationCarouselProps> = ({
  notifications,
  onNotificationPress,
  onNotificationDismiss,
  onNotificationAction,
  onSwipeComplete,
  autoPlayInterval = 0,
  enableHaptics = true,
  showIndicators = true,
  
  // Enhanced features (default to enabled for better UX)
  enableFullWidthTouch = true,
  enableAccessibilityFeatures = true,
  enableAlternativeNavigation = false, // Only show when screen reader is active
  touchSensitivity = 'medium',
  debugMode = false,
  
  style,
}) => {
  const {
    animations,
    currentIndex,
    isDragging,
    fullWidthProgress,
    interactionIntensity,
    
    // Legacy gesture handler (for backward compatibility)
    createGestureHandler,
    
    // Enhanced methods for full-width touch
    updateFromTouchSession,
    executeSwipeFromSession,
    
    // Style creators
    createCardAnimatedStyle,
    createBackgroundAnimatedStyle,
    createIndicatorAnimatedStyle,
    createSwipeIndicatorStyle,
    
    // Control methods
    animateToIndex,
  } = useNotificationCarouselAnimations(notifications.length);

  // Touch sensitivity configuration
  const getTouchConfig = useCallback(() => {
    const baseConfig = {
      low: { swipeThreshold: SCREEN_WIDTH * 0.25, velocityThreshold: 800 },
      medium: { swipeThreshold: SCREEN_WIDTH * 0.15, velocityThreshold: 600 },
      high: { swipeThreshold: SCREEN_WIDTH * 0.1, velocityThreshold: 400 },
    };
    return baseConfig[touchSensitivity];
  }, [touchSensitivity]);

  // State for touch delegation
  const [currentTouchSession, setCurrentTouchSession] = useState<TouchSession | null>(null);
  
  // Refs for interaction zones
  const cardZoneRefs = useRef<InteractionZone[]>([]);
  const registerZoneRef = useRef<((zone: InteractionZone) => () => void) | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlayInterval > 0 && notifications.length > 1) {
      const interval = setInterval(() => {
        if (!isDragging.value) {
          const nextIndex = (currentIndex.value + 1) % notifications.length;
          animateToIndex(nextIndex - currentIndex.value);
        }
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlayInterval, notifications.length, isDragging, currentIndex, animateToIndex]);

  // Enhanced touch session handlers
  useEffect(() => {
    if (enableFullWidthTouch) {
      updateFromTouchSession(currentTouchSession);
    }
  }, [currentTouchSession, enableFullWidthTouch, updateFromTouchSession]);

  // Handle full-width swipe gestures
  const handleFullWidthSwipe = useCallback((
    direction: 'left' | 'right',
    velocity: number,
    session: TouchSession
  ) => {
    if (!enableFullWidthTouch) return;
    
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Execute the swipe animation
    executeSwipeFromSession(direction, velocity, session, (logicalDirection) => {
      onSwipeComplete?.(logicalDirection, currentIndex.value);
    });
  }, [enableFullWidthTouch, enableHaptics, executeSwipeFromSession, onSwipeComplete, currentIndex]);

  // Handle card tap (both legacy and new system)
  const handleCardTap = useCallback((session?: TouchSession) => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const currentNotification = notifications[currentIndex.value];
    if (currentNotification && onNotificationPress) {
      onNotificationPress(currentNotification);
    }
  }, [enableHaptics, notifications, currentIndex, onNotificationPress]);

  // Legacy handlers (for backward compatibility)
  const handleSwipeComplete = (direction: 'next' | 'prev') => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onSwipeComplete?.(direction, currentIndex.value);
  };

  const handleCardPress = (notification: NotificationData) => {
    handleCardTap();
  };

  // Navigation handlers for accessibility
  const handlePrevious = useCallback(() => {
    if (currentIndex.value > 0) {
      animateToIndex(-1, true);
      handleSwipeComplete('prev');
    }
  }, [currentIndex, animateToIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex.value < notifications.length - 1) {
      animateToIndex(1, true);
      handleSwipeComplete('next');
    }
  }, [currentIndex, notifications.length, animateToIndex]);

  // Create gesture handler
  const gestureHandler = createGestureHandler(
    handleSwipeComplete,
    () => {
      if (notifications[currentIndex.value]) {
        handleCardPress(notifications[currentIndex.value]);
      }
    }
  );

  // Entrance animation for the entire carousel
  const carouselEntranceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(0, {
            damping: 12,
            stiffness: 100,
          }),
        },
        {
          scale: withSpring(1, {
            damping: 15,
            stiffness: 120,
          }),
        },
      ],
      opacity: withSpring(1, {
        damping: 20,
        stiffness: 100,
      }),
    };
  });

  // Background gradient that responds to interactions
  const backgroundGradientStyle = useAnimatedStyle(() => {
    const currentNotification = notifications[Math.round(currentIndex.value)];
    if (!currentNotification) return {};

    // Dynamic background based on notification type
    const getGradientColors = (type: NotificationData['type']): [string, string] => {
      switch (type) {
        case 'booking_confirmed':
          return [
            `${designTokens.colors.success[50]}40`,
            `${designTokens.colors.success[100]}20`,
          ];
        case 'booking_reminder':
          return [
            `${designTokens.colors.warning[50]}40`,
            `${designTokens.colors.warning[100]}20`,
          ];
        case 'payment_due':
          return [
            `${designTokens.colors.error[50]}40`,
            `${designTokens.colors.error[100]}20`,
          ];
        case 'friend_request':
          return [
            `${designTokens.colors.primary[50]}40`,
            `${designTokens.colors.primary[100]}20`,
          ];
        default:
          return [
            `${designTokens.colors.neutral[50]}40`,
            `${designTokens.colors.neutral[100]}20`,
          ];
      }
    };

    const [startColor, endColor] = getGradientColors(currentNotification.type);

    return {
      opacity: withSpring(isDragging.value ? 0.8 : 1),
    };
  });

  // Render individual cards
  const renderCards = () => {
    return notifications.map((notification, index) => {
      const cardAnimatedStyle = createCardAnimatedStyle(index);

      return (
        <Animated.View
          key={notification.id}
          style={[styles.cardContainer, cardAnimatedStyle]}
        >
          <NotificationCard
            {...notification}
            index={index}
            totalCards={notifications.length}
            onPress={handleCardPress}
            onDismiss={onNotificationDismiss}
            onActionPress={onNotificationAction}
          />
        </Animated.View>
      );
    });
  };

  // Render page indicators
  const renderIndicators = () => {
    if (!showIndicators || notifications.length <= 1) return null;

    return (
      <View style={styles.indicatorsContainer}>
        {notifications.map((_, index) => {
          const indicatorStyle = createIndicatorAnimatedStyle(index);
          
          return (
            <Animated.View
              key={index}
              style={[styles.indicator, indicatorStyle]}
            />
          );
        })}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <RTLText style={styles.emptyStateText}>אין התראות חדשות</RTLText>
      <RTLText style={styles.emptyStateSubtext}>
        כל ההתראות שלך יופיעו כאן
      </RTLText>
    </View>
  );

  if (notifications.length === 0) {
    return renderEmptyState();
  }

  // Generate accessibility labels for each notification
  const getAccessibilityLabels = useCallback(() => {
    return notifications.map((notification, index) => 
      `${notification.title}. ${notification.type}. התראה ${index + 1}`
    );
  }, [notifications]);

  // Render the enhanced carousel with full-width touch support
  const renderEnhancedCarousel = () => (
    <TouchDelegationManager
      onSwipeGesture={handleFullWidthSwipe}
      onCardTap={handleCardTap}
      swipeThreshold={getTouchConfig().swipeThreshold}
      velocityThreshold={getTouchConfig().velocityThreshold}
      enableHaptics={enableHaptics}
      debugMode={debugMode}
    >
      <Animated.View style={[styles.carousel, carouselEntranceStyle, style]}>
        {/* Dynamic background gradient */}
        <Animated.View style={[StyleSheet.absoluteFillObject, backgroundGradientStyle]}>
          <LinearGradient
            colors={['transparent', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Full-width swipe indicators */}
        <Animated.View style={[styles.swipeIndicator, styles.leftIndicator, createSwipeIndicatorStyle('left')]} />
        <Animated.View style={[styles.swipeIndicator, styles.rightIndicator, createSwipeIndicatorStyle('right')]} />

        {/* Cards container */}
        <Animated.View style={styles.cardsContainer}>
          <Animated.View style={[styles.cardsWrapper, createBackgroundAnimatedStyle()]}>
            {renderCards()}
          </Animated.View>
        </Animated.View>

        {/* Page indicators */}
        {renderIndicators()}

        {/* Card counter */}
        <View style={styles.counterContainer}>
          <RTLText style={styles.counterText}>
            {currentIndex.value + 1} מתוך {notifications.length}
          </RTLText>
        </View>
      </Animated.View>
    </TouchDelegationManager>
  );

  // Render legacy carousel (for backward compatibility)
  const renderLegacyCarousel = () => (
    <Animated.View style={[styles.carousel, carouselEntranceStyle, style]}>
      {/* Dynamic background gradient */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundGradientStyle]}>
        <LinearGradient
          colors={['transparent', 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Cards container with legacy gesture handling */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.cardsContainer}>
          <Animated.View style={[styles.cardsWrapper, createBackgroundAnimatedStyle()]}>
            {renderCards()}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>

      {/* Page indicators */}
      {renderIndicators()}

      {/* Card counter */}
      <View style={styles.counterContainer}>
        <RTLText style={styles.counterText}>
          {currentIndex.value + 1} מתוך {notifications.length}
        </RTLText>
      </View>
    </Animated.View>
  );

  // Main render logic
  const carouselContent = enableFullWidthTouch ? renderEnhancedCarousel() : renderLegacyCarousel();

  return enableAccessibilityFeatures ? (
    <AccessibilityEnhancedCarousel
      currentIndex={currentIndex.value}
      totalItems={notifications.length}
      onPrevious={handlePrevious}
      onNext={handleNext}
      itemLabels={getAccessibilityLabels()}
      enableVoiceOver={true}
      enableAlternativeNavigation={enableAlternativeNavigation}
      debugMode={debugMode}
    >
      {carouselContent}
    </AccessibilityEnhancedCarousel>
  ) : (
    carouselContent
  );
};

const styles = StyleSheet.create({
  carousel: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designTokens.colors.primary[400],
  },
  counterContainer: {
    position: 'absolute',
    bottom: designTokens.spacing.sm,
    alignSelf: 'center',
  },
  counterText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
    fontWeight: designTokens.typography.weights.medium,
  },
  emptyState: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.xl,
  },
  emptyStateText: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.sizes.md * 1.4,
  },
  // Full-width swipe indicators
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    width: 4,
    height: 60,
    backgroundColor: designTokens.colors.primary[500],
    borderRadius: 2,
    zIndex: 10,
    opacity: 0, // Initially hidden, shown via animation
  },
  leftIndicator: {
    left: 15,
  },
  rightIndicator: {
    right: 15,
  },
});

// Export for use in other components
export default NotificationCarousel;