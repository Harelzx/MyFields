import React, { useEffect, useState } from 'react';
import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  AccessibilityInfo
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Box, VStack, HStack, Text } from '@gluestack-ui/themed';
import { WoltButton, MyFieldsLogo } from '@components/design-system';
import { RTLText } from '@components/design-system/RTLText';
import { texts } from '@constants/hebrewTexts';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface FeatureSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const features: FeatureSlide[] = [
  {
    id: '1',
    icon: 'football',
    title: 'הזמן מגרש בקלות',
    description: 'מצא והזמן מגרשים בקרבתך תוך שניות',
    color: designTokens.colors.primary[600],
  },
  {
    id: '2',
    icon: 'people',
    title: 'הזמן חברים',
    description: 'צור קבוצה והזמן חברים למשחק',
    color: designTokens.colors.success[500],
  },
  {
    id: '3',
    icon: 'wallet',
    title: 'ארנק דיגיטלי',
    description: 'שלם בקלות ונהל את ההוצאות שלך',
    color: designTokens.colors.secondary[600],
  },
];

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAccessibilityOn, setIsAccessibilityOn] = useState(false);
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    // Check accessibility status
    AccessibilityInfo.isScreenReaderEnabled().then(setIsAccessibilityOn);
    
    // Auto-scroll carousel with fade animation
    const timer = setInterval(() => {
      if (!isAccessibilityOn) {
        fadeAnim.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setCurrentIndex)((currentIndex + 1) % features.length);
          fadeAnim.value = withTiming(1, { duration: 300 });
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, isAccessibilityOn, fadeAnim]);

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Signup');
  };

  const handleBusinessRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to business request screen
    console.log('Business request');
  };

  const renderCurrentFeature = () => {
    const feature = features[currentIndex];
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeAnim.value,
        transform: [{ scale: withSpring(fadeAnim.value) }],
      };
    });

    return (
      <Animated.View
        style={[styles.featureContainer, animatedStyle]}
        accessible={true}
        accessibilityLabel={`${feature.title}: ${feature.description}`}
      >
        <View style={styles.featureContent}>
          <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
            <Ionicons name={feature.icon} size={40} color="white" />
          </View>
          <Text style={styles.featureTitle}>
            {feature.title}
          </Text>
          <Text style={styles.featureDescription}>
            {feature.description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderPagination = () => {
    return (
      <HStack space="xs" justifyContent="center" mt="$4">
        {features.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex 
                  ? designTokens.colors.primary[600] 
                  : designTokens.colors.text.disabled,
                width: index === currentIndex ? 24 : 8,
                opacity: index === currentIndex ? 1 : 0.3,
              },
            ]}
            accessible={false}
          />
        ))}
      </HStack>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VStack flex={1} justifyContent="center" px="$6">
          {/* Logo and Title */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            style={styles.header}
          >
            <View 
              style={styles.logoContainer}
              accessible={true}
              accessibilityLabel="לוגו MyFields"
              accessibilityRole="image"
            >
              <MyFieldsLogo size={140} backgroundColor={designTokens.colors.background.primary} />
            </View>
            <RTLText 
              center 
              style={styles.title}
              accessible={true}
              accessibilityRole="header"
            >
              {texts.welcome.title}
            </RTLText>
            <RTLText 
              center 
              style={styles.subtitle}
              accessible={true}
            >
              {texts.welcome.subtitle}
            </RTLText>
          </Animated.View>

          {/* Feature Carousel */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(1000).springify()}
            style={styles.carouselContainer}
          >
            {renderCurrentFeature()}
            {renderPagination()}
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(1000).springify()}
            style={styles.buttonContainer}
          >
            <WoltButton
              variant="primary"
              fullWidth
              onPress={handleLogin}
              accessible={true}
              accessibilityLabel={texts.welcome.loginButton}
              accessibilityHint="לחץ כדי להתחבר לחשבון קיים"
              accessibilityRole="button"
            >
              {texts.welcome.loginButton}
            </WoltButton>
            
            <WoltButton
              variant="outline"
              fullWidth
              onPress={handleSignup}
              accessible={true}
              accessibilityLabel="הרשמה"
              accessibilityHint="לחץ כדי ליצור חשבון חדש"
              accessibilityRole="button"
            >
              הרשמה
            </WoltButton>
            
            <WoltButton
              variant="secondary"
              fullWidth
              onPress={handleBusinessRequest}
              style={styles.businessButton}
              accessible={true}
              accessibilityLabel={texts.welcome.businessButton}
              accessibilityHint="לחץ כדי להירשם כבעל עסק"
              accessibilityRole="button"
            >
              {texts.welcome.businessButton}
            </WoltButton>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  carouselContainer: {
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  featureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 16,
  },
  businessButton: {
    marginTop: 12,
  },
});

export default WelcomeScreen;