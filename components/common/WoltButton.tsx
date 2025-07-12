import React from 'react';
import { Pressable, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { designTokens } from '../../constants/theme';

interface WoltButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const WoltButton: React.FC<WoltButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onPress,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  // Wolt button styling
  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      height: 48, // Standard Wolt height
      borderRadius: 24, // Rounded XL
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      ...(fullWidth && { width: '100%' }),
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        backgroundColor: disabled ? designTokens.colors.secondary[300] : designTokens.colors.primary[600],
      };
    } else if (variant === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? designTokens.colors.secondary[300] : designTokens.colors.primary[600],
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: designTokens.colors.background.primary,
        borderWidth: 1,
        borderColor: disabled ? designTokens.colors.secondary[300] : designTokens.colors.primary[600],
      };
    }
  };

  const getTextStyles = (): TextStyle => {
    return {
      fontSize: designTokens.typography.sizes.md,
      fontWeight: '600' as any,
      color: variant === 'primary' 
        ? designTokens.colors.text.inverse 
        : (disabled ? designTokens.colors.text.disabled : designTokens.colors.primary[600]),
      marginHorizontal: 8,
    };
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, getButtonStyles(), style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {!loading && leftIcon && (
        <Text style={[getTextStyles(), { marginRight: 8 }]}>
          {leftIcon}
        </Text>
      )}
      {!loading && (
        <Text style={[getTextStyles(), { textAlign: 'right', writingDirection: 'rtl' }]}>
          {children}
        </Text>
      )}
      {!loading && rightIcon && (
        <Text style={[getTextStyles(), { marginLeft: 8 }]}>
          {rightIcon}
        </Text>
      )}
    </AnimatedPressable>
  );
};