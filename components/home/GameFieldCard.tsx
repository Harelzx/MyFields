import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  BadgeText,
  Image,
  Button,
  ButtonText,
  Avatar,
  AvatarGroup,
  AvatarFallbackText,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { I18nManager } from 'react-native';
import { RTLText } from '../RTLText';

interface GameFieldCardProps {
  type: 'field' | 'game';
  title: string;
  subtitle: string;
  location?: string;
  time?: string;
  price?: string;
  rating?: number;
  imageUrl?: string;
  status?: 'available' | 'limited' | 'full';
  currentPlayers?: number;
  maxPlayers?: number;
  players?: string[]; // Array of player names for avatars
  onPress: () => void;
  onJoin?: () => void;
}

export const GameFieldCard: React.FC<GameFieldCardProps> = ({
  type,
  title,
  subtitle,
  location,
  time,
  price,
  rating,
  imageUrl,
  status = 'available',
  currentPlayers,
  maxPlayers,
  players = [],
  onPress,
  onJoin,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return { bg: '$success100', color: '$success700', text: 'זמין' };
      case 'limited':
        return { bg: '$warning100', color: '$warning700', text: 'מוגבל' };
      case 'full':
        return { bg: '$error100', color: '$error700', text: 'תפוס' };
      default:
        return { bg: '$primary100', color: '$primary700', text: 'זמין' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Box
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark800"
      borderRadius="$xl"
      borderWidth="$1"
      borderColor="$borderLight200"
      $dark-borderColor="$borderDark700"
      overflow="hidden"
      shadowColor="$shadowLight300"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.15}
      shadowRadius={3.84}
      elevation={3}
      width={280}
      onPress={onPress}
      pressable
    >
      {/* Image Section */}
      <Box position="relative" height={140}>
        <Image
          source={{ uri: imageUrl }}
          alt={title}
          width="100%"
          height="100%"
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <Badge
          position="absolute"
          top="$3"
          right="$3"
          bg={statusBadge.bg}
          borderWidth="$1"
          borderColor={statusBadge.color}
          borderRadius="$full"
          px="$2"
          py="$1"
        >
          <BadgeText
            fontSize="$xs"
            fontWeight="$semibold"
            color={statusBadge.color}
          >
            {statusBadge.text}
          </BadgeText>
        </Badge>

        {/* Rating for fields */}
        {rating && type === 'field' && (
          <HStack
            position="absolute"
            bottom="$3"
            left="$3"
            space="xs"
            alignItems="center"
            bg="rgba(0,0,0,0.7)"
            borderRadius="$full"
            px="$2"
            py="$1"
          >
            <Ionicons name="star" size={12} color="#FFA500" />
            <Text fontSize="$xs" color="$white" fontWeight="$medium">
              {rating}
            </Text>
          </HStack>
        )}
      </Box>

      {/* Content Section */}
      <VStack p="$4" space="md">
        <VStack space="xs" alignItems="flex-start">
          <Text
            fontSize="$lg"
            fontWeight="$semibold"
            color="$textLight900"
            $dark-color="$textDark50"
            numberOfLines={1}
            textAlign="left"
          >
            {title}
          </Text>
          <Text
            fontSize="$sm"
            color="$textLight600"
            $dark-color="$textDark400"
            numberOfLines={1}
            textAlign="left"
          >
            {subtitle}
          </Text>
        </VStack>

        {/* Info Row */}
        <VStack space="sm">
          {location && (
            <HStack space="xs" alignItems="center">
              <Ionicons name="location" size={12} color="#6B7280" />
              <Text fontSize="$xs" color="$textLight500" $dark-color="$textDark400" textAlign="left">
                {location}
              </Text>
            </HStack>
          )}

          {time && (
            <HStack space="xs" alignItems="center">
              <Ionicons name="time" size={12} color="#6B7280" />
              <Text fontSize="$xs" color="$textLight500" $dark-color="$textDark400" textAlign="left">
                {time}
              </Text>
            </HStack>
          )}

          {/* Players for games */}
          {type === 'game' && currentPlayers && maxPlayers && (
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="xs" alignItems="center">
                <Ionicons name="people" size={12} color="#6B7280" />
                <Text fontSize="$xs" color="$textLight500" $dark-color="$textDark400" textAlign="left">
                  {currentPlayers}/{maxPlayers}
                </Text>
              </HStack>
              
              {players.length > 0 && (
                <AvatarGroup size="xs" max={3}>
                  {players.slice(0, 3).map((player, index) => (
                    <Avatar key={index} size="xs" bg="$primary500">
                      <AvatarFallbackText color="$white">
                        {player.charAt(0).toUpperCase()}
                      </AvatarFallbackText>
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}
            </HStack>
          )}

          {/* Price for fields */}
          {price && type === 'field' && (
            <HStack justifyContent="flex-start" alignItems="center">
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                color="$primary600"
                $dark-color="$primary400"
                textAlign="left"
              >
                {price}
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Action Button */}
        {onJoin && type === 'game' && (
          <Button
            size="sm"
            variant="outline"
            borderColor="$primary500"
            onPress={onJoin}
            isDisabled={status === 'full'}
          >
            <ButtonText color="$primary600" fontSize="$sm">
              {status === 'full' ? 'מלא' : 'הצטרף'}
            </ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  );
};