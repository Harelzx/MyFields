import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { WoltButton } from '@components/design-system/WoltButton';
import { RTLText } from '@components/design-system/RTLText';
import { Input, LoadingSpinner } from '@components/design-system';
import { texts } from '@constants/hebrewTexts';
import { designTokens } from '@constants/theme';
import { fetchWalletTransactions, addMoneyToWallet, fetchUser } from '@services/mockApi';
import { WalletTransaction, User } from '@types/types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const WalletScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [error, setError] = useState('');

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

    try {
      setIsAddingMoney(true);
      setError('');
      const response = await addMoneyToWallet('user_1', amount);
      
      if (response.success) {
        Alert.alert('הצלחה', response.message || 'הכסף נוסף בהצלחה');
        setUserBalance(prev => prev + amount);
        setAddAmount('');
        setShowAddForm(false);
        // Reload transactions to show the new addition
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

  const getTransactionIcon = (type: string) => {
    const iconSize = 20;
    const iconColor = designTokens.colors.text.secondary;
    
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

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'booking_payment': return designTokens.colors.error[600];
      case 'wallet_charge': return designTokens.colors.success[600];
      case 'refund': return designTokens.colors.success[600];
      default: return designTokens.colors.text.primary;
    }
  };

  const renderTransactionCard = (transaction: WalletTransaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        {getTransactionIcon(transaction.type)}
      </View>
      <View style={styles.transactionInfo}>
        <RTLText style={styles.transactionDescription}>
          {transaction.description}
        </RTLText>
        <RTLText style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </RTLText>
        <RTLText style={styles.transactionStatus}>
          {transaction.status === 'completed' ? 'הושלם' : 'בתהליך'}
        </RTLText>
      </View>
      <View style={styles.transactionAmount}>
        <RTLText style={[
          styles.transactionAmountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {transaction.type === 'booking_payment' ? '-' : '+'}₪{transaction.amount}
        </RTLText>
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
          {/* Header */}
          <View style={styles.header}>
            <RTLText style={styles.title}>{texts.wallet.balance}</RTLText>
            <RTLText style={styles.subtitle}>
              נהל את הכסף שלך בקלות
            </RTLText>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <RTLText style={styles.balanceLabel}>יתרה נוכחית</RTLText>
            <RTLText style={styles.balanceAmount}>₪{userBalance.toFixed(2)}</RTLText>
            <View style={styles.balanceFooter}>
              <RTLText style={styles.balanceFooterText}>זמין לשימוש מיידי</RTLText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.actionsGrid}>
              <WoltButton
                variant="primary"
                fullWidth
                onPress={() => setShowAddForm(!showAddForm)}
                style={styles.actionButton}
              >
                {showAddForm ? 'ביטול' : texts.wallet.addMoney}
              </WoltButton>
              
              <WoltButton
                variant="outline"
                fullWidth
                onPress={() => Alert.alert('בקרוב', 'תכונה זו תהיה זמינה בקרוב')}
                style={styles.actionButton}
              >
                העבר כסף לחבר
              </WoltButton>
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
              </View>
            )}
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>{texts.wallet.recentTransactions}</RTLText>
            {transactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {transactions.slice(0, 10).map(renderTransactionCard)}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <RTLText style={styles.placeholderText}>
                  {texts.wallet.noTransactions}
                </RTLText>
                <RTLText style={styles.placeholderSubtext}>
                  כאן יופיעו כל הפעולות שביצעת
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
  balanceCard: {
    backgroundColor: designTokens.colors.primary[600],
    padding: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.lg,
    marginBottom: designTokens.spacing.xl,
    alignItems: 'center',
    ...designTokens.shadows.lg,
  },
  balanceLabel: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.inverse,
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  balanceAmount: {
    fontSize: designTokens.typography.sizes.huge,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.inverse,
    textAlign: 'center',
  },
  balanceFooter: {
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceFooterText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
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
  transactionsList: {
    gap: designTokens.spacing.md,
  },
  transactionCard: {
    backgroundColor: designTokens.colors.background.card,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...designTokens.shadows.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: designTokens.colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: designTokens.spacing.md,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  transactionDate: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.xs,
  },
  transactionStatus: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.success[600],
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
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

export default WalletScreen;