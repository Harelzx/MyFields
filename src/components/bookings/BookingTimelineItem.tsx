import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  FadeIn,
  SlideInLeft
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, VStack, Divider } from '@gluestack-ui/themed';
import QRCode from 'react-native-qrcode-svg';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface BookingTimelineItemProps {
  id: string;
  venueName: string;
  venueImage?: string;
  date: string;
  time: string;
  duration: number; // in hours
  price: number;
  currency: string;
  status: BookingStatus;
  courtNumber?: string;
  participants?: number;
  maxParticipants?: number;
  qrCode?: string; // For entry access
  onRebook?: (id: string) => void;
  onInvite?: (id: string) => void;
  onNavigate?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDetails?: (id: string) => void;
  style?: any;
}

const STATUS_CONFIG = {
  confirmed: {
    color: designTokens.colors.success[600],
    bgColor: designTokens.colors.success[100],
    icon: 'check-circle',
    text: 'אושר',
  },
  pending: {
    color: designTokens.colors.warning[600],
    bgColor: designTokens.colors.warning[100],
    icon: 'clock',
    text: 'ממתין לאישור',
  },
  cancelled: {
    color: designTokens.colors.error[600],
    bgColor: designTokens.colors.error[100],
    icon: 'close-circle',
    text: 'בוטל',
  },
  completed: {
    color: designTokens.colors.secondary[600],
    bgColor: designTokens.colors.secondary[100],
    icon: 'check-all',
    text: 'הושלם',
  },
};

export const BookingTimelineItem: React.FC<BookingTimelineItemProps> = ({
  id,
  venueName,
  venueImage,
  date,
  time,
  duration,
  price,
  currency,
  status,
  courtNumber,
  participants = 0,
  maxParticipants = 10,
  qrCode,
  onRebook,
  onInvite,
  onNavigate,
  onCancel,
  onDetails,
  style,
}) => {
  const scale = useSharedValue(1);
  const statusConfig = STATUS_CONFIG[status];
  const showQR = status === 'confirmed' && qrCode;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDateHebrew = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'מחר';
    } else {
      return date.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.delay(100)}
      style={[animatedStyle, style]}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => onDetails?.(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <HStack style={styles.content} space="md">
          {/* Venue Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {venueImage ? (
              <Image source={{ uri: venueImage }} style={styles.thumbnail} />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <MaterialCommunityIcons 
                  name="soccer-field" 
                  size={32} 
                  color={designTokens.colors.text.tertiary} 
                />
              </View>
            )}
            
            {/* Status Indicator Overlay */}
            <View style={[styles.statusOverlay, { backgroundColor: statusConfig.bgColor }]}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={16}
                color={statusConfig.color}
              />
            </View>
          </View>

          {/* Booking Details */}
          <VStack flex={1} space="xs">
            {/* Header */}
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1}>
                <RTLText style={styles.venueName} numberOfLines={1}>
                  {venueName}
                </RTLText>
                <RTLText style={styles.courtInfo}>
                  {courtNumber ? `מגרש ${courtNumber}` : 'מגרש'}
                </RTLText>
              </VStack>
              
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <RTLText style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </RTLText>
              </View>
            </HStack>

            {/* Date & Time */}
            <HStack space="lg" alignItems="center">
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={16} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.dateTime}>
                  {formatDateHebrew(date)} • {time}
                </RTLText>
              </HStack>
              
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={16} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.duration}>
                  {duration} {duration === 1 ? 'שעה' : 'שעות'}
                </RTLText>
              </HStack>
            </HStack>

            {/* Participants & Price */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={16} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.participants}>
                  {participants}/{maxParticipants} משתתפים
                </RTLText>
              </HStack>
              
              <RTLText style={styles.price}>
                {currency}{price}
              </RTLText>
            </HStack>

            {/* Action Buttons */}
            <HStack style={styles.actionButtons} space="sm">
              {status === 'confirmed' && (
                <>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onNavigate?.(id)}
                  >
                    <MaterialCommunityIcons 
                      name="map" 
                      size={16} 
                      color={designTokens.colors.primary[600]} 
                    />
                    <RTLText style={styles.actionButtonText}>ניווט</RTLText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onInvite?.(id)}
                  >
                    <MaterialCommunityIcons 
                      name="account-plus" 
                      size={16} 
                      color={designTokens.colors.primary[600]} 
                    />
                    <RTLText style={styles.actionButtonText}>הזמן</RTLText>
                  </TouchableOpacity>
                </>
              )}
              
              {(status === 'completed' || status === 'cancelled') && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onRebook?.(id)}
                >
                  <MaterialCommunityIcons 
                    name="refresh" 
                    size={16} 
                    color={designTokens.colors.primary[600]} 
                  />
                  <RTLText style={styles.actionButtonText}>הזמן שוב</RTLText>
                </TouchableOpacity>
              )}
              
              {status === 'pending' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => onCancel?.(id)}
                >
                  <MaterialCommunityIcons 
                    name="close" 
                    size={16} 
                    color={designTokens.colors.error[600]} 
                  />
                  <RTLText style={styles.cancelButtonText}>בטל</RTLText>
                </TouchableOpacity>
              )}
            </HStack>
          </VStack>

          {/* QR Code for Entry */}
          {showQR && (
            <Animated.View entering={SlideInLeft.delay(200)} style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrCode}
                  size={60}
                  backgroundColor={designTokens.colors.background.primary}
                  color={designTokens.colors.text.primary}
                />
              </View>
              <RTLText style={styles.qrLabel}>QR כניסה</RTLText>
            </Animated.View>
          )}
        </HStack>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.md,
    ...designTokens.shadows.sm,
  },
  content: {
    alignItems: 'flex-start',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: designTokens.borderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: designTokens.colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: designTokens.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: designTokens.colors.background.card,
  },
  venueName: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  courtInfo: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.full,
  },
  statusText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  dateTime: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    fontWeight: designTokens.typography.weights.medium,
  },
  duration: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  participants: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  price: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
  },
  actionButtons: {
    marginTop: designTokens.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.primary[50],
    borderRadius: designTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: designTokens.colors.primary[200],
  },
  actionButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
    marginLeft: designTokens.spacing.xs,
  },
  cancelButton: {
    backgroundColor: designTokens.colors.error[50],
    borderColor: designTokens.colors.error[200],
  },
  cancelButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.error[600],
    fontWeight: designTokens.typography.weights.medium,
    marginLeft: designTokens.spacing.xs,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: designTokens.spacing.md,
  },
  qrCodeWrapper: {
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  qrLabel: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.text.tertiary,
    marginTop: designTokens.spacing.xs,
    textAlign: 'center',
  },
});