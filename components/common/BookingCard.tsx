import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RTLText } from '../RTLText';
import { WoltButton } from './WoltButton';
import { designTokens } from '../../constants/theme';
import { Booking } from '../../utils/types';

interface BookingCardProps extends Booking {
  onPress?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
  style?: any;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  onPress,
  onCancel,
  style,
  ...booking
}) => {
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
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canCancel = booking.status === 'confirmed' || booking.status === 'active';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(booking)}
      activeOpacity={0.7}
    >
      {/* Field Image */}
      <View style={styles.imageContainer}>
        {booking.fieldImageUrl ? (
          <Image source={{ uri: booking.fieldImageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <RTLText style={styles.placeholderText}>תמונה</RTLText>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <RTLText style={styles.statusText}>{getStatusText()}</RTLText>
        </View>
      </View>

      {/* Booking Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <RTLText style={styles.fieldName}>{booking.fieldName}</RTLText>
          <RTLText style={styles.price}>₪{booking.totalPrice}</RTLText>
        </View>

        <RTLText style={styles.date}>{formatDate(booking.date)}</RTLText>
        <RTLText style={styles.time}>
          {booking.startTime} - {booking.endTime} ({booking.duration} שעות)
        </RTLText>

        {canCancel && (
          <View style={styles.actions}>
            <WoltButton
              variant="outline"
              onPress={() => onCancel?.(booking.id)}
              style={styles.cancelButton}
            >
              בטל הזמנה
            </WoltButton>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.md,
    ...designTokens.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: designTokens.colors.secondary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: designTokens.colors.text.tertiary,
    fontSize: designTokens.typography.sizes.md,
  },
  statusBadge: {
    position: 'absolute',
    top: designTokens.spacing.sm,
    right: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
  },
  statusText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  content: {
    padding: designTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.xs,
  },
  fieldName: {
    flex: 1,
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  price: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
    marginLeft: designTokens.spacing.sm,
  },
  date: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
  },
  time: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
    marginBottom: designTokens.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: designTokens.spacing.lg,
  },
});