import React, { useState, useEffect } from 'react';
import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { Input, WoltButton, LoadingSpinner, MyFieldsLogo } from '@components/design-system';
import { designTokens } from '@constants/theme';
import { texts } from '@constants/hebrewTexts';
import { loginUser } from '@services/mockApi';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);

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

  useEffect(() => {
    // Check biometric availability
    const checkBiometricSupport = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (hasHardware && supportedTypes.length > 0) {
          setIsBiometricAvailable(true);
          setBiometricType(supportedTypes[0]);
        }
      } catch (error) {
        console.log('Biometric authentication not available:', error);
        setIsBiometricAvailable(false);
      }
    };
    
    // Load saved credentials
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        
        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };
    
    checkBiometricSupport();
    loadSavedCredentials();
    
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
  
  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable) {
      Alert.alert('שגיאה', 'זיהוי ביומטרי לא זמין במכשיר זה');
      return;
    }
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'השתמש בזיהוי ביומטרי להתחברות',
        fallbackLabel: 'השתמש בסיסמה',
        cancelLabel: 'ביטול',
        requireConfirmation: false,
      });
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Load saved credentials and login
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          await handleLoginWithCredentials(savedEmail, savedPassword);
        } else {
          Alert.alert('שגיאה', 'לא נמצאו פרטי התחברות שמורים');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('שגיאה', 'שגיאה בזיהוי ביומטרי');
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'נא להזין כתובת אימייל';
    }
    if (!emailRegex.test(email.trim())) {
      return 'כתובת האימייל אינה תקינה';
    }
    return '';
  };
  
  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return 'נא להזין סיסמה';
    }
    if (password.length < 6) {
      return 'הסיסמה חייבת להכיל לפחות 6 תווים';
    }
    return '';
  };
  
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      const error = validateEmail(text);
      setEmailError(error);
    }
  };
  
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      const error = validatePassword(text);
      setPasswordError(error);
    }
  };
  
  const handleLoginWithCredentials = async (emailParam: string, passwordParam: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await loginUser(emailParam.trim(), passwordParam);
      
      if (response.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', emailParam.trim());
          await AsyncStorage.setItem('rememberedPassword', passwordParam);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberedPassword');
          await AsyncStorage.removeItem('rememberMe');
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('Main');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(response.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('שגיאה בחיבור לשרת. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Real-time validation
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    if (emailValidationError) {
      setEmailError(emailValidationError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await handleLoginWithCredentials(email, password);
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
                      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                        <View style={[styles.inputContainer, emailError && styles.inputError]}>
                          <Ionicons name="mail-outline" size={20} color={emailError ? designTokens.colors.error[500] : "#64748B"} style={styles.leftIcon} />
                          <TextInput
                            style={[styles.textInput, emailError && styles.textInputError]}
                            value={email}
                            onChangeText={handleEmailChange}
                            onBlur={() => setEmailError(validateEmail(email))}
                            placeholder="הזן את האימייל שלך"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            accessibilityLabel="שדה אימייל"
                          />
                        </View>
                        {emailError ? (
                          <RTLText style={styles.inputErrorText}>{emailError}</RTLText>
                        ) : null}
                      </Animated.View>

                      <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                        <View style={[styles.inputContainer, passwordError && styles.inputError]}>
                          <Ionicons name="lock-closed-outline" size={20} color={passwordError ? designTokens.colors.error[500] : "#64748B"} style={styles.leftIcon} />
                          <TextInput
                            style={[styles.textInput, passwordError && styles.textInputError]}
                            value={password}
                            onChangeText={handlePasswordChange}
                            onBlur={() => setPasswordError(validatePassword(password))}
                            placeholder="הזן את הסיסמה שלך"
                            secureTextEntry={!showPassword}
                            accessibilityLabel="שדה סיסמה"
                          />
                          <TouchableOpacity 
                            style={styles.toggleButton}
                            onPress={handlePasswordToggle}
                            accessibilityLabel={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                          >
                            <Animated.View style={passwordToggleAnimatedStyle}>
                              <Ionicons 
                                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                size={20} 
                                color={passwordError ? designTokens.colors.error[500] : "#64748B"} 
                              />
                            </Animated.View>
                          </TouchableOpacity>
                        </View>
                        {passwordError ? (
                          <RTLText style={styles.inputErrorText}>{passwordError}</RTLText>
                        ) : null}
                      </Animated.View>
                      
                      {/* Remember Me Toggle */}
                      <Animated.View entering={FadeInDown.delay(350).duration(600)} style={styles.rememberMeContainer}>
                        <View style={styles.rememberMeContent}>
                          <RTLText style={styles.rememberMeText}>זכור אותי</RTLText>
                          <Switch
                            value={rememberMe}
                            onValueChange={(value) => {
                              setRememberMe(value);
                              if (value) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }
                            }}
                            trackColor={{ false: '#E2E8F0', true: designTokens.colors.primary[200] }}
                            thumbColor={rememberMe ? designTokens.colors.primary[600] : '#94A3B8'}
                            ios_backgroundColor="#E2E8F0"
                          />
                        </View>
                      </Animated.View>

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

                        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
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
                        </Animated.View>
                        
                        {/* Biometric Authentication Button */}
                        {isBiometricAvailable && (
                          <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.biometricContainer}>
                            <View style={styles.biometricDivider}>
                              <View style={styles.divider} />
                              <RTLText style={styles.biometricDividerText}>או</RTLText>
                              <View style={styles.divider} />
                            </View>
                            <WoltButton
                              variant="outline"
                              fullWidth
                              onPress={handleBiometricAuth}
                              style={styles.biometricButton}
                              disabled={isLoading}
                              accessibilityLabel={`התחבר באמצעות ${biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ? 'Face ID' : 'Touch ID'}`}
                            >
                              <View style={styles.buttonContent}>
                                <Ionicons 
                                  name={biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ? "scan" : "finger-print"} 
                                  size={20} 
                                  color={designTokens.colors.primary[600]} 
                                />
                                <RTLText style={styles.biometricButtonText}>
                                  {biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ? 'Face ID' : 'Touch ID'}
                                </RTLText>
                              </View>
                            </WoltButton>
                          </Animated.View>
                        )}
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
  inputError: {
    borderColor: designTokens.colors.error[500],
    borderWidth: 1.5,
    backgroundColor: designTokens.colors.error[50],
  },
  textInputError: {
    color: designTokens.colors.error[700],
  },
  inputErrorText: {
    color: designTokens.colors.error[600],
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  rememberMeContainer: {
    marginTop: 8,
  },
  rememberMeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rememberMeText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    fontWeight: '500',
  },
  biometricContainer: {
    marginTop: 16,
  },
  biometricDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  biometricDividerText: {
    marginHorizontal: 12,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  biometricButton: {
    height: 44,
    borderRadius: 12,
    borderColor: designTokens.colors.primary[300],
    borderWidth: 1.5,
  },
  biometricButtonText: {
    color: designTokens.colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;