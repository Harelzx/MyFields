import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTLText } from '@components/design-system/RTLText';
import { useTheme } from '@contexts/ThemeContext';
import { uiTokens } from '@constants/theme';

interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  imageUrl?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  additionalInfo?: string;
}

interface SectionCardProps {
  title: string;
  items: SectionItem[];
  onViewAllPress: () => void;
  onItemPress: (item: SectionItem) => void;
  emptyStateText?: string;
  viewAllText?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  items,
  onViewAllPress,
  onItemPress,
  emptyStateText = 'אין פריטים זמינים',
  viewAllText = 'הצג הכל',
}) => {
  const { theme } = useTheme();

  const renderItem = (item: SectionItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.item,
        {
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border.light,
          shadowColor: theme.colors.text.primary,
          ...theme.shadows.sm,
        },
      ]}
      onPress={() => onItemPress(item)}
      activeOpacity={0.8}
    >
      {/* Image or Icon */}
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.itemIconContainer,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Ionicons
              name={item.icon || 'location-outline'}
              size={24}
              color={theme.colors.primary[600]}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <RTLText
          style={[styles.itemTitle, { color: theme.colors.text.primary }]}
          numberOfLines={1}
        >
          {item.title}
        </RTLText>
        
        <RTLText
          style={[styles.itemSubtitle, { color: theme.colors.text.tertiary }]}
          numberOfLines={1}
        >
          {item.subtitle}
        </RTLText>

        {/* Price or Additional Info */}
        {(item.price || item.additionalInfo) && (
          <View style={styles.itemFooter}>
            {item.price && (
              <RTLText
                style={[styles.itemPrice, { color: theme.colors.primary[600] }]}
              >
                {item.price}
              </RTLText>
            )}
            
            {item.additionalInfo && (
              <RTLText
                style={[styles.itemInfo, { color: theme.colors.text.secondary }]}
                numberOfLines={1}
              >
                {item.additionalInfo}
              </RTLText>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.subtle,
          shadowColor: theme.colors.text.primary,
          ...theme.shadows.sm,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <RTLText style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </RTLText>
        
        <TouchableOpacity
          style={[styles.viewAllButton, { backgroundColor: theme.colors.primary[50] }]}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <RTLText
            style={[styles.viewAllText, { color: theme.colors.primary[600] }]}
          >
            {viewAllText}
          </RTLText>
          <Ionicons
            name="chevron-back"
            size={16}
            color={theme.colors.primary[600]}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {items.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsContainer}
            style={styles.itemsScroll}
          >
            {items.slice(0, 5).map(renderItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={32}
              color={theme.colors.text.disabled}
              style={styles.emptyIcon}
            />
            <RTLText
              style={[styles.emptyText, { color: theme.colors.text.tertiary }]}
            >
              {emptyStateText}
            </RTLText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: uiTokens.sectionCard.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  viewAllButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevronIcon: {
    marginRight: 2,
  },
  content: {
    minHeight: uiTokens.sectionCard.height - 60, // Adjust for header
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: uiTokens.sectionCard.itemSpacing,
  },
  itemsScroll: {
    flexGrow: 0,
  },
  item: {
    width: uiTokens.sectionCard.itemWidth,
    height: uiTokens.sectionCard.itemHeight,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemImageContainer: {
    height: 60,
    width: '100%',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemInfo: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});