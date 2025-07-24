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
  Switch
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { WoltButton, LoadingSpinner, MyFieldsLogo } from '@components/design-system';
import { designTokens } from '@constants/theme';
import { texts } from '@constants/hebrewTexts';
import { registerUser } from '@services/mockApi';
import { MOCK_SPORTS } from '@constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    preferredSports: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const stepTranslateX = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    // Animate header entrance
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    
    // Update progress
    progressWidth.value = withTiming((currentStep / 3) * 100, { duration: 500 });
  }, [currentStep]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const stepAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stepTranslateX.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שדה חובה';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שדה חובה';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'שדה חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'חלשה';
      case 2:
        return 'בינונית';
      case 3:
        return 'חזקה';
      case 4:
        return 'חזקה מאוד';
      default:
        return 'חלשה';
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return designTokens.colors.error[500];
      case 2:
        return designTokens.colors.warning[500];
      case 3:
        return designTokens.colors.success[400];
      case 4:
        return designTokens.colors.success[600];
      default:
        return designTokens.colors.error[500];
    }
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'שדה חובה';
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להיות לפחות 6 תווים';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'שדה חובה';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    if (!acceptTerms) {
      newErrors.terms = 'יש לקבל את תנאי השימוש';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.preferredSports.length === 0) {
      newErrors.sports = 'אנא בחר לפחות ספורט אחד';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      stepTranslateX.value = withSpring(-50, { damping: 15 });
      setTimeout(() => {
        setCurrentStep(2);
        stepTranslateX.value = 50;
        stepTranslateX.value = withSpring(0, { damping: 15 });
      }, 150);
    } else if (currentStep === 2 && validateStep2()) {
      stepTranslateX.value = withSpring(-50, { damping: 15 });
      setTimeout(() => {
        setCurrentStep(3);
        stepTranslateX.value = 50;
        stepTranslateX.value = withSpring(0, { damping: 15 });
      }, 150);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      stepTranslateX.value = withSpring(50, { damping: 15 });
      setTimeout(() => {
        setCurrentStep(2);
        stepTranslateX.value = -50;
        stepTranslateX.value = withSpring(0, { damping: 15 });
      }, 150);
    } else if (currentStep === 2) {
      stepTranslateX.value = withSpring(50, { damping: 15 });
      setTimeout(() => {
        setCurrentStep(1);
        stepTranslateX.value = -50;
        stepTranslateX.value = withSpring(0, { damping: 15 });
      }, 150);
    } else {
      navigation.goBack();
    }
  };

  const handleSignup = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    
    try {
      const response = await registerUser({
        fullName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        phone: formData.phoneNumber,
        userType: 'player',
        walletBalance: 0,
        isVerified: false,
        onboardingCompleted: false,
        preferredSports: formData.preferredSports
      });
      
      if (response.success) {
        navigation.replace('Main');
      } else {
        setErrors({ general: response.error || 'שגיאה ברישום' });
      }
    } catch (error) {
      setErrors({ general: 'שגיאה בחיבור לשרת' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Update password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const toggleSport = (sportName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => {
      const newSports = prev.preferredSports.includes(sportName)
        ? prev.preferredSports.filter(sport => sport !== sportName)
        : [...prev.preferredSports, sportName];
      return { ...prev, preferredSports: newSports };
    });
    // Clear error when user selects a sport
    if (errors.sports) {
      setErrors(prev => ({ ...prev, sports: '' }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={designTokens.colors.primary[600]} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <MyFieldsLogo size={60} backgroundColor={designTokens.colors.background.card} />
            </View>
            <RTLText center style={styles.headerTitle}>
              צור חשבון חדש
            </RTLText>
            <RTLText center style={styles.headerSubtitle}>
              הצטרף לקהילת השחקנים שלנו
            </RTLText>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
            </View>
            <RTLText style={styles.progressText}>
              שלב {currentStep} מתוך 3
            </RTLText>
          </View>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.formContainer, stepAnimatedStyle]}>
            {currentStep === 1 ? (
              // Step 1: Personal Info
              <View style={styles.stepContainer}>
                <RTLText style={styles.stepTitle}>פרטים אישיים</RTLText>
                <RTLText style={styles.stepSubtitle}>
                  בואו נכיר אותך
                </RTLText>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>שם פרטי</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.firstName}
                        onChangeText={(value) => updateFormData('firstName', value)}
                        placeholder="הזן את השם הפרטי שלך"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.firstName && (
                      <RTLText style={styles.errorText}>{errors.firstName}</RTLText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>שם משפחה</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.lastName}
                        onChangeText={(value) => updateFormData('lastName', value)}
                        placeholder="הזן את שם המשפחה שלך"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.lastName && (
                      <RTLText style={styles.errorText}>{errors.lastName}</RTLText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>אימייל</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        placeholder="הזן את האימייל שלך"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.email && (
                      <RTLText style={styles.errorText}>{errors.email}</RTLText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>מספר טלפון</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="call-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.phoneNumber}
                        onChangeText={(value) => updateFormData('phoneNumber', value)}
                        placeholder="050-1234567"
                        keyboardType="phone-pad"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.phoneNumber && (
                      <RTLText style={styles.errorText}>{errors.phoneNumber}</RTLText>
                    )}
                  </View>
                </View>

                <WoltButton
                  variant="primary"
                  fullWidth
                  onPress={handleNext}
                  style={styles.continueButton}
                >
                  המשך
                </WoltButton>
              </View>
            ) : currentStep === 2 ? (
              // Step 2: Password
              <View style={styles.stepContainer}>
                <RTLText style={styles.stepTitle}>יצירת סיסמה</RTLText>
                <RTLText style={styles.stepSubtitle}>
                  בחר סיסמה חזקה לחשבון שלך
                </RTLText>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>סיסמה</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        placeholder="הזן סיסמה (לפחות 6 תווים)"
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.password && (
                      <RTLText style={styles.errorText}>{errors.password}</RTLText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <RTLText style={styles.inputLabel}>אישור סיסמה</RTLText>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.leftIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                        placeholder="הזן שוב את הסיסמה"
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    {errors.confirmPassword && (
                      <RTLText style={styles.errorText}>{errors.confirmPassword}</RTLText>
                    )}
                  </View>

                  {errors.general && (
                    <View style={styles.generalErrorContainer}>
                      <RTLText style={styles.errorText}>{errors.general}</RTLText>
                    </View>
                  )}
                </View>

                <WoltButton
                  variant="primary"
                  fullWidth
                  onPress={handleNext}
                  style={styles.continueButton}
                >
                  המשך
                </WoltButton>
              </View>
            ) : (
              // Step 3: Sports Selection
              <View style={styles.stepContainer}>
                <RTLText style={styles.stepTitle}>בחר את הספורטים שלך</RTLText>
                <RTLText style={styles.stepSubtitle}>
                  איזה ספורטים אתה אוהב לשחק?
                </RTLText>

                <View style={styles.form}>
                  <View style={styles.sportsGrid}>
                    {MOCK_SPORTS.map((sport) => (
                      <TouchableOpacity
                        key={sport.id}
                        style={[
                          styles.sportCard,
                          formData.preferredSports.includes(sport.name) && styles.sportCardSelected
                        ]}
                        onPress={() => toggleSport(sport.name)}
                        accessibilityLabel={`בחר ${sport.name}`}
                        accessibilityRole="button"
                      >
                        <RTLText style={styles.sportIcon}>{sport.iconName}</RTLText>
                        <RTLText style={[
                          styles.sportName,
                          formData.preferredSports.includes(sport.name) && styles.sportNameSelected
                        ]}>
                          {sport.name}
                        </RTLText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {errors.sports && (
                    <View style={styles.generalErrorContainer}>
                      <RTLText style={styles.errorText}>{errors.sports}</RTLText>
                    </View>
                  )}

                  {errors.general && (
                    <View style={styles.generalErrorContainer}>
                      <RTLText style={styles.errorText}>{errors.general}</RTLText>
                    </View>
                  )}
                </View>

                <WoltButton
                  variant="primary"
                  fullWidth
                  onPress={handleSignup}
                  style={styles.signupButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" color={designTokens.colors.text.inverse} />
                  ) : (
                    'צור חשבון'
                  )}
                </WoltButton>
              </View>
            )}

            {/* Login Link */}
            <View style={styles.loginSection}>
              <RTLText style={styles.loginText}>
                {texts.auth.alreadyHaveAccount}
              </RTLText>
              <TouchableOpacity onPress={navigateToLogin}>
                <RTLText style={styles.loginLink}>
                  {texts.auth.signIn}
                </RTLText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.background.card,
    borderBottomLeftRadius: designTokens.borderRadius.xl,
    borderBottomRightRadius: designTokens.borderRadius.xl,
    ...designTokens.shadows.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.sm,
  },
  backButtonText: {
    fontSize: designTokens.typography.sizes.xl,
    color: designTokens.colors.primary[600],
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  logoContainer: {
    marginBottom: designTokens.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: designTokens.typography.sizes.xxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  headerSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: designTokens.colors.secondary[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: designTokens.colors.primary[600],
    borderRadius: 2,
  },
  progressText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 320,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  stepSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.md,
  },
  form: {
    gap: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.md,
  },
  inputGroup: {
    marginBottom: designTokens.spacing.xs,
  },
  inputLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
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
  generalErrorContainer: {
    backgroundColor: designTokens.colors.error[50],
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.error[200],
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'center',
  },
  continueButton: {
    height: 44,
    marginTop: 'auto',
  },
  signupButton: {
    height: 44,
    marginTop: 'auto',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: designTokens.spacing.lg,
    gap: designTokens.spacing.xs,
  },
  loginText: {
    color: designTokens.colors.text.secondary,
    fontSize: designTokens.typography.sizes.md,
  },
  loginLink: {
    color: designTokens.colors.primary[600],
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  sportCardSelected: {
    borderColor: designTokens.colors.primary[600],
    backgroundColor: designTokens.colors.primary[50],
  },
  sportIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  sportNameSelected: {
    color: designTokens.colors.primary[600],
  },
});

export default SignupScreen;