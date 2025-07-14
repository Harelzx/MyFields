import React from 'react';
import { Text, TextProps, I18nManager } from 'react-native';

interface RTLTextProps extends TextProps {
  center?: boolean;
}

export const RTLText: React.FC<RTLTextProps> = ({ style, center = false, ...props }) => {
  // CONFIRMED: When I18nManager.isRTL = TRUE with doLeftAndRightSwapInRTL = TRUE:
  // - textAlign: 'left' → Shows Hebrew on visual RIGHT side ✅
  // - textAlign: 'right' → Shows Hebrew on visual LEFT side ❌
  
  const rtlStyle = center 
    ? { textAlign: 'center' as const }
    : { 
        textAlign: 'left' as const,      // In RTL mode, 'left' = visual RIGHT for Hebrew
        // Remove writingDirection as it's not helping
      };

  return (
    <Text
      {...props}
      style={[rtlStyle, style]} // Apply rtlStyle first, then allow style to override
    />
  );
};