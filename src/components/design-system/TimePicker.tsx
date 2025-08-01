import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { RTLText } from './RTLText';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onTimeChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  is24Hour?: boolean; // Default true for Israel
  minTime?: string;
  maxTime?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onTimeChange,
  placeholder = "בחר שעה",
  disabled = false,
  error,
  label,
  is24Hour = true,
  minTime,
  maxTime,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? parseInt(value.split(':')[0]) : 9
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? parseInt(value.split(':')[1]) : 0
  );

  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  const showPicker = () => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVisible(true);
    modalScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    modalOpacity.value = withTiming(1, { duration: 200 });
  };

  const hidePicker = () => {
    modalScale.value = withTiming(0.9, { duration: 150 });
    modalOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  const confirmTime = () => {
    const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeChange(formattedTime);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hidePicker();
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return null;
    
    const [hour, minute] = time.split(':').map(Number);
    
    if (is24Hour) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      // Convert to 12-hour format for display
      const period = hour >= 12 ? 'אחה"צ' : 'בבוקר';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
  };

  const validateTime = (hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (minTime && timeString < minTime) return false;
    if (maxTime && timeString > maxTime) return false;
    
    return true;
  };

  const renderTimeWheel = (
    values: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    formatter?: (value: number) => string
  ) => {
    return (
      <View style={styles.wheelContainer}>
        {values.map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.wheelItem,
              selectedValue === value && styles.wheelItemSelected,
              !validateTime(
                values === Array.from({ length: 24 }, (_, i) => i) ? value : selectedHour,
                values === Array.from({ length: 60 }, (_, i) => i) ? value : selectedMinute
              ) && styles.wheelItemDisabled
            ]}
            onPress={() => {
              if (validateTime(
                values === Array.from({ length: 24 }, (_, i) => i) ? value : selectedHour,
                values === Array.from({ length: 60 }, (_, i) => i) ? value : selectedMinute
              )) {
                onValueChange(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            disabled={!validateTime(
              values === Array.from({ length: 24 }, (_, i) => i) ? value : selectedHour,
              values === Array.from({ length: 60 }, (_, i) => i) ? value : selectedMinute
            )}
          >
            <RTLText style={[
              styles.wheelItemText,
              selectedValue === value && styles.wheelItemTextSelected,
              !validateTime(
                values === Array.from({ length: 24 }, (_, i) => i) ? value : selectedHour,
                values === Array.from({ length: 60 }, (_, i) => i) ? value : selectedMinute
              ) && styles.wheelItemTextDisabled
            ]}>
              {formatter ? formatter(value) : value.toString().padStart(2, '0')}
            </RTLText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

  return (
    <View style={styles.container}>
      {label && (
        <RTLText style={styles.inputLabel}>{label}</RTLText>
      )}
      
      <View style={styles.inputContainer}>
        <Ionicons 
          name="time-outline" 
          size={20} 
          color={disabled ? designTokens.colors.text.disabled : "#64748B"} 
          style={styles.inputIcon} 
        />
        <TouchableOpacity
          style={[
            styles.textInput,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          onPress={showPicker}
          disabled={disabled}
          accessibilityLabel={label || placeholder}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          <RTLText style={[
            styles.inputText,
            !value && styles.inputPlaceholder,
            disabled && styles.inputTextDisabled,
          ]}>
            {value ? formatDisplayTime(value) : placeholder}
          </RTLText>
        </TouchableOpacity>
      </View>

      {error && (
        <RTLText style={styles.errorText}>{error}</RTLText>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={hidePicker}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hidePicker}
          />
          
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[styles.modalContent, modalAnimatedStyle]}
          >
            <View style={styles.modalHeader}>
              <RTLText style={styles.modalTitle}>בחר שעה</RTLText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hidePicker}
                accessibilityLabel="סגור"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={designTokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.wheelSection}>
                <RTLText style={styles.wheelLabel}>שעה</RTLText>
                <View style={styles.wheelScrollContainer}>
                  {renderTimeWheel(hours, selectedHour, setSelectedHour)}
                </View>
              </View>

              <View style={styles.timeSeparator}>
                <RTLText style={styles.timeSeparatorText}>:</RTLText>
              </View>

              <View style={styles.wheelSection}>
                <RTLText style={styles.wheelLabel}>דקה</RTLText>
                <View style={styles.wheelScrollContainer}>
                  {renderTimeWheel(minutes, selectedMinute, setSelectedMinute)}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={hidePicker}
                accessibilityLabel="ביטול"
                accessibilityRole="button"
              >
                <RTLText style={styles.cancelButtonText}>ביטול</RTLText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmTime}
                accessibilityLabel="אישור"
                accessibilityRole="button"
              >
                <RTLText style={styles.confirmButtonText}>אישור</RTLText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.xs,
  },
  inputLabel: {
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
    justifyContent: 'center',
  },
  inputError: {
    borderColor: designTokens.colors.error[500],
  },
  inputDisabled: {
    backgroundColor: designTokens.colors.background.secondary,
    opacity: 0.6,
  },
  inputText: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
  },
  inputPlaceholder: {
    color: '#94A3B8',
  },
  inputTextDisabled: {
    color: designTokens.colors.text.disabled,
  },
  inputIcon: {
    marginRight: 12,
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.modal,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: designTokens.colors.background.surface,
    borderRadius: designTokens.borderRadius.xl,
    width: Math.min(screenWidth - 32, 320),
    maxHeight: '80%',
    ...designTokens.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.border.light,
  },
  modalTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  closeButton: {
    padding: designTokens.spacing.xs,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designTokens.spacing.lg,
  },
  wheelSection: {
    flex: 1,
    alignItems: 'center',
  },
  wheelLabel: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
  },
  wheelScrollContainer: {
    maxHeight: 200,
  },
  wheelContainer: {
    alignItems: 'center',
  },
  wheelItem: {
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    marginVertical: 2,
    borderRadius: designTokens.borderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  wheelItemSelected: {
    backgroundColor: designTokens.colors.primary[50],
    borderWidth: 1,
    borderColor: designTokens.colors.primary[600],
  },
  wheelItemDisabled: {
    opacity: 0.3,
  },
  wheelItemText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    fontWeight: designTokens.typography.weights.medium,
  },
  wheelItemTextSelected: {
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.bold,
  },
  wheelItemTextDisabled: {
    color: designTokens.colors.text.disabled,
  },
  timeSeparator: {
    marginHorizontal: designTokens.spacing.md,
    alignItems: 'center',
  },
  timeSeparatorText: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: designTokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
    gap: designTokens.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.background.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary[600],
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.inverse,
  },
});