import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTLText } from '../RTLText';
import { useTheme } from '../../contexts/ThemeContext';
import { uiTokens } from '../../constants/theme';
import { texts } from '../../constants/hebrewTexts';

interface UserProfileDropdownProps {
  username: string;
  onProfilePress: () => void;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  username,
  onProfilePress,
  onSettingsPress,
  onLogoutPress,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(0.95)).current;
  const profileButtonRef = useRef<TouchableOpacity>(null);

  const openDropdown = () => {
    console.log('🔥 Profile dropdown clicked!');
    
    // Measure button to position dropdown under it
    profileButtonRef.current?.measureInWindow((x, y, width, height) => {
      const buttonPos = { x, y, width, height };
      console.log('Button position:', buttonPos);
      console.log('📱 Screen dimensions:', { screenWidth, screenHeight });
      setButtonPosition(buttonPos);
      setIsVisible(true);
      console.log('✅ Setting dropdown visible');
      startAnimation();
    });
  };

  const startAnimation = () => {
    console.log('🎬 Starting dropdown animation');
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: uiTokens.transitions.quick,
        useNativeDriver: true,
      }),
      Animated.spring(animatedScale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🎭 Animation completed');
    });
  };

  const closeDropdown = () => {
    console.log('❌ Closing dropdown');
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: uiTokens.transitions.quick,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 0.95,
        duration: uiTokens.transitions.quick,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('✅ Dropdown closed, setting invisible');
      setIsVisible(false);
    });
  };

  const handleMenuItemPress = (action: () => void) => {
    console.log('🎯 Menu item pressed');
    closeDropdown();
    setTimeout(action, 100); // Small delay for better UX
  };

  // Position dropdown with fixed distance from right edge (Option 5)
  const dropdownWidth = 220;
  
  const dropdownStyle = {
    position: 'absolute' as const,
    top: buttonPosition.y + buttonPosition.height + 8, // 8px below the button
    right: 16, // Fixed 16px from right edge
    width: dropdownWidth,
    maxHeight: 300,
    zIndex: 1000,
  };
  
  console.log('Dropdown style:', dropdownStyle);
  console.log('Is dropdown visible?', isVisible);
  console.log('Button position state:', buttonPosition);

  return (
    <>
      {/* Profile Button */}
      <TouchableOpacity
        ref={profileButtonRef}
        style={[
          styles.profileButton,
          {
            backgroundColor: theme.colors.background.elevated,
            borderColor: theme.colors.border.light,
            shadowColor: theme.colors.text.primary,
            ...theme.shadows.sm,
          },
        ]}
        onPress={openDropdown}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Profile dropdown"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.profileContent}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primary[500] },
            ]}
          >
            <RTLText style={[styles.avatarText, { color: theme.colors.text.inverse }]}>
              {username.charAt(0).toUpperCase()}
            </RTLText>
          </View>
          
          {/* Dropdown Arrow */}
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.text.secondary}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={closeDropdown}>
          {/* Dropdown Menu */}
          <Animated.View
            style={[
              styles.dropdown,
              dropdownStyle,
              {
                backgroundColor: theme.colors.background.elevated,
                borderColor: theme.colors.border.light,
                shadowColor: theme.colors.text.primary,
                ...theme.shadows.lg,
              },
              {
                opacity: animatedOpacity,
                transform: [{ scale: animatedScale }],
              },
            ]}
          >
            {/* Personal Profile */}
            <TouchableOpacity
              style={[
                styles.menuItem, 
                styles.menuItemWithBorder,
                { borderBottomColor: theme.colors.border.light }
              ]}
              onPress={() => handleMenuItemPress(onProfilePress)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={texts.userProfile.title}
              accessibilityHint="עבור לעמוד הפרופיל האישי"
            >
              <RTLText style={[styles.menuText, { color: theme.colors.text.primary }]}>
                {texts.userProfile.title}
              </RTLText>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.text.secondary}
                style={styles.menuIcon}
              />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.menuItemWithBorder, 
                { borderBottomColor: theme.colors.border.light }
              ]}
              onPress={() => handleMenuItemPress(onSettingsPress)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={texts.settings.title}
              accessibilityHint="עבור לעמוד ההגדרות"
            >
              <RTLText style={[styles.menuText, { color: theme.colors.text.primary }]}>
                {texts.settings.title}
              </RTLText>
              <Ionicons
                name="settings-outline"
                size={20}
                color={theme.colors.text.secondary}
                style={styles.menuIcon}
              />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(onLogoutPress)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={texts.auth.logout}
              accessibilityHint="התנתק מהחשבון"
            >
              <RTLText style={[styles.menuText, { color: theme.colors.error[500] }]}>
                {texts.auth.logout}
              </RTLText>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.error[500]}
                style={styles.menuIcon}
              />
            </TouchableOpacity>
            </Animated.View>
          </Pressable>
        </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  profileContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    borderRadius: uiTokens.dropdown.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row-reverse', // RTL: text first, then icon
    alignItems: 'center',
    justifyContent: 'flex-start', // According to RTL_RULES.md: flex-start = visual RIGHT
    paddingHorizontal: 16,
    paddingVertical: 14, // Increased for better touch target
    minHeight: uiTokens.dropdown.itemHeight,
  },
  menuItemWithBorder: {
    borderBottomWidth: 1, // Add divider lines
  },
  menuIcon: {
    marginLeft: 12, // Space between text and icon
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left', // According to RTL_RULES.md: textAlign 'left' = visual RIGHT in RTL
  },
});