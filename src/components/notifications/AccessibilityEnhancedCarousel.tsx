import React, { useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  AccessibilityInfo, 
  findNodeHandle,
  Dimensions,
  Platform 
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { Haptics } from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { I18nManager } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AccessibilityEnhancedCarouselProps {
  children: React.ReactNode;
  currentIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onItemFocus?: (index: number) => void;
  itemLabels?: string[]; // Accessibility labels for each item
  enableVoiceOver?: boolean;
  enableAlternativeNavigation?: boolean;
  debugMode?: boolean;
}

export const AccessibilityEnhancedCarousel: React.FC<AccessibilityEnhancedCarouselProps> = ({
  children,
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  onItemFocus,
  itemLabels = [],
  enableVoiceOver = true,
  enableAlternativeNavigation = true,
  debugMode = false,
}) => {
  // Refs for accessibility management
  const carouselRef = useRef<View>(null);
  const prevButtonRef = useRef<TouchableOpacity>(null);
  const nextButtonRef = useRef<TouchableOpacity>(null);
  
  // State for accessibility features
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = React.useState(false);
  
  // Animation values
  const buttonScale = useSharedValue(1);
  const progressIndicatorWidth = useSharedValue(0);
  
  // Check accessibility preferences
  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);
        
        if (Platform.OS === 'ios') {
          const reducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(reducedMotionEnabled);
        }
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };
    
    checkAccessibilitySettings();
    
    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    
    let reducedMotionListener: any;
    if (Platform.OS === 'ios') {
      reducedMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setIsReducedMotionEnabled
      );
    }
    
    return () => {
      screenReaderListener?.remove();
      if (Platform.OS === 'ios') {
        reducedMotionListener?.remove();
      }
    };
  }, []);
  
  // Update progress indicator
  useEffect(() => {
    const progress = totalItems > 1 ? (currentIndex / (totalItems - 1)) : 0;
    progressIndicatorWidth.value = withSpring(progress, {
      damping: 15,
      stiffness: 150,
    });
  }, [currentIndex, totalItems]);
  
  // Handle navigation with accessibility announcements
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      buttonScale.value = withSpring(0.95, { damping: 10 }, () => {
        buttonScale.value = withSpring(1);
      });
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPrevious();
      
      // Announce navigation for screen readers
      if (isScreenReaderEnabled) {
        const newIndex = currentIndex - 1;
        const announcement = I18nManager.isRTL 
          ? `עבר להתראה ${newIndex + 1} מתוך ${totalItems}`
          : `Moved to notification ${newIndex + 1} of ${totalItems}`;
        
        AccessibilityInfo.announceForAccessibility(announcement);
      }
      
      // Focus management
      if (onItemFocus) {
        onItemFocus(Math.max(0, currentIndex - 1));
      }
    }
  }, [currentIndex, totalItems, isScreenReaderEnabled, onPrevious, onItemFocus]);
  
  const handleNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      buttonScale.value = withSpring(0.95, { damping: 10 }, () => {
        buttonScale.value = withSpring(1);
      });
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onNext();
      
      // Announce navigation for screen readers
      if (isScreenReaderEnabled) {
        const newIndex = currentIndex + 1;
        const announcement = I18nManager.isRTL 
          ? `עבר להתראה ${newIndex + 1} מתוך ${totalItems}`
          : `Moved to notification ${newIndex + 1} of ${totalItems}`;
        
        AccessibilityInfo.announceForAccessibility(announcement);
      }
      
      // Focus management
      if (onItemFocus) {
        onItemFocus(Math.min(totalItems - 1, currentIndex + 1));
      }
    }
  }, [currentIndex, totalItems, isScreenReaderEnabled, onNext, onItemFocus]);
  
  // Generate accessibility label for current item
  const getCurrentItemAccessibilityLabel = useCallback(() => {
    const baseLabel = itemLabels[currentIndex] || `התראה ${currentIndex + 1}`;
    const positionLabel = `${currentIndex + 1} מתוך ${totalItems}`;
    
    return `${baseLabel}. ${positionLabel}. החלק ימינה או שמאלה להתראה הבאה או הקודמת.`;
  }, [currentIndex, totalItems, itemLabels]);
  
  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event: any) => {
    if (!enableVoiceOver) return;
    
    // Handle keyboard events for accessibility
    switch (event.nativeEvent.key) {
      case 'ArrowRight':
        if (I18nManager.isRTL) {
          handlePrevious();
        } else {
          handleNext();
        }
        break;
      case 'ArrowLeft':
        if (I18nManager.isRTL) {
          handleNext();
        } else {
          handlePrevious();
        }
        break;
      case 'Home':
        if (currentIndex !== 0) {
          onItemFocus?.(0);
        }
        break;
      case 'End':
        if (currentIndex !== totalItems - 1) {
          onItemFocus?.(totalItems - 1);
        }
        break;
    }
  }, [handlePrevious, handleNext, currentIndex, totalItems, onItemFocus]);
  
  // Animated styles
  const navigationButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const progressBarStyle = useAnimatedStyle(() => ({
    width: interpolate(
      progressIndicatorWidth.value,
      [0, 1],
      [8, SCREEN_WIDTH - 40],
      Extrapolate.CLAMP
    ),
  }));
  
  // Render navigation buttons (only if alternative navigation is enabled)
  const renderNavigationButtons = () => {
    if (!enableAlternativeNavigation || (!isScreenReaderEnabled && totalItems <= 1)) {
      return null;
    }
    
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < totalItems - 1;
    
    return (
      <View style={styles.navigationContainer}>
        <Animated.View style={navigationButtonStyle}>
          <TouchableOpacity
            ref={prevButtonRef}
            style={[
              styles.navigationButton,
              styles.prevButton,
              !canGoPrev && styles.disabledButton,
            ]}
            onPress={handlePrevious}
            disabled={!canGoPrev}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={I18nManager.isRTL ? "התראה קודמת" : "Previous notification"}
            accessibilityHint={I18nManager.isRTL 
              ? "לחץ כדי לעבור להתראה הקודמת" 
              : "Tap to go to previous notification"
            }
            accessibilityState={{ disabled: !canGoPrev }}
          >
            <MaterialCommunityIcons
              name={I18nManager.isRTL ? "chevron-right" : "chevron-left"}
              size={24}
              color={canGoPrev ? designTokens.colors.primary[600] : designTokens.colors.text.disabled}
            />
            <RTLText style={[
              styles.navigationButtonText,
              !canGoPrev && styles.disabledButtonText,
            ]}>
              קודם
            </RTLText>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={navigationButtonStyle}>
          <TouchableOpacity
            ref={nextButtonRef}
            style={[
              styles.navigationButton,
              styles.nextButton,
              !canGoNext && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!canGoNext}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={I18nManager.isRTL ? "התראה הבאה" : "Next notification"}
            accessibilityHint={I18nManager.isRTL 
              ? "לחץ כדי לעבור להתראה הבאה" 
              : "Tap to go to next notification"
            }
            accessibilityState={{ disabled: !canGoNext }}
          >
            <MaterialCommunityIcons
              name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
              size={24}
              color={canGoNext ? designTokens.colors.primary[600] : designTokens.colors.text.disabled}
            />
            <RTLText style={[
              styles.navigationButtonText,
              !canGoNext && styles.disabledButtonText,
            ]}>
              הבא
            </RTLText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      <RTLText style={styles.progressText}>
        {currentIndex + 1} / {totalItems}
      </RTLText>
    </View>
  );
  
  // Render accessibility info panel (debug mode)
  const renderAccessibilityInfo = () => {
    if (!debugMode) return null;
    
    return (
      <View style={styles.debugPanel}>
        <RTLText style={styles.debugTitle}>מידע נגישות</RTLText>
        <RTLText style={styles.debugText}>
          Screen Reader: {isScreenReaderEnabled ? 'מופעל' : 'כבוי'}
        </RTLText>
        <RTLText style={styles.debugText}>
          Reduced Motion: {isReducedMotionEnabled ? 'מופעל' : 'כבוי'}
        </RTLText>
        <RTLText style={styles.debugText}>
          Alternative Navigation: {enableAlternativeNavigation ? 'מופעל' : 'כבוי'}
        </RTLText>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Main carousel content */}
      <View
        ref={carouselRef}
        style={styles.carouselContent}
        accessible={enableVoiceOver}
        accessibilityRole="tablist"
        accessibilityLabel={getCurrentItemAccessibilityLabel()}
        onKeyPress={handleKeyboardNavigation}
      >
        {children}
      </View>
      
      {/* Progress indicator */}
      {renderProgressIndicator()}
      
      {/* Alternative navigation buttons */}
      {renderNavigationButtons()}
      
      {/* Debug panel */}
      {renderAccessibilityInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContent: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.background.primary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
    minWidth: 100,
    minHeight: 44, // Minimum touch target size
  },
  prevButton: {
    marginRight: designTokens.spacing.sm,
  },
  nextButton: {
    marginLeft: designTokens.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: designTokens.colors.background.disabled,
  },
  navigationButtonText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginHorizontal: designTokens.spacing.sm,
  },
  disabledButtonText: {
    color: designTokens.colors.text.disabled,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.background.secondary,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: designTokens.colors.border.light,
    borderRadius: 2,
    marginRight: designTokens.spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: designTokens.colors.primary[500],
    borderRadius: 2,
    minWidth: 8,
  },
  progressText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
    minWidth: 40,
    textAlign: 'center',
  },
  debugPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    zIndex: 1000,
  },
  debugTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: 'white',
    marginBottom: designTokens.spacing.sm,
  },
  debugText: {
    fontSize: designTokens.typography.sizes.sm,
    color: 'white',
    marginBottom: designTokens.spacing.xs,
  },
});

export default AccessibilityEnhancedCarousel;