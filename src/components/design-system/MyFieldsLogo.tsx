import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { designTokens } from '@constants/theme';

interface MyFieldsLogoProps {
  size?: number;
  backgroundColor?: string;
}

export const MyFieldsLogo: React.FC<MyFieldsLogoProps> = ({ 
  size = 100,
  backgroundColor = 'transparent'
}) => {
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size,
        backgroundColor: backgroundColor
      }
    ]}>
      <Image 
        source={require('../../../assets/Myfields-original-logo.png')}
        style={[styles.logoImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  logoImage: {
    // Additional styling if needed
  },
});