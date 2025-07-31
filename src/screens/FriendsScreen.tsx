import React, { useState, useEffect, useMemo } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { WoltButton } from '@components/design-system/WoltButton';
import { RTLText } from '@components/design-system/RTLText';
import { Input, LoadingSpinner } from '@components/design-system';
import { texts } from '@constants/hebrewTexts';
import { designTokens } from '@constants/theme';
import { fetchUserFriends, inviteFriend } from '@services/mockApi';
import { Friend } from '@types/types';
import { Ionicons } from '@expo/vector-icons';

// Enhanced Friend interface with social features
interface EnhancedFriend extends Friend {
  status: 'online' | 'playing' | 'available' | 'offline';
  currentActivity?: string;
  currentField?: string;
  mutualGames?: number;
  joinedGroups?: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  adminId: string;
  sport: string;
  regularTimes: string[];
  imageUrl?: string;
  isPublic: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatConversation {
  id: string;
  name: string;
  type: 'friend' | 'group';
  lastMessage?: ChatMessage;
  unreadCount: number;
  participants: string[];
}

type TabType = 'friends' | 'groups' | 'chat';

const FriendsScreen: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<EnhancedFriend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadFriends(),
        loadGroups(),
        loadConversations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    // Enhanced mock data with social features
    const mockFriends: EnhancedFriend[] = [
      {
        id: '1',
        fullName: 'דני כהן',
        phoneNumber: '050-1234567',
        favoriteSpots: ['מגרש הכוכבים'],
        isOnline: true,
        status: 'playing',
        currentActivity: 'משחק כדורגל',
        currentField: 'מגרש הכוכבים',
        mutualGames: 12,
        joinedGroups: ['football_tlv', 'weekend_warriors']
      },
      {
        id: '2',
        fullName: 'שרה לוי',
        phoneNumber: '052-9876543',
        favoriteSpots: ['מגרש הספורט'],
        isOnline: true,
        status: 'online',
        mutualGames: 8,
        joinedGroups: ['tennis_lovers']
      },
      {
        id: '3',
        fullName: 'מיכאל רוזן',
        phoneNumber: '054-5555555',
        favoriteSpots: ['מגרש המרכז'],
        isOnline: false,
        status: 'offline',
        lastActive: '2 שעות',
        mutualGames: 15,
        joinedGroups: ['basketball_pros', 'weekend_warriors']
      },
      {
        id: '4',
        fullName: 'רחל אברהם',
        phoneNumber: '053-7777777',
        favoriteSpots: ['מגרש הקהילה'],
        isOnline: true,
        status: 'available',
        mutualGames: 6,
        joinedGroups: ['volleyball_team']
      }
    ];
    setFriends(mockFriends);
  };

  const loadGroups = async () => {
    const mockGroups: Group[] = [
      {
        id: 'football_tlv',
        name: 'כדורגל תל אביב',
        description: 'קבוצת כדורגל קבועה בתל אביב - כל יום שלישי ב-19:00',
        members: ['1', '3', 'user_1'],
        adminId: 'user_1',
        sport: 'כדורגל',
        regularTimes: ['יום שלישי 19:00', 'יום ראשון 20:00'],
        isPublic: true
      },
      {
        id: 'tennis_lovers',
        name: 'אוהבי טניס',
        description: 'משחקי טניס בסופי שבוע',
        members: ['2', 'user_1'],
        adminId: '2',
        sport: 'טניס',
        regularTimes: ['שבת 10:00', 'ראשון 18:00'],
        isPublic: false
      },
      {
        id: 'weekend_warriors',
        name: 'לוחמי סוף השבוע',
        description: 'ספורט בסוף השבוע - כל הספורטים',
        members: ['1', '3', 'user_1'],
        adminId: '3',
        sport: 'מעורב',
        regularTimes: ['שבת 9:00', 'ראשון 17:00'],
        isPublic: true
      }
    ];
    setGroups(mockGroups);
  };

  const loadConversations = async () => {
    const mockConversations: ChatConversation[] = [
      {
        id: 'conv_1',
        name: 'דני כהן',
        type: 'friend',
        lastMessage: {
          id: 'msg_1',
          senderId: '1',
          senderName: 'דני כהן',
          message: 'בא לכדורגל מחר?',
          timestamp: '14:30',
          isRead: false
        },
        unreadCount: 2,
        participants: ['1', 'user_1']
      },
      {
        id: 'conv_2',
        name: 'כדורגל תל אביב',
        type: 'group',
        lastMessage: {
          id: 'msg_2',
          senderId: '3',
          senderName: 'מיכאל רוזן',
          message: 'מי בא היום למשחק?',
          timestamp: '12:15',
          isRead: true
        },
        unreadCount: 0,
        participants: ['1', '3', 'user_1']
      }
    ];
    setConversations(mockConversations);
  };

  const handleInviteFriend = async () => {
    if (!phoneNumber.trim()) {
      setError('נא להזין מספר טלפון');
      return;
    }

    try {
      setIsInviting(true);
      setError('');
      const response = await inviteFriend(phoneNumber);
      
      if (response.success) {
        Alert.alert('הצלחה', response.message || 'ההזמנה נשלחה בהצלחה');
        setPhoneNumber('');
        setShowInviteForm(false);
      } else {
        setError(response.error || 'שגיאה בשליחת ההזמנה');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsInviting(false);
    }
  };

  const renderFriendCard = (friend: Friend) => (
    <View key={friend.id} style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Ionicons name="person" size={24} color={designTokens.colors.primary[600]} />
      </View>
      <View style={styles.friendInfo}>
        <RTLText style={styles.friendName}>{friend.fullName}</RTLText>
        <RTLText style={styles.friendPhone}>{friend.phoneNumber}</RTLText>
        <RTLText style={styles.friendStatus}>
          {friend.status === 'active' ? 'פעיל' : 'לא פעיל'}
        </RTLText>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity style={styles.inviteButton}>
          <View style={styles.inviteButtonContent}>
            <Ionicons name="football" size={16} color={designTokens.colors.primary[600]} />
            <RTLText style={styles.inviteButtonText}>הזמן למגרש</RTLText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <RTLText style={styles.loadingText}>טוען חברים...</RTLText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RTLText style={styles.title}>{texts.friends.myFriends}</RTLText>
            <RTLText style={styles.subtitle}>
              {friends.length} חברים ברשימה שלך
            </RTLText>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.actionsGrid}>
              <WoltButton
                variant="primary"
                fullWidth
                onPress={() => setShowInviteForm(!showInviteForm)}
                style={styles.actionButton}
              >
                {showInviteForm ? 'ביטול' : texts.friends.inviteFriends}
              </WoltButton>
              
              <WoltButton
                variant="outline"
                fullWidth
                onPress={() => Alert.alert('בקרוב', 'תכונה זו תהיה זמינה בקרוב')}
                style={styles.actionButton}
              >
                {texts.friends.findFriends}
              </WoltButton>
            </View>

            {/* Invite Form */}
            {showInviteForm && (
              <View style={styles.inviteForm}>
                <RTLText style={styles.inviteFormTitle}>הזמן חבר חדש</RTLText>
                <Input
                  label="מספר טלפון"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="050-1234567"
                  keyboardType="phone-pad"
                  leftIcon="phone"
                  error={error}
                />
                <WoltButton
                  variant="primary"
                  fullWidth
                  onPress={handleInviteFriend}
                  disabled={isInviting}
                  style={styles.inviteSubmitButton}
                >
                  {isInviting ? <LoadingSpinner size="small" color={designTokens.colors.text.inverse} /> : 'שלח הזמנה'}
                </WoltButton>
              </View>
            )}
          </View>

          {/* Friends List */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>החברים שלי</RTLText>
            {friends.length > 0 ? (
              <View style={styles.friendsList}>
                {friends.map(renderFriendCard)}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <RTLText style={styles.placeholderText}>
                  {texts.friends.noFriends}
                </RTLText>
                <RTLText style={styles.placeholderSubtext}>
                  הזמן חברים כדי לשחק ביחד!
                </RTLText>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
  },
  header: {
    marginBottom: designTokens.spacing.xl,
  },
  title: {
    fontSize: designTokens.typography.sizes.xxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  subtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
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
  inviteForm: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    marginTop: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },
  inviteFormTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },
  inviteSubmitButton: {
    marginTop: designTokens.spacing.sm,
  },
  friendsList: {
    gap: designTokens.spacing.md,
  },
  friendCard: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...designTokens.shadows.sm,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: designTokens.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: designTokens.spacing.md,
  },
  friendAvatarText: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.primary[600],
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  friendPhone: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
  },
  friendStatus: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.success[600],
  },
  friendActions: {
    alignItems: 'flex-end',
  },
  inviteButton: {
    backgroundColor: designTokens.colors.primary[50],
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.primary[200],
  },
  inviteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  inviteButtonText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.primary[600],
  },
  placeholder: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.disabled,
    textAlign: 'center',
  },
});

export default FriendsScreen;