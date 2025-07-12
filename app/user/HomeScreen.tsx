import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { WoltButton } from '../../components/common/WoltButton';
import { RTLText } from '../../components/RTLText';
import { SearchInput } from '../../components/common/SearchInput';
import { FieldCard } from '../../components/common/FieldCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { texts } from '../../constants/hebrewTexts';
import { designTokens } from '../../constants/theme';
import { searchFields } from '../../services/mockApi';
import { Field } from '../../utils/types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);

  // Load fields on component mount
  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const response = await searchFields();
      if (response.success && response.data) {
        setFields(response.data);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldPress = (fieldId: string) => {
    console.log('Field pressed:', fieldId);
    // TODO: Navigate to field details screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RTLText style={styles.greeting}>
              {texts.home.goodMorning}, משתמש!
            </RTLText>
          </View>

          {/* Search */}
          <View style={styles.section}>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="חפש מגרשים בקרבתך..."
              onClear={() => setSearchQuery('')}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>{texts.home.quickActions}</RTLText>
            <View style={styles.actionsGrid}>
              <WoltButton
                variant="primary"
                onPress={() => console.log('Book field')}
                style={styles.actionButton}
              >
                {texts.home.bookField}
              </WoltButton>
              
              <WoltButton
                variant="outline"
                onPress={() => console.log('My bookings')}
                style={styles.actionButton}
              >
                {texts.home.myBookings}
              </WoltButton>
            </View>
          </View>

          {/* Nearby Fields */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>מגרשים קרובים</RTLText>
            
            {isLoading ? (
              <LoadingSpinner text="טוען מגרשים..." />
            ) : (
              <>
                {fields.map(field => (
                  <FieldCard
                    key={field.id}
                    id={field.id}
                    name={field.name}
                    location={field.address}
                    price={field.pricePerHour}
                    currency="₪"
                    rating={field.rating}
                    distance="2.5 ק״מ" // TODO: Calculate real distance
                    availableSlots={3} // TODO: Calculate from availability
                    imageUrl={field.imageUrl}
                    onPress={handleFieldPress}
                  />
                ))}
              </>
            )}
          </View>

          {/* Recent Bookings */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>{texts.home.recentBookings}</RTLText>
            <EmptyState
              icon="📅"
              title="אין הזמנות אחרונות"
              subtitle="כשתזמין מגרש, ההזמנות שלך יופיעו כאן"
              actionText="הזמן מגרש"
              onAction={() => console.log('Book field from empty state')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: designTokens.spacing.xl,
  },
  header: {
    marginBottom: designTokens.spacing.xl,
  },
  greeting: {
    fontSize: designTokens.typography.sizes.xxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  section: {
    marginBottom: designTokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },
  actionsGrid: {
    gap: designTokens.spacing.md,
  },
  actionButton: {
    marginBottom: designTokens.spacing.sm,
  },
  placeholder: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default HomeScreen;