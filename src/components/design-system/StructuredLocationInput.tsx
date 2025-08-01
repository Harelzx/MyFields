import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { RTLText } from './RTLText';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface StructuredAddress {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  neighborhood?: string;
  region?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  placeId?: string; // For Google Places integration
}

interface StructuredLocationInputProps {
  value: StructuredAddress;
  onValueChange: (address: StructuredAddress) => void;
  error?: string;
  label?: string;
}


export const StructuredLocationInput: React.FC<StructuredLocationInputProps> = ({
  value,
  onValueChange,
  error,
  label = 'מיקום המגרש',
}) => {

  // Ensure value has default structure
  const safeValue: StructuredAddress = value || {
    street: '',
    streetNumber: '',
    city: '',
    postalCode: '',
    neighborhood: '',
    country: 'ישראל',
    coordinates: undefined,
  };

  const updateAddress = (updates: Partial<StructuredAddress>) => {
    onValueChange({ ...safeValue, ...updates });
  };

  const validateAddress = () => {
    const errors: string[] = [];
    if (!safeValue.street.trim()) errors.push('רחוב');
    if (!safeValue.streetNumber.trim()) errors.push('מספר בית');
    if (!safeValue.city.trim()) errors.push('עיר');
    
    return errors.length === 0 ? null : `חסרים שדות: ${errors.join(', ')}`;
  };


  const renderAddressFields = () => (
    <View style={styles.fieldsContainer}>
      {/* Street and Street Number Row */}
      <View style={styles.fieldRow}>
        <View style={styles.streetFieldWrapper}>
          <RTLText style={styles.fieldLabel}>רחוב</RTLText>
          <View style={styles.inputContainer}>
            <Ionicons name="home-outline" size={20} color={designTokens.colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={safeValue.street}
              onChangeText={(text) => updateAddress({ street: text })}
              placeholder="שם הרחוב"
              placeholderTextColor={designTokens.colors.text.tertiary}
            />
          </View>
        </View>
        
        <View style={styles.numberFieldWrapper}>
          <RTLText style={styles.fieldLabel}>מספר</RTLText>
          <View style={styles.inputContainer}>
            <Ionicons name="keypad-outline" size={20} color={designTokens.colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={safeValue.streetNumber}
              onChangeText={(text) => updateAddress({ streetNumber: text })}
              placeholder="123"
              keyboardType="numeric"
              placeholderTextColor={designTokens.colors.text.tertiary}
            />
          </View>
        </View>
      </View>

      {/* City and Postal Code Row */}
      <View style={styles.fieldRow}>
        <View style={styles.cityFieldWrapper}>
          <RTLText style={styles.fieldLabel}>עיר</RTLText>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={designTokens.colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={safeValue.city}
              onChangeText={(text) => updateAddress({ city: text })}
              placeholder="תל אביב-יפו"
              placeholderTextColor={designTokens.colors.text.tertiary}
            />
          </View>
        </View>
        
        <View style={styles.postalCodeFieldWrapper}>
          <RTLText style={styles.fieldLabel}>מיקוד</RTLText>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={designTokens.colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={safeValue.postalCode}
              onChangeText={(text) => updateAddress({ postalCode: text })}
              placeholder="12345"
              keyboardType="numeric"
              placeholderTextColor={designTokens.colors.text.tertiary}
            />
          </View>
        </View>
      </View>

      {/* Neighborhood Row (Optional) */}
      <View style={styles.singleFieldRow}>
        <View style={styles.fullWidthFieldWrapper}>
          <RTLText style={styles.fieldLabel}>שכונה (אופציונאלי)</RTLText>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={designTokens.colors.text.tertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={safeValue.neighborhood || ''}
              onChangeText={(text) => updateAddress({ neighborhood: text })}
              placeholder="שם השכונה"
              placeholderTextColor={designTokens.colors.text.tertiary}
            />
          </View>
        </View>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <RTLText style={styles.sectionLabel}>{label}</RTLText>
      
      {/* Address Input Fields */}
      {renderAddressFields()}

      {/* Validation Error */}
      {error && (
        <RTLText style={styles.errorText}>{error}</RTLText>
      )}
      
      {/* Address Validation Warning */}
      {validateAddress() && (
        <RTLText style={styles.validationWarning}>
          {validateAddress()}
        </RTLText>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.lg,
  },
  sectionLabel: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },
  fieldsContainer: {
    gap: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    padding: designTokens.spacing.lg,
    ...designTokens.shadows.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },
  singleFieldRow: {
    flexDirection: 'row',
  },
  // Street field takes more space (65%)
  streetFieldWrapper: {
    flex: 0.65,
  },
  // Street number field takes less space (35%) but adequate for Israeli addresses
  numberFieldWrapper: {
    flex: 0.35,
  },
  // City field takes more space (60%)
  cityFieldWrapper: {
    flex: 0.6,
  },
  // Postal code field takes more space (40%) for Israeli 5-7 digit codes
  postalCodeFieldWrapper: {
    flex: 0.4,
  },
  fullWidthFieldWrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
  },
  inputContainer: {
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    textAlign: 'right',
    paddingVertical: designTokens.spacing.sm,
  },
  inputIcon: {
    marginRight: designTokens.spacing.sm,
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'left',
    marginTop: designTokens.spacing.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  validationWarning: {
    color: designTokens.colors.warning[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'left',
    marginTop: designTokens.spacing.sm,
    fontStyle: 'italic',
  },
});