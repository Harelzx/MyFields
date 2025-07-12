import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { RTLText } from '../RTLText';
import { designTokens } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  autoFocus?: boolean;
  editable?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'חפש מגרשים...',
  onClear,
  onFocus,
  onBlur,
  style,
  autoFocus = false,
  editable = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Ionicons name="search" size={20} color={designTokens.colors.text.tertiary} />
      </View>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={designTokens.colors.text.tertiary}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        editable={editable}
        textAlign="right"
        writingDirection="rtl"
      />

      {/* Clear Button */}
      {value.length > 0 && onClear && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={designTokens.colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    paddingHorizontal: designTokens.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: designTokens.spacing.sm,
  },
  iconText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.tertiary,
  },
  input: {
    flex: 1,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    textAlign: 'right',
  },
  clearButton: {
    marginLeft: designTokens.spacing.sm,
    padding: designTokens.spacing.xs,
  },
  clearText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
  },
});