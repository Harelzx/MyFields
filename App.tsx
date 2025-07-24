import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nManager } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackConfig } from '@config/gluestack-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@contexts/ThemeContext';
import { QueryProvider } from '@providers/QueryProvider';
import { bootstrapRTL } from '@utils/bootstrap';

// Import screens
import WelcomeScreen from '@screens/WelcomeScreen';
import LoginScreen from '@screens/LoginScreen';
import SignupScreen from '@screens/SignupScreen';
import MainTabs from '@navigation/MainTabs';

// Initialize RTL for Hebrew
bootstrapRTL();

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
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
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

