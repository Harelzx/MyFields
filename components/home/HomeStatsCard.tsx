import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
// Icons will be passed as render functions from parent components
import { I18nManager } from 'react-native';
import { RTLText } from '../RTLText';

interface HomeStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: () => React.ReactNode;
  badgeText?: string;
  badgeColor?: 'success' | 'warning' | 'error' | 'info';
  onPress?: () => void;
}

export const HomeStatsCard: React.FC<HomeStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeColor = 'info',
  onPress,
}) => {
  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'success':
        return { bg: '$success100', borderColor: '$success200' };
      case 'warning':
        return { bg: '$warning100', borderColor: '$warning200' };
      case 'error':
        return { bg: '$error100', borderColor: '$error200' };
      default:
        return { bg: '$primary100', borderColor: '$primary200' };
    }
  };

  const getBadgeTextColor = (color: string) => {
    switch (color) {
      case 'success':
        return '$success700';
      case 'warning':
        return '$warning700';
      case 'error':
        return '$error700';
      default:
        return '$primary700';
    }
  };

  return (
    <Box
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark800"
      borderRadius="$xl"
      borderWidth="$1"
      borderColor="$borderLight200"
      $dark-borderColor="$borderDark700"
      p="$4"
      shadowColor="$shadowLight300"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={3.84}
      elevation={3}
      onPress={onPress}
      pressable={!!onPress}
      width={200}
      minHeight={120}
    >
      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="sm" alignItems="center">
            <Box
              bg="$primary100"
              $dark-bg="$primary800"
              borderRadius="$full"
              p="$3"
              width={48}
              height={48}
              alignItems="center"
              justifyContent="center"
            >
              {icon()}
            </Box>
            <Text
              fontSize="$sm"
              fontWeight="$medium"
              color="$textLight600"
              $dark-color="$textDark400"
              textAlign="left"
            >
              {title}
            </Text>
          </HStack>
          
          {badgeText && (
            <Badge
              {...getBadgeVariant(badgeColor)}
              borderWidth="$1"
              borderRadius="$full"
              px="$2"
              py="$1"
            >
              <BadgeText
                fontSize="$xs"
                fontWeight="$semibold"
                color={getBadgeTextColor(badgeColor)}
              >
                {badgeText}
              </BadgeText>
            </Badge>
          )}
        </HStack>

        <VStack space="xs" alignItems="flex-start">
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            color="$textLight900"
            $dark-color="$textDark50"
            textAlign="left"
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              fontSize="$xs"
              color="$textLight500"
              $dark-color="$textDark400"
              textAlign="left"
            >
              {subtitle}
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};