import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  ButtonText,
  Menu,
  MenuItem,
  MenuItemLabel,
  Icon,
  Avatar,
  AvatarFallbackText,
  HStack,
  VStack,
  Text,
  Pressable,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { texts } from '../../constants/hebrewTexts';
import { I18nManager } from 'react-native';

interface UserProfileDropdownGSProps {
  username: string;
  onProfilePress: () => void;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
}

export const UserProfileDropdownGS: React.FC<UserProfileDropdownGSProps> = ({
  username,
  onProfilePress,
  onSettingsPress,
  onLogoutPress,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuItemPress = (action: () => void) => {
    setIsOpen(false);
    setTimeout(action, 100);
  };

  return (
    <Menu
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      placement="bottom end"
      offset={8}
      trigger={({ ...triggerProps }) => (
        <Button
          {...triggerProps}
          size="sm"
          variant="outline"
          borderRadius="$full"
          px="$3"
          py="$2"
          borderColor="$borderLight200"
          bg="$backgroundLight0"
          $dark-bg="$backgroundDark800"
          $dark-borderColor="$borderDark700"
        >
          <HStack space="sm" alignItems="center">
            <Avatar size="xs" bg="$primary500">
              <AvatarFallbackText color="$white">
                {username.charAt(0).toUpperCase()}
              </AvatarFallbackText>
            </Avatar>
            <Ionicons name="chevron-down" size={12} color="#6B7280" />
          </HStack>
        </Button>
      )}
    >
      <Box
        bg="$backgroundLight0"
        $dark-bg="$backgroundDark800"
        borderRadius="$lg"
        borderWidth="$1"
        borderColor="$borderLight200"
        $dark-borderColor="$borderDark700"
        shadowColor="$shadowLight300"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        elevation={5}
        minWidth={220}
        overflow="hidden"
      >
        {/* Profile Option */}
        <MenuItem 
          key="profile"
          onPress={() => handleMenuItemPress(onProfilePress)}
          px="$4"
          py="$3"
          borderBottomWidth="$1"
          borderBottomColor="$borderLight100"
          $dark-borderBottomColor="$borderDark800"
        >
          <HStack space="md" alignItems="center">
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text
              fontSize="$md"
              fontWeight="$medium"
              color="$textLight900"
              $dark-color="$textDark50"
              textAlign="left"
            >
              {texts.userProfile.title}
            </Text>
          </HStack>
        </MenuItem>

        {/* Settings Option */}
        <MenuItem 
          key="settings"
          onPress={() => handleMenuItemPress(onSettingsPress)}
          px="$4"
          py="$3"
          borderBottomWidth="$1"
          borderBottomColor="$borderLight100"
          $dark-borderBottomColor="$borderDark800"
        >
          <HStack space="md" alignItems="center">
            <Ionicons name="settings" size={16} color="#6B7280" />
            <Text
              fontSize="$md"
              fontWeight="$medium"
              color="$textLight900"
              $dark-color="$textDark50"
              textAlign="left"
            >
              {texts.settings.title}
            </Text>
          </HStack>
        </MenuItem>

        {/* Logout Option */}
        <MenuItem 
          key="logout"
          onPress={() => handleMenuItemPress(onLogoutPress)}
          px="$4"
          py="$3"
        >
          <HStack space="md" alignItems="center">
            <Ionicons name="log-out" size={16} color="#EF4444" />
            <Text
              fontSize="$md"
              fontWeight="$medium"
              color="$error500"
              textAlign="left"
            >
              {texts.auth.logout}
            </Text>
          </HStack>
        </MenuItem>
      </Box>
    </Menu>
  );
};