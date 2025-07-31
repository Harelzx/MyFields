import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent,
  HandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Haptics } from 'expo-haptics';
import { I18nManager } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullWidthTouchOverlayProps {
  children: React.ReactNode;
  onSwipe: (direction: 'next' | 'prev', velocity: number) => void;
  onCardPress?: () => void;
  enableHaptics?: boolean;
  swipeThreshold?: number;
  velocityThreshold?: number;
  disabled?: boolean;
  debugMode?: boolean;
}

interface TouchInteractionState {
  isInteractingWithCard: boolean;
  initialTouchPosition: { x: number; y: number };
  swipeStartTime: number;
  touchIdentifier: string;
}

export const FullWidthTouchOverlay: React.FC<FullWidthTouchOverlayProps> = ({
  children,
  onSwipe,
  onCardPress,
  enableHaptics = true,
  swipeThreshold = SCREEN_WIDTH * 0.2, // 20% of screen width
  velocityThreshold = 800,
  disabled = false,
  debugMode = false,
}) => {
  // Refs for gesture handlers
  const panRef = useRef(null);
  const tapRef = useRef(null);

  // Shared values for animations and state
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const gestureVelocity = useSharedValue(0);
  const touchStartX = useSharedValue(0);
  const touchStartY = useSharedValue(0);
  const touchStartTime = useSharedValue(0);

  // Track interaction state
  const interactionState = useRef<TouchInteractionState>({
    isInteractingWithCard: false,
    initialTouchPosition: { x: 0, y: 0 },
    swipeStartTime: 0,
    touchIdentifier: '',
  });

  // RTL-aware direction mapping
  const mapGestureToDirection = useCallback((translationX: number): 'next' | 'prev' => {
    const rtlMultiplier = I18nManager.isRTL ? -1 : 1;
    const adjustedTranslation = translationX * rtlMultiplier;
    return adjustedTranslation > 0 ? 'next' : 'prev';
  }, []);

  // Enhanced swipe validation
  const isValidSwipeGesture = useCallback((
    translationX: number,
    translationY: number,
    velocityX: number,
    duration: number
  ): boolean => {
    const horizontalDistance = Math.abs(translationX);
    const verticalDistance = Math.abs(translationY);
    const horizontalVelocity = Math.abs(velocityX);

    // Horizontal dominance check (prevent accidental vertical scrolls from triggering swipes)
    const isHorizontallyDominant = horizontalDistance > verticalDistance * 1.5;
    
    // Distance or velocity threshold check
    const meetsDistanceThreshold = horizontalDistance > swipeThreshold;
    const meetsVelocityThreshold = horizontalVelocity > velocityThreshold;
    
    // Minimum duration to prevent accidental taps
    const isValidDuration = duration > 100;
    
    // Prevent very slow drags from being considered swipes
    const hasReasonableSpeed = horizontalVelocity > 200 || horizontalDistance > swipeThreshold * 1.5;

    return isHorizontallyDominant && 
           (meetsDistanceThreshold || meetsVelocityThreshold) && 
           isValidDuration && 
           hasReasonableSpeed;
  }, [swipeThreshold, velocityThreshold]);

  // Haptic feedback handler
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    if (!enableHaptics) return;
    
    const feedbackMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    
    Haptics.impactAsync(feedbackMap[intensity]);
  }, [enableHaptics]);

  // Pan gesture handler with enhanced logic
  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (event) => {
      if (disabled) return;
      
      isGestureActive.value = true;
      touchStartX.value = event.x;
      touchStartY.value = event.y;
      touchStartTime.value = Date.now();
      
      // Store initial touch state
      runOnJS(() => {
        interactionState.current = {
          isInteractingWithCard: false,
          initialTouchPosition: { x: event.x, y: event.y },
          swipeStartTime: Date.now(),
          touchIdentifier: `gesture_${Date.now()}`,
        };
      })();
      
      // Light haptic for gesture start
      runOnJS(triggerHapticFeedback)('light');
    },

    onActive: (event) => {
      if (disabled) return;
      
      translateX.value = event.translationX;
      gestureVelocity.value = event.velocityX;
      
      // Provide real-time visual feedback
      const progress = Math.abs(event.translationX) / swipeThreshold;
      const dampedProgress = Math.min(progress, 1);
      
      // Optional: Add subtle resistance at boundaries
      if (Math.abs(event.translationX) > swipeThreshold * 2) {
        translateX.value = event.translationX > 0 
          ? swipeThreshold * 2 + (event.translationX - swipeThreshold * 2) * 0.3
          : -swipeThreshold * 2 + (event.translationX + swipeThreshold * 2) * 0.3;
      }
    },

    onEnd: (event) => {
      if (disabled) return;
      
      isGestureActive.value = false;
      const duration = Date.now() - touchStartTime.value;
      
      const isValidSwipe = runOnJS(isValidSwipeGesture)(
        event.translationX,
        event.translationY,
        event.velocityX,
        duration
      );
      
      if (isValidSwipe) {
        const direction = runOnJS(mapGestureToDirection)(event.translationX);
        
        // Strong haptic for successful swipe
        runOnJS(triggerHapticFeedback)('medium');
        
        // Execute swipe callback
        runOnJS(onSwipe)(direction, Math.abs(event.velocityX));
        
        // Animate to completion
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 300,
          velocity: event.velocityX,
        });
      } else {
        // Snap back with elastic feel
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 400,
        });
        
        // Check if this might have been intended as a card tap
        const tapDistance = Math.sqrt(
          Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
        );
        
        if (tapDistance < 20 && duration < 500) {
          // This looks like a tap that was slightly off
          runOnJS(triggerHapticFeedback)('light');
          if (onCardPress) {
            runOnJS(onCardPress)();
          }
        }
      }
      
      // Reset interaction state
      runOnJS(() => {
        interactionState.current = {
          isInteractingWithCard: false,
          initialTouchPosition: { x: 0, y: 0 },
          swipeStartTime: 0,
          touchIdentifier: '',
        };
      })();
    },
  });

  // Tap gesture handler for card interactions
  const tapGestureHandler = useCallback((event: HandlerStateChangeEvent<TapGestureHandlerGestureEvent>) => {
    if (disabled) return;
    
    if (event.nativeEvent.state === State.ACTIVE) {
      triggerHapticFeedback('light');
      if (onCardPress) {
        onCardPress();
      }
    }
  }, [disabled, triggerHapticFeedback, onCardPress]);

  // Animated style for the overlay (for debug visualization)
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = debugMode ? 0.1 : 0;
    const scale = isGestureActive.value ? 1.02 : 1;
    
    return {
      opacity: withSpring(opacity),
      transform: [
        { scale: withSpring(scale) },
        { translateX: translateX.value * 0.05 }, // Subtle parallax effect
      ],
    };
  });

  // Progress indicator style (for visual feedback during swipe)
  const progressIndicatorStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateX.value) / swipeThreshold;
    const cappedProgress = Math.min(progress, 1);
    
    return {
      opacity: isGestureActive.value ? cappedProgress * 0.3 : 0,
      transform: [
        { scaleX: cappedProgress },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Full-width touch detection overlay */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={panGestureHandler}
        onHandlerStateChange={panGestureHandler}
        activeOffsetX={[-10, 10]} // Horizontal activation threshold
        failOffsetY={[-50, 50]} // Fail if vertical movement is too large
        simultaneousHandlers={[tapRef]}
        enableTrackpadTwoFingerGesture={false}
        minPointers={1}
        maxPointers={1}
      >
        <TapGestureHandler
          ref={tapRef}
          onHandlerStateChange={tapGestureHandler}
          numberOfTaps={1}
          maxDist={20} // Maximum distance for tap recognition
          simultaneousHandlers={[panRef]}
        >
          <Animated.View style={[styles.touchOverlay, overlayAnimatedStyle]}>
            {/* Content container */}
            <View style={styles.contentContainer}>
              {children}
            </View>
            
            {/* Progress indicators (optional visual feedback) */}
            <Animated.View style={[styles.progressIndicator, styles.progressLeft, progressIndicatorStyle]} />
            <Animated.View style={[styles.progressIndicator, styles.progressRight, progressIndicatorStyle]} />
            
            {/* Debug overlay */}
            {debugMode && (
              <View style={styles.debugOverlay}>
                <View style={styles.debugGrid}>
                  {/* Grid lines for touch area visualization */}
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={[styles.debugLine, { left: (i + 1) * (SCREEN_WIDTH / 6) }]} />
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </TapGestureHandler>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  touchOverlay: {
    flex: 1,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIndicator: {
    position: 'absolute',
    top: '50%',
    width: 4,
    height: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    borderRadius: 2,
    transformOrigin: 'center',
  },
  progressLeft: {
    left: 20,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  progressRight: {
    right: 20,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  debugOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    pointerEvents: 'none',
  },
  debugGrid: {
    flex: 1,
    position: 'relative',
  },
  debugLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
});

export default FullWidthTouchOverlay;