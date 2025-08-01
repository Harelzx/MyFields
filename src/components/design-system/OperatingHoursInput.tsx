import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  I18nManager,
} from 'react-native';
import { RTLText } from './RTLText';
import { TimePicker } from './TimePicker';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface OperatingHours {
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
}

interface OperatingHoursInputProps {
  value?: OperatingHours;
  onValueChange: (hours: OperatingHours) => void;
  error?: string;
  label?: string;
}

// Israeli week structure: Sunday is first working day, Saturday is rest day
const DAYS_OF_WEEK = [
  { key: 'sunday' as keyof OperatingHours, label: 'ראשון', shortLabel: 'א׳' },
  { key: 'monday' as keyof OperatingHours, label: 'שני', shortLabel: 'ב׳' },
  { key: 'tuesday' as keyof OperatingHours, label: 'שלישי', shortLabel: 'ג׳' },
  { key: 'wednesday' as keyof OperatingHours, label: 'רביעי', shortLabel: 'ד׳' },
  { key: 'thursday' as keyof OperatingHours, label: 'חמישי', shortLabel: 'ה׳' },
  { key: 'friday' as keyof OperatingHours, label: 'שישי', shortLabel: 'ו׳' },
  { key: 'saturday' as keyof OperatingHours, label: 'שבת', shortLabel: 'ש׳' },
];

const DEFAULT_DAY_HOURS: DayHours = {
  isOpen: true,
  openTime: '08:00',
  closeTime: '22:00',
};

const DEFAULT_SATURDAY_HOURS: DayHours = {
  isOpen: false,
  openTime: '08:00',
  closeTime: '22:00',
};

const createDefaultOperatingHours = (): OperatingHours => ({
  sunday: { ...DEFAULT_DAY_HOURS },
  monday: { ...DEFAULT_DAY_HOURS },
  tuesday: { ...DEFAULT_DAY_HOURS },
  wednesday: { ...DEFAULT_DAY_HOURS },
  thursday: { ...DEFAULT_DAY_HOURS },
  friday: { ...DEFAULT_DAY_HOURS },
  saturday: { ...DEFAULT_SATURDAY_HOURS }, // Saturday closed by default for Israeli culture
});

const ensureDayHours = (dayHours: DayHours | undefined): DayHours => {
  if (!dayHours || typeof dayHours !== 'object') {
    return { ...DEFAULT_DAY_HOURS };
  }
  
  return {
    isOpen: typeof dayHours.isOpen === 'boolean' ? dayHours.isOpen : DEFAULT_DAY_HOURS.isOpen,
    openTime: typeof dayHours.openTime === 'string' ? dayHours.openTime : DEFAULT_DAY_HOURS.openTime,
    closeTime: typeof dayHours.closeTime === 'string' ? dayHours.closeTime : DEFAULT_DAY_HOURS.closeTime,
  };
};

export const OperatingHoursInput: React.FC<OperatingHoursInputProps> = ({
  value,
  onValueChange,
  error,
  label = 'שעות פעילות',
}) => {
  const [expandedDay, setExpandedDay] = useState<keyof OperatingHours | null>(null);

  // Ensure value has complete, safe structure with deep validation
  const safeValue: OperatingHours = React.useMemo(() => {
    if (!value || typeof value !== 'object') {
      return createDefaultOperatingHours();
    }
    
    return {
      sunday: ensureDayHours(value.sunday),
      monday: ensureDayHours(value.monday),
      tuesday: ensureDayHours(value.tuesday),
      wednesday: ensureDayHours(value.wednesday),
      thursday: ensureDayHours(value.thursday),
      friday: ensureDayHours(value.friday),
      saturday: ensureDayHours(value.saturday),
    };
  }, [value]);

  const updateDayHours = (day: keyof OperatingHours, dayHours: DayHours) => {
    const newHours = {
      ...safeValue,
      [day]: dayHours,
    };
    onValueChange(newHours);
  };

  const toggleDayOpen = (day: keyof OperatingHours) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentDay = ensureDayHours(safeValue[day]);
    updateDayHours(day, {
      ...currentDay,
      isOpen: !currentDay.isOpen,
    });
  };

  const copyHoursToWeekdays = () => {
    const sundayHours = ensureDayHours(safeValue.sunday);
    // Israeli weekdays: Sunday through Thursday (not including Friday and Saturday)
    const weekdays: (keyof OperatingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday'];
    
    // For RTL languages, we want ביטול on the right and העתק on the left
    // In RTL, the first button appears on the right, second on the left
    const buttons = I18nManager.isRTL ? [
      { text: 'ביטול', style: 'cancel' as const },
      {
        text: 'העתק',
        onPress: () => {
          const newHours = { ...safeValue };
          weekdays.forEach(day => {
            newHours[day] = { ...sundayHours };
          });
          onValueChange(newHours);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ] : [
      {
        text: 'העתק',
        onPress: () => {
          const newHours = { ...safeValue };
          weekdays.forEach(day => {
            newHours[day] = { ...sundayHours };
          });
          onValueChange(newHours);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
      { text: 'ביטול', style: 'cancel' as const },
    ];
    
    Alert.alert(
      'העתק שעות',
      'האם ברצונך להעתיק את שעות יום ראשון לימי השבוע (ב׳-ה׳)?',
      buttons
    );
  };

  const copyHoursToAll = () => {
    const sundayHours = ensureDayHours(safeValue.sunday);
    
    // For RTL languages, we want ביטול on the right and העתק on the left
    // In RTL, the first button appears on the right, second on the left
    const buttons = I18nManager.isRTL ? [
      { text: 'ביטול', style: 'cancel' as const },
      {
        text: 'העתק',
        onPress: () => {
          const newHours: OperatingHours = {
            sunday: { ...sundayHours },
            monday: { ...sundayHours },
            tuesday: { ...sundayHours },
            wednesday: { ...sundayHours },
            thursday: { ...sundayHours },
            friday: { ...sundayHours },
            saturday: { ...sundayHours },
          };
          onValueChange(newHours);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ] : [
      {
        text: 'העתק',
        onPress: () => {
          const newHours: OperatingHours = {
            sunday: { ...sundayHours },
            monday: { ...sundayHours },
            tuesday: { ...sundayHours },
            wednesday: { ...sundayHours },
            thursday: { ...sundayHours },
            friday: { ...sundayHours },
            saturday: { ...sundayHours },
          };
          onValueChange(newHours);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
      { text: 'ביטול', style: 'cancel' as const },
    ];
    
    Alert.alert(
      'העתק שעות לכל הימים',
      'האם ברצונך להעתיק את שעות יום ראשון לכל ימי השבוע?',
      buttons
    );
  };


  const formatTimeRange = (dayHours: DayHours | undefined) => {
    const safeDayHours = ensureDayHours(dayHours);
    if (!safeDayHours.isOpen) return 'סגור';
    return `${safeDayHours.openTime} - ${safeDayHours.closeTime}`;
  };

  const validateTimeRange = (openTime: string, closeTime: string) => {
    if (openTime >= closeTime) {
      return 'שעת הפתיחה חייבת להיות לפני שעת הסגירה';
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <RTLText style={styles.label}>{label}</RTLText>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={copyHoursToWeekdays}
            accessibilityLabel="העתק שעות לימי השבוע"
            accessibilityRole="button"
          >
            <Ionicons name="copy-outline" size={16} color={designTokens.colors.primary[600]} />
            <RTLText style={styles.quickActionText}>ימי השבוע</RTLText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={copyHoursToAll}
            accessibilityLabel="העתק שעות לכל הימים"
            accessibilityRole="button"
          >
            <Ionicons name="copy-outline" size={16} color={designTokens.colors.primary[600]} />
            <RTLText style={styles.quickActionText}>כל הימים</RTLText>
          </TouchableOpacity>
        </View>
      </View>


      {/* Days List */}
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = ensureDayHours(safeValue[day.key]);
          const isExpanded = expandedDay === day.key;
          const timeError = dayHours.isOpen ? validateTimeRange(dayHours.openTime, dayHours.closeTime) : null;

          return (
            <View key={day.key} style={styles.dayContainer}>
              <TouchableOpacity
                style={[
                  styles.dayHeader,
                  timeError && styles.dayHeaderError,
                ]}
                onPress={() => {
                  setExpandedDay(isExpanded ? null : day.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                accessibilityLabel={`${day.label} - ${formatTimeRange(dayHours)}`}
                accessibilityRole="button"
              >
                <View style={styles.dayInfo}>
                  <RTLText style={styles.dayLabel}>{day.label}</RTLText>
                  <RTLText style={[
                    styles.dayHours,
                    !dayHours.isOpen && styles.dayHoursClosed,
                    timeError && styles.dayHoursError,
                  ]}>
                    {formatTimeRange(dayHours)}
                  </RTLText>
                </View>
                
                <View style={styles.dayControls}>
                  <TouchableOpacity
                    style={[
                      styles.openToggle,
                      dayHours.isOpen && styles.openToggleActive,
                    ]}
                    onPress={() => toggleDayOpen(day.key)}
                    accessibilityLabel={dayHours.isOpen ? 'סגור יום' : 'פתח יום'}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: dayHours.isOpen }}
                  >
                    <RTLText style={[
                      styles.openToggleText,
                      dayHours.isOpen && styles.openToggleTextActive,
                    ]}>
                      {dayHours.isOpen ? 'פתוח' : 'סגור'}
                    </RTLText>
                  </TouchableOpacity>
                  
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={designTokens.colors.text.tertiary}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && dayHours.isOpen && (
                <View style={styles.timePickersContainer}>
                  <View style={styles.timePickerRow}>
                    <View style={styles.timePickerWrapper}>
                      <TimePicker
                        label="פתיחה"
                        value={dayHours.openTime}
                        onTimeChange={(time) => {
                          const safeDayHours = ensureDayHours(dayHours);
                          updateDayHours(day.key, {
                            ...safeDayHours,
                            openTime: time,
                          });
                        }}
                        maxTime={dayHours.closeTime}
                        error={timeError === 'שעת הפתיחה חייבת להיות לפני שעת הסגירה' ? timeError : undefined}
                      />
                    </View>
                    
                    <View style={styles.timePickerWrapper}>
                      <TimePicker
                        label="סגירה"
                        value={dayHours.closeTime}
                        onTimeChange={(time) => {
                          const safeDayHours = ensureDayHours(dayHours);
                          updateDayHours(day.key, {
                            ...safeDayHours,
                            closeTime: time,
                          });
                        }}
                        minTime={dayHours.openTime}
                        error={timeError === 'שעת הפתיחה חייבת להיות לפני שעת הסגירה' ? timeError : undefined}
                      />
                    </View>
                  </View>
                  
                  {timeError && (
                    <RTLText style={styles.timeErrorText}>{timeError}</RTLText>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.sm,
  },
  label: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    textAlign: 'left',
  },
  quickActions: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.primary[50],
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.primary[200],
  },
  quickActionText: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
  },
  daysContainer: {
    gap: designTokens.spacing.xs,
  },
  dayContainer: {
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designTokens.spacing.md,
  },
  dayHeaderError: {
    backgroundColor: designTokens.colors.error[50],
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: 2,
    textAlign: 'left',
  },
  dayHours: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    textAlign: 'left',
  },
  dayHoursClosed: {
    color: designTokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
  dayHoursError: {
    color: designTokens.colors.error[600],
  },
  dayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },
  openToggle: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: designTokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
  },
  openToggleActive: {
    backgroundColor: designTokens.colors.success[50],
    borderColor: designTokens.colors.success[300],
  },
  openToggleText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
  },
  openToggleTextActive: {
    color: designTokens.colors.success[600],
  },
  timePickersContainer: {
    padding: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
    backgroundColor: designTokens.colors.background.secondary,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },
  timePickerWrapper: {
    flex: 1,
  },
  timeErrorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'left',
    marginTop: designTokens.spacing.sm,
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'left',
    marginTop: designTokens.spacing.xs,
  },
});