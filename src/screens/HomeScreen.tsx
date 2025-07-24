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


        {/* Profile Dropdown Menu - Outside scroll to prevent clipping */}
        {showProfileDropdown && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 80,
                right: 24,
                zIndex: 1000,
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
        )}

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadHomeData} />
          }
        >
          <VStack flex={1} space="xl">
            {/* Beautiful Hero Welcome Section with Gradient and Organic Shapes */}
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
              <Box position="relative" overflow="hidden" bg="#667eea">
                
                {/* Simplified Decorative Elements */}
                <Box position="absolute" top={-50} right={-50} width={200} height={200} borderRadius={100} bg="rgba(255,255,255,0.1)" />
                <Box position="absolute" bottom={-60} left={-60} width={180} height={180} borderRadius={90} bg="rgba(255,255,255,0.08)" />
                <Box position="absolute" top={100} right={150} width={80} height={80} borderRadius={40} bg="rgba(255,255,255,0.15)" />
                <Box position="absolute" top={50} left={80} width={120} height={120} borderRadius={60} bg="rgba(255,255,255,0.06)" />
                <Box position="absolute" bottom={80} right={100} width={60} height={60} borderRadius={30} bg="rgba(255,255,255,0.12)" />
                
                {/* Floating particles */}
                <Box position="absolute" top={130} left={30} width={8} height={8} borderRadius={4} bg="rgba(255,255,255,0.3)" />
                <Box position="absolute" top={200} right={40} width={6} height={6} borderRadius={3} bg="rgba(255,255,255,0.4)" />
                <Box position="absolute" bottom={120} left={120} width={10} height={10} borderRadius={5} bg="rgba(255,255,255,0.25)" />
                <Box position="absolute" top={160} right={200} width={4} height={4} borderRadius={2} bg="rgba(255,255,255,0.5)" />
                
                <Box px="$6" py="$6" position="relative">
                  {/* Profile Section - Positioned at Top Right */}
                  <Pressable
                    position="absolute"
                    top="$4"
                    right="$6"
                    onPress={handleProfilePress}
                    bg="rgba(255,255,255,0.15)" 
                    borderRadius="$full" 
                    px="$3"
                    py="$2"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.25)"
                    zIndex={1001}
                    $pressed={{
                      bg: 'rgba(255,255,255,0.25)',
                      transform: [{ scale: 0.98 }],
                    }}
                  >
                    <HStack space="sm" alignItems="center">
                      <Box
                        bg="$primary500"
                        borderRadius="$full"
                        width={28}
                        height={28}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="white" fontSize="$sm" fontWeight="$bold">
                          {currentUser.charAt(0)}
                        </Text>
                      </Box>
                      <Ionicons name="chevron-down" size={14} color="white" />
                    </HStack>
                  </Pressable>


                  {/* Content Section */}
                  <VStack space="md" alignItems="flex-start" pt="$2">
                    {/* Compact Typography */}
                    <VStack space="xs" alignItems="flex-start">
                      <Text 
                        fontSize="$sm"
                        fontWeight="$medium"
                        color="rgba(255,255,255,0.8)"
                        textAlign="left"
                      >
                        ✨ {new Date().getHours() < 12 ? 'בוקר טוב' : new Date().getHours() < 18 ? 'אחר הצהריים טובים' : 'ערב טוב'}
                      </Text>
                      <Heading 
                        size="2xl"
                        fontWeight="$bold"
                        color="white"
                        textAlign="left"
                        shadowColor="rgba(0,0,0,0.3)"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.3}
                        shadowRadius={4}
                      >
                        {currentUser}
                      </Heading>
                    </VStack>
                    
                    {/* Inspiring Catchphrase with Benefits */}
                    <VStack alignItems="flex-start" space="xs">
                      <Text 
                        fontSize="$lg" 
                        color="white"
                        textAlign="left"
                        fontWeight="$bold"
                        shadowColor="rgba(0,0,0,0.3)"
                        shadowOffset={{ width: 0, height: 1 }}
                        shadowOpacity={0.3}
                        shadowRadius={2}
                      >
                        🏆 זמן לנצח יחד!
                      </Text>
                      <Text 
                        fontSize="$xs" 
                        color="white"
                        textAlign="left"
                        fontWeight="$medium"
                        opacity={0.9}
                        shadowColor="rgba(0,0,0,0.2)"
                        shadowOffset={{ width: 0, height: 1 }}
                        shadowOpacity={0.2}
                        shadowRadius={1}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        מצא חברים • הזמן מגרש • שחק ותיהנה
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </Box>
            </Animated.View>

            {/* Enhanced Stats Cards with Vibrant Design */}
            <Animated.View entering={FadeInRight.delay(200).duration(600)}>
              <VStack space="lg">
                <HStack justifyContent="space-between" alignItems="center" px="$6">
                  <Heading variant="section">
                    הפעילות שלך
                  </Heading>
                  <Button variant="outline" size="sm" borderColor="$primary500">
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="analytics" size={16} color="#3396ff" />
                      <ButtonText color="$primary600" fontSize="$sm" fontWeight="$semibold">
                        כל הנתונים
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>
                
                <Divider mx="$6" bg="$borderLight300" opacity={0.6} />
                
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    gap: 20,
                  }}
                >
                  <VibrantStatsCard
                    title="משחקים השבוע"
                    value="5"
                    subtitle="3 השבוע הבא"
                    iconName="calendar"
                    color="#10b981"
                    onPress={() => console.log('Games this week')}
                  />
                  <VibrantStatsCard
                    title="מגרשים שמורים"
                    value="2"
                    subtitle="מחר ב-18:00"
                    iconName="location"
                    color="#3396ff"
                    onPress={() => console.log('Reserved fields')}
                  />
                  <VibrantStatsCard
                    title="חברים פעילים"
                    value="18"
                    subtitle="השבוע"
                    iconName="people"
                    color="#22c55e"
                    onPress={() => console.log('Active friends')}
                  />
                  <VibrantStatsCard
                    title="הוצאות חודש"
                    value="₪580"
                    subtitle="מתוך ₪800"
                    iconName="wallet"
                    color="#f59e0b"
                    onPress={() => console.log('Monthly expenses')}
                  />
                </ScrollView>
              </VStack>
            </Animated.View>

            {/* Personalized Recommendations Section */}
            <Animated.View entering={FadeInRight.delay(300).duration(600)}>
              <VStack space="lg">
                <HStack justifyContent="space-between" alignItems="center" px="$6">
                  <VStack space="xs" alignItems="flex-start">
                    <Heading variant="section">
                      מומלץ עבורך
                    </Heading>
                    <Text fontSize="$sm" color="$textLight600" $dark={{color: "$textDark400"}}>
                      מבוסס על העדפותיך ופעילותך
                    </Text>
                  </VStack>
                  <Button variant="outline" size="sm" borderColor="$success500">
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="star" size={16} color="#10b981" />
                      <ButtonText color="$success600" fontSize="$sm" fontWeight="$semibold">
                        עדכן העדפות
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>

                <Divider mx="$6" bg="$borderLight300" opacity={0.6} />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    gap: 20,
                  }}
                >
                  {recommendations.map((item, index) => {
                    const isField = 'sportType' in item;
                    return (
                      <VibrantCard
                        key={`rec-${item.id}`}
                        item={item}
                        type={isField ? "field" : "game"}
                        onPress={() => console.log('Recommendation pressed:', item.id)}
                      />
                    );
                  })}
                </ScrollView>
              </VStack>
            </Animated.View>

            {/* Enhanced Join Games Section */}
            <Animated.View entering={FadeInRight.delay(400).duration(600)}>
              <VStack space="lg">
                <HStack justifyContent="space-between" alignItems="center" px="$6">
                  <Heading variant="section">
                    הצטרף למשחק
                  </Heading>
                  <Button variant="vibrant" size="sm">
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="people" size={18} color="white" />
                      <ButtonText color="$white" fontSize="$sm" fontWeight="$bold">
                        כל המשחקים
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>

                <Divider mx="$6" bg="$borderLight300" opacity={0.6} />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    gap: 20,
                  }}
                  onMomentumScrollEnd={(event) => {
                    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                    const isCloseToEnd = contentOffset.x >= contentSize.width - layoutMeasurement.width - 100;
                    if (isCloseToEnd) {
                      loadMoreGames();
                    }
                  }}
                >
                  {games.map((game, index) => (
                    <VibrantCard
                      key={game.id}
                      item={game}
                      type="game"
                      onPress={() => console.log('Game pressed:', game.id)}
                    />
                  ))}
                  {hasMoreGames && (
                    <Box width={280} height={200} justifyContent="center" alignItems="center">
                      <Button variant="outline" onPress={loadMoreGames}>
                        <ButtonText>טען עוד</ButtonText>
                      </Button>
                    </Box>
                  )}
                </ScrollView>
              </VStack>
            </Animated.View>

            {/* Enhanced Nearby Fields Section */}
            <Animated.View entering={FadeInRight.delay(600).duration(600)}>
              <VStack space="lg">
                <HStack justifyContent="space-between" alignItems="center" px="$6">
                  <Heading variant="section">
                    מגרשים בקרבתך
                  </Heading>
                  <Button variant="vibrant" size="sm">
                    <HStack space="xs" alignItems="center">
                      <Ionicons name="add" size={18} color="white" />
                      <ButtonText color="$white" fontSize="$sm" fontWeight="$bold">
                        הזמן מגרש
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>

                <Divider mx="$6" bg="$borderLight300" opacity={0.6} />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    gap: 20,
                  }}
                  onMomentumScrollEnd={(event) => {
                    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                    const isCloseToEnd = contentOffset.x >= contentSize.width - layoutMeasurement.width - 100;
                    if (isCloseToEnd) {
                      loadMoreFields();
                    }
                  }}
                >
                  {fields.map((field, index) => (
                    <VibrantCard
                      key={field.id}
                      item={field}
                      type="field"
                      onPress={() => console.log('Field pressed:', field.id)}
                    />
                  ))}
                  {hasMoreFields && (
                    <Box width={280} height={200} justifyContent="center" alignItems="center">
                      <Button variant="outline" onPress={loadMoreFields}>
                        <ButtonText>טען עוד</ButtonText>
                      </Button>
                    </Box>
                  )}
                </ScrollView>
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