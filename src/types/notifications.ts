export interface NotificationData {
  id: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'payment_due' | 'friend_request' | 'system_update';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  imageUrl?: string;
  relatedBookingId?: string;
  relatedUserId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationCardProps extends NotificationData {
  index: number;
  totalCards: number;
  onPress?: (notification: NotificationData) => void;
  onDismiss?: (notificationId: string) => void;
  onActionPress?: (notificationId: string, action: string) => void;
  style?: any;
}

export interface CarouselAnimationConfig {
  // Spring physics configuration
  springConfig: {
    damping: number;
    stiffness: number;
    mass: number;
    restDisplacementThreshold: number;
    restSpeedThreshold: number;
  };
  
  // Gesture thresholds
  swipeThreshold: number;
  velocityThreshold: number;
  
  // Visual effects
  scaleOnPress: number;
  maxRotation: number;
  depthOffset: number;
  opacityRange: [number, number];
  
  // RTL-specific settings
  rtlMultiplier: number; // -1 for RTL, 1 for LTR
  naturalSwipeDirection: 'left' | 'right'; // For RTL users, 'left' feels natural for "next"
}

export interface CardTransform {
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
  rotation: number;
  zIndex: number;
}

export interface AnimationState {
  currentIndex: number;
  isDragging: boolean;
  isAnimating: boolean;
  dragOffset: number;
  velocity: number;
}