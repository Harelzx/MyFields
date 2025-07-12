import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { WoltButton } from '../../components/common/WoltButton';
import { RTLText } from '../../components/RTLText';
import { LoadingSpinner, EmptyState, BookingCard } from '../../components/common';
import { texts } from '../../constants/hebrewTexts';
import { designTokens } from '../../constants/theme';
import { fetchUserBookings } from '../../services/mockApi';
import { Booking } from '../../utils/types';

const BookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUserBookings('user_1');
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingPress = (booking: Booking) => {
    console.log('Booking pressed:', booking.id);
    // TODO: Navigate to booking details
  };

  const handleCancelBooking = async (bookingId: string) => {
    console.log('Cancel booking:', bookingId);
    // TODO: Implement cancel booking
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'active');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RTLText style={styles.title}>{texts.tabs.bookings}</RTLText>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <WoltButton
              variant="primary"
              fullWidth
              onPress={() => console.log('Book new field')}
              style={styles.actionButton}
            >
              {texts.home.bookField}
            </WoltButton>
          </View>

          {isLoading ? (
            <LoadingSpinner text="טוען הזמנות..." />
          ) : (
            <>
              {/* Active Bookings */}
              <View style={styles.section}>
                <RTLText style={styles.sectionTitle}>הזמנות פעילות</RTLText>
                {activeBookings.length > 0 ? (
                  activeBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      {...booking}
                      onPress={handleBookingPress}
                      onCancel={handleCancelBooking}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="📅"
                    title="אין הזמנות פעילות"
                    subtitle="כשתזמין מגרש, ההזמנות יופיעו כאן"
                  />
                )}
              </View>

              {/* Past Bookings */}
              <View style={styles.section}>
                <RTLText style={styles.sectionTitle}>הזמנות קודמות</RTLText>
                {pastBookings.length > 0 ? (
                  pastBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      {...booking}
                      onPress={handleBookingPress}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="📋"
                    title="אין הזמנות קודמות"
                    subtitle="ההיסטוריה שלך תופיע כאן"
                  />
                )}
              </View>
            </>
          )}
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
  title: {
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

export default BookingsScreen;