import React from 'react';
import { View, Text, I18nManager, Platform } from 'react-native';

export const ComprehensiveRTLDiagnostic: React.FC = () => {
  const testText = "שלום עולם Hello World";
  
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
      {/* System Info */}
      <View style={{
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
          🔍 COMPREHENSIVE RTL DIAGNOSTIC
        </Text>
        <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
          Platform: {Platform.OS} | RTL: {I18nManager.isRTL ? 'TRUE' : 'FALSE'}
        </Text>
        <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center' }}>
          allowRTL: {I18nManager.allowRTL ? 'TRUE' : 'FALSE'} | doLeftAndRightSwapInRTL: {I18nManager.doLeftAndRightSwapInRTL ? 'TRUE' : 'FALSE'}
        </Text>
      </View>

      {/* Test Cases - Each on its own line */}
      <View style={{ gap: 8 }}>
        
        {/* Test 1: Pure textAlign */}
        <View style={{ 
          width: '100%', 
          backgroundColor: '#ffeeee', 
          borderWidth: 2, 
          borderColor: '#ff6666',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#cc0000', marginBottom: 4 }}>
            textAlign: 'left'
          </Text>
          <Text style={{ textAlign: 'left', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        <View style={{ 
          width: '100%', 
          backgroundColor: '#eeffee', 
          borderWidth: 2, 
          borderColor: '#66ff66',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#006600', marginBottom: 4 }}>
            textAlign: 'right'
          </Text>
          <Text style={{ textAlign: 'right', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        {/* Test 2: writingDirection */}
        <View style={{ 
          width: '100%', 
          backgroundColor: '#ffffee', 
          borderWidth: 2, 
          borderColor: '#ffff66',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666600', marginBottom: 4 }}>
            writingDirection: 'rtl'
          </Text>
          <Text style={{ writingDirection: 'rtl', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        <View style={{ 
          width: '100%', 
          backgroundColor: '#ffeeff', 
          borderWidth: 2, 
          borderColor: '#ff66ff',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#660066', marginBottom: 4 }}>
            textAlign: 'right' + writingDirection: 'rtl'
          </Text>
          <Text style={{ textAlign: 'right', writingDirection: 'rtl', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        {/* Test 3: Container-based alignment */}
        <View style={{ 
          width: '100%', 
          backgroundColor: '#eeeeff', 
          borderWidth: 2, 
          borderColor: '#6666ff',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#000066', marginBottom: 4 }}>
            alignSelf: 'flex-start'
          </Text>
          <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        <View style={{ 
          width: '100%', 
          backgroundColor: '#fff0f0', 
          borderWidth: 2, 
          borderColor: '#ff9999',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#cc0000', marginBottom: 4 }}>
            alignSelf: 'flex-end'
          </Text>
          <Text style={{ alignSelf: 'flex-end', fontSize: 14 }}>
            {testText}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        {/* Test 4: Pure Hebrew */}
        <View style={{ 
          width: '100%', 
          backgroundColor: '#f0fff0', 
          borderWidth: 2, 
          borderColor: '#99ff99',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#006600', marginBottom: 4 }}>
            Pure Hebrew - Default
          </Text>
          <Text style={{ fontSize: 14 }}>
            שלום עולם ברוך הבא
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>

        <View style={{ 
          width: '100%', 
          backgroundColor: '#f0f0ff', 
          borderWidth: 2, 
          borderColor: '#9999ff',
          padding: 8,
          borderRadius: 8 
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#000066', marginBottom: 4 }}>
            Pure Hebrew - RTL forced
          </Text>
          <Text style={{ textAlign: 'right', writingDirection: 'rtl', fontSize: 14 }}>
            שלום עולם ברוך הבא
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>🔴L</Text>
            <Text style={{ fontSize: 8 }}>🔵C</Text>
            <Text style={{ fontSize: 8 }}>🟢R</Text>
          </View>
        </View>
      </View>

      {/* Analysis */}
      <View style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
      }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          📊 ANALYSIS TARGET
        </Text>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ✅ CORRECT: Hebrew text should appear near 🟢R (right side)
        </Text>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          ❌ WRONG: Hebrew text appearing near 🔴L (left side)
        </Text>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
          🎯 GOAL: Force Hebrew to always align right regardless of OS language
        </Text>
      </View>
    </View>
  );
};