import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { NotificationCarousel } from './NotificationCarousel';
import { NotificationData } from '../../types/notifications';

// Mock notification data for demo
const createMockNotifications = (): NotificationData[] => [
  {
    id: '1',
    type: 'booking_confirmed',
    title: 'הזמנה אושרה',
    message: 'ההזמנה שלך למגרש כדורגל בפארק הירקון אושרה בהצלחה. המגרש שמור עבורך ביום רביעי ב-18:00.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    priority: 'high',
    actionRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
    relatedBookingId: 'booking_123',
  },
  {
    id: '2',
    type: 'booking_reminder', 
    title: 'תזכורת משחק',
    message: 'המשחק שלך מתחיל בעוד שעה במגרש הטניס בגני יהושע. הגע 15 דקות לפני המועד.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    priority: 'high',
    actionRequired: true,
    relatedBookingId: 'booking_124',
  },
  {
    id: '3',
    type: 'payment_due',
    title: 'תשלום ממתין',
    message: 'יש לך תשלום ממתין עבור הזמנת המגרש מאתמול. אנא השלם את התשלום כדי לאשר את ההזמנה.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    isRead: true,
    priority: 'medium',
    actionRequired: true,
    relatedBookingId: 'booking_125',
  },
  {
    id: '4',
    type: 'friend_request',
    title: 'בקשת חברות חדשה',
    message: 'דניאל כהן שלח לך בקשת חברות. תוכלו לשחק יחד ולתאם משחקים.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    isRead: false,
    priority: 'low',
    actionRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    relatedUserId: 'user_456',
  },
  {
    id: '5',
    type: 'system_update',
    title: 'עדכון חדש זמין',
    message: 'גרסה חדשה של האפליקציה זמינה להורדה. העדכון כולל שיפורים בביצועים ותכונות חדשות.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isRead: true,
    priority: 'low',
    actionRequired: false,
  },
];

export const NotificationCarouselDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>(createMockNotifications());
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)]);
  };

  const handleNotificationPress = (notification: NotificationData) => {
    addLog(`נלחץ על התראה: ${notification.title}`);
  };

  const handleNotificationDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    addLog(`התראה נמחקה: ${notificationId}`);
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    addLog(`פעולה בוצעה: ${action} על התראה ${notificationId}`);
    
    // Handle specific actions
    switch (action) {
      case 'accept':
      case 'decline':
        // Mark friend request as handled
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, actionRequired: false }
              : n
          )
        );
        break;
      case 'pay':
        // Mark payment as handled
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, actionRequired: false, type: 'booking_confirmed' }
              : n
          )
        );
        break;
    }
  };

  const handleSwipeComplete = (direction: 'next' | 'prev', currentIndex: number) => {
    addLog(`החלקה ${direction === 'next' ? 'קדימה' : 'אחורה'} - אינדקס נוכחי: ${currentIndex}`);
  };

  const addNewNotification = () => {
    const newNotification: NotificationData = {
      id: `new_${Date.now()}`,
      type: 'booking_confirmed',
      title: 'התראה חדשה',
      message: 'זוהי התראה חדשה שנוצרה לצורכי הדגמה',
      timestamp: new Date(),
      isRead: false,
      priority: 'medium',
      actionRequired: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    addLog('התראה חדשה נוספה');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addLog('כל ההתראות סומנו כנקראו');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <RTLText style={styles.headerTitle}>התראות</RTLText>
          <RTLText style={styles.headerSubtitle}>
            דוגמה לקרוסלת התראות עם אנימציות RTL
          </RTLText>
        </View>

        {/* Notification Carousel */}
        <View style={styles.carouselSection}>
          <NotificationCarousel
            notifications={notifications}
            onNotificationPress={handleNotificationPress}
            onNotificationDismiss={handleNotificationDismiss}
            onNotificationAction={handleNotificationAction}
            onSwipeComplete={handleSwipeComplete}
            autoPlayInterval={0} // Disabled for demo
            enableHaptics={true}
            showIndicators={true}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={addNewNotification}>
            <RTLText style={styles.controlButtonText}>הוסף התראה</RTLText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={markAllAsRead}>
            <RTLText style={styles.controlButtonText}>סמן הכל כנקרא</RTLText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.clearButton]} onPress={clearLogs}>
            <RTLText style={styles.clearButtonText}>נקה יומן</RTLText>
          </TouchableOpacity>
        </View>

        {/* Event Log */}
        <View style={styles.logSection}>
          <RTLText style={styles.logTitle}>יומן אירועים</RTLText>
          <View style={styles.logContainer}>
            {logs.length === 0 ? (
              <RTLText style={styles.emptyLog}>אין אירועים</RTLText>
            ) : (
              logs.map((log, index) => (
                <RTLText key={index} style={styles.logEntry}>
                  {log}
                </RTLText>
              ))
            )}
          </View>
        </View>

        {/* RTL Guidelines Note */}
        <View style={styles.guidelinesSection}>
          <RTLText style={styles.guidelinesTitle}>הנחיות RTL</RTLText>
          <RTLText style={styles.guidelinesText}>
            • החלקה שמאלה = הבא (טבעי בעברית){'\n'}
            • החלקה ימינה = הקודם{'\n'}
            • אנימציות עם קפיצים פיזיקליים{'\n'}
            • משוב הפטי למגע{'\n'}
            • כיוון טבעי לקריאה בעברית
          </RTLText>
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
  scrollContent: {
    paddingBottom: designTokens.spacing.xxxl,
  },
  header: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.xl,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: designTokens.typography.sizes.xxxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'left',
  },
  carouselSection: {
    marginVertical: designTokens.spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.xl,
  },
  controlButton: {
    flex: 1,
    backgroundColor: designTokens.colors.primary[600],
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
  },
  controlButtonText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
  },
  clearButton: {
    backgroundColor: designTokens.colors.error[600],
  },
  clearButtonText: {
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
  },
  logSection: {
    paddingHorizontal: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.xl,
  },
  logTitle: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
    textAlign: 'left',
  },
  logContainer: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    minHeight: 120,
  },
  emptyLog: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logEntry: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  guidelinesSection: {
    paddingHorizontal: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.background.secondary,
    marginHorizontal: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
  },
  guidelinesTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
    textAlign: 'left',
  },
  guidelinesText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.sizes.md * 1.6,
    textAlign: 'left',
  },
});

export default NotificationCarouselDemo;