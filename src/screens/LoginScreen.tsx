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
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { WoltButton, LoadingSpinner, MyFieldsLogo } from '@components/design-system';
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
  return (
    <TouchableOpacity
      style={styles.socialButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons name={icon as any} size={20} color={iconColor} />
      <RTLText style={styles.socialButtonText}>{text}</RTLText>
    </TouchableOpacity>
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
  }, []);

  const handlePasswordToggle = () => {
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
    // Real-time validation - only show errors after user has typed something substantial
    if (text.length > 3) {
      const error = validateEmail(text);
      setEmailError(error);
    } else {
      setEmailError('');
    }
  };
  
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Real-time validation - only show errors after user has typed something
    if (text.length > 0) {
      const error = validatePassword(text);
      setPasswordError(error);
    } else {
      setPasswordError('');
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header section with clean hierarchy */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <MyFieldsLogo size={60} backgroundColor="transparent" />
            </View>
            
            <RTLText style={styles.welcomeTitle}>ברוך השב!</RTLText>
            <RTLText style={styles.welcomeSubtitle}>התחבר כדי להמשיך</RTLText>
          </View>

          {/* Main form */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={emailError ? designTokens.colors.error[500] : designTokens.colors.text.tertiary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.textInput, emailError && styles.textInputError]}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="אימייל"
                    placeholderTextColor={designTokens.colors.text.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="שדה אימייל"
                  />
                </View>
                {emailError ? (
                  <RTLText style={styles.errorText}>{emailError}</RTLText>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={passwordError ? designTokens.colors.error[500] : designTokens.colors.text.tertiary} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.textInput, passwordError && styles.textInputError]}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="סיסמה"
                    placeholderTextColor={designTokens.colors.text.tertiary}
                    secureTextEntry={!showPassword}
                    accessibilityLabel="שדה סיסמה"
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={handlePasswordToggle}
                    accessibilityLabel={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={passwordError ? designTokens.colors.error[500] : designTokens.colors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <RTLText style={styles.errorText}>{passwordError}</RTLText>
                ) : null}
              </View>
              
              {/* Options row */}
              <View style={styles.optionsRow}>
                <View style={styles.rememberMe}>
                  <Switch
                    value={rememberMe}
                    onValueChange={(value) => {
                      setRememberMe(value);
                      if (value) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    trackColor={{ false: designTokens.colors.border.light, true: designTokens.colors.primary[200] }}
                    thumbColor={rememberMe ? designTokens.colors.primary[600] : designTokens.colors.text.disabled}
                    ios_backgroundColor={designTokens.colors.border.light}
                  />
                  <RTLText style={styles.rememberMeText}>זכור אותי</RTLText>
                </View>
                
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  accessibilityLabel="שחזר סיסמה"
                  accessibilityRole="button"
                >
                  <RTLText style={styles.forgotPasswordText}>שכחת סיסמה?</RTLText>
                </TouchableOpacity>
              </View>

              {/* General error */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={designTokens.colors.error[500]} />
                  <RTLText style={styles.generalErrorText}>{error}</RTLText>
                </View>
              ) : null}

              {/* Login button */}
              <WoltButton
                variant="primary"
                fullWidth
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading || (!email || !password)}
                accessibilityLabel="התחבר לחשבון"
              >
                {isLoading ? (
                  <View style={styles.buttonContent}>
                    <LoadingSpinner size="small" color={designTokens.colors.text.inverse} />
                    <RTLText style={styles.buttonText}>מתחבר...</RTLText>
                  </View>
                ) : (
                  <RTLText style={styles.buttonText}>{texts.auth.signIn}</RTLText>
                )}
              </WoltButton>
              
              {/* Biometric Authentication */}
              {isBiometricAvailable && (
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
              )}
            </View>
          </View>

          {/* Social Login - Simplified */}
          <View style={styles.socialSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <RTLText style={styles.dividerText}>או</RTLText>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
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
          </View>

          {/* Signup link */}
          <View style={styles.signupSection}>
            <RTLText style={styles.signupText}>אין לך חשבון?</RTLText>
            <TouchableOpacity 
              onPress={navigateToSignup}
              accessibilityLabel="צור חשבון חדש"
              accessibilityRole="button"
            >
              <RTLText style={styles.signupLink}>הירשם כאן</RTLText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: designTokens.spacing.xl,
    paddingTop: designTokens.spacing.massive,
    paddingBottom: designTokens.spacing.xxl,
  },
  
  // Header section - clean and minimal
  headerSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxxl,
  },
  logoContainer: {
    marginBottom: designTokens.spacing.lg,
  },
  welcomeTitle: {
    fontSize: designTokens.typography.sizes.xxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left', // RTL compliance: 'left' shows on visual right in RTL mode
  },
  welcomeSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'left', // RTL compliance
  },
  
  // Form card - clean white card
  formCard: {
    backgroundColor: designTokens.colors.background.elevated,
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.xxl,
    marginBottom: designTokens.spacing.xl,
    ...designTokens.shadows.sm,
  },
  form: {
    gap: designTokens.spacing.lg,
  },
  
  // Input styling - clean and modern
  inputGroup: {
    gap: designTokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.primary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    borderRadius: designTokens.borderRadius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 52,
  },
  inputContainerError: {
    borderColor: designTokens.colors.error[500],
    backgroundColor: designTokens.colors.error[50],
  },
  inputIcon: {
    marginRight: designTokens.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    textAlign: 'left', // RTL compliance: shows text on visual right
    paddingVertical: designTokens.spacing.sm,
  },
  textInputError: {
    color: designTokens.colors.error[700],
  },
  passwordToggle: {
    padding: designTokens.spacing.xs,
    marginLeft: designTokens.spacing.xs,
  },
  
  // Options row - remember me and forgot password
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: designTokens.spacing.xs,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  rememberMeText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left', // RTL compliance
  },
  forgotPassword: {
    padding: designTokens.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left', // RTL compliance
  },
  
  // Error handling
  errorText: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.error[600],
    marginTop: designTokens.spacing.xs,
    marginRight: designTokens.spacing.lg,
    textAlign: 'left', // RTL compliance: error text aligned to visual right
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.error[50],
    borderRadius: designTokens.borderRadius.sm,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    gap: designTokens.spacing.sm,
  },
  generalErrorText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.error[600],
    textAlign: 'left', // RTL compliance
  },
  
  // Buttons
  loginButton: {
    marginTop: designTokens.spacing.md,
    height: 52,
    borderRadius: designTokens.borderRadius.md,
  },
  biometricButton: {
    height: 48,
    borderRadius: designTokens.borderRadius.md,
    borderColor: designTokens.colors.primary[300],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  buttonText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.inverse,
    textAlign: 'left', // RTL compliance
  },
  biometricButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.primary[600],
    textAlign: 'left', // RTL compliance
  },
  
  // Social login section - simplified
  socialSection: {
    gap: designTokens.spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: designTokens.colors.border.light,
  },
  dividerText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left', // RTL compliance
  },
  socialButtons: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.background.primary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    borderRadius: designTokens.borderRadius.md,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.sm,
    height: 48,
  },
  socialButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'left', // RTL compliance
  },
  
  // Signup section
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    marginTop: designTokens.spacing.lg,
  },
  signupText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'left', // RTL compliance
  },
  signupLink: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.semibold,
    textAlign: 'left', // RTL compliance
  },
});

export default LoginScreen;