import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RTLText } from '../RTLText';
import { useTheme } from '../../contexts/ThemeContext';
import { uiTokens } from '../../constants/theme';
import { texts } from '../../constants/hebrewTexts';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../../app/user/HomeScreen';
import HomeScreenGS from '../../app/user/HomeScreenGS';
import BookingsScreen from '../../app/user/BookingsScreen';
import FriendsScreen from '../../app/user/FriendsScreen';
import WalletScreen from '../../app/user/WalletScreen';
import MenuScreen from '../../app/user/MenuScreen';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  const { theme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Pure React Native tab bar background with adjusted height
  const TabBarBackground = () => {
    const totalHeight = (uiTokens.navigation.height - 8) + insets.bottom; // Match reduced tab bar height
    const bgColor = theme.colors.background.primary;
    
    return (
      <View 
        style={[
          styles.tabBarBackground, 
          { 
            height: totalHeight,
            backgroundColor: bgColor,
          }
        ]} 
      />
    );
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background.primary }
      ]} 
      edges={['top', 'left', 'right']} // Exclude bottom to allow tab bar overlay
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // Tab bar styling with lowered position and visual separation
          tabBarStyle: {
            position: 'absolute',
            bottom: -insets.bottom / 2, // Lower tabs with partial overlap for closer positioning
            left: 0,
            right: 0,
            height: (uiTokens.navigation.height - 8) + insets.bottom, // Reduced height by 8px
            backgroundColor: 'transparent', // Let background component handle color
            // Add visual separation from content
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            // Add subtle shadow for clear delineation
            shadowOpacity: 0.1,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: -1 },
            shadowRadius: 2,
            elevation: 2, // Android shadow
            // Optimize content spacing
            paddingBottom: 0, // Remove extra padding since we're lowering position
            paddingTop: 6, // Reduced from 8px
            paddingHorizontal: 8,
            // Ensure proper rendering
            overflow: 'visible',
          },
          // iOS translucent effect for native-like behavior
          ...(Platform.OS === 'ios' && {
            tabBarTranslucent: true,
          }),
          tabBarActiveTintColor: theme.colors.primary[600],
          tabBarInactiveTintColor: theme.colors.text.disabled,
          tabBarLabelStyle: {
            fontSize: uiTokens.navigation.labelSize,
            fontWeight: '500',
            textAlign: 'center',
            marginTop: 1, // Reduced from 2
            marginBottom: Platform.OS === 'ios' ? 4 : 2, // Increased for better spacing
          },
          tabBarItemStyle: {
            paddingVertical: 2, // Reduced from 4 for tighter layout
          },
          tabBarIconStyle: {
            marginBottom: 1, // Reduced from 2
          },
          tabBarBackground: TabBarBackground,
        }}
        // RTL order: Home, Bookings, Wallet, Friends, Menu (right to left)
        initialRouteName="Home"
      >
      {/* RTL Order: Right to Left - בית, הזמנות, ארנק, חברים, תפריט */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreenGS}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText center style={[styles.tabLabel, { color }]}>
              {texts.tabs.home}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={uiTokens.navigation.iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText center style={[styles.tabLabel, { color }]}>
              {texts.tabs.bookings}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={uiTokens.navigation.iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText center style={[styles.tabLabel, { color }]}>
              {texts.tabs.wallet}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={uiTokens.navigation.iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText center style={[styles.tabLabel, { color }]}>
              {texts.tabs.friends}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={uiTokens.navigation.iconSize} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText center style={[styles.tabLabel, { color }]}>
              {'תפריט'}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={uiTokens.navigation.iconSize} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Height will be set dynamically based on safe area insets
  },
});

export default MainTabs;