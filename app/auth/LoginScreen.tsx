import React, { useState } from 'react';
import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { RTLText } from '../../components/RTLText';
import { Input, WoltButton, LoadingSpinner, MyFieldsLogo } from '../../components/common';
import { designTokens } from '../../constants/theme';
import { texts } from '../../constants/hebrewTexts';
import { loginUser } from '../../services/mockApi';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  navigation: any;
}

const SocialButton: React.FC<{
  onPress: () => void;
  icon: string;
  iconColor: string;
  text: string;
  accessibilityLabel: string;
}> = ({ onPress, icon, iconColor, text, accessibilityLabel }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={[styles.socialButton, animatedStyle]}>
      <TouchableOpacity
        style={styles.socialButtonInner}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <RTLText style={styles.socialButtonText}>{text}</RTLText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('demo@myfields.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-20);
  const formTranslateY = useSharedValue(60);
  const formOpacity = useSharedValue(0);
  const formScale = useSharedValue(0.95);
  const passwordToggleScale = useSharedValue(1);
  const socialButtonsOpacity = useSharedValue(0);
  const socialButtonsTranslateY = useSharedValue(20);

  React.useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    
    // Animate form entrance with delay - slide up from below
    formTranslateY.value = withDelay(150, withSpring(0, { damping: 18, stiffness: 85 }));
    formOpacity.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    formScale.value = withDelay(150, withSpring(1, { damping: 14, stiffness: 90 }));
    
    // Animate social buttons with stagger
    socialButtonsOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    socialButtonsTranslateY.value = withDelay(400, withSpring(0, { damping: 18, stiffness: 85 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value }
    ],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: formTranslateY.value },
      { scale: formScale.value }
    ],
    opacity: formOpacity.value,
  }));

  const socialButtonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: socialButtonsOpacity.value,
    transform: [{ translateY: socialButtonsTranslateY.value }],
  }));

  const passwordToggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordToggleScale.value }],
  }));

  const handlePasswordToggle = () => {
    passwordToggleScale.value = withTiming(0.8, { duration: 100 }, () => {
      passwordToggleScale.value = withSpring(1, { damping: 10 });
    });
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    
    // Enhanced validation
    if (!email.trim()) {
      setError('נא להזין כתובת אימייל');
      return;
    }
    
    if (!password.trim()) {
      setError('נא להזין סיסמה');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('כתובת האימייל אינה תקינה');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(email.trim(), password);
      
      if (response.success) {
        // Navigate to main app
        navigation.replace('Main');
      } else {
        setError(response.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('שגיאה בחיבור לשרת. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="never"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backgroundContainer}>
            <View style={styles.mainContent}>
              <View style={styles.formSection}>
                <View style={styles.formCard}>
                  <View style={styles.formContainer}>
                    {/* Header section with proper hierarchy */}
                    <View style={styles.headerSection}>
                      {/* Logo */}
                      <Animated.View style={[styles.logoContainerInForm, logoAnimatedStyle]}>
                        <View style={styles.logoShadowContainer}>
                          <MyFieldsLogo size={80} backgroundColor="transparent" />
                        </View>
                      </Animated.View>
                      
                      {/* Product subtitle */}
                      <RTLText center style={styles.productSubtitle}>
                        הזמן מגרש בקלות
                      </RTLText>
                      
                      {/* Primary welcome text */}
                      <RTLText center style={styles.welcomeHeadline}>
                        ברוך השב!
                      </RTLText>
                      
                      {/* Supporting text */}
                      <RTLText center style={styles.supportingText}>
                        התחבר כדי להמשיך
                      </RTLText>
                    </View>

                    <View style={styles.form}>
                      <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.leftIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={email}
                          onChangeText={(text) => setEmail(text)}
                          placeholder="הזן את האימייל שלך"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.leftIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={password}
                          onChangeText={(text) => setPassword(text)}
                          placeholder="הזן את הסיסמה שלך"
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                          style={styles.toggleButton}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#64748B" 
                          />
                        </TouchableOpacity>
                      </View>

                      {error ? (
                        <View style={styles.errorContainer}>
                          <RTLText style={styles.errorText}>{error}</RTLText>
                        </View>
                      ) : null}

                      <View style={styles.formActions}>
                        <TouchableOpacity 
                          style={styles.forgotPassword}
                          accessibilityLabel="שחזר סיסמה"
                          accessibilityRole="button"
                        >
                          <RTLText style={styles.forgotPasswordText}>
                            שכחת סיסמה?
                          </RTLText>
                        </TouchableOpacity>

                        <WoltButton
                          variant="primary"
                          fullWidth
                          onPress={handleLogin}
                          style={styles.loginButton}
                          disabled={isLoading || (!email || !password)}
                          accessibilityLabel="התחבר לחשבון"
                        >
                          {isLoading ? (
                            <View style={styles.loadingContent}>
                              <LoadingSpinner size="small" color={designTokens.colors.text.inverse} />
                              <RTLText style={styles.loadingText}>מתחבר...</RTLText>
                            </View>
                          ) : (
                            <View style={styles.buttonContent}>
                              <Ionicons name="log-in" size={20} color={designTokens.colors.text.inverse} />
                              <RTLText style={styles.buttonText}>{texts.auth.signIn}</RTLText>
                            </View>
                          )}
                        </WoltButton>
                      </View>

                      {/* Social Login */}
                      <Animated.View style={[styles.socialSection, socialButtonsAnimatedStyle]}>
                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <RTLText style={styles.dividerText}>או התחבר עם</RTLText>
                          <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtonsContainer}>
                          <SocialButton
                            onPress={() => {}}
                            icon="logo-google"
                            iconColor="#4285F4"
                            text="Google"
                            accessibilityLabel="התחבר עם Google"
                          />
                          <SocialButton
                            onPress={() => {}}
                            icon="logo-apple"
                            iconColor="#000000"
                            text="Apple"
                            accessibilityLabel="התחבר עם Apple"
                          />
                        </View>
                      </Animated.View>

                      {/* Signup Link */}
                      <View style={styles.signupSection}>
                        <RTLText style={styles.signupText}>
                          {texts.auth.dontHaveAccount}
                        </RTLText>
                        <TouchableOpacity 
                          onPress={navigateToSignup}
                          accessibilityLabel="צור חשבון חדש"
                          accessibilityRole="button"
                        >
                          <RTLText style={styles.signupLink}>
                            {texts.auth.createAccount}
                          </RTLText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  simpleContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 10,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainContent: {
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainerInForm: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoShadowContainer: {
    shadowColor: designTokens.colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: 'transparent',
  },
  productSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  welcomeHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  supportingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
    marginBottom: 20,
  },
  logoSubtextInForm: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
    marginTop: 8,
  },
  formSection: {
    paddingVertical: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: 6,
    marginTop: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: designTokens.colors.text.secondary,
    marginBottom: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  toggleButton: {
    padding: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  formActions: {
    gap: 10,
    marginTop: 6,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  loadingText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  buttonText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
  },
  errorContainer: {
    backgroundColor: designTokens.colors.error[50],
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.error[200],
    marginVertical: designTokens.spacing.xs,
    shadowColor: designTokens.colors.error[500],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: designTokens.spacing.sm,
  },
  forgotPasswordText: {
    color: designTokens.colors.primary[600],
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  loginButton: {
    marginTop: 6,
    height: 48,
    borderRadius: 12,
  },
  socialSection: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: designTokens.spacing.md,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: '100%',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  signupText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '400',
  },
  signupLink: {
    color: designTokens.colors.primary[600],
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;