import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RTLText } from '../RTLText';
import { designTokens } from '../../constants/theme';

interface FieldCardProps {
  id: string;
  name: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  imageUrl?: string;
  distance?: string;
  availableSlots?: number;
  onPress?: (id: string) => void;
  style?: any;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  id,
  name,
  location,
  price,
  currency,
  rating,
  imageUrl,
  distance,
  availableSlots,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(id)}
      activeOpacity={0.7}
    >
      {/* Field Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <RTLText style={styles.placeholderText}>תמונה</RTLText>
          </View>
        )}
        {distance && (
          <View style={styles.distanceBadge}>
            <RTLText style={styles.distanceText}>{distance}</RTLText>
          </View>
        )}
      </View>

      {/* Field Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <RTLText style={styles.name}>{name}</RTLText>
          <View style={styles.ratingContainer}>
            <RTLText style={styles.rating}>⭐ {rating.toFixed(1)}</RTLText>
          </View>
        </View>

        <RTLText style={styles.location}>{location}</RTLText>

        <View style={styles.footer}>
          <RTLText style={styles.price}>
            {currency}{price.toFixed(0)} / שעה
          </RTLText>
          {availableSlots && (
            <RTLText style={styles.availability}>
              {availableSlots} זמינים
            </RTLText>
          )}
        </View>
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
    ...designTokens.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
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
  distanceBadge: {
    position: 'absolute',
    top: designTokens.spacing.sm,
    left: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.background.overlay,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
  },
  distanceText: {
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
  name: {
    flex: 1,
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  ratingContainer: {
    marginLeft: designTokens.spacing.sm,
  },
  rating: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  location: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
  },
  availability: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.success[600],
    fontWeight: designTokens.typography.weights.medium,
  },
});