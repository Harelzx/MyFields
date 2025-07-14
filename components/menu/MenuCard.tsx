import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  BadgeText,
  Button,
} from '@gluestack-ui/themed';
import { I18nManager } from 'react-native';
import { RTLText } from '../RTLText';

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: any;
  iconColor?: string;
  badgeText?: string;
  badgeColor?: 'success' | 'warning' | 'error' | 'info';
  onPress: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = '$primary600',
  badgeText,
  badgeColor = 'info',
  onPress,
}) => {
  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'success':
        return { bg: '$success100', borderColor: '$success200', textColor: '$success700' };
      case 'warning':
        return { bg: '$warning100', borderColor: '$warning200', textColor: '$warning700' };
      case 'error':
        return { bg: '$error100', borderColor: '$error200', textColor: '$error700' };
      default:
        return { bg: '$primary100', borderColor: '$primary200', textColor: '$primary700' };
    }
  };

  const badgeVariant = getBadgeVariant(badgeColor);

  return (
    <Button
      variant="outline"
      borderColor="$borderLight200"
      $dark-borderColor="$borderDark700"
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark800"
      borderRadius="$xl"
      height="auto"
      p="$0"
      onPress={onPress}
      shadowColor="$shadowLight300"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.1}
      shadowRadius={2}
      elevation={2}
      $pressed={{
        bg: '$backgroundLight100',
        $dark-bg: '$backgroundDark700',
        scale: 0.98,
      }}
    >
      <Box p="$4" width="100%">
        <VStack space="md" alignItems="center">
          {/* Icon Section */}
          <Box position="relative">
            <Box
              bg="$primary100"
              $dark-bg="$primary800"
              borderRadius="$full"
              p="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={icon}
                size="xl"
                color={iconColor}
                $dark-color="$primary300"
              />
            </Box>
            
            {/* Badge */}
            {badgeText && (
              <Badge
                position="absolute"
                top="$-1"
                right="$-1"
                bg={badgeVariant.bg}
                borderWidth="$1"
                borderColor={badgeVariant.borderColor}
                borderRadius="$full"
                minWidth="$6"
                height="$6"
                alignItems="center"
                justifyContent="center"
              >
                <BadgeText
                  fontSize="$2xs"
                  fontWeight="$bold"
                  color={badgeVariant.textColor}
                >
                  {badgeText}
                </BadgeText>
              </Badge>
            )}
          </Box>

          {/* Text Section */}
          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color="$textLight900"
              $dark-color="$textDark50"
              textAlign="center"
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text
              fontSize="$sm"
              color="$textLight600"
              $dark-color="$textDark400"
              textAlign="center"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Button>
  );
};