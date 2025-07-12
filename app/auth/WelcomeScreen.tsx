import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { WoltButton, MyFieldsLogo } from '../../components/common';
import { RTLText } from '../../components/RTLText';
import { texts } from '../../constants/hebrewTexts';
import { designTokens } from '../../constants/theme';

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleBusinessRequest = () => {
    console.log('Business request');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MyFieldsLogo size={140} backgroundColor={designTokens.colors.background.primary} />
          </View>
          <RTLText center style={styles.title}>{texts.welcome.title}</RTLText>
          <RTLText center style={styles.subtitle}>{texts.welcome.subtitle}</RTLText>
        </View>
        
        <View style={styles.buttonContainer}>
          <WoltButton
            variant="primary"
            fullWidth
            onPress={handleLogin}
          >
            {texts.welcome.loginButton}
          </WoltButton>
          
          <WoltButton
            variant="outline"
            fullWidth
            onPress={handleSignup}
          >
            הרשמה
          </WoltButton>
          
          <WoltButton
            variant="secondary"
            fullWidth
            onPress={handleBusinessRequest}
            style={styles.businessButton}
          >
            {texts.welcome.businessButton}
          </WoltButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.massive,
  },
  logoContainer: {
    marginBottom: designTokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: designTokens.typography.sizes.xxxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },
  subtitle: {
    fontSize: designTokens.typography.sizes.lg,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: designTokens.spacing.lg,
  },
  businessButton: {
    marginTop: designTokens.spacing.md,
  },
});

export default WelcomeScreen;