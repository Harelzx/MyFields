import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Button,
  ButtonText,
  Icon,
  SafeAreaView,
  Heading,
  Divider,
  Pressable,
  Image,
  Badge,
  BadgeText,
  Avatar,
  AvatarGroup,
  AvatarFallbackText,
} from '@gluestack-ui/themed';
import { RefreshControl, Dimensions, TouchableWithoutFeedback, Modal, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  runOnJS,
  SlideInDown,
  SlideOutUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeStatusBar } from '@components/design-system/ThemeStatusBar';
import { useTheme } from '@contexts/ThemeContext';
import { texts } from '@constants/hebrewTexts';
import { searchFields, searchGames } from '@services/mockApi';
import { Field, Game } from '@types/types';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 280;

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentUser] = useState('דניאל כהן');
  const [recommendations, setRecommendations] = useState<(Game | Field)[]>([]);
  const [hasMoreFields, setHasMoreFields] = useState(true);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const [fieldsPage, setFieldsPage] = useState(1);
  const [gamesPage, setGamesPage] = useState(1);
  
  // Profile dropdown state
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const profileButtonRef = useRef<any>(null);
  
  // Animation values for dropdown
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.8);
  const dropdownTranslateY = useSharedValue(-10);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const [fieldsResponse, gamesResponse] = await Promise.all([
        searchFields(),
        searchGames()
      ]);
      
      if (fieldsResponse.success && fieldsResponse.data) {
        setFields(fieldsResponse.data.slice(0, 5));
      }
      
      if (gamesResponse.success && gamesResponse.data) {
        setGames(gamesResponse.data.slice(0, 5));
      }
      
      // Load personalized recommendations
      await loadRecommendations();
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadRecommendations = async () => {
    try {
      // Simulate personalized recommendations based on user preferences
      const [fieldsResponse, gamesResponse] = await Promise.all([
        searchFields(),
        searchGames()
      ]);
      
      const allFields = fieldsResponse.success ? fieldsResponse.data || [] : [];
      const allGames = gamesResponse.success ? gamesResponse.data || [] : [];
      
      // Simple recommendation algorithm based on user activity
      const userPreferences = ['כדורגל', 'כדורסל', 'טניס']; // Would come from user profile
      const timePreferences = ['18:00', '19:00', '20:00']; // Evening preferences
      
      const recommendedFields = allFields.filter((field: Field) => 
        userPreferences.includes(field.sportType) && field.rating && field.rating > 4.0
      ).slice(0, 3);
      
      const recommendedGames = allGames.filter((game: Game) => 
        userPreferences.includes(game.sport) && 
        timePreferences.some(time => game.time.includes(time)) &&
        game.currentPlayers < game.maxPlayers
      ).slice(0, 3);
      
      setRecommendations([...recommendedFields, ...recommendedGames]);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };
  
  const loadMoreFields = async () => {
    if (!hasMoreFields) return;
    
    try {
      const response = await searchFields();
      if (response.success && response.data) {
        const newFields = response.data.slice(fieldsPage * 5, (fieldsPage + 1) * 5);
        if (newFields.length > 0) {
          setFields(prev => [...prev, ...newFields]);
          setFieldsPage(prev => prev + 1);
        } else {
          setHasMoreFields(false);
        }
      }
    } catch (error) {
      console.error('Error loading more fields:', error);
    }
  };
  
  const loadMoreGames = async () => {
    if (!hasMoreGames) return;
    
    try {
      const response = await searchGames();
      if (response.success && response.data) {
        const newGames = response.data.slice(gamesPage * 5, (gamesPage + 1) * 5);
        if (newGames.length > 0) {
          setGames(prev => [...prev, ...newGames]);
          setGamesPage(prev => prev + 1);
        } else {
          setHasMoreGames(false);
        }
      }
    } catch (error) {
      console.error('Error loading more games:', error);
    }
  };


  // Profile dropdown handlers
  const measureProfileButton = () => {
    if (profileButtonRef.current) {
      profileButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const isRTL = I18nManager.isRTL;
        setDropdownPosition({
          top: pageY + height + 8, // 8px gap below button
          right: isRTL ? screenWidth - pageX - width : pageX, // RTL positioning
        });
      });
    }
  };

  const showDropdown = () => {
    measureProfileButton();
    setIsDropdownVisible(true);
    
    // Animate dropdown appearance
    dropdownOpacity.value = withTiming(1, { duration: 200 });
    dropdownScale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 300,
      mass: 0.8 
    });
    dropdownTranslateY.value = withSpring(0, { 
      damping: 15, 
      stiffness: 300 
    });

    // Auto-hide after 4 seconds
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    dropdownTimeout.current = setTimeout(() => {
      hideDropdown();
    }, 4000);
  };

  const hideDropdown = () => {
    // Animate dropdown disappearance
    dropdownOpacity.value = withTiming(0, { duration: 150 });
    dropdownScale.value = withTiming(0.9, { duration: 150 });
    dropdownTranslateY.value = withTiming(-10, { duration: 150 });
    
    setTimeout(() => {
      setIsDropdownVisible(false);
    }, 150);

    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
      dropdownTimeout.current = null;
    }
  };

  const openDropdown = () => {
    if (profileButtonRef.current) {
      profileButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const isRTL = I18nManager.isRTL;
        setDropdownPosition({
          top: pageY + height + 8,
          right: isRTL ? screenWidth - pageX - width : pageX,
        });
        setIsDropdownVisible(true);
        showDropdown();
        
        // Auto-dismiss after 4 seconds
        dropdownTimeout.current = setTimeout(() => {
          hideDropdown();
        }, 4000);
      });
    }
  };

  const handleProfileMenuPress = () => {
    if (isDropdownVisible) {
      hideDropdown();
    } else {
      openDropdown();
    }
  };

  const handleProfileNavigation = () => {
    hideDropdown();
    navigation.navigate('Profile');
  };

  const handleSettingsPress = () => {
    hideDropdown();
    navigation.navigate('Settings');
  };

  const handleLogout = async () => {
    hideDropdown();
    
    try {
      // Clear user session data
      await AsyncStorage.multiRemove([
        'currentUser',
        'authToken',
        'lastAuthenticatedUser'
      ]);
      
      // Navigate to Welcome screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }]
      });
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) {
        clearTimeout(dropdownTimeout.current);
      }
    };
  }, []);





  // Profile Dropdown Component
  const ProfileDropdown = () => {
    const dropdownAnimatedStyle = useAnimatedStyle(() => ({
      opacity: dropdownOpacity.value,
      transform: [
        { scale: dropdownScale.value },
        { translateY: dropdownTranslateY.value }
      ],
    }));

    const menuItems = [
      {
        icon: 'person-outline',
        label: 'פרופיל',
        onPress: handleProfileNavigation,
        color: '#3b82f6'
      },
      {
        icon: 'settings-outline',
        label: texts.settings.title,
        onPress: handleSettingsPress,
        color: '#6b7280'
      },
      {
        icon: 'log-out-outline',
        label: texts.auth.logout,
        onPress: handleLogout,
        color: '#ef4444'
      }
    ];

    if (!isDropdownVisible) return null;

    return (
      <Modal
        transparent
        visible={isDropdownVisible}
        animationType="none"
        onRequestClose={hideDropdown}
      >
        <TouchableWithoutFeedback onPress={hideDropdown}>
          <Box flex={1}>
            <Animated.View
              style={[
                dropdownAnimatedStyle,
                {
                  position: 'absolute',
                  top: dropdownPosition.top,
                  right: dropdownPosition.right,
                  zIndex: 1000,
                }
              ]}
            >
              <Box
                bg="$backgroundLight0"
                $dark={{bg: "$backgroundDark800"}}
                borderRadius="$xl"
                borderWidth="$1"
                borderColor="$borderLight200"
                $dark={{borderColor: "$borderDark700"}}
                shadowColor="$shadowLight300"
                shadowOffset={{ width: 0, height: 8 }}
                shadowOpacity={0.25}
                shadowRadius={16}
                elevation={12}
                minWidth={220}
                overflow="hidden"
              >
                {/* Dropdown Header */}
                <Box
                  bg="$primary50"
                  $dark={{bg: "$primary900"}}
                  p="$4"
                  borderBottomWidth="$1"
                  borderBottomColor="$borderLight200"
                  $dark={{borderBottomColor: "$borderDark700"}}
                >
                  <HStack space="sm" alignItems="center">
                    <Box
                      bg="$primary500"
                      borderRadius="$full"
                      width={32}
                      height={32}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="white" fontSize="$sm" fontWeight="$bold">
                        {currentUser.charAt(0)}
                      </Text>
                    </Box>
                    <VStack space="xs" alignItems="flex-start" flex={1}>
                      <Text 
                        fontSize="$sm" 
                        fontWeight="$bold" 
                        color="$textLight900"
                        $dark={{color: "$textDark50"}}
                        textAlign="left"
                        numberOfLines={1}
                      >
                        {currentUser}
                      </Text>
                      <Text 
                        fontSize="$xs" 
                        color="$textLight600"
                        $dark={{color: "$textDark400"}}
                        textAlign="left"
                      >
                        חבר פעיל
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Menu Items */}
                <VStack space="xs" p="$2">
                  {menuItems.map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={item.onPress}
                      borderRadius="$lg"
                      p="$3"
                      $pressed={{
                        bg: '$backgroundLight100',
                        transform: [{ scale: 0.98 }],
                      }}
                      $hover={{
                        bg: '$backgroundLight50',
                      }}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          bg={`${item.color}15`}
                          borderRadius="$full"
                          p="$2"
                          width={36}
                          height={36}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons 
                            name={item.icon as keyof typeof Ionicons.glyphMap} 
                            size={18} 
                            color={item.color} 
                          />
                        </Box>
                        <Text
                          fontSize="$sm"
                          fontWeight="$medium"
                          color="$textLight900"
                          $dark={{color: "$textDark50"}}
                          textAlign="left"
                          flex={1}
                        >
                          {item.label}
                        </Text>
                        <Ionicons 
                          name="chevron-back" 
                          size={16} 
                          color={theme.colors.text.secondary}
                        />
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>

                {/* Dropdown Footer with app version */}
                <Box
                  bg="$backgroundLight50"
                  $dark={{bg: "$backgroundDark900"}}
                  p="$3"
                  borderTopWidth="$1"
                  borderTopColor="$borderLight200"
                  $dark={{borderTopColor: "$borderDark700"}}
                >
                  <Text
                    fontSize="$xs"
                    color="$textLight500"
                    $dark={{color: "$textDark500"}}
                    textAlign="center"
                  >
                    MyFields v1.0.0
                  </Text>
                </Box>
              </Box>
            </Animated.View>
          </Box>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Notification carousel data
  const notificationCards = [
    {
      id: 1,
      type: 'upcoming_game',
      title: 'המשחק הבא שלך',
      subtitle: 'כדורגל • היום 18:00',
      location: 'מגרש הכוכבים',
      icon: 'football',
      gradient: ['#667eea', '#764ba2'],
      actions: [
        { label: 'ניווט', icon: 'navigate', type: 'primary' },
        { label: 'פרטים', icon: 'information-circle', type: 'secondary' }
      ]
    },
    {
      id: 2,
      type: 'game_approval',
      title: 'אישור להצטרפות למשחק',
      subtitle: 'טניס • מחר 16:30',
      location: 'מועדון הטניס המרכזי',
      icon: 'tennisball',
      gradient: ['#f093fb', '#f5576c'],
      actions: [
        { label: 'אישור', icon: 'checkmark-circle', type: 'success' },
        { label: 'דחיה', icon: 'close-circle', type: 'danger' }
      ]
    },
    {
      id: 3,
      type: 'friend_request',
      title: 'בקשת חברות חדשה',
      subtitle: 'מיכאל כהן רוצה להתחבר אליך',
      location: 'משחק משותף: כדורסל',
      icon: 'person-add',
      gradient: ['#4facfe', '#00f2fe'],
      actions: [
        { label: 'קבלה', icon: 'person-add', type: 'success' },
        { label: 'התעלמות', icon: 'person-remove', type: 'secondary' }
      ]
    },
    {
      id: 4,
      type: 'field_confirmation',
      title: 'אישור הזמנת מגרש',
      subtitle: 'פדל • יום ראשון 20:00',
      location: 'מועדון הפדל הירוק',
      icon: 'checkmark-done-circle',
      gradient: ['#43e97b', '#38f9d7'],
      actions: [
        { label: 'אישור', icon: 'checkmark', type: 'success' },
        { label: 'עריכה', icon: 'create', type: 'warning' }
      ]
    },
    {
      id: 5,
      type: 'game_reminder',
      title: 'תזכורת למשחק מחר',
      subtitle: 'כדורעף • מחר 19:00',
      location: 'מתחם הספורט הלאומי',
      icon: 'alarm',
      gradient: ['#fa709a', '#fee140'],
      actions: [
        { label: 'מוכן', icon: 'thumbs-up', type: 'primary' },
        { label: 'ביטול', icon: 'close', type: 'danger' }
      ]
    }
  ];

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Enhanced sports images with better quality and relevance
  const getSportImage = (sportType: string) => {
    const sportImages: Record<string, string> = {
      'כדורגל': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&h=500&fit=crop&q=80',
      'טניס': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&q=80',
      'כדורסל': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop&q=80',
      'פדל': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80',
      'כדורעף': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500&h=500&fit=crop&q=80',
    };
    return sportImages[sportType] || sportImages['כדורגל'];
  };

  // Enhanced component for vibrant stats cards with animations
  const VibrantStatsCard = ({ title, value, subtitle, iconName, color, onPress }: {
    title: string;
    value: string;
    subtitle: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          $pressed={{
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          }}
          accessibilityLabel={`${title}: ${value}`}
          accessibilityHint={subtitle}
        >
          <Box
            bg="$backgroundLight0"
            $dark={{bg: "$backgroundDark800"}}
            borderRadius="$2xl"
            borderWidth="$1"
            borderColor="$borderLight200"
            $dark={{borderColor: "$borderDark700"}}
            p="$5"
            width={200}
            minHeight={140}
            shadowColor="$shadowLight300"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
            elevation={6}
          >
            <VStack space="lg" alignItems="flex-start">
              <HStack justifyContent="space-between" alignItems="center" width="100%">
                <Box
                  bg={`${color}10`}
                  borderRadius="$full"
                  p="$3"
                  width={56}
                  height={56}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name={iconName} size={28} color={color} />
                </Box>
                <Badge
                  bg={color}
                  borderRadius="$md"
                  px="$3"
                  py="$1"
                  borderWidth={0}
                >
                  <BadgeText fontSize="$xs" fontWeight="$medium" color="$white">
                    פעיל
                  </BadgeText>
                </Badge>
              </HStack>
              
              <VStack space="xs" alignItems="flex-start">
                <Heading
                  size="2xl"
                  fontWeight="$black"
                  color="$textLight900"
                  $dark={{color: "$textDark50"}}
                  textAlign="left"
                >
                  {value}
                </Heading>
                <Text
                  fontSize="$md"
                  fontWeight="$semibold"
                  color="$textLight700"
                  $dark={{color: "$textDark300"}}
                  textAlign="left"
                >
                  {title}
                </Text>
                <Text
                  fontSize="$sm"
                  color="$textLight500"
                  $dark={{color: "$textDark400"}}
                  textAlign="left"
                >
                  {subtitle}
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Pressable>
      </Animated.View>
    );
  };

  // Notification Carousel Component - Simplified
  const NotificationCarousel = () => {
    const currentCard = notificationCards[currentCardIndex];

    const getButtonStyles = (type: string) => {
      const styles = {
        primary: { bg: 'white', textColor: currentCard.gradient[0] },
        secondary: { bg: 'rgba(255,255,255,0.2)', textColor: 'white' },
        success: { bg: 'white', textColor: '#10b981' },
        danger: { bg: 'white', textColor: '#ef4444' },
        warning: { bg: 'white', textColor: '#f59e0b' }
      };
      return styles[type as keyof typeof styles] || styles.primary;
    };

    const nextCard = () => {
      setCurrentCardIndex((prev) => (prev + 1) % notificationCards.length);
    };

    const prevCard = () => {
      setCurrentCardIndex((prev) => (prev - 1 + notificationCards.length) % notificationCards.length);
    };

    // Enhanced full-width touch detection system
    const fullWidthPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // More permissive gesture detection for full-width area
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const hasMinimumMovement = Math.abs(gestureState.dx) > 10; // Lower threshold
        
        return isHorizontal && hasMinimumMovement;
      },
      
      onPanResponderGrant: (evt, gestureState) => {
        // Touch granted
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Real-time feedback during gesture
        const progress = Math.min(Math.abs(gestureState.dx) / (screenWidth * 0.25), 1);
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // More sensitive thresholds for better detection
        const swipeThreshold = 50; // Fixed 50px threshold
        const velocityThreshold = 300; // Lower velocity threshold
        
        const shouldSwipe = Math.abs(gestureState.dx) > swipeThreshold || 
                           Math.abs(gestureState.vx) > velocityThreshold;
        
        if (shouldSwipe) {
          const isRTL = I18nManager.isRTL;
          
          if (gestureState.dx > 0) {
            // Swipe right
            if (isRTL) {
              prevCard();
            } else {
              nextCard();
            }
          } else {
            // Swipe left
            if (isRTL) {
              nextCard();
            } else {
              prevCard();
            }
          }
        }
      },
      
      onPanResponderTerminationRequest: () => false, // Don't allow termination
      onShouldBlockNativeResponder: () => false, // Allow native components to respond
    });

    return (
      <Box position="relative" width="100%" minHeight={200}>
        {/* Carousel content */}
        <Box position="relative" zIndex={2}>
          <LinearGradient
            colors={currentCard.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 20,
              minHeight: 160,
            }}
          >
          {/* Background pattern */}
          <Box 
            position="absolute" 
            top={-20} 
            right={-20} 
            width={100} 
            height={100} 
            borderRadius={50} 
            bg="rgba(255,255,255,0.08)" 
          />
          
          <VStack space="md" position="relative">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack space="xs" alignItems="flex-start" flex={1}>
                <Text fontSize="$sm" color="rgba(255,255,255,0.8)" fontWeight="$medium">
                  {currentCard.title}
                </Text>
                <Heading size="lg" color="white" fontWeight="$bold" numberOfLines={1}>
                  {currentCard.subtitle}
                </Heading>
                <HStack space="xs" alignItems="center">
                  <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                  <Text fontSize="$md" color="rgba(255,255,255,0.9)" fontWeight="$medium" numberOfLines={1} flex={1}>
                    {currentCard.location}
                  </Text>
                </HStack>
              </VStack>
              
              <Box
                bg="rgba(255,255,255,0.15)"
                borderRadius="$full"
                p="$3"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.2)"
              >
                <Ionicons name={currentCard.icon as keyof typeof Ionicons.glyphMap} size={28} color="white" />
              </Box>
            </HStack>
            
            <HStack space="md" mt="$2">
              {currentCard.actions.map((action, index) => {
                const buttonStyle = getButtonStyles(action.type);
                return (
                  <Button
                    key={index}
                    variant={action.type === 'secondary' ? 'outline' : 'solid'}
                    size="sm"
                    bg={buttonStyle.bg}
                    borderColor={action.type === 'secondary' ? 'rgba(255,255,255,0.3)' : undefined}
                    borderRadius="$full"
                    flex={1}
                    $pressed={{
                      bg: action.type === 'secondary' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    <HStack space="xs" alignItems="center">
                      <Ionicons 
                        name={action.icon as keyof typeof Ionicons.glyphMap} 
                        size={16} 
                        color={action.type === 'secondary' ? 'white' : buttonStyle.textColor} 
                      />
                      <ButtonText 
                        color={action.type === 'secondary' ? 'white' : buttonStyle.textColor} 
                        fontWeight="$bold"
                        fontSize="$sm"
                      >
                        {action.label}
                      </ButtonText>
                    </HStack>
                  </Button>
                );
              })}
            </HStack>
          </VStack>
          </LinearGradient>
        </Box>

        {/* Dot indicators */}
        <HStack space="xs" justifyContent="center" mt="$3">
          {notificationCards.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setCurrentCardIndex(index)}
              bg={index === currentCardIndex ? currentCard.gradient[0] : '$backgroundLight300'}
              width={8}
              height={8}
              borderRadius="$full"
              $pressed={{ opacity: 0.7 }}
            />
          ))}
        </HStack>
        
        {/* Full-width touch overlay for swipe detection */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={10}
          {...fullWidthPanResponder.panHandlers}
        />
      </Box>
    );
  };

  // Enhanced game/field card with vibrant design and better animations
  const VibrantCard = ({ item, type, onPress }: {
    item: Game | Field;
    type: 'game' | 'field';
    onPress: () => void;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.85, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    const getStatusColor = () => {
      if (type === 'game') {
        const game = item as Game;
        const percentage = (game.currentPlayers / game.maxPlayers) * 100;
        if (percentage >= 90) return '#ef4444';
        if (percentage >= 70) return '#f59e0b';
        return '#10b981';
      }
      return '#10b981';
    };

    const getStatusText = () => {
      if (type === 'game') {
        const game = item as Game;
        const percentage = (game.currentPlayers / game.maxPlayers) * 100;
        if (percentage >= 90) return 'כמעט מלא';
        if (percentage >= 70) return 'מתמלא';
        return 'פתוח';
      }
      return 'זמין';
    };

    const statusColor = getStatusColor();
    const sportType = type === 'game' ? (item as Game).sport : (item as Field).sportType;

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          $pressed={{
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          }}
        >
          <Box
            bg="$backgroundLight0"
            $dark={{bg: "$backgroundDark800"}}
            borderRadius="$2xl"
            borderWidth="$1"
            borderColor="$borderLight200"
            $dark={{borderColor: "$borderDark700"}}
            overflow="hidden"
            shadowColor="$shadowLight300"
            shadowOffset={{ width: 0, height: 6 }}
            shadowOpacity={0.2}
            shadowRadius={12}
            elevation={8}
            width={280}
          >
            {/* Enhanced Image Section with Gradient Overlay */}
            <Box position="relative" height={160}>
              <Image
                source={{ uri: getSportImage(sportType) }}
                alt={type === 'game' ? (item as Game).sport : (item as Field).name}
                width="100%"
                height="100%"
                resizeMode="cover"
              />
              
              {/* Gradient Overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4))"
              />
              
              {/* Status Badge with Enhanced Design */}
              <Badge
                position="absolute"
                top="$4"
                right="$4"
                bg={statusColor}
                borderRadius="$md"
                px="$3"
                py="$2"
                borderWidth={0}
              >
                <BadgeText
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$white"
                >
                  {getStatusText()}
                </BadgeText>
              </Badge>

              {/* Rating for fields */}
              {type === 'field' && (item as Field).rating && (
                <HStack
                  position="absolute"
                  bottom="$4"
                  left="$4"
                  space="xs"
                  alignItems="center"
                  bg="rgba(0,0,0,0.7)"
                  borderRadius="$full"
                  px="$3"
                  py="$2"
                >
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text fontSize="$sm" color="$white" fontWeight="$bold">
                    {(item as Field).rating}
                  </Text>
                </HStack>
              )}
            </Box>

            {/* Enhanced Content Section */}
            <VStack p="$5" space="md">
              <VStack space="xs" alignItems="flex-start">
                <Heading
                  size="lg"
                  fontWeight="$bold"
                  color="$textLight900"
                  $dark={{color: "$textDark50"}}
                  numberOfLines={1}
                  textAlign="left"
                >
                  {type === 'game' ? (item as Game).sport : (item as Field).name}
                </Heading>
                <Text
                  fontSize="$md"
                  color="$textLight600"
                  $dark={{color: "$textDark400"}}
                  numberOfLines={1}
                  textAlign="left"
                >
                  {type === 'game' ? (item as Game).fieldName : (item as Field).sportType}
                </Text>
              </VStack>

              {/* Enhanced Info Section */}
              <VStack space="sm">
                {type === 'game' && (
                  <>
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="time" size={16} color="#6b7280" />
                      <Text fontSize="$sm" color="$textLight500" $dark={{color: "$textDark400"}} textAlign="left">
                        {(item as Game).time}
                      </Text>
                    </HStack>
                    
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="xs" alignItems="center">
                        <Ionicons name="people" size={16} color={statusColor} />
                        <Text fontSize="$sm" color={statusColor} fontWeight="$bold" textAlign="left">
                          {(item as Game).currentPlayers}/{(item as Game).maxPlayers}
                        </Text>
                      </HStack>
                      
                      <AvatarGroup size="sm" max={3}>
                        {['א', 'ב', 'ג'].map((initial, index) => (
                          <Avatar key={index} size="sm" bg="$primary500">
                            <AvatarFallbackText color="$white">
                              {initial}
                            </AvatarFallbackText>
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </HStack>
                  </>
                )}

                {type === 'field' && (
                  <>
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="location" size={16} color="#6b7280" />
                      <Text fontSize="$sm" color="$textLight500" $dark={{color: "$textDark400"}} textAlign="left">
                        {(item as Field).location}
                      </Text>
                    </HStack>
                    
                    <HStack justifyContent="flex-start" alignItems="center">
                      <Heading
                        size="lg"
                        fontWeight="$bold"
                        color="$primary600"
                        $dark={{color: "$primary400"}}
                        textAlign="left"
                      >
                        ₪{(item as Field).pricePerHour}/שעה
                      </Heading>
                    </HStack>
                  </>
                )}
              </VStack>

              {/* Enhanced Action Button */}
              <Button
                variant="solid"
                size="md"
                bg="$primary500"
                borderRadius="$full"
                $pressed={{
                  bg: '$primary600',
                  transform: [{ scale: 0.95 }],
                }}
                shadowColor="$primary500"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
                elevation={6}
              >
                <HStack space="sm" alignItems="center">
                  <Ionicons 
                    name={type === 'game' ? 'people' : 'calendar'} 
                    size={18} 
                    color="white" 
                  />
                  <ButtonText color="$white" fontSize="$md" fontWeight="$bold">
                    {type === 'game' ? 'הצטרף' : 'הזמן'}
                  </ButtonText>
                </HStack>
              </Button>
            </VStack>
          </Box>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <>
      <ThemeStatusBar />
      <SafeAreaView flex={1} bg="$appBackground" $dark={{bg: "$backgroundDark900"}}>
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadHomeData} />
          }
        >
          <VStack flex={1} space="xl">
            {/* Simplified Hero Section with Focus on Next Activity */}
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
              <Box mx="$6" mt="$4">
                {/* Header with Profile */}
                <HStack justifyContent="space-between" alignItems="center" mb="$6">
                  <VStack space="xs" alignItems="flex-start">
                    <Text 
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight600"
                      $dark={{color: "$textDark400"}}
                      textAlign="left"
                    >
                      {new Date().getHours() < 12 ? 'בוקר טוב' : new Date().getHours() < 18 ? 'אחר הצהריים טובים' : 'ערב טוב'}
                    </Text>
                    <Heading 
                      size="xl"
                      fontWeight="$bold"
                      color="$textLight900"
                      $dark={{color: "$textDark50"}}
                      textAlign="left"
                    >
                      {currentUser}
                    </Heading>
                  </VStack>
                  
                  {/* Profile Button */}
                  <Pressable
                    ref={profileButtonRef}
                    onPress={handleProfileMenuPress}
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$full" 
                    p="$2"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                    shadowColor="$shadowLight300"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.1}
                    shadowRadius={4}
                    elevation={3}
                    $pressed={{
                      bg: '$backgroundLight100',
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    <HStack space="sm" alignItems="center">
                      <Box
                        bg="$primary500"
                        borderRadius="$full"
                        width={32}
                        height={32}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="white" fontSize="$sm" fontWeight="$bold">
                          {currentUser.charAt(0)}
                        </Text>
                      </Box>
                      <Animated.View
                        style={{
                          transform: [{
                            rotate: isDropdownVisible ? '180deg' : '0deg'
                          }]
                        }}
                      >
                        <Ionicons 
                          name="chevron-down" 
                          size={16} 
                          color={theme.colors.text.secondary} 
                        />
                      </Animated.View>
                    </HStack>
                  </Pressable>
                </HStack>

                {/* Notification Carousel */}
                <NotificationCarousel />
              </Box>
            </Animated.View>

            {/* Quick Stats Overview */}
            <Animated.View entering={FadeInRight.delay(200).duration(600)}>
              <VStack space="md" mx="$6">
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading 
                    size="lg"
                    fontWeight="$bold"
                    color="$textLight900"
                    $dark={{color: "$textDark50"}}
                  >
                    סיכום השבוע
                  </Heading>
                  <Button 
                    variant="outline" 
                    size="sm"
                    borderColor="$borderLight300"
                    $dark={{borderColor: "$borderDark600"}}
                    bg="$backgroundLight50"
                    $dark={{bg: "$backgroundDark700"}}
                  >
                    <HStack space="xs" alignItems="center">
                      <ButtonText 
                        color="$textLight700" 
                        $dark={{color: "$textDark300"}}
                        fontSize="$sm" 
                        fontWeight="$medium"
                      >
                        הצג הכל
                      </ButtonText>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={theme.colors.text.secondary}
                      />
                    </HStack>
                  </Button>
                </HStack>
                
                {/* Compact Stats Grid - Updated colors */}
                <HStack space="md">
                  <Box
                    flex={1}
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$xl"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                    shadowColor="#10b981"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.05}
                    shadowRadius={4}
                    elevation={2}
                  >
                    <VStack space="xs" alignItems="center">
                      <Box
                        bg="rgba(16, 185, 129, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="calendar" size={20} color="#059669" />
                      </Box>
                      <Heading size="lg" fontWeight="$bold" color="$textLight900" $dark={{color: "$textDark50"}}>
                        5
                      </Heading>
                      <Text fontSize="$xs" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="center">
                        משחקים השבוע
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Box
                    flex={1}
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$xl"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                    shadowColor="#8b5cf6"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.05}
                    shadowRadius={4}
                    elevation={2}
                  >
                    <VStack space="xs" alignItems="center">
                      <Box
                        bg="rgba(139, 92, 246, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="people" size={20} color="#7c3aed" />
                      </Box>
                      <Heading size="lg" fontWeight="$bold" color="$textLight900" $dark={{color: "$textDark50"}}>
                        18
                      </Heading>
                      <Text fontSize="$xs" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="center">
                        חברים פעילים
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Box
                    flex={1}
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$xl"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                    shadowColor="#f59e0b"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.05}
                    shadowRadius={4}
                    elevation={2}
                  >
                    <VStack space="xs" alignItems="center">
                      <Box
                        bg="rgba(245, 158, 11, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="wallet" size={20} color="#d97706" />
                      </Box>
                      <Heading size="lg" fontWeight="$bold" color="$textLight900" $dark={{color: "$textDark50"}}>
                        ₪580
                      </Heading>
                      <Text fontSize="$xs" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="center">
                        הוצאות חודש
                      </Text>
                    </VStack>
                  </Box>
                </HStack>
              </VStack>
            </Animated.View>

            {/* Activity Feed - Show upcoming games and recent activity */}
            <Animated.View entering={FadeInRight.delay(300).duration(600)}>
              <VStack space="md" mx="$6">
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading 
                    size="lg"
                    fontWeight="$bold"
                    color="$textLight900"
                    $dark={{color: "$textDark50"}}
                  >
                    פעילות אחרונה
                  </Heading>
                  <Button 
                    variant="outline" 
                    size="sm"
                    borderColor="$borderLight300"
                    $dark={{borderColor: "$borderDark600"}}
                    bg="$backgroundLight50"
                    $dark={{bg: "$backgroundDark700"}}
                  >
                    <HStack space="xs" alignItems="center">
                      <ButtonText 
                        color="$textLight700" 
                        $dark={{color: "$textDark300"}}
                        fontSize="$sm" 
                        fontWeight="$medium"
                      >
                        הצג הכל
                      </ButtonText>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={theme.colors.text.secondary}
                      />
                    </HStack>
                  </Button>
                </HStack>
                
                {/* Activity List */}
                <VStack space="sm">
                  <Box
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        bg="rgba(34, 197, 94, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#15803d" />
                      </Box>
                      <VStack space="xs" flex={1} alignItems="flex-start">
                        <Text fontSize="$md" fontWeight="$medium" color="$textLight900" $dark={{color: "$textDark50"}} textAlign="left">
                          השלמת משחק כדורגל
                        </Text>
                        <Text fontSize="$sm" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="left">
                          מגרש הכוכבים • לפני שעתיים
                        </Text>
                      </VStack>
                      <Box
                        bg="$success100"
                        borderRadius="$md"
                        px="$2"
                        py="$1"
                      >
                        <Text fontSize="$xs" color="$success700" fontWeight="$medium">
                          +15 נק'
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                  
                  <Box
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        bg="rgba(59, 130, 246, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="person-add" size={20} color="#2563eb" />
                      </Box>
                      <VStack space="xs" flex={1} alignItems="flex-start">
                        <Text fontSize="$md" fontWeight="$medium" color="$textLight900" $dark={{color: "$textDark50"}} textAlign="left">
                          דני הזמין אותך למשחק
                        </Text>
                        <Text fontSize="$sm" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="left">
                          כדורסל • מחר ב-19:00
                        </Text>
                      </VStack>
                      <Button variant="outline" size="xs">
                        <ButtonText fontSize="$xs" fontWeight="$medium">
                          הצטרף
                        </ButtonText>
                      </Button>
                    </HStack>
                  </Box>
                  
                  <Box
                    bg="$backgroundLight0"
                    $dark={{bg: "$backgroundDark800"}}
                    borderRadius="$lg"
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{borderColor: "$borderDark700"}}
                  >
                    <HStack space="md" alignItems="center">
                      <Box
                        bg="rgba(168, 85, 247, 0.15)"
                        borderRadius="$full"
                        p="$2"
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="calendar" size={20} color="#7c3aed" />
                      </Box>
                      <VStack space="xs" flex={1} alignItems="flex-start">
                        <Text fontSize="$md" fontWeight="$medium" color="$textLight900" $dark={{color: "$textDark50"}} textAlign="left">
                          הזמנת מגרש טניס
                        </Text>
                        <Text fontSize="$sm" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="left">
                          מגרש רמת השרון • עוד 3 ימים
                        </Text>
                      </VStack>
                      <Text fontSize="$sm" color="$warning600" fontWeight="$medium">
                        ₪120
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </VStack>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInRight.delay(400).duration(600)}>
              <VStack space="md" mx="$6">
                <Heading 
                  size="lg"
                  fontWeight="$bold"
                  color="$textLight900"
                  $dark={{color: "$textDark50"}}
                  textAlign="left"
                >
                  פעולות מהירות
                </Heading>
                
                <HStack space="md">
                  <Pressable
                    flex={1}
                    borderRadius="$xl"
                    p="$4"
                    shadowColor="#ec4899"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.25}
                    shadowRadius={8}
                    elevation={6}
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                    }}
                    bg="#ec4899" // Fallback
                    $pressed={{
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    <VStack space="md" alignItems="center">
                      <Box
                        bg="rgba(255,255,255,0.2)"
                        borderRadius="$full"
                        p="$3"
                        width={56}
                        height={56}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="people" size={28} color="white" />
                      </Box>
                      <VStack space="xs" alignItems="flex-start">
                        <Text fontSize="$md" fontWeight="$bold" color="white" textAlign="left">
                          הצטרף למשחק
                        </Text>
                        <Text fontSize="$xs" color="rgba(255,255,255,0.8)" textAlign="left">
                          מצא חברים לספורט
                        </Text>
                      </VStack>
                    </VStack>
                  </Pressable>
                  
                  <Pressable
                    flex={1}
                    borderRadius="$xl"
                    p="$4"
                    shadowColor="#10b981"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.25}
                    shadowRadius={8}
                    elevation={6}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                    bg="#10b981" // Fallback
                    $pressed={{
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    <VStack space="md" alignItems="center">
                      <Box
                        bg="rgba(255,255,255,0.2)"
                        borderRadius="$full"
                        p="$3"
                        width={56}
                        height={56}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons name="calendar" size={28} color="white" />
                      </Box>
                      <VStack space="xs" alignItems="flex-start">
                        <Text fontSize="$md" fontWeight="$bold" color="white" textAlign="left">
                          הזמן מגרש
                        </Text>
                        <Text fontSize="$xs" color="rgba(255,255,255,0.8)" textAlign="left">
                          מגרשים בקרבתך
                        </Text>
                      </VStack>
                    </VStack>
                  </Pressable>
                </HStack>
              </VStack>
            </Animated.View>

            {/* Featured Games Preview */}
            <Animated.View entering={FadeInRight.delay(500).duration(600)}>
              <VStack space="md" mx="$6">
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading 
                    size="lg"
                    fontWeight="$bold"
                    color="$textLight900"
                    $dark={{color: "$textDark50"}}
                  >
                    משחקים פתוחים
                  </Heading>
                  <Button 
                    variant="outline" 
                    size="sm"
                    borderColor="$borderLight300"
                    $dark={{borderColor: "$borderDark600"}}
                    bg="$backgroundLight50"
                    $dark={{bg: "$backgroundDark700"}}
                  >
                    <HStack space="xs" alignItems="center">
                      <ButtonText 
                        color="$textLight700" 
                        $dark={{color: "$textDark300"}}
                        fontSize="$sm" 
                        fontWeight="$medium"
                      >
                        הצג הכל
                      </ButtonText>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={theme.colors.text.secondary}
                      />
                    </HStack>
                  </Button>
                </HStack>
                
                {/* Show first 2 games in vertical list with horizontal peek */}
                <VStack space="sm">
                  {games.slice(0, 2).map((game, index) => (
                    <Pressable
                      key={game.id}
                      bg="$backgroundLight0"
                      $dark={{bg: "$backgroundDark800"}}
                      borderRadius="$lg"
                      p="$4"
                      borderWidth={1}
                      borderColor="$borderLight200"
                      $dark={{borderColor: "$borderDark700"}}
                      $pressed={{
                        bg: '$backgroundLight50',
                        transform: [{ scale: 0.99 }],
                      }}
                    >
                      <HStack space="md" alignItems="center">
                        <Box
                          bg={index === 0 ? "rgba(139, 92, 246, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                          borderRadius="$full"
                          p="$3"
                          width={48}
                          height={48}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons 
                            name={index === 0 ? "football" : "basketball"} 
                            size={24} 
                            color={index === 0 ? "#8b5cf6" : "#ef4444"} 
                          />
                        </Box>
                        
                        <VStack space="xs" flex={1} alignItems="flex-start">
                          <Text fontSize="$md" fontWeight="$bold" color="$textLight900" $dark={{color: "$textDark50"}} textAlign="left">
                            {game.sport}
                          </Text>
                          <Text fontSize="$sm" color="$textLight600" $dark={{color: "$textDark400"}} textAlign="left">
                            {game.fieldName} • {game.time}
                          </Text>
                          <HStack space="xs" alignItems="center" alignSelf="flex-start">
                            <Ionicons name="people" size={14} color="#10b981" />
                            <Text fontSize="$xs" color="$success600" fontWeight="$medium">
                              {game.currentPlayers}/{game.maxPlayers} שחקנים
                            </Text>
                          </HStack>
                        </VStack>
                        
                        <Button variant="outline" size="sm">
                          <ButtonText fontSize="$sm" fontWeight="$medium">
                            הצטרף
                          </ButtonText>
                        </Button>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              </VStack>
            </Animated.View>

            {/* Bottom Padding */}
            <Box height="$20" />
          </VStack>
        </ScrollView>
        
        {/* Profile Dropdown */}
        <ProfileDropdown />
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;