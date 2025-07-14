import React from 'react';
import { View, Text } from 'react-native';
import { RTLText } from './RTLText';

interface DebugTextWrapperProps {
  children: React.ReactNode;
  label: string;
  currentAlignment?: 'left' | 'right' | 'center';
  color?: string;
}

export const DebugTextWrapper: React.FC<DebugTextWrapperProps> = ({ 
  children, 
  label, 
  currentAlignment = 'RTLText',
  color = '#ff6666' 
}) => {
  return (
    <View style={{
      position: 'relative',
      borderWidth: 2,
      borderColor: color,
      borderRadius: 8,
      marginVertical: 4,
      backgroundColor: `${color}10`, // 10% opacity background
    }}>
      {/* Debug Label */}
      <View style={{
        position: 'absolute',
        top: -12,
        left: 8,
        backgroundColor: color,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 10,
      }}>
        <Text style={{
          color: 'white',
          fontSize: 10,
          fontWeight: 'bold',
        }}>
          {label} - textAlign: 'right'
        </Text>
      </View>
      
      {/* Actual content */}
      <View style={{ padding: 8, paddingTop: 16 }}>
        {children}
      </View>
      
      {/* Alignment test strip */}
      <View style={{
        position: 'absolute',
        bottom: 2,
        left: 2,
        right: 2,
        height: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
      }}>
        {/* Left marker */}
        <View style={{
          width: 4,
          backgroundColor: '#ff0000',
          borderRadius: 2,
        }} />
        
        {/* Center marker */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: 4,
            height: 16,
            backgroundColor: '#0000ff',
            borderRadius: 2,
          }} />
        </View>
        
        {/* Right marker */}
        <View style={{
          width: 4,
          backgroundColor: '#00ff00',
          borderRadius: 2,
        }} />
        
        {/* Legend */}
        <View style={{
          position: 'absolute',
          right: 8,
          top: 2,
        }}>
          <Text style={{ fontSize: 8, color: '#666' }}>
            🔴L 🔵C 🟢R
          </Text>
        </View>
      </View>
    </View>
  );
};