import React from 'react';
import { View, Text, I18nManager } from 'react-native';

export const RTLDebug: React.FC = () => {
  const boxStyle = {
    marginVertical: 8,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    minHeight: 50,
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  };

  const testTextStyle = {
    fontSize: 16,
    lineHeight: 24,
  };

  return (
    <View style={{ 
      padding: 16, 
      backgroundColor: '#ffffff', 
      margin: 10, 
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
          RTL DEBUG PANEL
        </Text>
        <Text style={{ color: '#ccc', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
          I18nManager.isRTL: {I18nManager.isRTL ? '✅ TRUE' : '❌ FALSE'}
        </Text>
      </View>

      {/* Test Cases */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
        📱 Text Alignment Tests
      </Text>
      
      {/* Test 1: textAlign left */}
      <View style={[boxStyle, { backgroundColor: '#ffeeee', borderColor: '#ff6666' }]}>
        <Text style={[labelStyle, { color: '#cc0000' }]}>
          🔴 textAlign: 'left'
        </Text>
        <Text style={[testTextStyle, { textAlign: 'left' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>
      
      {/* Test 2: textAlign right */}
      <View style={[boxStyle, { backgroundColor: '#eeffee', borderColor: '#66ff66' }]}>
        <Text style={[labelStyle, { color: '#006600' }]}>
          🟢 textAlign: 'right'
        </Text>
        <Text style={[testTextStyle, { textAlign: 'right' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>
      
      {/* Test 3: textAlign center */}
      <View style={[boxStyle, { backgroundColor: '#eeeeff', borderColor: '#6666ff' }]}>
        <Text style={[labelStyle, { color: '#000066' }]}>
          🔵 textAlign: 'center'
        </Text>
        <Text style={[testTextStyle, { textAlign: 'center' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>
      
      {/* Test 4: writingDirection rtl only */}
      <View style={[boxStyle, { backgroundColor: '#ffffee', borderColor: '#ffff66' }]}>
        <Text style={[labelStyle, { color: '#666600' }]}>
          🟡 writingDirection: 'rtl' only
        </Text>
        <Text style={[testTextStyle, { writingDirection: 'rtl' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>
      
      {/* Test 5: Both */}
      <View style={[boxStyle, { backgroundColor: '#ffeeff', borderColor: '#ff66ff' }]}>
        <Text style={[labelStyle, { color: '#660066' }]}>
          🟣 textAlign: 'right' + writingDirection: 'rtl'
        </Text>
        <Text style={[testTextStyle, { textAlign: 'right', writingDirection: 'rtl' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>

      {/* Test 6: Our RTLText component */}
      <View style={[boxStyle, { backgroundColor: '#f0f0f0', borderColor: '#888888' }]}>
        <Text style={[labelStyle, { color: '#333333' }]}>
          ⚫ Current RTLText Component (textAlign: 'right')
        </Text>
        <Text style={[testTextStyle, { textAlign: 'right', writingDirection: 'rtl' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>

      {/* Test 7: Force left alignment in RTL mode */}
      <View style={[boxStyle, { backgroundColor: '#e0e0e0', borderColor: '#444444' }]}>
        <Text style={[labelStyle, { color: '#000000' }]}>
          ⚪ Force textAlign: 'left' in RTL mode
        </Text>
        <Text style={[testTextStyle, { textAlign: 'left', writingDirection: 'rtl' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>

      {/* Test 8: Try alignSelf approach */}
      <View style={[boxStyle, { backgroundColor: '#fff0f0', borderColor: '#cc4444' }]}>
        <Text style={[labelStyle, { color: '#cc0000' }]}>
          🔴 alignSelf: 'flex-end' (logical right in RTL)
        </Text>
        <Text style={[testTextStyle, { alignSelf: 'flex-end', writingDirection: 'rtl' }]}>
          שלום עולם Hello World 123
        </Text>
      </View>

      {/* Visual Reference */}
      <View style={{
        marginTop: 16,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
      }}>
        <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>
          📍 VISUAL REFERENCE: Hebrew should appear on RIGHT side of screen
        </Text>
      </View>
    </View>
  );
};