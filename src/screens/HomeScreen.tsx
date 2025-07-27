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
import { RefreshControl, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserProfileDropdownGS } from '@components/design-system/UserProfileDropdownGS';
import { ThemeStatusBar } from '@components/design-system/ThemeStatusBar';
import { useTheme } from '@contexts/ThemeContext';
import { texts } from '@constants/hebrewTexts';
import { searchFields, searchGames } from '@services/mockApi';
import { Field, Game } from '@types/types';
import { I18nManager } from 'react-native';

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState<(Game | Field)[]>([]);
  const [hasMoreFields, setHasMoreFields] = useState(true);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const [fieldsPage, setFieldsPage] = useState(1);
  const [gamesPage, setGamesPage] = useState(1);
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.8);

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

  const handleProfilePress = () => {
    console.log('Profile button pressed, current state:', showProfileDropdown);
    console.log('About to toggle dropdown');
    
    if (showProfileDropdown) {
      console.log('Closing dropdown');
      setShowProfileDropdown(false);
    } else {
      console.log('Opening dropdown');
      setShowProfileDropdown(true);
    }
  };

  const handleProfileMenuPress = () => {
    console.log('Profile menu pressed');
    setTimeout(() => {
      setShowProfileDropdown(false);
    }, 100);
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    setTimeout(() => {
      setShowProfileDropdown(false);
    }, 100);
  };

  const handleLogoutPress = () => {
    console.log('Logout pressed');
    setTimeout(() => {
      setShowProfileDropdown(false);
    }, 100);
  };

  // Handle dropdown animation
  useEffect(() => {
    console.log('showProfileDropdown state changed to:', showProfileDropdown);
    if (showProfileDropdown) {
      dropdownOpacity.value = withTiming(1, { duration: 200 });
      dropdownScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      dropdownOpacity.value = withTiming(0, { duration: 150 });
      dropdownScale.value = withTiming(0.8, { duration: 150 });
    }
  }, [showProfileDropdown]);

  // Animated style for dropdown
  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropdownOpacity.value,
    transform: [{ scale: dropdownScale.value }],
  }));

  // Auto-close dropdown after 5 seconds
  useEffect(() => {
    if (showProfileDropdown) {
      console.log('Setting up auto-close timer');
      const timer = setTimeout(() => {
        console.log('Auto-closing dropdown after timeout');
        setShowProfileDropdown(false);
      }, 5000);
      
      return () => {
        console.log('Clearing auto-close timer');
        clearTimeout(timer);
      };
    }
  }, [showProfileDropdown]);

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


        {/* Profile Dropdown Menu - Positioned relative to header */}
        {showProfileDropdown && (
          <Box position="relative" zIndex={1000}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: -10,
                  right: 24,
                },
                dropdownAnimatedStyle,
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
                minWidth={180}
                overflow="hidden"
              >
                {/* Profile Option */}
                <Pressable
                  onPress={handleProfileMenuPress}
                  $pressed={{ bg: '$backgroundLight100' }}
                  px="$4"
                  py="$3"
                  borderBottomWidth="$1"
                  borderBottomColor="$borderLight100"
                >
                  <HStack space="md" alignItems="center">
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text
                      fontSize="$md"
                      fontWeight="$medium"
                      color="$textLight900"
                      $dark={{color: "$textDark50"}}
                      textAlign="left"
                    >
                      פרופיל אישי
                    </Text>
                  </HStack>
                </Pressable>

                {/* Settings Option */}
                <Pressable
                  onPress={handleSettingsPress}
                  $pressed={{ bg: '$backgroundLight100' }}
                  px="$4"
                  py="$3"
                  borderBottomWidth="$1"
                  borderBottomColor="$borderLight100"
                >
                  <HStack space="md" alignItems="center">
                    <Ionicons name="settings" size={16} color="#6B7280" />
                    <Text
                      fontSize="$md"
                      fontWeight="$medium"
                      color="$textLight900"
                      $dark={{color: "$textDark50"}}
                      textAlign="left"
                    >
                      הגדרות
                    </Text>
                  </HStack>
                </Pressable>

                {/* Logout Option */}
                <Pressable
                  onPress={handleLogoutPress}
                  $pressed={{ bg: '$backgroundLight100' }}
                  px="$4"
                  py="$3"
                >
                  <HStack space="md" alignItems="center">
                    <Ionicons name="log-out" size={16} color="#EF4444" />
                    <Text
                      fontSize="$md"
                      fontWeight="$medium"
                      color="$error500"
                      textAlign="left"
                    >
                      יציאה
                    </Text>
                  </HStack>
                </Pressable>
              </Box>
            </Animated.View>
          </Box>
        )}

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
                    onPress={handleProfilePress}
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
                      <Box
                        bg="$success500"
                        borderRadius="$full"
                        width={8}
                        height={8}
                        mr="$1"
                      />
                      <Ionicons 
                        name="chevron-down" 
                        size={16} 
                        color={theme.colors.text.secondary} 
                      />
                    </HStack>
                  </Pressable>
                </HStack>

                {/* Next Activity Hero Card - Updated with gradient */}
                <Box
                  borderRadius="$xl"
                  p="$5"
                  shadowColor="#1f2937"
                  shadowOffset={{ width: 0, height: 8 }}
                  shadowOpacity={0.15}
                  shadowRadius={16}
                  elevation={8}
                  position="relative"
                  overflow="hidden"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                  bg="#667eea" // Fallback for non-gradient support
                >
                  {/* Subtle background pattern */}
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
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack space="xs" alignItems="flex-start">
                        <Text fontSize="$sm" color="rgba(255,255,255,0.8)" fontWeight="$medium">
                          המשחק הבא שלך
                        </Text>
                        <Heading size="lg" color="white" fontWeight="$bold">
                          כדורגל • היום 18:00
                        </Heading>
                        <HStack space="xs" alignItems="center">
                          <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                          <Text fontSize="$md" color="rgba(255,255,255,0.9)" fontWeight="$medium">
                            מגרש הכוכבים
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
                        <Ionicons name="football" size={28} color="white" />
                      </Box>
                    </HStack>
                    
                    <HStack space="md" mt="$2">
                      <Button
                        variant="solid"
                        size="sm"
                        bg="white"
                        borderRadius="$full"
                        flex={1}
                        $pressed={{
                          bg: 'rgba(255,255,255,0.9)',
                          transform: [{ scale: 0.98 }],
                        }}
                      >
                        <HStack space="xs" alignItems="center">
                          <Ionicons name="navigate" size={16} color="#667eea" />
                          <ButtonText color="#667eea" fontWeight="$bold">
                            ניווט
                          </ButtonText>
                        </HStack>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        borderColor="rgba(255,255,255,0.3)"
                        borderRadius="$full"
                        flex={1}
                        $pressed={{
                          bg: 'rgba(255,255,255,0.1)',
                          transform: [{ scale: 0.98 }],
                        }}
                      >
                        <HStack space="xs" alignItems="center">
                          <Ionicons name="information-circle" size={16} color="white" />
                          <ButtonText color="white" fontWeight="$bold">
                            פרטים
                          </ButtonText>
                        </HStack>
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
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
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;