import { I18nManager } from 'react-native';

export const isRTL = () => I18nManager.isRTL;

// RTL-aware margin helpers
export const getMarginStart = (value: number) => ({
  [isRTL() ? 'marginRight' : 'marginLeft']: value,
});

export const getMarginEnd = (value: number) => ({
  [isRTL() ? 'marginLeft' : 'marginRight']: value,
});

export const getPaddingStart = (value: number) => ({
  [isRTL() ? 'paddingRight' : 'paddingLeft']: value,
});

export const getPaddingEnd = (value: number) => ({
  [isRTL() ? 'paddingLeft' : 'paddingRight']: value,
});

// RTL-aware flex direction
export const getFlexDirection = (direction: 'row' | 'row-reverse') => {
  if (isRTL()) {
    return direction === 'row' ? 'row-reverse' : 'row';
  }
  return direction;
};

// RTL-aware text alignment
export const getTextAlign = (align?: 'left' | 'right' | 'center') => {
  if (!align) return isRTL() ? 'right' : 'left';
  if (align === 'center') return 'center';
  if (isRTL()) {
    return align === 'left' ? 'right' : 'left';
  }
  return align;
};

// RTL-aware position helpers
export const getPosition = (side: 'left' | 'right', value: number) => ({
  [isRTL() && side === 'left' ? 'right' : isRTL() && side === 'right' ? 'left' : side]: value,
});

// Navigation gesture configuration for RTL
export const getRTLGestureConfig = () => ({
  gestureDirection: isRTL() ? 'horizontal-inverted' : 'horizontal',
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  animation: isRTL() ? 'slide_from_left' : 'slide_from_right',
});