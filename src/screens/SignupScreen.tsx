import React, { useState, useRef } from 'react';
import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { WoltButton, LoadingSpinner, MyFieldsLogo, CityAutocomplete, PricingInput, StructuredLocationInput } from '@components/design-system';
import { OperatingHoursInput } from '@components/design-system/OperatingHoursInput';
import { designTokens } from '@constants/theme';
import { texts } from '@constants/hebrewTexts';
import { registerUser } from '@services/mockApi';
import { MOCK_SPORTS, MOCK_CITIES } from '@constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';

import type { OperatingHours, DayHours } from '@components/design-system/OperatingHoursInput';
import type { PricingData } from '@components/design-system/PricingInput';
import type { StructuredAddress } from '@components/design-system/StructuredLocationInput';

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
    userType: '' as 'player' | 'business_owner' | '',
    city: '',
    address: '',
    preferredSports: [] as string[],
    profileImageUrl: '',
    // Business owner field information
    fieldName: '',
    fieldTypes: [] as string[],
    fieldLocation: {
      street: '',
      streetNumber: '',
      city: '',
      postalCode: '',
      country: 'ישראל',
    } as StructuredAddress,
    operatingHours: {
      sunday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
      saturday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    } as OperatingHours,
    pricing: {
      basePrice: 0,
      currency: 'ILS',
      pricingType: 'per_hour',
      hasPeakPricing: false,
      groupPricing: [],
      packages: [],
    } as PricingData,
    amenities: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPhoneTyping, setIsPhoneTyping] = useState(false);
  const [isEmailTyping, setIsEmailTyping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Refs for debounced validation
  const phoneValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cityInputRef = useRef<TextInput>(null);

  // Animation values
  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const stepTranslateX = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Animation values for success screen
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header entrance
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    
    // Update progress
    progressWidth.value = withTiming((currentStep / 3) * 100, { duration: 500 });
  }, [currentStep]);

  // Load saved form data on mount
  React.useEffect(() => {
    const loadSavedFormData = async () => {
      try {
        const saved = await AsyncStorage.getItem('signupFormData');
        if (saved) {
          const savedData = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...savedData }));
        }
      } catch (error) {
        console.log('Failed to load saved form data:', error);
      }
    };
    
    loadSavedFormData();
  }, []);

  // Cleanup validation timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
      if (emailValidationTimeoutRef.current) {
        clearTimeout(emailValidationTimeoutRef.current);
      }
    };
  }, []);

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

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const validateStep1 = (skipPhoneValidation = false, skipEmailValidation = false) => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שדה חובה';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'שם חייב להיות לפחות 2 תווים';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שדה חובה';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'שם משפחה חייב להיות לפחות 2 תווים';
    }
    
    // Enhanced email validation (skip if user is typing)
    if (!skipEmailValidation) {
      if (!formData.email.trim()) {
        newErrors.email = 'שדה חובה';
      } else if (!isEmailTyping) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = 'אימייל לא תקין';
        }
      }
    }
    
    // Israeli phone number validation (skip if user is typing)
    if (!skipPhoneValidation) {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'שדה חובה';
      } else if (!isPhoneTyping) {
        const phoneRegex = /^(\+972|0)(5[0-9]|7[23456789])\d{7}$|^(\+972|0)[23489]\d{7}$/;
        const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phoneNumber = 'מספר טלפון לא תקין (לדוגמה: 050-1234567)';
        }
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'שדה חובה';
    } else if (formData.password.length < 8) {
      newErrors.password = 'סיסמה חייבת להיות לפחות 8 תווים';
    } else if (passwordStrength < 2) {
      newErrors.password = 'סיסמה חלשה מדי - השתמש באותיות גדולות, קטנות ומספרים';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'שדה חובה';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'יש לקבל את תנאי השימוש';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
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
    
    // User type validation
    if (!formData.userType) {
      newErrors.userType = 'אנא בחר סוג משתמש';
    }
    
    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'שדה חובה';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'שם העיר חייב להיות לפחות 2 תוים';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };


  const validateStructuredAddress = (address: StructuredAddress): string | null => {
    if (!address.street.trim()) return 'שם הרחוב הוא שדה חובה';
    if (!address.streetNumber.trim()) return 'מספר בית הוא שדה חובה';
    if (!address.city.trim()) return 'שם העיר הוא שדה חובה';
    return null;
  };

  const validateOperatingHours = (hours: OperatingHours): string | null => {
    if (!hours) return 'שעות פעילות הן שדה חובה';
    
    const hasOpenDays = Object.values(hours).some(day => day && day.isOpen);
    if (!hasOpenDays) return 'חייב להיות פתוח לפחות ביום אחד';
    
    // Validate time ranges for open days
    for (const [dayName, dayHours] of Object.entries(hours)) {
      if (dayHours && dayHours.isOpen && dayHours.openTime >= dayHours.closeTime) {
        return `יום ${dayName}: שעת הפתיחה חייבת להיות לפני שעת הסגירה`;
      }
    }
    
    return null;
  };

  const validatePricing = (pricing: PricingData): string | null => {
    if (!pricing) return 'פרטי תעריף הם שדה חובה';
    if (pricing.basePrice <= 0) return 'חייב להגדיר מחיר בסיס גדול מ-0';
    
    if (pricing.hasPeakPricing) {
      if (!pricing.peakPrice || pricing.peakPrice <= pricing.basePrice) {
        return 'מחיר שעות עומס חייב להיות גדול ממחיר הבסיס';
      }
    }
    
    // Validate group pricing tiers
    if (pricing.groupPricing) {
      for (const tier of pricing.groupPricing) {
        if (tier && tier.name && tier.name.trim() === '') return 'שם קבוצה לא יכול להיות ריק';
        if (tier && tier.price < 0) return 'מחיר קבוצה לא יכול להיות שלילי';
      }
    }
    
    // Validate packages
    if (pricing.packages) {
      for (const packageTier of pricing.packages) {
        if (packageTier && packageTier.name && packageTier.name.trim() === '') return 'שם חבילה לא יכול להיות ריק';
        if (packageTier && packageTier.price <= 0) return 'מחיר חבילה חייב להיות גדול מ-0';
      }
    }
    
    return null;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.userType === 'business_owner') {
      // Validate business field information
      if (!formData.fieldName.trim()) {
        newErrors.fieldName = 'שם המגרש הוא שדה חובה';
      }
      if (formData.fieldTypes.length === 0) {
        newErrors.fieldTypes = 'אנא בחר לפחות סוג מגרש אחד';
      }
      
      // Validate structured location
      const locationError = validateStructuredAddress(formData.fieldLocation);
      if (locationError) {
        newErrors.fieldLocation = locationError;
      }
      
      // Validate operating hours
      const hoursError = validateOperatingHours(formData.operatingHours);
      if (hoursError) {
        newErrors.operatingHours = hoursError;
      }
      
      // Validate pricing
      const pricingError = validatePricing(formData.pricing);
      if (pricingError) {
        newErrors.pricing = pricingError;
      }
    } else {
      // Validate sports preferences for regular players
      if (formData.preferredSports.length === 0) {
        newErrors.sports = 'אנא בחר לפחות ספורט אחד';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep === 1 && validateStep1()) {
      // Smooth slide transition to step 2
      stepTranslateX.value = withTiming(-100, { duration: 200 });
      setTimeout(() => {
        setCurrentStep(2);
        stepTranslateX.value = 100;
        stepTranslateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }, 200);
    } else if (currentStep === 2 && validateStep2()) {
      // Smooth slide transition to step 3
      stepTranslateX.value = withTiming(-100, { duration: 200 });
      setTimeout(() => {
        setCurrentStep(3);
        stepTranslateX.value = 100;
        stepTranslateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }, 200);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep === 3) {
      // Smooth slide transition back to step 2
      stepTranslateX.value = withTiming(100, { duration: 200 });
      setTimeout(() => {
        setCurrentStep(2);
        stepTranslateX.value = -100;
        stepTranslateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }, 200);
    } else if (currentStep === 2) {
      // Smooth slide transition back to step 1
      stepTranslateX.value = withTiming(100, { duration: 200 });
      setTimeout(() => {
        setCurrentStep(1);
        stepTranslateX.value = -100;
        stepTranslateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }, 200);
    } else {
      navigation.goBack();
    }
  };

  const handleSignup = async () => {
    // Validate all steps before submission
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      setErrors(prev => ({ ...prev, general: 'אנא בדוק שכל השדות מלאים כראוי' }));
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean phone number before sending
      const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      
      const userData = {
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        userType: formData.userType as 'player' | 'business_owner',
        city: formData.city.trim(),
        address: formData.address.trim() || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        walletBalance: 0,
        isVerified: false,
        onboardingCompleted: true, // Set to true after completing signup
        isBusinessOwner: formData.userType === 'business_owner',
        preferredSports: formData.preferredSports,
        password: formData.password, // Include password in user data
        // Add field information for business owners
        ...(formData.userType === 'business_owner' && {
          fieldInfo: {
            name: formData.fieldName.trim(),
            types: formData.fieldTypes,
            location: formData.fieldLocation,
            operatingHours: formData.operatingHours,
            pricing: formData.pricing,
            amenities: formData.amenities,
          }
        })
      };

      const response = await registerUser(userData);
      
      if (response.success && response.data) {
        // Save user session data
        const authToken = `auth_token_${Date.now()}_${response.data.id}`;
        const userData = response.data;
        
        // Store authentication data
        await AsyncStorage.multiSet([
          ['currentUser', JSON.stringify(userData)],
          ['authToken', authToken],
          ['lastAuthenticatedUser', JSON.stringify({
            id: userData.id,
            name: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            hasBiometrics: false // Will be set up later if user chooses
          })]
        ]);
        
        // Add haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Clear saved form data after successful signup
        AsyncStorage.removeItem('signupFormData').catch(error => {
          console.log('Failed to clear form data:', error);
        });
        
        // Show success animation
        setIsSuccess(true);
        
        // Animate success screen
        successScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        successOpacity.value = withTiming(1, { duration: 400 });
        
        // Navigate after short delay to show success state
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { user: userData, isNewUser: true } }]
          });
        }, 1500);
        
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({ general: response.error || 'שגיאה ברישום' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ general: 'שגיאה בחיבור לשרת. אנא נסה שוב.' });
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedPhoneValidation = React.useCallback((phoneValue: string) => {
    // Clear existing timeout
    if (phoneValidationTimeoutRef.current) {
      clearTimeout(phoneValidationTimeoutRef.current);
    }

    // Set new timeout for validation
    phoneValidationTimeoutRef.current = setTimeout(() => {
      // Only validate if phone has meaningful length
      if (phoneValue.trim().length > 3) {
        const phoneRegex = /^(\+972|0)(5[0-9]|7[23456789])\d{7}$|^(\+972|0)[23489]\d{7}$/;
        const cleanPhone = phoneValue.replace(/[\s-]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
          setErrors(prev => ({ 
            ...prev, 
            phoneNumber: 'מספר טלפון לא תקין (לדוגמה: 050-1234567)' 
          }));
        }
      }
      setIsPhoneTyping(false);
    }, 800); // 800ms delay after user stops typing
  }, []);

  const debouncedEmailValidation = React.useCallback((emailValue: string) => {
    // Clear existing timeout
    if (emailValidationTimeoutRef.current) {
      clearTimeout(emailValidationTimeoutRef.current);
    }

    // Set new timeout for validation
    emailValidationTimeoutRef.current = setTimeout(() => {
      // Only validate if email has meaningful length
      if (emailValue.trim().length > 3) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(emailValue.trim())) {
          setErrors(prev => ({ 
            ...prev, 
            email: 'אימייל לא תקין' 
          }));
        }
      }
      setIsEmailTyping(false);
    }, 600); // 600ms delay after user stops typing
  }, []);

  const updateFormData = (field: string, value: string | OperatingHours | PricingData | StructuredAddress) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Save form data to AsyncStorage for persistence
    AsyncStorage.setItem('signupFormData', JSON.stringify(newFormData)).catch(error => {
      console.log('Failed to save form data:', error);
    });
    
    // Handle phone number with debounced validation
    if (field === 'phoneNumber' && typeof value === 'string') {
      setIsPhoneTyping(true);
      // Clear error immediately when typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      // Trigger debounced validation
      debouncedPhoneValidation(value);
    } else if (field === 'email' && typeof value === 'string') {
      setIsEmailTyping(true);
      // Clear error immediately when typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      // Trigger debounced email validation
      debouncedEmailValidation(value);
    } else {
      // Clear error when user starts typing for other fields
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
    
    // Update password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const toggleSport = (sportName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => {
      const newSports = prev.preferredSports.includes(sportName)
        ? prev.preferredSports.filter(sport => sport !== sportName)
        : [...prev.preferredSports, sportName];
      const newFormData = { ...prev, preferredSports: newSports };
      
      // Save to AsyncStorage
      AsyncStorage.setItem('signupFormData', JSON.stringify(newFormData)).catch(error => {
        console.log('Failed to save form data:', error);
      });
      
      return newFormData;
    });
    // Clear error when user selects a sport
    if (errors.sports) {
      setErrors(prev => ({ ...prev, sports: '' }));
    }
  };

  const toggleFieldType = (fieldType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => {
      const newFieldTypes = prev.fieldTypes.includes(fieldType)
        ? prev.fieldTypes.filter(type => type !== fieldType)
        : [...prev.fieldTypes, fieldType];
      const newFormData = { ...prev, fieldTypes: newFieldTypes };
      
      // Save to AsyncStorage
      AsyncStorage.setItem('signupFormData', JSON.stringify(newFormData)).catch(error => {
        console.log('Failed to save form data:', error);
      });
      
      return newFormData;
    });
    // Clear error when user selects a field type
    if (errors.fieldTypes) {
      setErrors(prev => ({ ...prev, fieldTypes: '' }));
    }
  };

  const toggleAmenity = (amenityName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => {
      const newAmenities = prev.amenities.includes(amenityName)
        ? prev.amenities.filter(amenity => amenity !== amenityName)
        : [...prev.amenities, amenityName];
      const newFormData = { ...prev, amenities: newAmenities };
      
      // Save to AsyncStorage
      AsyncStorage.setItem('signupFormData', JSON.stringify(newFormData)).catch(error => {
        console.log('Failed to save form data:', error);
      });
      
      return newFormData;
    });
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const selectUserType = (userType: 'player' | 'business_owner') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData('userType', userType);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('profileImageUrl', result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון תמונה');
    }
  };

  const removeImage = () => {
    updateFormData('profileImageUrl', '');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const focusCityInput = () => {
    // Ensure keyboard stays visible when focusing city input
    requestAnimationFrame(() => {
      cityInputRef.current?.focus();
    });
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
            <View style={styles.logoTitleRow}>
              <MyFieldsLogo size={36} backgroundColor={designTokens.colors.background.card} />
              <RTLText style={styles.headerTitle}>
                צור חשבון חדש
              </RTLText>
            </View>
            
            {/* Slim Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
              </View>
              <RTLText style={styles.progressText}>
                {currentStep}/3
              </RTLText>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
          <Animated.View style={[styles.formContainer, stepAnimatedStyle]}>
            {currentStep === 1 ? (
              // Step 1: Personal Info
              <View style={styles.stepContainer}>
                <View style={styles.stepContent}>
                  <RTLText style={styles.stepTitle}>צור חשבון</RTLText>
                  <RTLText style={styles.stepSubtitle}>
                    מלא את הפרטים ליצירת חשבון חדש
                  </RTLText>

                  <View style={styles.form}>
                    <View style={styles.inputGroup}>
                      <RTLText style={styles.inputLabel}>שם פרטי</RTLText>
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
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
                        <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
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
                        <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
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
                        <Ionicons name="call-outline" size={20} color="#64748B" style={styles.inputIcon} />
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

                    <View style={styles.inputGroup}>
                      <RTLText style={styles.inputLabel}>סיסמה</RTLText>
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formData.password}
                          onChangeText={(value) => updateFormData('password', value)}
                          placeholder="הזן סיסמה (לפחות 8 תווים)"
                          secureTextEntry={!showPassword}
                          placeholderTextColor="#94A3B8"
                        />
                        <TouchableOpacity 
                          style={styles.passwordToggle}
                          onPress={() => setShowPassword(!showPassword)}
                          accessibilityLabel={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                          accessibilityRole="button"
                        >
                          <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#64748B" 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <RTLText style={styles.errorText}>{errors.password}</RTLText>
                      )}
                      
                      {/* Password Strength Indicator */}
                      {formData.password.length > 0 && (
                        <View style={styles.passwordStrengthContainer}>
                          <View style={styles.passwordStrengthBar}>
                            <View 
                              style={[
                                styles.passwordStrengthFill, 
                                { 
                                  width: `${(passwordStrength / 4) * 100}%`,
                                  backgroundColor: getPasswordStrengthColor(passwordStrength)
                                }
                              ]} 
                            />
                          </View>
                          <RTLText style={[styles.passwordStrengthText, { color: getPasswordStrengthColor(passwordStrength) }]}>
                            סיסמה {getPasswordStrengthText(passwordStrength)}
                          </RTLText>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <RTLText style={styles.inputLabel}>אישור סיסמה</RTLText>
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formData.confirmPassword}
                          onChangeText={(value) => updateFormData('confirmPassword', value)}
                          placeholder="הזן שוב את הסיסמה"
                          secureTextEntry={!showConfirmPassword}
                          placeholderTextColor="#94A3B8"
                        />
                        <TouchableOpacity 
                          style={styles.passwordToggle}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          accessibilityLabel={showConfirmPassword ? "הסתר אישור סיסמה" : "הצג אישור סיסמה"}
                          accessibilityRole="button"
                        >
                          <Ionicons 
                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#64748B" 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && (
                        <RTLText style={styles.errorText}>{errors.confirmPassword}</RTLText>
                      )}
                    </View>

                    {/* Terms and Conditions */}
                    <View style={styles.termsContainer}>
                      <TouchableOpacity 
                        style={styles.termsCheckbox}
                        onPress={() => {
                          setAcceptTerms(!acceptTerms);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        accessibilityLabel={acceptTerms ? "בטל את קבלת התנאים" : "קבל את תנאי השימוש"}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: acceptTerms }}
                      >
                        <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                          {acceptTerms && (
                            <Ionicons name="checkmark" size={16} color={designTokens.colors.text.inverse} />
                          )}
                        </View>
                        <RTLText style={styles.termsText}>
                          אני מסכים ל<RTLText style={styles.termsLink}>תנאי השימוש</RTLText> ו<RTLText style={styles.termsLink}>מדיניות הפרטיות</RTLText>
                        </RTLText>
                      </TouchableOpacity>
                      {errors.terms && (
                        <RTLText style={styles.errorText}>{errors.terms}</RTLText>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <WoltButton
                    variant="primary"
                    fullWidth
                    onPress={handleNext}
                    style={styles.continueButton}
                  >
                    המשך
                  </WoltButton>
                </View>
              </View>
            ) : currentStep === 2 ? (
              // Step 2: Account Type & Location
              <View style={styles.stepContainer}>
                <View style={styles.stepContent}>
                  <RTLText style={styles.stepTitle}>סוג חשבון ומיקום</RTLText>
                  <RTLText style={styles.stepSubtitle}>
                    מה סוג המשתמש אתה ואיפה אתה ממוקם?
                  </RTLText>

                  <View style={styles.form}>
                    {/* User Type Selection */}
                    <View style={styles.inputGroup}>
                      <RTLText style={styles.inputLabel}>סוג חשבון</RTLText>
                      <View style={styles.userTypeContainer}>
                        <TouchableOpacity
                          style={[
                            styles.userTypeCard,
                            formData.userType === 'player' && styles.userTypeCardSelected
                          ]}
                          onPress={() => selectUserType('player')}
                          accessibilityLabel="בחר שחקן"
                          accessibilityRole="button"
                        >
                          <Ionicons 
                            name="football-outline" 
                            size={32} 
                            color={formData.userType === 'player' ? designTokens.colors.primary[600] : '#64748B'} 
                          />
                          <RTLText style={[
                            styles.userTypeTitle,
                            formData.userType === 'player' && styles.userTypeTitleSelected
                          ]}>
                            שחקן
                          </RTLText>
                          <RTLText style={[
                            styles.userTypeDescription,
                            formData.userType === 'player' && styles.userTypeDescriptionSelected
                          ]}>
                            אני רוצה לשחק במגרשים
                          </RTLText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.userTypeCard,
                            formData.userType === 'business_owner' && styles.userTypeCardSelected
                          ]}
                          onPress={() => selectUserType('business_owner')}
                          accessibilityLabel="בחר בעל עסק"
                          accessibilityRole="button"
                        >
                          <Ionicons 
                            name="business-outline" 
                            size={32} 
                            color={formData.userType === 'business_owner' ? designTokens.colors.primary[600] : '#64748B'} 
                          />
                          <RTLText style={[
                            styles.userTypeTitle,
                            formData.userType === 'business_owner' && styles.userTypeTitleSelected
                          ]}>
                            בעל עסק
                          </RTLText>
                          <RTLText style={[
                            styles.userTypeDescription,
                            formData.userType === 'business_owner' && styles.userTypeDescriptionSelected
                          ]}>
                            אני מנהל מגרשים
                          </RTLText>
                        </TouchableOpacity>
                      </View>
                      {errors.userType && (
                        <RTLText style={styles.errorText}>{errors.userType}</RTLText>
                      )}
                    </View>

                    {/* City */}
                    <View style={styles.inputGroup}>
                      <TouchableOpacity 
                        onPress={focusCityInput}
                        activeOpacity={1}
                      >
                        <RTLText style={styles.inputLabel}>עיר</RTLText>
                      </TouchableOpacity>
                      <CityAutocomplete
                        ref={cityInputRef}
                        value={formData.city}
                        onChangeText={(value) => updateFormData('city', value)}
                        onSelectCity={(city) => updateFormData('city', city)}
                        cities={MOCK_CITIES}
                        placeholder="הקלד שם עיר"
                        error={errors.city}
                        maxSuggestions={6}
                        autoFocus={false}
                      />
                    </View>

                    {/* Address (Optional) */}
                    <View style={styles.inputGroup}>
                      <RTLText style={styles.inputLabel}>כתובת (אופציונאלי)</RTLText>
                      <View style={styles.inputContainer}>
                        <Ionicons name="home-outline" size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formData.address}
                          onChangeText={(value) => updateFormData('address', value)}
                          placeholder="רחוב, מספר בית, עיר"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <WoltButton
                    variant="primary"
                    fullWidth
                    onPress={handleNext}
                    style={styles.continueButton}
                  >
                    המשך
                  </WoltButton>
                </View>
              </View>
            ) : (
              // Step 3: Different content based on user type
              <View style={styles.stepContainer}>
                <View style={styles.stepContent}>
                  <RTLText style={styles.stepTitle}>
                    {formData.userType === 'business_owner' ? 'פרטי המגרש' : 'העדפות אישיות'}
                  </RTLText>
                  <RTLText style={styles.stepSubtitle}>
                    {formData.userType === 'business_owner' 
                      ? 'מלא את פרטי המגרש שלך' 
                      : 'בחר את הספורטים שלך והוסף תמונה'
                    }
                  </RTLText>

                  <View style={styles.form}>
                    {formData.userType === 'business_owner' ? (
                      // Business Owner Form
                      <>
                        {/* Field Name */}
                        <View style={styles.inputGroup}>
                          <RTLText style={styles.inputLabel}>שם המגרש</RTLText>
                          <View style={styles.inputContainer}>
                            <Ionicons name="football-outline" size={20} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                              style={styles.textInput}
                              value={formData.fieldName}
                              onChangeText={(value) => updateFormData('fieldName', value)}
                              placeholder="הזן את שם המגרש"
                              placeholderTextColor="#94A3B8"
                            />
                          </View>
                          {errors.fieldName && (
                            <RTLText style={styles.errorText}>{errors.fieldName}</RTLText>
                          )}
                        </View>

                        {/* Field Types - Multiple Selection */}
                        <View style={styles.inputGroup}>
                          <RTLText style={styles.inputLabel}>סוגי מגרש (ניתן לבחור כמה)</RTLText>
                          <View style={styles.fieldTypeGrid}>
                            {MOCK_SPORTS.map((sport) => (
                              <TouchableOpacity
                                key={sport.id}
                                style={[
                                  styles.fieldTypeCard,
                                  formData.fieldTypes.includes(sport.name) && styles.fieldTypeCardSelected
                                ]}
                                onPress={() => toggleFieldType(sport.name)}
                                accessibilityLabel={`בחר ${sport.name}`}
                                accessibilityRole="button"
                              >
                                <RTLText style={styles.sportIcon}>{sport.iconName}</RTLText>
                                <RTLText style={[
                                  styles.fieldTypeName,
                                  formData.fieldTypes.includes(sport.name) && styles.fieldTypeNameSelected
                                ]}>
                                  {sport.name}
                                </RTLText>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.fieldTypes && (
                            <RTLText style={styles.errorText}>{errors.fieldTypes}</RTLText>
                          )}
                        </View>

                        {/* Field Location */}
                        <StructuredLocationInput
                          value={formData.fieldLocation}
                          onValueChange={(address) => updateFormData('fieldLocation', address)}
                          error={errors.fieldLocation}
                          label="מיקום המגרש"
                        />

                        {/* Operating Hours */}
                        <OperatingHoursInput
                          value={formData.operatingHours}
                          onValueChange={(hours) => updateFormData('operatingHours', hours)}
                          error={errors.operatingHours}
                          label="שעות פעילות"
                        />

                        {/* Pricing */}
                        <PricingInput
                          value={formData.pricing}
                          onValueChange={(pricing) => updateFormData('pricing', pricing)}
                          error={errors.pricing}
                          label="תעריף השכרה"
                        />

                        {/* Amenities */}
                        <View style={styles.inputGroup}>
                          <RTLText style={styles.inputLabel}>שירותים ומתקנים (אופציונאלי)</RTLText>
                          <View style={styles.amenitiesGrid}>
                            {['חניה', 'מלתחות', 'מקלחות', 'הארה', 'מזגן', 'קפיטריה'].map((amenity) => (
                              <TouchableOpacity
                                key={amenity}
                                style={[
                                  styles.amenityCard,
                                  formData.amenities.includes(amenity) && styles.amenityCardSelected
                                ]}
                                onPress={() => toggleAmenity(amenity)}
                                accessibilityLabel={`בחר ${amenity}`}
                                accessibilityRole="button"
                              >
                                <RTLText style={[
                                  styles.amenityName,
                                  formData.amenities.includes(amenity) && styles.amenityNameSelected
                                ]}>
                                  {amenity}
                                </RTLText>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    ) : (
                      // Player Form (Original Sports Preferences & Profile Image)
                      <>
                        {/* Profile Image (Optional) */}
                        <View style={styles.inputGroup}>
                          <RTLText style={styles.inputLabel}>תמונת פרופיל (אופציונאלי)</RTLText>
                          <View style={styles.profileImageContainer}>
                            {formData.profileImageUrl ? (
                              <View style={styles.selectedImageContainer}>
                                <Image 
                                  source={{ uri: formData.profileImageUrl }} 
                                  style={styles.profileImage} 
                                />
                                <TouchableOpacity 
                                  style={styles.removeImageButton}
                                  onPress={removeImage}
                                  accessibilityLabel="הסר תמונה"
                                  accessibilityRole="button"
                                >
                                  <Ionicons name="close-circle" size={24} color={designTokens.colors.error[500]} />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity 
                                style={styles.imagePickerButton}
                                onPress={pickImage}
                                accessibilityLabel="בחר תמונה"
                                accessibilityRole="button"
                              >
                                <Ionicons name="camera-outline" size={32} color="#64748B" />
                                <RTLText style={styles.imagePickerText}>הוסף תמונה</RTLText>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        {/* Sports Selection */}
                        <View style={styles.inputGroup}>
                          <RTLText style={styles.inputLabel}>בחר את הספורטים שלך</RTLText>
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
                            <RTLText style={styles.errorText}>{errors.sports}</RTLText>
                          )}
                        </View>
                      </>
                    )}

                    {errors.general && (
                      <View style={styles.generalErrorContainer}>
                        <RTLText style={styles.errorText}>{errors.general}</RTLText>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
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

      {/* Success Screen Overlay */}
      {isSuccess && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={styles.successOverlay}
        >
          <Animated.View style={[styles.successContainer, successAnimatedStyle]}>
            <Animated.View 
              entering={ZoomIn.delay(200).duration(500).springify()}
              style={styles.successIconContainer}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={80} 
                color={designTokens.colors.success[600]} 
              />
            </Animated.View>
            
            <Animated.View 
              entering={FadeInUp.delay(400).duration(500)}
              style={styles.successTextContainer}
            >
              <RTLText style={styles.successTitle}>
                ברוך הבא ל-MyFields!
              </RTLText>
              <RTLText style={styles.successSubtitle}>
                החשבון שלך נוצר בהצלחה
              </RTLText>
              <RTLText style={styles.successDescription}>
                אנחנו מעבירים אותך למסך הראשי...
              </RTLText>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(600).duration(500)}
              style={styles.successLoader}
            >
              <LoadingSpinner size="medium" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}

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
    paddingTop: designTokens.spacing.sm,
    paddingBottom: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.card,
    borderBottomLeftRadius: designTokens.borderRadius.xl,
    borderBottomRightRadius: designTokens.borderRadius.xl,
    ...designTokens.shadows.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: designTokens.spacing.xs,
    marginBottom: designTokens.spacing.xs,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  headerTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    width: '100%',
  },
  progressBackground: {
    flex: 1,
    height: 3,
    backgroundColor: designTokens.colors.secondary[200],
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: designTokens.colors.primary[600],
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.text.tertiary,
    fontWeight: designTokens.typography.weights.medium,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
  },
  formContainer: {
    flex: 1,
    minHeight: 320,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContent: {
    flex: 1,
  },
  buttonContainer: {
    paddingTop: designTokens.spacing.lg,
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
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
    paddingVertical: 12,
    marginLeft: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordToggle: {
    padding: designTokens.spacing.xs,
    marginLeft: designTokens.spacing.xs,
  },
  passwordStrengthContainer: {
    marginTop: designTokens.spacing.sm,
    gap: designTokens.spacing.xs,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: designTokens.colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: designTokens.typography.sizes.xs,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left',
  },
  termsContainer: {
    marginTop: designTokens.spacing.md,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: designTokens.colors.border.light,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designTokens.colors.background.primary,
  },  
  checkboxChecked: {
    backgroundColor: designTokens.colors.primary[600],
    borderColor: designTokens.colors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    textAlign: 'left',
    lineHeight: 20,
  },
  termsLink: {
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
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
  },
  signupButton: {
    height: 44,
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
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.xl,
  },
  successIconContainer: {
    marginBottom: designTokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.success[600],
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  successSubtitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.xs,
  },
  successDescription: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  successLoader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.sm,
  },
  userTypeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: designTokens.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  userTypeCardSelected: {
    borderColor: designTokens.colors.primary[600],
    backgroundColor: designTokens.colors.primary[50],
  },
  userTypeTitle: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: '#64748B',
    marginTop: designTokens.spacing.xs,
    textAlign: 'center',
  },
  userTypeTitleSelected: {
    color: designTokens.colors.primary[600],
  },
  userTypeDescription: {
    fontSize: designTokens.typography.sizes.sm,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: designTokens.spacing.xs,
  },
  userTypeDescriptionSelected: {
    color: designTokens.colors.primary[500],
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: designTokens.spacing.sm,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: designTokens.colors.primary[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  imagePickerButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.xs,
  },
  imagePickerText: {
    fontSize: designTokens.typography.sizes.xs,
    color: '#64748B',
    textAlign: 'center',
  },
  // Business owner field styles
  fieldTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: designTokens.spacing.sm,
  },
  fieldTypeCard: {
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
  fieldTypeCardSelected: {
    borderColor: designTokens.colors.primary[600],
    backgroundColor: designTokens.colors.primary[50],
  },
  fieldTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  fieldTypeNameSelected: {
    color: designTokens.colors.primary[600],
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: designTokens.spacing.sm,
  },
  amenityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityCardSelected: {
    borderColor: designTokens.colors.primary[600],
    backgroundColor: designTokens.colors.primary[50],
  },
  amenityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  amenityNameSelected: {
    color: designTokens.colors.primary[600],
    fontWeight: '600',
  },
});

export default SignupScreen;
