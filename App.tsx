import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nManager } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackConfig } from './config/gluestack-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';

// Import screens
import WelcomeScreen from './app/auth/WelcomeScreen';
import LoginScreen from './app/auth/LoginScreen';
import SignupScreen from './app/auth/SignupScreen';
import MainTabs from './components/navigation/MainTabs';

// Initialize RTL for Hebrew
try {
  I18nManager.allowRTL(true);
  
  // Check if we need to force RTL
  if (!I18nManager.isRTL) {
    I18nManager.forceRTL(true);
    console.warn('⚠️ RTL configuration changed - restart required');
  } else {
    console.log('✅ RTL is properly enabled');
  }
  
  console.log('RTL Status:', {
    isRTL: I18nManager.isRTL,
    allowRTL: true,
    platform: 'expo'
  });
} catch (error) {
  console.error('RTL initialization error:', error);
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GluestackUIProvider config={gluestackConfig}>
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                // With global RTL enabled, React Navigation handles gestures automatically
                ...(I18nManager.isRTL ? {} : {
                  // Only use manual RTL config if global RTL is disabled
                  gestureDirection: 'horizontal-inverted',
                  cardStyleInterpolator: ({ current, layouts }) => {
                    return {
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-layouts.screen.width, 0],
                            }),
                          },
                        ],
                      },
                    };
                  },
                })
              }}
            >
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </GluestackUIProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

