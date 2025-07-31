import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
// Map functionality will be added later with proper Expo Maps setup
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Button,
  ButtonText,
  Badge,
  BadgeText,
  Fab,
  FabIcon,
  FabLabel,
  Divider,
  Avatar,
  AvatarImage,
  AvatarFallbackText
} from '@gluestack-ui/themed';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
  Extrapolation
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BookingCard, 
  ThemeStatusBar,
  VenueCard,
  BookingTimelineItem,
  VenueDiscoveryCarousel,
  QuickRebookCard,
  BookingStatsCard
} from '@components/design-system';
import { texts } from '@constants/hebrewTexts';
import { designTokens, getSpacing, getBorderRadius } from '@constants/theme';
import { fetchUserBookings } from '@services/mockApi';
import { Booking, Field } from '@types/types';
import { MOCK_FIELDS, MOCK_BOOKINGS } from '@constants/mockData';
import { useTheme } from '@contexts/ThemeContext';

// Mock data for premium experience
interface Venue {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  price: number;
  distance: string;
  amenities: string[];
  availableSlots: number;
  location: { latitude: number; longitude: number };
  type: 'football' | 'basketball' | 'tennis' | 'swimming';
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const VENUE_CARD_WIDTH = screenWidth * 0.85;
const MINI_MAP_HEIGHT = 120;
const FAB_SCROLL_THRESHOLD = 200;

const BookingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Animation values for premium experience
  const scrollY = useSharedValue(0);
  const fabScale = useSharedValue(0);
  const venueCarouselScale = useSharedValue(1);
  
  // Mock data
  // Transform MOCK_FIELDS to Venue format
  const transformFieldToVenue = (field: Field): Venue => ({
    id: field.id,
    name: field.name,
    city: field.city,
    image: field.imageUrl,
    rating: field.rating,
    price: field.pricePerHour,
    distance: '2.5 ק״מ', // Mock distance
    amenities: field.amenities,
    availableSlots: Math.floor(Math.random() * 5) + 1,
    location: field.coordinates,
    type: field.sportType === 'כדורגל' ? 'football' : 
          field.sportType === 'כדורסל' ? 'basketball' : 
          field.sportType === 'טניס' ? 'tennis' : 'football'
  });

  const mockVenues: Venue[] = MOCK_FIELDS.slice(0, 8).map(transformFieldToVenue);

  const mockFriends: Friend[] = [
    { id: '1', name: 'יוסי', avatar: 'https://picsum.photos/100/100?random=10' },
    { id: '2', name: 'דני', avatar: 'https://picsum.photos/100/100?random=11' },
    { id: '3', name: 'משה', avatar: 'https://picsum.photos/100/100?random=12' },
  ];

  useEffect(() => {
    loadBookings();
    setVenues(mockVenues);
  }, []);

  // Scroll handler for FAB animation
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Show FAB after scrolling past threshold
      fabScale.value = withSpring(
        scrollY.value > FAB_SCROLL_THRESHOLD ? 1 : 0,
        {
          damping: 15,
          stiffness: 150,
        }
      );
    },
  });

  const loadBookings = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      // Use enhanced mock bookings directly for better experience
      const enhancedBookings = MOCK_BOOKINGS.map(booking => ({
        ...booking,
        // Add some recent bookings for better demo
        date: booking.id === 'booking_1' ? new Date().toISOString().split('T')[0] : booking.date
      }));
      setBookings(enhancedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    setShowQRCode(booking.id);
  };

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  const handleQuickBook = (venue: Venue) => {
    console.log('Quick book venue:', venue.id);
    // TODO: Navigate to quick booking
  };

  const handleBookNewField = () => {
    console.log('Search fields pressed');
    // Scroll to venue discovery section for quick access
    // TODO: Add navigation to dedicated search/fields screen or show search modal
  };

  const getNextBooking = () => {
    return bookings
      .filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings
      .filter(b => ['confirmed', 'active'].includes(b.status) && new Date(b.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getRecentVenues = () => {
    // Get venues from recent bookings for quick rebook
    const recentBookingFields = bookings
      .filter(b => b.status === 'completed')
      .slice(0, 3)
      .map(b => b.fieldName);
    
    return venues.filter(v => recentBookingFields.includes(v.name));
  };

  // Premium component renders
  const nextBooking = getNextBooking();
  const upcomingBookings = getUpcomingBookings();
  const recentVenues = getRecentVenues();

  // Floating Action Button Component
  const FloatingActionButton = () => {
    const fabAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: fabScale.value,
        },
      ],
      opacity: fabScale.value,
    }));

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 100,
            right: 20,
            zIndex: 1000,
          },
          fabAnimatedStyle,
        ]}
      >
        <Pressable
          onPress={handleBookNewField}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Box
            bg="$primary500"
            borderRadius="$full"
            width={56}
            height={56}
            justifyContent="center"
            alignItems="center"
            shadowColor="$shadowLight400"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
          >
            <Ionicons name="add" size={28} color="white" />
          </Box>
        </Pressable>
      </Animated.View>
    );
  };

  // Premium Venue Card Component
  const VenueCard = ({ venue, onPress, onQuickBook }: { venue: Venue; onPress: () => void; onQuickBook: () => void }) => (
    <Pressable onPress={onPress}>
      <Box
        width={VENUE_CARD_WIDTH}
        borderRadius="$xl"
        overflow="hidden"
        bg="$backgroundLight0"
        $dark={{ bg: "$backgroundDark800" }}
        mr="$4"
        borderWidth={1}
        borderColor="$borderLight200"
        $dark={{ borderColor: "$borderDark700" }}
        shadowColor="$shadowLight400"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.15}
        shadowRadius={20}
        elevation={8}
      >
        <Box position="relative" height={180}>
          <Image
            source={{ uri: venue.image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Rating Badge */}
          <Box position="absolute" top="$3" right="$3">
            <BlurView intensity={80} style={{ borderRadius: 20, overflow: 'hidden' }}>
              <HStack bg="rgba(255,255,255,0.2)" px="$3" py="$2" space="xs" alignItems="center">
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text color="white" fontSize="$sm" fontWeight="$bold">
                  {venue.rating}
                </Text>
              </HStack>
            </BlurView>
          </Box>

          {/* Available Slots */}
          <Box position="absolute" top="$3" left="$3">
            <Badge bg="$success500" borderRadius="$full" px="$2" py="$1">
              <BadgeText color="white" fontSize="$xs">
                {venue.availableSlots} זמינים
              </BadgeText>
            </Badge>
          </Box>

          {/* Location Indicator */}
          <Box position="absolute" bottom="$3" left="$3" bg="rgba(0,0,0,0.7)" borderRadius="$md" px="$2" py="$1">
            <HStack space="xs" alignItems="center">
              <Ionicons name="location" size={12} color="white" />
              <Text fontSize="$xs" color="white" textAlign="left">
                {venue.distance}
              </Text>
            </HStack>
          </Box>
        </Box>

        <VStack p="$4" space="xs" minHeight={160}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack alignItems="flex-start" flex={1}>
              <Heading size="md" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left" numberOfLines={2}>
                {venue.name}
              </Heading>
              <HStack space="xs" alignItems="center">
                <Ionicons name="location" size={14} color={theme.colors.text.tertiary} />
                <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                  {venue.city}
                </Text>
              </HStack>
            </VStack>
            <VStack alignItems="flex-end">
              <Heading size="lg" color="$primary600" $dark={{ color: "$primary400" }} textAlign="right">
                ₪{venue.price}
              </Heading>
              <Text fontSize="$xs" color="$textLight500" $dark={{ color: "$textDark500" }} textAlign="right">
                לשעה
              </Text>
            </VStack>
          </HStack>

          {/* Amenities - Smart Display */}
          <HStack space="xs" flexWrap="wrap" px="$4">
            {(() => {
              // Calculate how many amenities we can show based on text length
              let visibleAmenities = [];
              let totalLength = 0;
              const maxLength = 35; // Approximate character limit for the card width
              
              for (let i = 0; i < venue.amenities.length; i++) {
                const amenity = venue.amenities[i];
                const amenityLength = amenity.length + 2; // +2 for spacing
                
                // If we still have remaining amenities and adding this one would exceed limit
                if (i < venue.amenities.length - 1 && totalLength + amenityLength > maxLength - 6) {
                  // Save space for "+X" badge (approximately 6 characters)
                  break;
                }
                
                // If this is the last amenity or we're within limits
                if (totalLength + amenityLength <= maxLength) {
                  visibleAmenities.push(amenity);
                  totalLength += amenityLength;
                } else {
                  break;
                }
              }
              
              return (
                <>
                  {visibleAmenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      bg="$primary100"
                      $dark={{ bg: "$primary900" }}
                      borderRadius="$full"
                      px="$2"
                      py="$1"
                      mb="$1"
                    >
                      <BadgeText
                        color="$primary700"
                        $dark={{ color: "$primary300" }}
                        fontSize="$xs"
                        numberOfLines={1}
                      >
                        {amenity}
                      </BadgeText>
                    </Badge>
                  ))}
                  {venue.amenities.length > visibleAmenities.length && (
                    <Badge
                      bg="$secondary100"
                      $dark={{ bg: "$secondary900" }}
                      borderRadius="$full"
                      px="$2"
                      py="$1"
                      mb="$1"
                    >
                      <BadgeText
                        color="$secondary700"
                        $dark={{ color: "$secondary300" }}
                        fontSize="$xs"
                      >
                        +{venue.amenities.length - visibleAmenities.length}
                      </BadgeText>
                    </Badge>
                  )}
                </>
              );
            })()}
          </HStack>

          {/* Regular Booking Button */}
          <Button
            bg="$primary500"
            borderRadius="$full"
            onPress={onQuickBook}
            mt="$1"
          >
            <HStack space="xs" alignItems="center">
              <Ionicons name="calendar" size={16} color="white" />
              <ButtonText color="white" fontSize="$sm" fontWeight="$bold">
                הזמן מגרש
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      </Box>
    </Pressable>
  );

  // Premium Booking Timeline Component
  const BookingTimeline = ({ bookings }: { bookings: Booking[] }) => {
    if (bookings.length === 0) {
      return (
        <Box
          bg="$backgroundLight50"
          $dark={{ bg: "$backgroundDark800" }}
          borderRadius="$xl"
          p="$6"
          alignItems="center"
          borderWidth={2}
          borderColor="$borderLight200"
          $dark={{ borderColor: "$borderDark700" }}
          borderStyle="dashed"
          mx="$4"
        >
          <Box
            bg="$primary100"
            $dark={{ bg: "$primary900" }}
            borderRadius="$full"
            p="$4"
            mb="$4"
          >
            <Ionicons name="basketball" size={32} color={theme.colors.primary[600]} />
          </Box>
          <Heading size="md" color="$textLight700" $dark={{ color: "$textDark300" }} textAlign="center" mb="$2">
            אין הזמנות עדיין
          </Heading>
          <Text fontSize="$sm" color="$textLight500" $dark={{ color: "$textDark500" }} textAlign="center" mb="$4">
            התחל את המסע הספורטיבי שלך היום
          </Text>
          <Button bg="$primary500" borderRadius="$full" onPress={handleBookNewField}>
            <ButtonText color="white" fontWeight="$bold">
              גלה מגרשים
            </ButtonText>
          </Button>
        </Box>
      );
    }

    return (
      <VStack space="md" px="$4">
        {bookings.map((booking, index) => (
          <Animated.View
            key={booking.id}
            entering={FadeInRight.delay(index * 100).duration(600)}
          >
            <Pressable onPress={() => handleBookingPress(booking)}>
              <Box
                bg="$backgroundLight0"
                $dark={{ bg: "$backgroundDark800" }}
                borderRadius="$xl"
                overflow="hidden"
                shadowColor="$shadowLight300"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.1}
                shadowRadius={12}
                elevation={4}
              >
                <LinearGradient
                  colors={[theme.colors.primary[500], theme.colors.primary[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 4 }}
                />
                
                <HStack p="$4" space="md" alignItems="center">
                  {/* Date Column */}
                  <VStack
                    bg="$primary50"
                    $dark={{ bg: "$primary900" }}
                    borderRadius="$lg"
                    p="$3"
                    alignItems="center"
                    minWidth={60}
                  >
                    <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }} fontWeight="$bold">
                      {new Date(booking.date).toLocaleDateString('he-IL', { month: 'short' })}
                    </Text>
                    <Heading size="lg" color="$primary700" $dark={{ color: "$primary300" }}>
                      {new Date(booking.date).getDate()}
                    </Heading>
                    <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }}>
                      {new Date(booking.date).toLocaleDateString('he-IL', { weekday: 'short' })}
                    </Text>
                  </VStack>

                  {/* Booking Details */}
                  <VStack flex={1} space="xs" alignItems="flex-start">
                    <HStack justifyContent="space-between" alignItems="flex-start" width="100%">
                      <VStack alignItems="flex-start">
                        <Heading size="md" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left" numberOfLines={2}>
                          {booking.fieldName}
                        </Heading>
                        <HStack space="md" alignItems="center">
                          <HStack space="xs" alignItems="center">
                            <Ionicons name="time" size={14} color={theme.colors.text.tertiary} />
                            <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                              {booking.startTime}
                            </Text>
                          </HStack>
                          <Badge
                            bg={booking.status === 'confirmed' ? '$success500' : 
                                booking.status === 'active' ? '$primary500' : '$secondary500'}
                            borderRadius="$full"
                            px="$2"
                            py="$1"
                          >
                            <BadgeText color="white" fontSize="$xs">
                              {booking.status === 'confirmed' ? 'מאושר' :
                               booking.status === 'active' ? 'פעיל' : 'הושלם'}
                            </BadgeText>
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack alignItems="flex-end">
                        <Heading size="md" color="$primary600" $dark={{ color: "$primary400" }}>
                          ₪{booking.totalPrice}
                        </Heading>
                      </VStack>
                    </HStack>
                    
                    {/* Enhanced Social Features */}
                    <VStack space="xs" mt="$1">
                      {/* Friends joining */}
                      <HStack space="xs" alignItems="center">
                        <Text fontSize="$xs" color="$textLight500" $dark={{ color: "$textDark500" }}>
                          משתתפים:
                        </Text>
                        <HStack space="-xs">
                          {mockFriends.slice(0, 3).map((friend, idx) => (
                            <Avatar key={friend.id} size="xs" borderWidth={2} borderColor="white" ml={idx > 0 ? "-$1" : "$0"}>
                              <AvatarImage source={{ uri: friend.avatar }} />
                              <AvatarFallbackText>{friend.name}</AvatarFallbackText>
                            </Avatar>
                          ))}
                        </HStack>
                        <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }}>
                          +2 נוספים
                        </Text>
                      </HStack>
                      
                      {/* Social Actions */}
                      <HStack space="xs" alignItems="center">
                        <Button size="xs" variant="outline" borderColor="$primary200" onPress={() => console.log('Invite friends')}>
                          <ButtonText fontSize="$xs" color="$primary600">הזמן חברים</ButtonText>
                        </Button>
                        <Button size="xs" variant="outline" borderColor="$secondary200" onPress={() => console.log('Share booking')}>
                          <ButtonText fontSize="$xs" color="$secondary600">שתף</ButtonText>
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button size="xs" variant="outline" borderColor="$success200" onPress={() => console.log('Join chat')}>
                            <ButtonText fontSize="$xs" color="$success600">צ'אט קבוצתי</ButtonText>
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </VStack>

                  {/* Action Button */}
                  <Pressable
                    onPress={() => setShowQRCode(booking.id)}
                    bg="$primary100"
                    $dark={{ bg: "$primary900" }}
                    borderRadius="$lg"
                    p="$3"
                  >
                    <Ionicons name="qr-code" size={24} color={theme.colors.primary[600]} />
                  </Pressable>
                </HStack>
              </Box>
            </Pressable>
          </Animated.View>
        ))}
      </VStack>
    );
  };

  // QR Code Modal
  const QRModal = () => {
    if (!showQRCode) return null;
    
    const booking = bookings.find(b => b.id === showQRCode);
    if (!booking) return null;

    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.8)"
        justifyContent="center"
        alignItems="center"
        zIndex={1000}
      >
        <Pressable
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          onPress={() => setShowQRCode(null)}
        />
        <Box
          bg="$backgroundLight0"
          $dark={{ bg: "$backgroundDark800" }}
          borderRadius="$xl"
          p="$6"
          m="$4"
          alignItems="center"
          shadowColor="$shadowLight400"
          shadowOffset={{ width: 0, height: 20 }}
          shadowOpacity={0.3}
          shadowRadius={30}
          elevation={20}
        >
          <VStack space="sm" alignItems="center">
            <VStack space="xs" alignItems="center">
              <Heading size="lg" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="center" numberOfLines={2}>
                {booking.fieldName}
              </Heading>
              <Text fontSize="$md" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="center">
                כניסה למגרש
              </Text>
            </VStack>
            
            <Box
              bg="white"
              p="$4"
              borderRadius="$lg"
              shadowColor="$shadowLight200"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              elevation={4}
            >
              <QRCode
                value={`booking:${booking.id}`}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </Box>
            
            <VStack space="xs" alignItems="center">
              <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="center">
                הצג קוד זה בכניסה למגרש
              </Text>
              <HStack space="md" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <Ionicons name="time" size={16} color={theme.colors.text.tertiary} />
                  <Text fontSize="$sm" color="$textLight700" $dark={{ color: "$textDark300" }}>
                    {booking.startTime}
                  </Text>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <Ionicons name="calendar" size={16} color={theme.colors.text.tertiary} />
                  <Text fontSize="$sm" color="$textLight700" $dark={{ color: "$textDark300" }}>
                    {new Date(booking.date).toLocaleDateString('he-IL')}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
            
            <Button
              bg="$primary500"
              borderRadius="$full"
              onPress={() => setShowQRCode(null)}
              px="$8"
            >
              <ButtonText color="white" fontWeight="$bold">
                סגור
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <ThemeStatusBar />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <VStack flex={1} bg="$backgroundLight0" $dark={{ bg: "$backgroundDark900" }}>
          {/* Premium Header */}
          <Box px="$4" py="$2" bg="$backgroundLight0" $dark={{ bg: "$backgroundDark900" }}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack alignItems="flex-start">
                <Heading size="xl" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left">
                  {texts.tabs.bookings}
                </Heading>
                <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                  מצא והזמן מגרשים בקלות
                </Text>
              </VStack>
              <HStack space="sm">
                <Pressable
                  bg="$backgroundLight100"
                  $dark={{ bg: "$backgroundDark800" }}
                  borderRadius="$full"
                  p="$3"
                  onPress={() => {}}
                >
                  <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
                </Pressable>
                <Pressable
                  bg="$backgroundLight100"
                  $dark={{ bg: "$backgroundDark800" }}
                  borderRadius="$full"
                  p="$3"
                  onPress={() => {}}
                >
                  <Ionicons name="notifications" size={20} color={theme.colors.text.secondary} />
                </Pressable>
              </HStack>
            </HStack>
          </Box>

          <Animated.ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary[600]}
                colors={[theme.colors.primary[600]]}
              />
            }
          >
            {/* Quick Stats Bar - Minimal and informative */}
            <Box mx="$4" mb="$1">
              <HStack space="sm" justifyContent="center" alignItems="flex-end">
                {nextBooking && new Date(nextBooking.date).toDateString() === new Date().toDateString() && (
                  <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
                    <Pressable onPress={() => handleBookingPress(nextBooking)}>
                      <Box
                        bg="$primary50"
                        $dark={{ bg: "$primary900" }}
                        borderRadius="$full"
                        px="$3"
                        py="$2"
                      >
                        <HStack space="xs" alignItems="center" justifyContent="center">
                          <Ionicons name="time" size={14} color={theme.colors.primary[600]} />
                          <Text fontSize="$xs" color="$primary700" $dark={{ color: "$primary300" }} fontWeight="$medium">
                            היום {nextBooking.startTime}
                          </Text>
                          <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }}>•</Text>
                          <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }} numberOfLines={1}>
                            {nextBooking.fieldName}
                          </Text>
                        </HStack>
                      </Box>
                    </Pressable>
                  </Animated.View>
                )}
                
                {(!nextBooking || new Date(nextBooking.date).toDateString() !== new Date().toDateString()) && (
                  <HStack space="xs">
                    <Box
                      bg="$backgroundLight100"
                      $dark={{ bg: "$backgroundDark800" }}
                      borderRadius="$full"
                      px="$3"
                      py="$3"
                    >
                      <HStack space="xs" alignItems="center">
                        <Ionicons name="calendar" size={14} color={theme.colors.text.secondary} />
                        <Text fontSize="$xs" color="$textLight600" $dark={{ color: "$textDark400" }}>
                          {upcomingBookings.length} הזמנות
                        </Text>
                      </HStack>
                    </Box>
                    
                    <Box
                      bg="$backgroundLight100"
                      $dark={{ bg: "$backgroundDark800" }}
                      borderRadius="$full"
                      px="$3"
                      py="$3"
                    >
                      <HStack space="xs" alignItems="center">
                        <Ionicons name="location" size={14} color={theme.colors.text.secondary} />
                        <Text fontSize="$xs" color="$textLight600" $dark={{ color: "$textDark400" }}>
                          {venues.length} מגרשים
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>
                )}
              </HStack>
            </Box>

            {/* Venue Discovery Section */}
            <VStack space="md" mt="$1">
              <HStack justifyContent="space-between" alignItems="center" px="$4">
                <VStack alignItems="flex-start">
                  <Heading size="lg" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left">
                    גלה מגרשים
                  </Heading>
                  <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                    מגרשים מומלצים בסביבתך
                  </Text>
                </VStack>
                <Button variant="outline" size="sm" borderRadius="$full">
                  <ButtonText fontSize="$sm" color="$primary600" $dark={{ color: "$primary400" }}>
                    הצג הכל
                  </ButtonText>
                </Button>
              </HStack>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {venues.map((venue, index) => (
                  <Animated.View
                    key={venue.id}
                    entering={SlideInRight.delay(index * 150).duration(600)}
                  >
                    <VenueCard
                      venue={venue}
                      onPress={() => handleVenuePress(venue)}
                      onQuickBook={() => handleQuickBook(venue)}
                    />
                  </Animated.View>
                ))}
              </ScrollView>
            </VStack>

            {/* Open Games Section */}
            <VStack space="md" mt="$2" mb="$3">
              <HStack justifyContent="space-between" alignItems="center" px="$4">
                <VStack alignItems="flex-start">
                  <Heading size="lg" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left">
                    משחקים פתוחים
                  </Heading>
                  <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                    הצטרף למשחקים הזוכרים שחקנים
                  </Text>
                </VStack>
                <Button variant="outline" size="sm" borderRadius="$full" borderColor="$success200">
                  <ButtonText fontSize="$sm" color="$success600">הצג הכל</ButtonText>
                </Button>
              </HStack>

              {/* Open Games List - Redesigned to match venue cards */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                  {[
                    { 
                      id: '1', 
                      venue: 'אצטדיון כדורגל פרימיום', 
                      time: '20:00', 
                      players: '8/22', 
                      sport: 'football', 
                      price: 15,
                      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
                      city: 'תל אביב',
                      distance: '1.2 ק״מ',
                      rating: 4.8,
                      level: 'ביניים',
                      amenities: ['דשא טבעי', 'תאורה', 'חניה', 'מלתחות'],
                      maxPlayers: 22,
                      currentPlayers: 8,
                      playersNeeded: 14
                    },
                    { 
                      id: '2', 
                      venue: 'היכל הכדורסל הלאומי', 
                      time: '19:30', 
                      players: '6/10', 
                      sport: 'basketball', 
                      price: 12,
                      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
                      city: 'רמת גן',
                      distance: '2.8 ק״מ',
                      rating: 4.6,
                      level: 'מתקדם',
                      amenities: ['מקורה', 'מזגן', 'חניה', 'ציוד'],
                      maxPlayers: 10,
                      currentPlayers: 6,
                      playersNeeded: 4
                    },
                    { 
                      id: '3', 
                      venue: 'מרכז הטניס פרימיום', 
                      time: '18:00', 
                      players: '2/4', 
                      sport: 'tennis', 
                      price: 20,
                      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
                      city: 'הרצליה',
                      distance: '3.5 ק״מ',
                      rating: 4.9,
                      level: 'כל הרמות',
                      amenities: ['מגרש כולל', 'פלייטכס', 'קפיטריה', 'מקלחות'],
                      maxPlayers: 4,
                      currentPlayers: 2,
                      playersNeeded: 2
                    },
                    { 
                      id: '4', 
                      venue: 'מגרש כדורגל נוער', 
                      time: '21:00', 
                      players: '12/16', 
                      sport: 'football', 
                      price: 10,
                      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
                      city: 'פתח תקווה',
                      distance: '4.1 ק״מ',
                      rating: 4.3,
                      level: 'מתחילים',
                      amenities: ['דשא סינטטי', 'תאורה', 'ספסלים'],
                      maxPlayers: 16,
                      currentPlayers: 12,
                      playersNeeded: 4
                    }
                  ].map((game, index) => (
                    <Animated.View key={game.id} entering={FadeInRight.delay(index * 150).duration(600)}>
                      <Pressable onPress={() => console.log('Join game:', game.id)}>
                        <Box
                          width={VENUE_CARD_WIDTH}
                          borderRadius="$xl"
                          overflow="hidden"
                          bg="$backgroundLight0"
                          $dark={{ bg: "$backgroundDark800" }}
                          mr="$4"
                          borderWidth={1}
                          borderColor="$borderLight200"
                          $dark={{ borderColor: "$borderDark700" }}
                          shadowColor="$shadowLight400"
                          shadowOffset={{ width: 0, height: 8 }}
                          shadowOpacity={0.15}
                          shadowRadius={20}
                          elevation={8}
                        >
                          {/* Image Header with Overlays - Matching venue cards */}
                          <Box position="relative" height={180}>
                            <Image
                              source={{ uri: game.image }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                            <LinearGradient
                              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
                              style={StyleSheet.absoluteFillObject}
                            />
                            
                            {/* Rating Badge - Top Right (matching venue cards) */}
                            <Box position="absolute" top="$3" right="$3">
                              <BlurView intensity={80} style={{ borderRadius: 20, overflow: 'hidden' }}>
                                <HStack bg="rgba(255,255,255,0.2)" px="$3" py="$2" space="xs" alignItems="center">
                                  <Ionicons name="star" size={14} color="#FFD700" />
                                  <Text color="white" fontSize="$sm" fontWeight="$bold">
                                    {game.rating}
                                  </Text>
                                </HStack>
                              </BlurView>
                            </Box>

                            {/* Players Needed Badge - Top Left */}
                            <Box position="absolute" top="$3" left="$3">
                              <Badge bg="$success500" borderRadius="$full" px="$2" py="$1">
                                <BadgeText color="white" fontSize="$xs">
                                  {game.playersNeeded} דרושים
                                </BadgeText>
                              </Badge>
                            </Box>

                            {/* Distance Indicator - Bottom Left (matching venue cards) */}
                            <Box position="absolute" bottom="$3" left="$3" bg="rgba(0,0,0,0.7)" borderRadius="$md" px="$2" py="$1">
                              <HStack space="xs" alignItems="center">
                                <Ionicons name="location" size={12} color="white" />
                                <Text fontSize="$xs" color="white" textAlign="left">
                                  {game.distance}
                                </Text>
                              </HStack>
                            </Box>
                          </Box>

                          {/* Content Section - Matching venue card layout */}
                          <VStack p="$4" space="xs" minHeight={160}>
                            <HStack justifyContent="space-between" alignItems="flex-start">
                              <VStack alignItems="flex-start" flex={1}>
                                <Heading size="md" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left" numberOfLines={2}>
                                  {game.venue}
                                </Heading>
                                <HStack space="xs" alignItems="center">
                                  <Ionicons name="location" size={14} color={theme.colors.text.tertiary} />
                                  <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                                    {game.city}
                                  </Text>
                                </HStack>
                              </VStack>
                              <VStack alignItems="flex-end">
                                <Heading size="lg" color="$primary600" $dark={{ color: "$primary400" }} textAlign="right">
                                  ₪{game.price}
                                </Heading>
                                <Text fontSize="$xs" color="$textLight500" $dark={{ color: "$textDark500" }} textAlign="right">
                                  לשחקן
                                </Text>
                              </VStack>
                            </HStack>

                            {/* Game Details - All features on same line */}
                            <HStack space="xs" flexWrap="wrap">
                              <Badge
                                bg="$success100"
                                $dark={{ bg: "$success900" }}
                                borderRadius="$full"
                                px="$2"
                                py="$1"
                              >
                                <BadgeText
                                  color="$success700"
                                  $dark={{ color: "$success300" }}
                                  fontSize="$xs"
                                >
                                  {game.playersNeeded} דרושים
                                </BadgeText>
                              </Badge>
                              <Badge
                                bg="$warning100"
                                $dark={{ bg: "$warning900" }}
                                borderRadius="$full"
                                px="$2"
                                py="$1"
                              >
                                <BadgeText
                                  color="$warning700"
                                  $dark={{ color: "$warning300" }}
                                  fontSize="$xs"
                                >
                                  {game.time}
                                </BadgeText>
                              </Badge>
                              <Badge
                                bg="$primary100"
                                $dark={{ bg: "$primary900" }}
                                borderRadius="$full"
                                px="$2"
                                py="$1"
                              >
                                <BadgeText
                                  color="$primary700"
                                  $dark={{ color: "$primary300" }}
                                  fontSize="$xs"
                                >
                                  {game.sport === 'football' ? 'כדורגל' : 
                                   game.sport === 'basketball' ? 'כדורסל' : 'טניס'}
                                </BadgeText>
                              </Badge>
                              <Badge
                                bg="$secondary100"
                                $dark={{ bg: "$secondary900" }}
                                borderRadius="$full"
                                px="$2"
                                py="$1"
                              >
                                <BadgeText
                                  color="$secondary700"
                                  $dark={{ color: "$secondary300" }}
                                  fontSize="$xs"
                                >
                                  {game.level}
                                </BadgeText>
                              </Badge>
                            </HStack>

                            {/* Join Game Button - Matching venue card style */}
                            <Button
                              bg="$success500"
                              borderRadius="$full"
                              onPress={() => console.log('Join game:', game.id)}
                              mt="$1"
                            >
                              <HStack space="xs" alignItems="center">
                                <Ionicons name="person-add" size={16} color="white" />
                                <ButtonText color="white" fontSize="$sm" fontWeight="$bold">
                                  הצטרף למשחק (₪{game.price})
                                </ButtonText>
                              </HStack>
                            </Button>
                          </VStack>
                        </Box>
                      </Pressable>
                    </Animated.View>
                  ))}
              </ScrollView>
            </VStack>

            {/* Quick Rebook Section */}
            {recentVenues.length > 0 && (
              <VStack space="md" mt="$1">
                <HStack justifyContent="space-between" alignItems="center" px="$4">
                  <VStack alignItems="flex-start">
                    <Heading size="lg" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left">
                      הזמן שוב
                    </Heading>
                    <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                      מגרשים ששיחקת בהם לאחרונה
                    </Text>
                  </VStack>
                </HStack>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  {recentVenues.map((venue, index) => (
                    <Animated.View
                      key={`recent-${venue.id}`}
                      entering={SlideInRight.delay(index * 100).duration(400)}
                    >
                      <Pressable onPress={() => handleQuickBook(venue)}>
                        <Box
                          width={200}
                          borderRadius="$lg"
                          overflow="hidden"
                          bg="$backgroundLight0"
                          $dark={{ bg: "$backgroundDark800" }}
                          mr="$3"
                          borderWidth={1}
                          borderColor="$borderLight200"
                          $dark={{ borderColor: "$borderDark700" }}
                          shadowColor="$shadowLight200"
                          shadowOffset={{ width: 0, height: 4 }}
                          shadowOpacity={0.1}
                          shadowRadius={8}
                          elevation={3}
                        >
                          <Box position="relative" height={100}>
                            <Image
                              source={{ uri: venue.image }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                            <LinearGradient
                              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
                              style={StyleSheet.absoluteFillObject}
                            />
                            <Box position="absolute" bottom="$2" right="$2">
                              <Badge bg="$primary500" borderRadius="$full" px="$2" py="$1">
                                <BadgeText color="white" fontSize="$xs">₪{venue.price}</BadgeText>
                              </Badge>
                            </Box>
                          </Box>
                          <VStack p="$2" space="xs" minHeight={60}>
                            <Heading size="sm" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left" numberOfLines={2}>
                              {venue.name}
                            </Heading>
                            <HStack space="xs" alignItems="center">
                              <HStack space="xs" alignItems="center" flex={1}>
                                <Ionicons name="location" size={12} color={theme.colors.text.tertiary} />
                                <Text fontSize="$xs" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                                  {venue.city}
                                </Text>
                              </HStack>
                              <Text fontSize="$xs" color="$primary600" $dark={{ color: "$primary400" }}>
                                הזמן שוב
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </Pressable>
                    </Animated.View>
                  ))}
                </ScrollView>
              </VStack>
            )}

            {/* Bookings Timeline */}
            <VStack space="md" mt="$3" mb="$4">
              <HStack justifyContent="space-between" alignItems="center" px="$4">
                <VStack alignItems="flex-start">
                  <Heading size="lg" color="$textLight900" $dark={{ color: "$textDark50" }} textAlign="left">
                    ההזמנות שלי
                  </Heading>
                  <Text fontSize="$sm" color="$textLight600" $dark={{ color: "$textDark400" }} textAlign="left">
                    כל ההזמנות שלך במקום אחד
                  </Text>
                </VStack>
                <Button variant="outline" size="sm" borderRadius="$full">
                  <ButtonText fontSize="$sm" color="$primary600" $dark={{ color: "$primary400" }}>
                    סנן
                  </ButtonText>
                </Button>
              </HStack>

              {isLoading ? (
                <VStack space="sm" px="$4">
                  {[...Array(3)].map((_, index) => (
                    <Box
                      key={index}
                      bg="$backgroundLight100"
                      $dark={{ bg: "$backgroundDark700" }}
                      borderRadius="$lg"
                      height={80}
                      mx="$2"
                    >
                      <ActivityIndicator
                        style={{ flex: 1 }}
                        color={theme.colors.primary[600]}
                        size="small"
                      />
                    </Box>
                  ))}
                </VStack>
              ) : (
                <BookingTimeline bookings={upcomingBookings} />
              )}
            </VStack>
          </Animated.ScrollView>


          {/* Floating Action Button */}
          <FloatingActionButton />

          {/* QR Code Modal */}
          <QRModal />
        </VStack>
      </SafeAreaView>
    </>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
});

export default BookingsScreen;