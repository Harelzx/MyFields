import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
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
  Divider
} from '@gluestack-ui/themed';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RTLText } from '@components/design-system/RTLText';
import { WoltButton } from './WoltButton';
import { designTokens } from '@constants/theme';
import { Booking } from '../../types/types';
import { useTheme } from '@contexts/ThemeContext';

interface BookingCardProps extends Booking {
  onPress?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
  onShare?: (bookingId: string) => void;
  onNavigate?: () => void;
  style?: any;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  onPress,
  onCancel,
  onShare,
  onNavigate,
  style,
  ...booking
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };
  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return designTokens.colors.success[600];
      case 'active':
        return designTokens.colors.primary[600];
      case 'completed':
        return designTokens.colors.secondary[600];
      case 'cancelled':
        return designTokens.colors.error[500];
      default:
        return designTokens.colors.secondary[500];
    }
  };

  const getStatusText = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'מאושר';
      case 'active':
        return 'פעיל';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return 'ממתין';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'היום';
    if (isTomorrow) return 'מחר';
    
    return date.toLocaleDateString('he-IL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTimeUntilBooking = () => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) return null; // Past booking
    if (diffHours < 1) return 'תוך פחות משעה';
    if (diffHours < 24) return `תוך ${diffHours} שעות`;
    if (diffDays === 1) return 'מחר';
    return `תוך ${diffDays} ימים`;
  };
  
  const isUpcoming = () => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    return bookingDateTime > new Date();
  };

  const canCancel = (booking.status === 'confirmed' || booking.status === 'active') && isUpcoming();
  const canShare = booking.status !== 'cancelled';
  const canNavigate = booking.status !== 'cancelled';
  const timeUntil = getTimeUntilBooking();

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={() => onPress?.(booking)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        $pressed={{
          opacity: 0.95,
          transform: [{ scale: 0.99 }],
        }}
      >
        <Box
          bg="$backgroundLight0"
          $dark={{bg: "$backgroundDark800"}}
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderLight200"
          $dark={{borderColor: "$borderDark700"}}
          overflow="hidden"
          shadowColor="$shadowLight300"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={4}
          elevation={3}
        >
          {/* Enhanced Image Section */}
          <Box position="relative" height={140}>
            {booking.fieldImageUrl ? (
              <Image source={{ uri: booking.fieldImageUrl }} style={styles.image} />
            ) : (
              <Box
                width="100%"
                height="100%"
                bg="$backgroundLight200"
                $dark={{bg: "$backgroundDark600"}}
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="image-outline" size={32} color={theme.colors.text.tertiary} />
                <Text fontSize="$sm" color="$textLight500" $dark={{color: "$textDark400"}} mt="$2">
                  תמונת מגרש
                </Text>
              </Box>
            )}
            
            {/* Gradient Overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.3))"
            />
            
            {/* Status Badge */}
            <Badge
              position="absolute"
              top="$3"
              right="$3"
              bg={getStatusColor()}
              borderRadius="$md"
              px="$3"
              py="$1"
              borderWidth={0}
            >
              <BadgeText
                fontSize="$sm"
                fontWeight="$medium"
                color="white"
              >
                {getStatusText()}
              </BadgeText>
            </Badge>
            
            {/* Time Until Badge */}
            {timeUntil && (
              <Badge
                position="absolute"
                bottom="$3"
                left="$3"
                bg="rgba(0,0,0,0.7)"
                borderRadius="$full"
                px="$3"
                py="$1"
                borderWidth={0}
              >
                <HStack space="xs" alignItems="center">
                  <Ionicons name="time" size={14} color="white" />
                  <BadgeText
                    fontSize="$xs"
                    fontWeight="$medium"
                    color="white"
                  >
                    {timeUntil}
                  </BadgeText>
                </HStack>
              </Badge>
            )}
          </Box>

          {/* Enhanced Content Section */}
          <VStack p="$4" space="sm">
            {/* Header with Field Name and Price */}
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack space="xs" flex={1} alignItems="flex-start">
                <Heading
                  size="md"
                  fontWeight="$bold"
                  color="$textLight900"
                  $dark={{color: "$textDark50"}}
                  numberOfLines={1}
                  textAlign="left"
                >
                  {booking.fieldName}
                </Heading>
                <Text
                  fontSize="$sm"
                  color="$textLight600"
                  $dark={{color: "$textDark400"}}
                  textAlign="left"
                >
                  {formatDate(booking.date)}
                </Text>
              </VStack>
              <Box alignItems="flex-end">
                <Heading
                  size="md"
                  fontWeight="$bold"
                  color="$primary600"
                  $dark={{color: "$primary400"}}
                  textAlign="right"
                >
                  ₪{booking.totalPrice}
                </Heading>
              </Box>
            </HStack>

            {/* Time and Duration */}
            <HStack space="md" alignItems="center">
              <HStack space="xs" alignItems="center" flex={1}>
                <Box
                  bg="$primary100"
                  $dark={{bg: "$primary900"}}
                  borderRadius="$full"
                  p="$1"
                  width={24}
                  height={24}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="time" size={12} color={theme.colors.primary[600]} />
                </Box>
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight700"
                  $dark={{color: "$textDark300"}}
                  textAlign="left"
                >
                  {booking.startTime} - {booking.endTime}
                </Text>
              </HStack>
              <Text
                fontSize="$xs"
                color="$textLight500"
                $dark={{color: "$textDark400"}}
                bg="$backgroundLight100"
                $dark={{bg: "$backgroundDark700"}}
                px="$2"
                py="$1"
                borderRadius="$sm"
              >
                {booking.duration} שעות
              </Text>
            </HStack>

            {/* Action Buttons */}
            {(canCancel || canShare || canNavigate) && (
              <>
                <Divider bg="$borderLight200" $dark={{bg: "$borderDark600"}} my="$2" />
                <HStack space="sm" justifyContent="space-between">
                  {/* Primary Actions */}
                  <HStack space="sm" flex={1}>
                    {canNavigate && onNavigate && (
                      <Button
                        variant="outline"
                        size="sm"
                        flex={1}
                        borderColor="$borderLight300"
                        $dark={{borderColor: "$borderDark600"}}
                        bg="$backgroundLight50"
                        $dark={{bg: "$backgroundDark700"}}
                        onPress={onNavigate}
                      >
                        <HStack space="xs" alignItems="center">
                          <Ionicons name="navigate" size={14} color={theme.colors.text.secondary} />
                          <ButtonText
                            fontSize="$sm"
                            fontWeight="$medium"
                            color="$textLight700"
                            $dark={{color: "$textDark300"}}
                          >
                            ניווט
                          </ButtonText>
                        </HStack>
                      </Button>
                    )}
                    
                    {canShare && onShare && (
                      <Button
                        variant="outline"
                        size="sm"
                        flex={1}
                        borderColor="$borderLight300"
                        $dark={{borderColor: "$borderDark600"}}
                        bg="$backgroundLight50"
                        $dark={{bg: "$backgroundDark700"}}
                        onPress={() => onShare(booking.id)}
                      >
                        <HStack space="xs" alignItems="center">
                          <Ionicons name="share" size={14} color={theme.colors.text.secondary} />
                          <ButtonText
                            fontSize="$sm"
                            fontWeight="$medium"
                            color="$textLight700"
                            $dark={{color: "$textDark300"}}
                          >
                            שתף
                          </ButtonText>
                        </HStack>
                      </Button>
                    )}
                  </HStack>
                  
                  {/* Cancel Button */}
                  {canCancel && onCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      borderColor="$error500"
                      bg="$error50"
                      $dark={{bg: "$error900"}}
                      onPress={() => onCancel(booking.id)}
                      ml="$2"
                    >
                      <HStack space="xs" alignItems="center">
                        <Ionicons name="close-circle" size={14} color={designTokens.colors.error[500]} />
                        <ButtonText
                          fontSize="$sm"
                          fontWeight="$medium"
                          color="$error600"
                          $dark={{color: "$error400"}}
                        >
                          בטל
                        </ButtonText>
                      </HStack>
                    </Button>
                  )}
                </HStack>
              </>
            )}
          </VStack>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});