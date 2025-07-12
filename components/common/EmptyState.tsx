import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RTLText } from '../RTLText';
import { WoltButton } from './WoltButton';
import { designTokens } from '../../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📱',
  title,
  subtitle,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <RTLText style={styles.icon}>{icon}</RTLText>
      </View>

      {/* Title */}
      <RTLText center style={styles.title}>{title}</RTLText>

      {/* Subtitle */}
      {subtitle && (
        <RTLText center style={styles.subtitle}>{subtitle}</RTLText>
      )}

      {/* Action Button */}
      {actionText && onAction && (
        <WoltButton
          variant="primary"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionText}
        </WoltButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.massive,
  },
  iconContainer: {
    marginBottom: designTokens.spacing.lg,
  },
  icon: {
    fontSize: 60,
    textAlign: 'center',
  },
  title: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  subtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeights.relaxed,
    marginBottom: designTokens.spacing.xl,
  },
  actionButton: {
    minWidth: 150,
  },
});