import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { NotificationCardProps } from '../../types/notifications';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface NotificationCardStyleConfig {
  backgroundColor: [string, string]; // Gradient colors
  borderColor: string;
  iconColor: string;
  iconName: string;
  glowColor: string;
}

const getNotificationStyle = (type: NotificationCardProps['type']): NotificationCardStyleConfig => {
  switch (type) {
    case 'booking_confirmed':
      return {
        backgroundColor: [designTokens.colors.success[50], designTokens.colors.success[100]],
        borderColor: designTokens.colors.success[200],
        iconColor: designTokens.colors.success[600],
        iconName: 'calendar-check',
        glowColor: designTokens.colors.success[300],
      };
    case 'booking_reminder':
      return {
        backgroundColor: [designTokens.colors.warning[50], designTokens.colors.warning[100]],
        borderColor: designTokens.colors.warning[200],
        iconColor: designTokens.colors.warning[600],
        iconName: 'clock-alert',
        glowColor: designTokens.colors.warning[300],
      };
    case 'payment_due':
      return {
        backgroundColor: [designTokens.colors.error[50], designTokens.colors.error[100]],
        borderColor: designTokens.colors.error[200],
        iconColor: designTokens.colors.error[600],
        iconName: 'credit-card-clock',
        glowColor: designTokens.colors.error[300],
      };
    case 'friend_request':
      return {
        backgroundColor: [designTokens.colors.primary[50], designTokens.colors.primary[100]],
        borderColor: designTokens.colors.primary[200],
        iconColor: designTokens.colors.primary[600],
        iconName: 'account-plus',
        glowColor: designTokens.colors.primary[300],
      };
    case 'system_update':
    default:
      return {
        backgroundColor: [designTokens.colors.neutral[50], designTokens.colors.neutral[100]],
        borderColor: designTokens.colors.neutral[200],
        iconColor: designTokens.colors.neutral[600],
        iconName: 'information',
        glowColor: designTokens.colors.neutral[300],
      };
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  isRead,
  priority,
  actionRequired,
  imageUrl,
  index,
  totalCards,
  onPress,
  onDismiss,
  onActionPress,
  style,
}) => {
  const styleConfig = getNotificationStyle(type);
  const [isPressed, setIsPressed] = React.useState(false);
  
  // Pressed animation
  const pressedScale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    setIsPressed(true);
    pressedScale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    pressedScale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });
  };
  
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
  }));
  
  // Priority glow effect
  const glowOpacity = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (priority === 'high' && !isRead) {
      glowOpacity.value = withTiming(0.3, { duration: 1000 });
      // Subtle pulsing effect for high priority
      const pulse = () => {
        glowOpacity.value = withTiming(0.6, { duration: 800 }, () => {
          glowOpacity.value = withTiming(0.3, { duration: 800 }, () => {
            if (priority === 'high' && !isRead) {
              pulse();
            }
          });
        });
      };
      pulse();
    } else {
      glowOpacity.value = withTiming(0, { duration: 500 });
    }
  }, [priority, isRead]);
  
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowColor: styleConfig.glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: glowOpacity.value * 10,
  }));
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `לפני ${hours} שעות`;
    } else {
      return format(date, 'dd/MM HH:mm', { locale: he });
    }
  };
  
  const renderActionButtons = () => {
    if (!actionRequired) return null;
    
    const getActionButtons = () => {
      switch (type) {
        case 'booking_confirmed':
          return [
            { key: 'view', title: 'צפה בהזמנה', style: 'primary' },
            { key: 'share', title: 'שתף', style: 'secondary' },
          ];
        case 'booking_reminder':
          return [
            { key: 'navigate', title: 'ניווט', style: 'primary' },
            { key: 'reschedule', title: 'דחה', style: 'secondary' },
          ];
        case 'payment_due':
          return [
            { key: 'pay', title: 'שלם עכשיו', style: 'primary' },
            { key: 'later', title: 'מאוחר יותר', style: 'secondary' },
          ];
        case 'friend_request':
          return [
            { key: 'accept', title: 'אשר', style: 'primary' },
            { key: 'decline', title: 'דחה', style: 'secondary' },
          ];
        default:
          return [];
      }
    };
    
    const buttons = getActionButtons();
    
    return (
      <View style={styles.actionButtons}>
        {buttons.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.actionButton,
              button.style === 'primary' ? styles.primaryButton : styles.secondaryButton,
            ]}
            onPress={() => onActionPress?.(id, button.key)}
          >
            <RTLText
              style={[
                styles.actionButtonText,
                button.style === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
              ]}
            >
              {button.title}
            </RTLText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderDismissButton = () => (
    <TouchableOpacity
      style={styles.dismissButton}
      onPress={() => onDismiss?.(id)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons
        name="close"
        size={18}
        color={designTokens.colors.text.tertiary}
      />
    </TouchableOpacity>
  );
  
  return (
    <AnimatedTouchableOpacity
      style={[animatedPressStyle, glowStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress?.({ 
        id, type, title, message, timestamp, isRead, priority, 
        actionRequired, imageUrl, metadata: {} 
      })}
      activeOpacity={1}
    >
      <AnimatedLinearGradient
        colors={styleConfig.backgroundColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: styleConfig.borderColor,
            opacity: isRead ? 0.8 : 1,
          },
        ]}
      >
        {/* Background blur effect for glass morphism */}
        <BlurView
          intensity={isPressed ? 90 : 80}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Priority indicator */}
        {priority === 'high' && !isRead && (
          <View style={[styles.priorityIndicator, { backgroundColor: styleConfig.iconColor }]} />
        )}
        
        {/* Dismiss button */}
        {renderDismissButton()}
        
        <View style={styles.content}>
          {/* Icon and header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${styleConfig.iconColor}15` }]}>
              <MaterialCommunityIcons
                name={styleConfig.iconName}
                size={24}
                color={styleConfig.iconColor}
              />
            </View>
            
            <View style={styles.headerText}>
              <RTLText style={styles.title} numberOfLines={1}>
                {title}
              </RTLText>
              <RTLText style={styles.timestamp}>
                {formatTime(timestamp)}
              </RTLText>
            </View>
            
            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
            )}
          </View>
          
          {/* Message */}
          <RTLText style={styles.message} numberOfLines={2}>
            {message}
          </RTLText>
          
          {/* Action buttons */}
          {renderActionButtons()}
        </View>
        
        {/* Unread indicator */}
        {!isRead && <View style={styles.unreadDot} />}
      </AnimatedLinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: designTokens.borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...designTokens.shadows.md,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    zIndex: 10,
  },
  dismissButton: {
    position: 'absolute',
    top: designTokens.spacing.sm,
    left: designTokens.spacing.sm,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${designTokens.colors.background.primary}80`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: designTokens.spacing.md,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'left',
  },
  timestamp: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
    marginTop: designTokens.spacing.xs,
    textAlign: 'left',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: designTokens.borderRadius.md,
    marginLeft: designTokens.spacing.md,
  },
  message: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.sizes.md * 1.4,
    marginBottom: designTokens.spacing.md,
    textAlign: 'left',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: designTokens.colors.primary[600],
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
  },
  actionButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  primaryButtonText: {
    color: designTokens.colors.text.inverse,
  },
  secondaryButtonText: {
    color: designTokens.colors.text.secondary,
  },
  unreadDot: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designTokens.colors.primary[600],
  },
});