import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { RTLText } from '../RTLText';
import { designTokens } from '../../constants/theme';
import { texts } from '../../constants/hebrewTexts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../../app/user/HomeScreen';
import BookingsScreen from '../../app/user/BookingsScreen';
import FriendsScreen from '../../app/user/FriendsScreen';
import WalletScreen from '../../app/user/WalletScreen';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: designTokens.colors.primary[600],
        tabBarInactiveTintColor: designTokens.colors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
        // RTL tab order - Hebrew reads right to left, so reverse the order
        tabBarPosition: 'bottom',
      }}
      // For RTL: arrange tabs right to left
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText style={[styles.tabLabel, { color }]}>
              {texts.tabs.home}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText style={[styles.tabLabel, { color }]}>
              {texts.tabs.bookings}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText style={[styles.tabLabel, { color }]}>
              {texts.tabs.friends}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <RTLText style={[styles.tabLabel, { color }]}>
              {texts.tabs.wallet}
            </RTLText>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: designTokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'center',
  },
});

export default MainTabs;