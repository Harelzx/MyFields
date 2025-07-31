import React from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  Dimensions
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { Box, VStack, HStack, Text, Pressable } from '@gluestack-ui/themed';
import { WoltButton, MyFieldsLogo } from '@components/design-system';
import { RTLText } from '@components/design-system/RTLText';
import { texts } from '@constants/hebrewTexts';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handlePhoneAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  };

  const handleSocialAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to social auth options
    console.log('Social auth options');
  };

  const handleSignup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <VStack flex={1} justifyContent="space-between" px="$6" py="$8">
        {/* Logo and Title */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800).springify()}
          style={styles.header}
        >
          <Box 
            style={styles.logoContainer}
            accessible={true}
            accessibilityLabel="לוגו MyFields"
            accessibilityRole="image"
          >
            <MyFieldsLogo size={120} backgroundColor={designTokens.colors.background.primary} />
          </Box>
          <RTLText 
            center 
            style={styles.title}
            accessible={true}
            accessibilityRole="header"
          >
            מצא את המגרש המושלם
          </RTLText>
          <RTLText 
            center 
            style={styles.subtitle}
            accessible={true}
          >
            הזמן בקליק אחד
          </RTLText>
        </Animated.View>

        {/* Value Proposition - Static, no carousel */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800).springify()}
          style={styles.valueSection}
        >
          <VStack space="lg" alignItems="center">
            <HStack space="xl" justifyContent="center" flexWrap="wrap">
              <VStack alignItems="center" space="xs" maxWidth={100}>
                <Box
                  bg="rgba(102, 126, 234, 0.1)"
                  borderRadius="$full"
                  p="$4"
                  width={64}
                  height={64}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="search" size={32} color="#667eea" />
                </Box>
                <Text 
                  fontSize="$sm" 
                  fontWeight="$semibold" 
                  color="$textLight700"
                  textAlign="left"
                >
                  מצא מגרשים
                </Text>
              </VStack>
              
              <VStack alignItems="center" space="xs" maxWidth={100}>
                <Box
                  bg="rgba(16, 185, 129, 0.1)"
                  borderRadius="$full"
                  p="$4"
                  width={64}
                  height={64}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="people" size={32} color="#10b981" />
                </Box>
                <Text 
                  fontSize="$sm" 
                  fontWeight="$semibold" 
                  color="$textLight700"
                  textAlign="left"
                >
                  הזמן חברים
                </Text>
              </VStack>
              
              <VStack alignItems="center" space="xs" maxWidth={100}>
                <Box
                  bg="rgba(245, 158, 11, 0.1)"
                  borderRadius="$full"
                  p="$4"
                  width={64}
                  height={64}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="flash" size={32} color="#f59e0b" />
                </Box>
                <Text 
                  fontSize="$sm" 
                  fontWeight="$semibold" 
                  color="$textLight700"
                  textAlign="left"
                >
                  שחק ותיהנה
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Animated.View>

        {/* Simplified CTA Section */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800).springify()}
          style={styles.ctaSection}
        >
          <VStack space="md">
            {/* Primary CTA - Phone Auth */}
            <Pressable
              onPress={handlePhoneAuth}
              style={styles.primaryButton}
              accessible={true}
              accessibilityLabel="התחבר עם מספר טלפון"
              accessibilityRole="button"
            >
              <HStack space="md" alignItems="center" justifyContent="center">
                <Ionicons name="phone-portrait" size={24} color="white" />
                <Text fontSize="$lg" fontWeight="$bold" color="white" textAlign="left">
                  התחבר עם מספר טלפון
                </Text>
              </HStack>
            </Pressable>

            {/* Divider */}
            <HStack alignItems="center" space="md">
              <Box flex={1} height={1} bg="$borderLight300" />
              <Text fontSize="$sm" color="$textLight500" textAlign="left">או</Text>
              <Box flex={1} height={1} bg="$borderLight300" />
            </HStack>

            {/* Social Options */}
            <VStack space="sm">
              <HStack space="md">
                <Pressable
                  flex={1}
                  onPress={handleSocialAuth}
                  style={styles.socialButton}
                  accessible={true}
                  accessibilityLabel="התחבר עם Google"
                  accessibilityRole="button"
                >
                  <HStack space="xs" alignItems="center" justifyContent="center">
                    <Text fontSize="$lg" color="$textLight700">G</Text>
                    <Text fontSize="$md" fontWeight="$medium" color="$textLight700" textAlign="left">
                      Google
                    </Text>
                  </HStack>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={handleSocialAuth}
                  style={styles.socialButton}
                  accessible={true}
                  accessibilityLabel="התחבר עם Apple"
                  accessibilityRole="button"
                >
                  <HStack space="xs" alignItems="center" justifyContent="center">
                    <Ionicons name="logo-apple" size={20} color={designTokens.colors.text.secondary} />
                    <Text fontSize="$md" fontWeight="$medium" color="$textLight700" textAlign="left">
                      Apple
                    </Text>
                  </HStack>
                </Pressable>
              </HStack>

              {/* Secondary Link */}
              <Pressable
                onPress={handleSignup}
                style={styles.signupLink}
                accessible={true}
                accessibilityLabel="אין לך חשבון? הרשם"
                accessibilityRole="button"
              >
                <Text fontSize="$md" color="$textLight600" textAlign="left">
                  אין לך חשבון? <Text color="$primary600" fontWeight="$semibold">הרשם</Text>
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        </Animated.View>
      </VStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  valueSection: {
    alignItems: 'center',
  },
  ctaSection: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: designTokens.colors.primary[600],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: designTokens.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  socialButton: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default WelcomeScreen;