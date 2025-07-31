import React, { useState, useEffect, useMemo } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Dimensions, Animated } from 'react-native';
import { WoltButton } from '@components/design-system/WoltButton';
import { RTLText } from '@components/design-system/RTLText';
import { Input, LoadingSpinner } from '@components/design-system';
import { texts } from '@constants/hebrewTexts';
import { designTokens } from '@constants/theme';
import { fetchWalletTransactions, addMoneyToWallet, fetchUser } from '@services/mockApi';
import { WalletTransaction, User, SpendingInsights } from '../types/types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const WalletScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'booking_payment' | 'wallet_charge' | 'refund' | 'transfer_in' | 'transfer_out' | 'bonus' | 'penalty'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [pendingBalance, setPendingBalance] = useState(100); // Mock pending balance
  const [availableBalance, setAvailableBalance] = useState(0);
  const [requireAuth, setRequireAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [transactionsResponse, userResponse] = await Promise.all([
        fetchWalletTransactions('user_1'),
        fetchUser('user_1')
      ]);
      
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || []);
      }
      
      if (userResponse.success) {
        setUserBalance(userResponse.data?.walletBalance || 0);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecureAction = (actionType: string, data?: any) => {
    if (actionType === 'add_money' && data.amount > 500) {
      // Require authentication for large amounts
      setPendingAction({ type: actionType, data });
      setRequireAuth(true);
      return;
    }
    executeAction(actionType, data);
  };

  const executeAction = async (actionType: string, data?: any) => {
    switch (actionType) {
      case 'add_money':
        await addMoneyAction(data.amount);
        break;
      default:
        break;
    }
  };

  const handleAuthentication = (success: boolean) => {
    setRequireAuth(false);
    if (success && pendingAction) {
      executeAction(pendingAction.type, pendingAction.data);
    }
    setPendingAction(null);
  };

  const addMoneyAction = async (amount: number) => {
    try {
      setIsAddingMoney(true);
      setError('');
      const response = await addMoneyToWallet('user_1', amount);
      
      if (response.success) {
        Alert.alert('הצלחה', response.message || 'הכסף נוסף בהצלחה');
        setUserBalance(prev => prev + amount);
        setAddAmount('');
        setShowAddForm(false);
        loadWalletData();
      } else {
        setError(response.error || 'שגיאה בהוספת כסף');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsAddingMoney(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (!addAmount || isNaN(amount) || amount <= 0) {
      setError('נא להזין סכום תקין');
      return;
    }

    if (amount > 1000) {
      setError('סכום מקסימלי לטעינה: ₪1000');
      return;
    }

    handleSecureAction('add_money', { amount });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDateGroupLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'אתמול';
    } else if (date >= weekAgo) {
      return 'השבוע שעבר';
    } else {
      return date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    }
  };

  const getTransactionCategoryLabel = (type: string) => {
    switch (type) {
      case 'booking_payment': return 'משחקים';
      case 'wallet_charge': return 'טעינת ארנק';
      case 'refund': return 'החזרים';
      default: return 'אחר';
    }
  };

  const getTransactionIcon = (type: string) => {
    const iconSize = 20;
    const iconColor = designTokens.colors.text.inverse;
    
    switch (type) {
      case 'booking_payment': 
        return <Ionicons name="football" size={iconSize} color={iconColor} />;
      case 'wallet_charge': 
        return <Ionicons name="card" size={iconSize} color={iconColor} />;
      case 'refund': 
        return <Ionicons name="arrow-undo" size={iconSize} color={iconColor} />;
      default: 
        return <Ionicons name="cash" size={iconSize} color={iconColor} />;
    }
  };

  const getTransactionIconBackground = (type: string) => {
    switch (type) {
      case 'booking_payment': return designTokens.colors.error[600];
      case 'wallet_charge': return designTokens.colors.success[600];
      case 'refund': return designTokens.colors.info[600];
      default: return designTokens.colors.secondary[600];
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'booking_payment': return designTokens.colors.error[600];
      case 'wallet_charge': return designTokens.colors.success[600];
      case 'refund': return designTokens.colors.success[600];
      default: return designTokens.colors.text.primary;
    }
  };

  const getTransactionSign = (type: string) => {
    switch (type) {
      case 'booking_payment':
      case 'transfer_out':
      case 'penalty':
      case 'fee':
        return '-';
      case 'wallet_charge':
      case 'refund':
      case 'transfer_in':
      case 'bonus':
        return '+';
      default:
        return '';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return 'card';
      case 'bank_transfer': return 'business';
      case 'paypal': return 'logo-paypal';
      case 'apple_pay': return 'logo-apple';
      case 'google_pay': return 'logo-google';
      default: return 'cash';
    }
  };

  // Filter and group transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchQuery === '' || 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, selectedFilter]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: WalletTransaction[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const groupLabel = getDateGroupLabel(transaction.createdAt);
      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }
      groups[groupLabel].push(transaction);
    });
    
    // Sort groups by date (most recent first)
    const sortedGroups = Object.keys(groups).sort((a, b) => {
      const order = ['היום', 'אתמול', 'השבוע שעבר'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return b.localeCompare(a);
    });
    
    return sortedGroups.map(groupLabel => ({
      title: groupLabel,
      data: groups[groupLabel].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }));
  }, [filteredTransactions]);

  // Calculate spending insights
  const spendingInsights = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const totalSpent = thisMonth
      .filter(t => t.type === 'booking_payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalAdded = thisMonth
      .filter(t => t.type === 'wallet_charge')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { totalSpent, totalAdded };
  }, [transactions]);

  const renderTransactionCard = (transaction: WalletTransaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: getTransactionIconBackground(transaction.type) }
      ]}>
        {getTransactionIcon(transaction.type)}
      </View>
      <View style={styles.transactionInfo}>
        <RTLText style={styles.transactionDescription}>
          {transaction.description}
        </RTLText>
        <RTLText style={styles.transactionCategory}>
          {getTransactionCategoryLabel(transaction.type)}
        </RTLText>
        <RTLText style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </RTLText>
      </View>
      <View style={styles.transactionAmount}>
        <RTLText style={[
          styles.transactionAmountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {getTransactionSign(transaction.type)}₪{transaction.amount}
        </RTLText>
        <View style={styles.transactionMeta}>
          <RTLText style={[
            styles.transactionStatus,
            { color: transaction.status === 'completed' ? designTokens.colors.success[600] : 
                     transaction.status === 'pending' ? designTokens.colors.warning[600] : 
                     designTokens.colors.error[600] }
          ]}>
            {transaction.status === 'completed' ? 'הושלם' : 
             transaction.status === 'pending' ? 'בהמתנה' : 
             transaction.status === 'failed' ? 'נכשל' : 'בוטל'}
          </RTLText>
          {transaction.paymentMethod && (
            <View style={styles.paymentMethodContainer}>
              <Ionicons 
                name={getPaymentMethodIcon(transaction.paymentMethod)} 
                size={12} 
                color={designTokens.colors.text.tertiary} 
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <RTLText style={styles.loadingText}>טוען ארנק...</RTLText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Compact Header with Balance */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.compactHeader}
          >
            <View style={styles.headerContent}>
              <RTLText style={styles.title}>{texts.wallet.balance}</RTLText>
              <RTLText style={styles.balanceAmount}>₪{userBalance.toFixed(2)}</RTLText>
            </View>
            <View style={styles.monthlyInsights}>
              <View style={styles.insightItem}>
                <RTLText style={styles.insightLabel}>הוצאות החודש</RTLText>
                <RTLText style={styles.insightValue}>₪{spendingInsights.totalSpent}</RTLText>
              </View>
              <View style={styles.insightItem}>
                <RTLText style={styles.insightLabel}>טעינות החודש</RTLText>
                <RTLText style={styles.insightValuePositive}>₪{spendingInsights.totalAdded}</RTLText>
              </View>
            </View>
          </LinearGradient>

          {/* Enhanced Quick Actions */}
          <View style={styles.section}>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="add-circle" size={24} color={designTokens.colors.success[600]} />
                </View>
                <RTLText style={styles.quickActionText}>הוסף כסף</RTLText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => Alert.alert('בקרוב', 'תכונה זו תהיה זמינה בקרוב')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="send" size={24} color={designTokens.colors.primary[600]} />
                </View>
                <RTLText style={styles.quickActionText}>העבר</RTLText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="analytics" size={24} color={designTokens.colors.info[600]} />
                </View>
                <RTLText style={styles.quickActionText}>היסטוריה</RTLText>
              </TouchableOpacity>
            </View>

            {/* Add Money Form */}
            {showAddForm && (
              <View style={styles.addMoneyForm}>
                <RTLText style={styles.addMoneyFormTitle}>הוסף כסף לארנק</RTLText>
                <View style={styles.quickAmounts}>
                  {[50, 100, 200, 500].map(amount => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => setAddAmount(amount.toString())}
                    >
                      <View style={styles.quickAmountContent}>
                        <Ionicons name="cash" size={16} color={designTokens.colors.primary[600]} />
                        <RTLText style={styles.quickAmountText}>₪{amount}</RTLText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input
                  label="סכום מותאם אישית"
                  value={addAmount}
                  onChangeText={setAddAmount}
                  placeholder="הזן סכום"
                  keyboardType="numeric"
                  leftIcon="money"
                  error={error}
                />
                <WoltButton
                  variant="primary"
                  fullWidth
                  onPress={handleAddMoney}
                  disabled={isAddingMoney}
                  style={styles.addMoneySubmitButton}
                >
                  {isAddingMoney ? <LoadingSpinner size="small" color={designTokens.colors.text.inverse} /> : 'הוסף כסף'}
                </WoltButton>
                
                <View style={styles.securityNote}>
                  <Ionicons name="shield-checkmark" size={16} color={designTokens.colors.success[600]} />
                  <RTLText style={styles.securityText}>
                    תשלומים מעל ₪500 דורשים אימות ביומטרי
                  </RTLText>
                </View>
              </View>
            )}
          </View>

          {/* Search and Filters */}
          <View style={styles.section}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={designTokens.colors.text.secondary} 
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="חפש עסקאות..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="left"
                />
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons 
                  name="options" 
                  size={20} 
                  color={showFilters ? designTokens.colors.primary[600] : designTokens.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    {[
                      { key: 'all', label: 'הכל' },
                      { key: 'booking_payment', label: 'משחקים' },
                      { key: 'wallet_charge', label: 'הפקדות' },
                      { key: 'refund', label: 'החזרים' },
                      { key: 'transfer_in', label: 'העברות נכנסות' },
                      { key: 'transfer_out', label: 'העברות יוצאות' },
                      { key: 'bonus', label: 'בונוסים' },
                      { key: 'penalty', label: 'עמלות' }
                    ].map(filter => (
                      <TouchableOpacity
                        key={filter.key}
                        style={[
                          styles.filterChip,
                          selectedFilter === filter.key && styles.filterChipActive
                        ]}
                        onPress={() => setSelectedFilter(filter.key as any)}
                      >
                        <RTLText style={[
                          styles.filterChipText,
                          selectedFilter === filter.key && styles.filterChipTextActive
                        ]}>
                          {filter.label}
                        </RTLText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Grouped Transactions */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>עסקאות</RTLText>
            {groupedTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {groupedTransactions.map(group => (
                  <View key={group.title} style={styles.transactionGroup}>
                    <RTLText style={styles.groupTitle}>{group.title}</RTLText>
                    <View style={styles.groupTransactions}>
                      {group.data.map(renderTransactionCard)}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="receipt-outline" size={48} color={designTokens.colors.text.disabled} />
                <RTLText style={styles.placeholderText}>
                  {searchQuery || selectedFilter !== 'all' ? 'לא נמצאו עסקאות' : texts.wallet.noTransactions}
                </RTLText>
                <RTLText style={styles.placeholderSubtext}>
                  {searchQuery || selectedFilter !== 'all' ? 'נסה לשנות את הפילטרים' : 'כאן יופיעו כל הפעולות שביצעת'}
                </RTLText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Security Authentication Modal */}
      {requireAuth && (
        <View style={styles.authModal}>
          <View style={styles.authContainer}>
            <View style={styles.authHeader}>
              <Ionicons name="shield-checkmark" size={32} color={designTokens.colors.primary[600]} />
              <RTLText style={styles.authTitle}>אימות ביטחוני נדרש</RTLText>
              <RTLText style={styles.authSubtitle}>
                לביצוע פעולה זו נדרש אימות ביומטרי או קוד PIN
              </RTLText>
            </View>
            
            <View style={styles.authActions}>
              <WoltButton
                variant="primary"
                onPress={() => handleAuthentication(true)}
                style={styles.authButton}
              >
                <Ionicons name="finger-print" size={16} color={designTokens.colors.text.inverse} />
                <RTLText style={styles.authButtonText}>אמת באמצעות ביומטריה</RTLText>
              </WoltButton>
              
              <TouchableOpacity
                style={styles.authCancelButton}
                onPress={() => handleAuthentication(false)}
              >
                <RTLText style={styles.authCancelText}>ביטול</RTLText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    padding: designTokens.spacing.lg,
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
    textAlign: 'left',
  },
  // Premium Balance Card Styles
  balanceCard: {
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.xl,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.lg,
  },
  balanceMain: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.inverse,
    opacity: 0.8,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  balanceAmount: {
    fontSize: designTokens.typography.sizes.huge,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.inverse,
    textAlign: 'left',
  },
  analyticsButton: {
    padding: designTokens.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: designTokens.borderRadius.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetailItem: {
    alignItems: 'flex-start',
  },
  balanceDetailLabel: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.inverse,
    opacity: 0.7,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  balanceDetailValue: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.inverse,
    textAlign: 'left',
  },
  // Analytics Card Styles
  analyticsCard: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.sm,
  },
  analyticsTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
    textAlign: 'left',
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: designTokens.spacing.sm,
  },
  analyticsItem: {
    flex: 1,
    backgroundColor: designTokens.colors.background.secondary,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'flex-start',
  },
  analyticsItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.xs,
    gap: designTokens.spacing.xs,
  },
  analyticsItemLabel: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.text.secondary,
    textAlign: 'left',
  },
  analyticsItemValue: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  analyticsItemChange: {
    fontSize: designTokens.typography.sizes.xs,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left',
  },
  section: {
    marginBottom: designTokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
    textAlign: 'left',
  },
  // Premium Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    ...designTokens.shadows.sm,
  },
  primaryAction: {
    flex: 2,
    minWidth: '45%',
  },
  quickActionGradient: {
    width: '100%',
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
  },
  quickActionIcon: {
    padding: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
  },
  quickActionText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },
  quickActionTextPrimary: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.inverse,
    textAlign: 'center',
  },
  addMoneyForm: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    marginTop: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },
  addMoneyFormTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: designTokens.spacing.sm,
    marginVertical: designTokens.spacing.md,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: designTokens.colors.primary[50],
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.primary[200],
    alignItems: 'center',
  },
  quickAmountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  quickAmountText: {
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.primary[600],
  },
  addMoneySubmitButton: {
    marginTop: designTokens.spacing.sm,
  },
  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.sm,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  searchIcon: {
    marginLeft: designTokens.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    paddingVertical: designTokens.spacing.xs,
  },
  filterButton: {
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  filterContainer: {
    marginBottom: designTokens.spacing.md,
  },
  filterChips: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
  },
  filterChipActive: {
    backgroundColor: designTokens.colors.primary[600],
    borderColor: designTokens.colors.primary[600],
  },
  filterChipText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: designTokens.colors.text.inverse,
  },
  // Transaction List Styles
  transactionsList: {
    gap: designTokens.spacing.md,
  },
  transactionGroup: {
    marginBottom: designTokens.spacing.lg,
  },
  groupTitle: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'left',
  },
  groupTransactions: {
    gap: designTokens.spacing.sm,
  },
  transactionCard: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...designTokens.shadows.xs,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: designTokens.spacing.md,
  },
  transactionInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  transactionDescription: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  transactionCategory: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.text.tertiary,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  transactionDate: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.text.secondary,
    textAlign: 'left',
  },
  transactionAmount: {
    alignItems: 'flex-start',
  },
  transactionAmountText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.bold,
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  transactionMeta: {
    alignItems: 'flex-start',
    gap: designTokens.spacing.xs,
  },
  transactionStatus: {
    fontSize: designTokens.typography.sizes.xs,
    fontWeight: designTokens.typography.weights.medium,
    textAlign: 'left',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background.secondary,
    paddingHorizontal: designTokens.spacing.xs,
    paddingVertical: designTokens.spacing.xxs,
    borderRadius: designTokens.borderRadius.xs,
  },
  // Security Styles
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    marginTop: designTokens.spacing.sm,
    padding: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.success[50],
    borderRadius: designTokens.borderRadius.sm,
  },
  securityText: {
    fontSize: designTokens.typography.sizes.xs,
    color: designTokens.colors.success[700],
    textAlign: 'left',
  },
  authModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  authContainer: {
    backgroundColor: designTokens.colors.background.card,
    margin: designTokens.spacing.lg,
    padding: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.xl,
    ...designTokens.shadows.lg,
    minWidth: screenWidth * 0.8,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
  },
  authTitle: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
    marginTop: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  authActions: {
    gap: designTokens.spacing.md,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.sm,
  },
  authButtonText: {
    color: designTokens.colors.text.inverse,
    fontWeight: designTokens.typography.weights.semibold,
  },
  authCancelButton: {
    alignItems: 'center',
    padding: designTokens.spacing.md,
  },
  authCancelText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
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
    marginTop: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.disabled,
    textAlign: 'center',
  },
  // Compact Header Styles
  compactHeader: {
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.md,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: designTokens.typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: designTokens.spacing.xs,
    textAlign: 'left',
  },
  monthlyInsights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: designTokens.spacing.md,
  },
  insightItem: {
    flex: 1,
  },
  insightLabel: {
    fontSize: designTokens.typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: designTokens.spacing.xxs,
    textAlign: 'left',
  },
  insightValue: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: 'white',
    textAlign: 'left',
  },
  insightValuePositive: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: '#4ade80',
    textAlign: 'left',
  },
});

export default WalletScreen;