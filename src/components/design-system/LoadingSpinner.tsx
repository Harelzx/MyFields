import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = designTokens.colors.primary[600],
  text,
  style,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[animatedStyle]}>
        <View
          style={[
            styles.spinner,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderColor: `${color}33`,
              borderTopColor: color,
            },
          ]}
        />
      </Animated.View>
      {text && <RTLText style={styles.text}>{text}</RTLText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 100,
  },
  text: {
    marginTop: designTokens.spacing.sm,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
});