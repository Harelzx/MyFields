import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: 'person' | 'mail' | 'lock' | 'phone' | 'search' | 'money';
  rightIcon?: 'eye' | 'eye-off' | 'clear';
  onRightIconPress?: () => void;
  rightIconStyle?: ViewStyle;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoFocus?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  rightIconStyle,
  secureTextEntry = false,
  keyboardType = 'default',
  autoFocus = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <RTLText style={styles.label}>{label}</RTLText>
      )}

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>
            {getLeftIcon(leftIcon)}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={designTokens.colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign="right"
          writingDirection="rtl"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Right Icon */}
        {rightIcon && (
          <Animated.View style={rightIconStyle}>
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              activeOpacity={0.6}
            >
              {getRightIcon(rightIcon)}
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Error */}
      {error && (
        <RTLText style={styles.error}>{error}</RTLText>
      )}
    </View>
  );
};

const getLeftIcon = (iconName: string) => {
  const iconColor = designTokens.colors.text.tertiary;
  const iconSize = 20;
  
  switch (iconName) {
    case 'person':
      return <Ionicons name="person-outline" size={iconSize} color={iconColor} />;
    case 'mail':
      return <Ionicons name="mail-outline" size={iconSize} color={iconColor} />;
    case 'lock':
      return <Ionicons name="lock-closed-outline" size={iconSize} color={iconColor} />;
    case 'phone':
      return <Ionicons name="call-outline" size={iconSize} color={iconColor} />;
    case 'search':
      return <Ionicons name="search-outline" size={iconSize} color={iconColor} />;
    case 'money':
      return <Ionicons name="card-outline" size={iconSize} color={iconColor} />;
    default:
      return <Ionicons name="ellipse-outline" size={iconSize} color={iconColor} />;
  }
};

const getRightIcon = (iconName: string) => {
  const iconColor = designTokens.colors.text.tertiary;
  const iconSize = 20;
  
  switch (iconName) {
    case 'eye':
      return <Ionicons name="eye-outline" size={iconSize} color={iconColor} />;
    case 'eye-off':
      return <Ionicons name="eye-off-outline" size={iconSize} color={iconColor} />;
    case 'clear':
      return <Ionicons name="close-circle-outline" size={iconSize} color={iconColor} />;
    default:
      return <Ionicons name="ellipse-outline" size={iconSize} color={iconColor} />;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
  label: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    paddingHorizontal: designTokens.spacing.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: designTokens.colors.primary[600],
    ...designTokens.shadows.sm,
  },
  inputContainerError: {
    borderColor: designTokens.colors.error[500],
  },
  input: {
    flex: 1,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    textAlign: 'right',
    paddingVertical: designTokens.spacing.sm,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  leftIcon: {
    marginRight: designTokens.spacing.sm,
  },
  rightIcon: {
    marginLeft: designTokens.spacing.sm,
    padding: designTokens.spacing.xs,
  },
  iconText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.tertiary,
  },
  error: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.error[500],
    marginTop: designTokens.spacing.xs,
  },
});