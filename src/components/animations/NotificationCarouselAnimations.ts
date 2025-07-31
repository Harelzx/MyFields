import { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  useDerivedValue,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Dimensions, I18nManager } from 'react-native';
import { CarouselAnimationConfig, CardTransform, AnimationState } from '../../types/notifications';
import { Haptics } from 'expo-haptics';
import { TouchSession } from '../notifications/TouchDelegationManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 120;

// Enhanced RTL-aware animation configuration with full-width support
export const getAnimationConfig = (): CarouselAnimationConfig => ({
  springConfig: {
    damping: 15,
    stiffness: 120,
    mass: 1,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  // Full-width optimized thresholds
  swipeThreshold: SCREEN_WIDTH * 0.15, // 15% of screen width (reduced from card-based)
  velocityThreshold: 600, // Reduced for better sensitivity across full width
  scaleOnPress: 0.98, // Gentler scaling for full-width interactions
  maxRotation: 6, // Reduced for more subtle effect
  depthOffset: 15, // Slightly reduced depth
  opacityRange: [0.5, 1], // Improved visibility range
  rtlMultiplier: I18nManager.isRTL ? -1 : 1,
  naturalSwipeDirection: I18nManager.isRTL ? 'left' : 'right',
});

export class NotificationCarouselAnimations {
  private config: CarouselAnimationConfig;
  private cardCount: number;
  
  // Animation values
  public translateX = useSharedValue(0);
  public dragOffset = useSharedValue(0);
  public isDragging = useSharedValue(false);
  public currentIndex = useSharedValue(0);
  public velocity = useSharedValue(0);
  
  // Visual effects
  public cardScale = useSharedValue(1);
  public backgroundOpacity = useSharedValue(1);
  
  // Full-width interaction values
  public fullWidthProgress = useSharedValue(0);
  public interactionIntensity = useSharedValue(0);
  public gestureDirection = useSharedValue(0); // -1 for left/prev, 1 for right/next

  constructor(cardCount: number) {
    this.config = getAnimationConfig();
    this.cardCount = cardCount;
  }

  /**
   * RTL-aware direction mapping
   * In Hebrew/RTL: swipe left = next (natural thumb movement)
   * In English/LTR: swipe right = next
   */
  private mapGestureToDirection(gestureTranslationX: number): number {
    return gestureTranslationX * this.config.rtlMultiplier;
  }

  /**
   * Calculate card position with RTL awareness
   */
  private getCardPosition(index: number, currentIndex: number, offset: number): number {
    const basePosition = (index - currentIndex) * CARD_WIDTH;
    const rtlAdjustedOffset = offset * this.config.rtlMultiplier;
    return basePosition + rtlAdjustedOffset;
  }

  /**
   * Handle full-width touch session updates
   */
  public updateFromTouchSession = (session: TouchSession | null) => {
    'worklet';
    
    if (!session || !session.isActive) {
      // Reset interaction values
      this.fullWidthProgress.value = withSpring(0);
      this.interactionIntensity.value = withSpring(0);
      this.gestureDirection.value = 0;
      this.isDragging.value = false;
      return;
    }

    const deltaX = session.currentPoint.x - session.startPoint.x;
    const deltaY = session.currentPoint.y - session.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calculate progress (0-1) based on swipe distance
    const progress = Math.min(Math.abs(deltaX) / this.config.swipeThreshold, 1);
    this.fullWidthProgress.value = progress;
    
    // Calculate interaction intensity based on confidence and velocity
    const baseIntensity = session.confidence * progress;
    const velocityBoost = Math.min(distance / 200, 0.3); // Add velocity-based intensity
    this.interactionIntensity.value = Math.min(baseIntensity + velocityBoost, 1);
    
    // Set gesture direction for RTL awareness
    if (Math.abs(deltaX) > 10) {
      const rawDirection = deltaX > 0 ? 1 : -1;
      this.gestureDirection.value = rawDirection * this.config.rtlMultiplier;
    }
    
    // Update dragging state
    this.isDragging.value = session.interactionType === 'swipe' && session.confidence > 0.5;
    
    // Update drag offset for card positioning
    if (session.interactionType === 'swipe') {
      this.dragOffset.value = deltaX * this.config.rtlMultiplier;
    }
  };

  /**
   * Execute swipe animation from touch session
   */
  public executeSwipeFromSession = (
    direction: 'left' | 'right', 
    velocity: number, 
    session: TouchSession,
    onComplete?: (direction: 'next' | 'prev') => void
  ) => {
    'worklet';
    
    // Map screen direction to logical direction (accounting for RTL)
    const logicalDirection = this.mapScreenDirectionToLogical(direction);
    const indexDelta = logicalDirection === 'next' ? 1 : -1;
    
    // Enhanced animation with session context
    const springConfig = {
      ...this.config.springConfig,
      damping: Math.max(12, 20 - (velocity / 100)), // Dynamic damping based on velocity
      stiffness: Math.min(150, 100 + (velocity / 10)), // Dynamic stiffness
    };
    
    // Execute the swipe
    this.animateToIndex(indexDelta, true, springConfig);
    
    // Enhanced visual feedback
    this.fullWidthProgress.value = withSequence(
      withSpring(1, { damping: 10, stiffness: 200 }),
      withDelay(100, withSpring(0, springConfig))
    );
    
    if (onComplete) {
      runOnJS(onComplete)(logicalDirection);
    }
  };

  /**
   * Map screen-based direction to logical direction (accounting for RTL)
   */
  private mapScreenDirectionToLogical = (screenDirection: 'left' | 'right'): 'next' | 'prev' => {
    'worklet';
    
    if (I18nManager.isRTL) {
      // In RTL: left swipe = next, right swipe = prev
      return screenDirection === 'left' ? 'next' : 'prev';
    } else {
      // In LTR: right swipe = next, left swipe = prev
      return screenDirection === 'right' ? 'next' : 'prev';
    }
  };

  /**
   * Advanced card transform calculation with depth and physics
   */
  public getCardTransform = (cardIndex: number): CardTransform => {
    'worklet';
    
    const currentIdx = this.currentIndex.value;
    const offset = this.dragOffset.value;
    
    // Base position calculation
    const position = this.getCardPosition(cardIndex, currentIdx, offset);
    const normalizedPosition = position / CARD_WIDTH;
    
    // Distance from center (0 = center card, ±1 = adjacent cards)
    const distanceFromCenter = Math.abs(normalizedPosition);
    
    // Scale effect: center card is largest, others shrink
    const scale = interpolate(
      distanceFromCenter,
      [0, 1, 2],
      [1, 0.9, 0.8],
      Extrapolate.CLAMP
    );
    
    // Rotation effect: subtle 3D feel
    const rotation = interpolate(
      normalizedPosition,
      [-2, -1, 0, 1, 2],
      [
        -this.config.maxRotation * 0.5,
        -this.config.maxRotation,
        0,
        this.config.maxRotation,
        this.config.maxRotation * 0.5
      ],
      Extrapolate.CLAMP
    );
    
    // Opacity: fade out distant cards
    const opacity = interpolate(
      distanceFromCenter,
      [0, 1, 2],
      [this.config.opacityRange[1], 0.7, this.config.opacityRange[0]],
      Extrapolate.CLAMP
    );
    
    // Depth effect: move cards back/forward
    const translateY = interpolate(
      distanceFromCenter,
      [0, 1, 2],
      [0, this.config.depthOffset * 0.5, this.config.depthOffset],
      Extrapolate.CLAMP
    );
    
    // Z-index for proper layering
    const zIndex = Math.max(0, 100 - Math.floor(distanceFromCenter * 10));
    
    return {
      translateX: position,
      translateY,
      scale: scale * this.cardScale.value,
      opacity,
      rotation,
      zIndex,
    };
  };

  /**
   * Gesture handler with RTL awareness and haptic feedback
   */
  public createGestureHandler = (
    onSwipeComplete: (direction: 'next' | 'prev') => void,
    onCardPress: () => void
  ) => {
    return useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (event) => {
        this.isDragging.value = true;
        this.cardScale.value = withSpring(this.config.scaleOnPress);
        
        // Haptic feedback for interaction start
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      },
      
      onActive: (event) => {
        // Map gesture to RTL-aware offset
        const mappedTranslation = this.mapGestureToDirection(event.translationX);
        this.dragOffset.value = mappedTranslation;
        this.velocity.value = event.velocityX;
        
        // Real-time visual feedback during drag
        const progress = Math.abs(mappedTranslation) / CARD_WIDTH;
        this.backgroundOpacity.value = interpolate(
          progress,
          [0, 0.5, 1],
          [1, 0.95, 0.9],
          Extrapolate.CLAMP
        );
      },
      
      onEnd: (event) => {
        this.isDragging.value = false;
        this.cardScale.value = withSpring(1);
        this.backgroundOpacity.value = withSpring(1);
        
        const mappedTranslation = this.mapGestureToDirection(event.translationX);
        const mappedVelocity = this.mapGestureToDirection(event.velocityX);
        
        const shouldSwipe = 
          Math.abs(mappedTranslation) > this.config.swipeThreshold ||
          Math.abs(mappedVelocity) > this.config.velocityThreshold;
        
        if (shouldSwipe) {
          const direction = mappedTranslation > 0 ? 'next' : 'prev';
          
          // Haptic feedback for successful swipe
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          
          // Animate to next/prev position
          this.animateToIndex(direction === 'next' ? 1 : -1, true);
          runOnJS(onSwipeComplete)(direction);
        } else {
          // Snap back with elastic feel
          this.dragOffset.value = withSpring(0, {
            ...this.config.springConfig,
            damping: 20, // More damping for snap-back
          });
          
          // Subtle haptic for snap-back
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    });
  };

  /**
   * Programmatic animation to specific index
   */
  public animateToIndex = (indexDelta: number, isUserInitiated = false, customSpringConfig?: any) => {
    'worklet';
    
    const newIndex = Math.max(0, Math.min(this.cardCount - 1, this.currentIndex.value + indexDelta));
    
    if (newIndex !== this.currentIndex.value) {
      this.currentIndex.value = newIndex;
      
      // Use custom spring config if provided, otherwise use default logic
      const springConfig = customSpringConfig || (isUserInitiated 
        ? { 
            ...this.config.springConfig,
            damping: 18, // Slightly more damping for user actions
          }
        : this.config.springConfig);
      
      this.dragOffset.value = withSpring(0, springConfig);
    }
  };

  /**
   * Staggered entrance animation for cards
   */
  public createEntranceAnimation = (cardIndex: number, totalCards: number) => {
    const delay = cardIndex * 100; // 100ms stagger
    const initialOffset = SCREEN_WIDTH * (I18nManager.isRTL ? -1 : 1);
    
    return {
      transform: [
        {
          translateX: withSpring(0, {
            ...this.config.springConfig,
            damping: 12,
          }, undefined, delay),
        },
        {
          scale: withSpring(1, {
            ...this.config.springConfig,
            damping: 10,
          }, undefined, delay + 50),
        },
      ],
      opacity: withTiming(1, {
        duration: 400,
      }, undefined, delay),
    };
  };

  /**
   * Exit animation for dismissed cards
   */
  public createExitAnimation = (direction: 'left' | 'right' = 'left') => {
    const exitOffset = SCREEN_WIDTH * (direction === 'left' ? -1 : 1) * this.config.rtlMultiplier;
    
    return {
      transform: [
        {
          translateX: withSpring(exitOffset, {
            damping: 15,
            stiffness: 150,
          }),
        },
        {
          scale: withSpring(0.8),
        },
      ],
      opacity: withTiming(0, { duration: 300 }),
    };
  };

  /**
   * Generate animated style for individual cards
   */
  public createCardAnimatedStyle = (cardIndex: number) => {
    return useAnimatedStyle(() => {
      const transform = this.getCardTransform(cardIndex);
      
      return {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        transform: [
          { translateX: transform.translateX },
          { translateY: transform.translateY },
          { scale: transform.scale },
          { rotateZ: `${transform.rotation}deg` },
        ],
        opacity: transform.opacity,
        zIndex: transform.zIndex,
      };
    });
  };

  /**
   * Enhanced background effect during full-width interactions
   */
  public createBackgroundAnimatedStyle = () => {
    return useAnimatedStyle(() => {
      const baseOpacity = this.backgroundOpacity.value;
      const interactionDimming = this.interactionIntensity.value * 0.1;
      
      return {
        opacity: Math.max(0.7, baseOpacity - interactionDimming),
        transform: [
          {
            scale: withSpring(1 + (this.interactionIntensity.value * 0.005), {
              damping: 20,
              stiffness: 300,
            }),
          },
        ],
      };
    });
  };

  /**
   * Full-width swipe progress indicators
   */
  public createSwipeIndicatorStyle = (side: 'left' | 'right') => {
    return useAnimatedStyle(() => {
      const isActiveSide = (side === 'left' && this.gestureDirection.value < 0) ||
                          (side === 'right' && this.gestureDirection.value > 0);
      
      const progress = isActiveSide ? this.fullWidthProgress.value : 0;
      const intensity = this.interactionIntensity.value;
      
      return {
        opacity: withSpring(progress * intensity, {
          damping: 15,
          stiffness: 200,
        }),
        transform: [
          {
            scaleY: withSpring(0.5 + (progress * 0.5), {
              damping: 12,
              stiffness: 250,
            }),
          },
          {
            translateX: withSpring(
              side === 'left' 
                ? -20 + (progress * 15)
                : 20 - (progress * 15),
              {
                damping: 18,
                stiffness: 180,
              }
            ),
          },
        ],
      };
    });
  };

  /**
   * Indicator dots animation (for bottom pagination)
   */
  public createIndicatorAnimatedStyle = (indicatorIndex: number) => {
    return useAnimatedStyle(() => {
      const isActive = Math.round(this.currentIndex.value) === indicatorIndex;
      
      return {
        transform: [
          {
            scale: withSpring(isActive ? 1.2 : 1, {
              damping: 15,
              stiffness: 150,
            }),
          },
        ],
        opacity: withSpring(isActive ? 1 : 0.4),
      };
    });
  };
}

/**
 * Hook for managing notification carousel animations with full-width support
 */
export const useNotificationCarouselAnimations = (cardCount: number) => {
  const animations = new NotificationCarouselAnimations(cardCount);
  
  return {
    animations,
    currentIndex: animations.currentIndex,
    isDragging: animations.isDragging,
    fullWidthProgress: animations.fullWidthProgress,
    interactionIntensity: animations.interactionIntensity,
    
    // Legacy gesture handler (maintained for backward compatibility)
    createGestureHandler: animations.createGestureHandler,
    
    // Enhanced methods for full-width touch
    updateFromTouchSession: animations.updateFromTouchSession,
    executeSwipeFromSession: animations.executeSwipeFromSession,
    
    // Style creators
    createCardAnimatedStyle: animations.createCardAnimatedStyle,
    createBackgroundAnimatedStyle: animations.createBackgroundAnimatedStyle,
    createIndicatorAnimatedStyle: animations.createIndicatorAnimatedStyle,
    createSwipeIndicatorStyle: animations.createSwipeIndicatorStyle,
    
    // Control methods
    animateToIndex: animations.animateToIndex,
  };
};