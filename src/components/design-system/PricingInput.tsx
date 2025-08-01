import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { RTLText } from './RTLText';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface PricingTier {
  name: string;
  price: number;
  description?: string;
}

export interface PricingData {
  basePrice: number;
  currency: 'ILS';
  pricingType: 'per_hour' | 'per_game' | 'per_day';
  hasPeakPricing: boolean;
  peakPrice?: number;
  peakHours?: {
    start: string;
    end: string;
    days: string[];
  };
  groupPricing: PricingTier[];
  packages: PricingTier[];
}

interface PricingInputProps {
  value: PricingData;
  onValueChange: (pricing: PricingData) => void;
  error?: string;
  label?: string;
}

const PRICING_TYPES = [
  { key: 'per_hour', label: 'לשעה', icon: 'time-outline' },
  { key: 'per_game', label: 'למשחק', icon: 'football-outline' },
  { key: 'per_day', label: 'ליום', icon: 'calendar-outline' },
] as const;


const DEFAULT_GROUP_PRICING: PricingTier[] = [
  { name: 'קבוצה קטנה (2-4)', price: 0, description: 'עד 4 אנשים' },
  { name: 'קבוצה בינונית (5-8)', price: 0, description: '5-8 אנשים' },
  { name: 'קבוצה גדולה (9+)', price: 0, description: '9 אנשים ומעלה' },
];

const DEFAULT_PACKAGES: PricingTier[] = [
  { name: 'מנוי שבועי', price: 0, description: '7 ימים' },
  { name: 'מנוי חודשי', price: 0, description: '30 ימים' },
  { name: 'מנוי שנתי', price: 0, description: '365 ימים' },
];

export const PricingInput: React.FC<PricingInputProps> = ({
  value,
  onValueChange,
  error,
  label = 'תעריף השכרה',
}) => {
  const [expandedSection, setExpandedSection] = useState<'peak' | 'group' | 'packages' | null>(null);

  // Ensure value has default structure
  const safeValue: PricingData = value || {
    basePrice: 0,
    currency: 'ILS',
    pricingType: 'per_hour',
    hasPeakPricing: false,
    peakPricing: {
      peakPrice: 0,
      peakHours: { start: '18:00', end: '22:00' },
      peakDays: [],
    },
    groupPricing: [...DEFAULT_GROUP_PRICING],
    packages: [...DEFAULT_PACKAGES],
  };

  const updatePricing = (updates: Partial<PricingData>) => {
    onValueChange({ ...safeValue, ...updates });
  };

  const toggleSection = (section: 'peak' | 'group' | 'packages') => {
    setExpandedSection(expandedSection === section ? null : section);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addGroupPricingTier = () => {
    const newTier: PricingTier = {
      name: `קבוצה ${safeValue.groupPricing.length + 1}`,
      price: 0,
      description: '',
    };
    updatePricing({
      groupPricing: [...safeValue.groupPricing, newTier],
    });
  };

  const updateGroupPricingTier = (index: number, tier: PricingTier) => {
    const newGroupPricing = [...safeValue.groupPricing];
    newGroupPricing[index] = tier;
    updatePricing({ groupPricing: newGroupPricing });
  };

  const removeGroupPricingTier = (index: number) => {
    const newGroupPricing = safeValue.groupPricing.filter((_, i) => i !== index);
    updatePricing({ groupPricing: newGroupPricing });
  };

  const addPackage = () => {
    const newPackage: PricingTier = {
      name: `חבילה ${safeValue.packages.length + 1}`,
      price: 0,
      description: '',
    };
    updatePricing({
      packages: [...safeValue.packages, newPackage],
    });
  };

  const updatePackage = (index: number, packageTier: PricingTier) => {
    const newPackages = [...safeValue.packages];
    newPackages[index] = packageTier;
    updatePricing({ packages: newPackages });
  };

  const removePackage = (index: number) => {
    const newPackages = safeValue.packages.filter((_, i) => i !== index);
    updatePricing({ packages: newPackages });
  };

  const formatPrice = (price: number) => {
    return `${price} ₪`;
  };

  const renderPricingTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <RTLText style={styles.sectionInputLabel}>סוג התעריף</RTLText>
      <View style={styles.segmentedControlContainer}>
        <View style={styles.segmentedControl}>
          {PRICING_TYPES.map((type, index) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.segmentedControlItem,
                index === 0 && styles.segmentedControlItemFirst,
                index === PRICING_TYPES.length - 1 && styles.segmentedControlItemLast,
                safeValue.pricingType === type.key && styles.segmentedControlItemSelected,
              ]}
              onPress={() => {
                updatePricing({ pricingType: type.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessibilityLabel={`בחר תעריף ${type.label}`}
              accessibilityRole="button"
            >
              <RTLText style={[
                styles.segmentedControlText,
                safeValue.pricingType === type.key && styles.segmentedControlTextSelected,
              ]}>
                {type.label}
              </RTLText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderBasePricing = () => (
    <View style={styles.sectionContainer}>
      <RTLText style={styles.sectionInputLabel}>מחיר בסיס</RTLText>
      <View style={styles.priceInputContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={safeValue.basePrice.toString()}
            onChangeText={(text) => {
              const price = parseFloat(text) || 0;
              updatePricing({ basePrice: price });
            }}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.currencyLabel}>
            <RTLText style={styles.currencyText}>₪</RTLText>
          </View>
        </View>
        <RTLText style={styles.priceDescription}>
          {formatPrice(safeValue.basePrice)} {PRICING_TYPES.find(t => t.key === safeValue.pricingType)?.label}
        </RTLText>
      </View>
    </View>
  );

  const renderPeakPricing = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('peak')}
        accessibilityLabel="תעריפי שעות עומס"
      >
        <RTLText style={styles.sectionLabel}>תעריפי שעות עומס</RTLText>
        <View style={styles.sectionHeaderRight}>
          <TouchableOpacity
            style={[
              styles.enableToggle,
              safeValue.hasPeakPricing && styles.enableToggleActive,
            ]}
            onPress={() => {
              updatePricing({ 
                hasPeakPricing: !safeValue.hasPeakPricing,
                ...(safeValue.hasPeakPricing ? { peakPrice: undefined, peakHours: undefined } : {})
              });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <RTLText style={[
              styles.enableToggleText,
              safeValue.hasPeakPricing && styles.enableToggleTextActive,
            ]}>
              {safeValue.hasPeakPricing ? 'פעיל' : 'כבוי'}
            </RTLText>
          </TouchableOpacity>
          <Ionicons
            name={expandedSection === 'peak' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={designTokens.colors.text.tertiary}
          />
        </View>
      </TouchableOpacity>

      {expandedSection === 'peak' && safeValue.hasPeakPricing && (
        <View style={styles.expandedContent}>
          <View style={styles.inputGroup}>
            <RTLText style={styles.sectionInputLabel}>מחיר בשעות עומס</RTLText>
            <View style={styles.inputContainer}>
              <Ionicons name="trending-up-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={safeValue.peakPrice?.toString() || ''}
                onChangeText={(text) => {
                  const price = parseFloat(text) || 0;
                  updatePricing({ peakPrice: price });
                }}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.currencyLabel}>
                <RTLText style={styles.currencyText}>₪</RTLText>
              </View>
            </View>
          </View>
          
          <RTLText style={styles.helperText}>
            הגדר שעות עומס (לדוגמה: 17:00-21:00 בימי ב׳-ה׳)
          </RTLText>
        </View>
      )}
    </View>
  );

  const renderTierInput = (
    tier: PricingTier,
    index: number,
    onUpdate: (index: number, tier: PricingTier) => void,
    onRemove: (index: number) => void
  ) => (
    <View key={index} style={styles.tierContainer}>
      <View style={styles.tierHeader}>
        <View style={styles.tierInputs}>
          <View style={styles.tierNameInput}>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={tier.name}
                onChangeText={(name) => onUpdate(index, { ...tier, name })}
                placeholder="שם הקבוצה/חבילה"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          <View style={styles.tierPriceInput}>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={tier.price.toString()}
                onChangeText={(text) => {
                  const price = parseFloat(text) || 0;
                  onUpdate(index, { ...tier, price });
                }}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.currencyLabel}>
                <RTLText style={styles.currencyText}>₪</RTLText>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeTierButton}
          onPress={() => {
            onRemove(index);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          accessibilityLabel="הסר רמת תמחור"
        >
          <Ionicons name="close-circle" size={20} color={designTokens.colors.error[500]} />
        </TouchableOpacity>
      </View>
      
      {tier.description !== undefined && (
        <View style={styles.inputContainer}>
          <Ionicons name="document-text-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, styles.tierDescriptionInput]}
            value={tier.description}
            onChangeText={(description) => onUpdate(index, { ...tier, description })}
            placeholder="תיאור (אופציונאלי)"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>
      )}
    </View>
  );

  const renderGroupPricing = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('group')}
        accessibilityLabel="תעריפי קבוצות"
      >
        <RTLText style={styles.sectionLabel}>תעריפי קבוצות</RTLText>
        <Ionicons
          name={expandedSection === 'group' ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={designTokens.colors.text.tertiary}
        />
      </TouchableOpacity>

      {expandedSection === 'group' && (
        <View style={styles.expandedContent}>
          {safeValue.groupPricing.map((tier, index) =>
            renderTierInput(tier, index, updateGroupPricingTier, removeGroupPricingTier)
          )}
          
          <TouchableOpacity
            style={styles.addTierButton}
            onPress={addGroupPricingTier}
            accessibilityLabel="הוסף תעריף קבוצה"
          >
            <Ionicons name="add-circle-outline" size={20} color={designTokens.colors.primary[600]} />
            <RTLText style={styles.addTierButtonText}>הוסף תעריף קבוצה</RTLText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPackages = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('packages')}
        accessibilityLabel="חבילות ומנויים"
      >
        <RTLText style={styles.sectionLabel}>חבילות ומנויים</RTLText>
        <Ionicons
          name={expandedSection === 'packages' ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={designTokens.colors.text.tertiary}
        />
      </TouchableOpacity>

      {expandedSection === 'packages' && (
        <View style={styles.expandedContent}>
          {safeValue.packages.map((packageTier, index) =>
            renderTierInput(packageTier, index, updatePackage, removePackage)
          )}
          
          <TouchableOpacity
            style={styles.addTierButton}
            onPress={addPackage}
            accessibilityLabel="הוסף חבילה"
          >
            <Ionicons name="add-circle-outline" size={20} color={designTokens.colors.primary[600]} />
            <RTLText style={styles.addTierButtonText}>הוסף חבילה</RTLText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <RTLText style={styles.inputLabel}>{label}</RTLText>
      
      {renderPricingTypeSelector()}
      {renderBasePricing()}
      {renderPeakPricing()}
      {renderGroupPricing()}
      {renderPackages()}

      {error && (
        <RTLText style={styles.errorText}>{error}</RTLText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
  inputLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  sectionContainer: {
    marginBottom: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designTokens.spacing.md,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  sectionLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'right',
  },
  expandedContent: {
    padding: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
    backgroundColor: designTokens.colors.background.secondary,
    gap: designTokens.spacing.md,
  },
  segmentedControlContainer: {
    padding: designTokens.spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row-reverse',
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    overflow: 'hidden',
  },
  segmentedControlItem: {
    flex: 1,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: designTokens.colors.border.light,
    minHeight: 44,
  },
  segmentedControlItemFirst: {
    borderTopLeftRadius: designTokens.borderRadius.lg,
    borderBottomLeftRadius: designTokens.borderRadius.lg,
    borderLeftWidth: 0,
  },
  segmentedControlItemLast: {
    borderTopRightRadius: designTokens.borderRadius.lg,
    borderBottomRightRadius: designTokens.borderRadius.lg,
  },
  segmentedControlItemSelected: {
    backgroundColor: designTokens.colors.primary[600],
  },
  segmentedControlText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  segmentedControlTextSelected: {
    color: designTokens.colors.text.inverse,
  },
  priceInputContainer: {
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },
  priceTextInput: {
    flex: 1,
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    textAlign: 'left',
  },
  currencyLabel: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: designTokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  currencyText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
  },
  priceDescription: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    fontWeight: designTokens.typography.weights.medium,
  },
  enableToggle: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: designTokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
  },
  enableToggleActive: {
    backgroundColor: designTokens.colors.success[50],
    borderColor: designTokens.colors.success[300],
  },
  enableToggleText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
  },
  enableToggleTextActive: {
    color: designTokens.colors.success[600],
  },
  inputGroup: {
    gap: designTokens.spacing.xs,
  },
  sectionInputLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
    paddingVertical: 12,
    marginLeft: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  helperText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.tertiary,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  tierContainer: {
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.sm,
  },
  tierInputs: {
    flex: 1,
    gap: designTokens.spacing.sm,
  },
  tierNameInput: {
    flex: 1,
  },
  tierPriceInput: {
    flex: 1,
  },
  tierDescriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeTierButton: {
    padding: designTokens.spacing.xs,
  },
  addTierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.primary[50],
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.primary[200],
  },
  addTierButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.primary[600],
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'center',
  },
});