import React from 'react';
import { Text, TextProps, I18nManager } from 'react-native';

interface RTLTextProps extends TextProps {
  center?: boolean;
}

export const RTLText: React.FC<RTLTextProps> = ({ style, center = false, ...props }) => {
  // Handle centered text vs right-aligned text
  const rtlStyle = center 
    ? { textAlign: 'center' as const }
    : I18nManager.isRTL 
      ? { textAlign: 'left' as const } 
      : { 
          writingDirection: 'rtl' as const, 
          textAlign: 'right' as const 
        };

  return (
    <Text
      {...props}
      style={[style, rtlStyle]}
    />
  );
};