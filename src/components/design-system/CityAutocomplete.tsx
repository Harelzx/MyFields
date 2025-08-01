import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform
} from 'react-native';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CityAutocompleteProps {
  value: string;
  onChangeText: (value: string) => void;
  onSelectCity: (city: string) => void;
  cities: string[];
  placeholder?: string;
  error?: string;
  maxSuggestions?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const CityAutocomplete = React.forwardRef<TextInput, CityAutocompleteProps>(({
  value,
  onChangeText,
  onSelectCity,
  cities,
  placeholder = 'הקלד שם העיר',
  error,
  maxSuggestions = 6,
  disabled = false,
  autoFocus = false
}, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [suppressBlur, setSuppressBlur] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Expose TextInput methods via ref
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      setSuppressBlur(true);
      setTimeout(() => {
        inputRef.current?.focus();
        // Double focus to ensure it sticks
        setTimeout(() => {
          if (!inputRef.current?.isFocused()) {
            inputRef.current?.focus();
          }
          setSuppressBlur(false);
        }, 100);
      }, 50);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    clear: () => {
      handleClear();
    },
    isFocused: () => {
      return inputRef.current?.isFocused() || false;
    }
  }), []);

  // Filter cities based on input text
  const filterCities = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredCities([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = cities
      .filter(city => 
        city.toLowerCase().includes(searchText.toLowerCase()) ||
        city.includes(searchText) // For Hebrew text matching
      )
      .slice(0, maxSuggestions);

    setFilteredCities(filtered);
    setShowSuggestions(filtered.length > 0 && inputFocused);
  };

  // Handle text input changes
  const handleTextChange = (text: string) => {
    onChangeText(text);
    filterCities(text);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSuppressBlur(true);
    onSelectCity(city);
    onChangeText(city); // Update the text input value as well
    setShowSuggestions(false);
    setFilteredCities([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Keep focus on input instead of dismissing keyboard
    setTimeout(() => {
      inputRef.current?.focus();
      setSuppressBlur(false);
    }, 50);
  };

  // Handle input focus
  const handleFocus = () => {
    setInputFocused(true);
    setSuppressBlur(true); // Prevent immediate blur
    setTimeout(() => {
      setSuppressBlur(false);
    }, 500); // Give more time before allowing blur
    if (value.trim() && filteredCities.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    if (suppressBlur) {
      return;
    }
    setInputFocused(false);
    // Only hide suggestions if no selection is in progress
    // Use a longer delay to prevent premature dismissal
    setTimeout(() => {
      if (!suppressBlur) {
        setShowSuggestions(false);
      }
    }, 300);
  };

  // Handle clear button press
  const handleClear = () => {
    onChangeText('');
    setFilteredCities([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Update filtered cities when cities prop changes
  useEffect(() => {
    if (value.trim()) {
      filterCities(value);
    }
  }, [cities]);


  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        value === item && styles.suggestionItemSelected
      ]}
      onPress={() => handleCitySelect(item)}
      activeOpacity={0.7}
      accessibilityLabel={`בחר ${item}`}
      accessibilityRole="button"
      delayPressIn={0}
      delayPressOut={0}
    >
      <RTLText style={[
        styles.suggestionText,
        value === item && styles.suggestionTextSelected
      ]}>
        {item}
      </RTLText>
      {value === item && (
        <Ionicons 
          name="checkmark" 
          size={18} 
          color={designTokens.colors.primary[600]} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        {/* Input Container */}
        <View style={[
          styles.inputContainer,
          inputFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled
        ]}>
          <Ionicons 
            name="location-outline" 
            size={20} 
            color={inputFocused ? designTokens.colors.primary[600] : '#64748B'} 
            style={styles.inputIcon} 
          />
          
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              disabled && styles.textInputDisabled
            ]}
            value={value}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            editable={!disabled}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="done"
            autoFocus={autoFocus}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (filteredCities.length === 1) {
                handleCitySelect(filteredCities[0]);
              } else {
                Keyboard.dismiss();
              }
            }}
            accessibilityLabel="שדה הקלדת עיר"
            accessibilityHint="הקלד שם העיר לחיפוש"
          />

          {value.length > 0 && !disabled && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              accessibilityLabel="נקה טקסט"
              accessibilityRole="button"
            >
              <Ionicons 
                name="close-circle" 
                size={18} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <RTLText style={styles.errorText}>{error}</RTLText>
        )}
        

        {/* Suggestions List */}
        {showSuggestions && filteredCities.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsList}>
              {filteredCities.map((item, index) => (
                <React.Fragment key={`city-${index}-${item}`}>
                  {renderSuggestionItem({ item })}
                  {index < filteredCities.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* No Results Message */}
        {showSuggestions && value.trim().length > 0 && filteredCities.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons 
              name="search-outline" 
              size={24} 
              color="#94A3B8" 
              style={styles.noResultsIcon}
            />
            <RTLText style={styles.noResultsText}>
              לא נמצאו ערים התואמות לחיפוש
            </RTLText>
            <RTLText style={styles.noResultsSubtext}>
              נסה להקליד שם אחר
            </RTLText>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
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
  inputContainerFocused: {
    borderColor: designTokens.colors.primary[600],
    borderWidth: 2,
    ...designTokens.shadows.sm,
  },
  inputContainerError: {
    borderColor: designTokens.colors.error[500],
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'right',
    paddingVertical: 12,
    marginLeft: 12,
  },
  textInputDisabled: {
    color: '#94A3B8',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: designTokens.colors.error[600],
    fontSize: designTokens.typography.sizes.sm,
    textAlign: 'center',
    marginTop: designTokens.spacing.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    ...designTokens.shadows.md,
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  suggestionItemSelected: {
    backgroundColor: designTokens.colors.primary[50],
  },
  suggestionText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  suggestionTextSelected: {
    color: designTokens.colors.primary[600],
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  noResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    padding: 24,
    alignItems: 'center',
    zIndex: 1000,
    ...designTokens.shadows.md,
  },
  noResultsIcon: {
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

CityAutocomplete.displayName = 'CityAutocomplete';

export default CityAutocomplete;