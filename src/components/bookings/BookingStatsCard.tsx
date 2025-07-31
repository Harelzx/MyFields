import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  SlideInUp
} from 'react-native-reanimated';
import { RTLText } from '@components/design-system/RTLText';
import { designTokens } from '@constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, HStack, VStack, Progress } from '@gluestack-ui/themed';

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  favoriteVenues: number;
  totalSpent: number;
  currency: string;
  avgRating: number;
  currentStreak: number; // Days with consistent bookings
  longestStreak: number;
  preferredTime: string;
  mostBookedVenue: {
    name: string;
    count: number;
  };
  thisMonthBookings: number;
  lastMonthBookings: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface BookingStatsCardProps {
  stats: BookingStats;
  achievements?: Achievement[];
  onViewDetails?: () => void;
  onViewAchievements?: () => void;
  style?: any;
}

export const BookingStatsCard: React.FC<BookingStatsCardProps> = ({
  stats,
  achievements = [],
  onViewDetails,
  onViewAchievements,
  style,
}) => {
  const scale = useSharedValue(1);
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    // Animate progress bars on mount
    progressValue.value = withDelay(500, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressValue.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getCompletionRate = () => {
    const total = stats.completedBookings + stats.cancelledBookings;
    if (total === 0) return 0;
    return (stats.completedBookings / total) * 100;
  };

  const getGrowthPercentage = () => {
    if (stats.lastMonthBookings === 0) return stats.thisMonthBookings > 0 ? 100 : 0;
    return ((stats.thisMonthBookings - stats.lastMonthBookings) / stats.lastMonthBookings) * 100;
  };

  const renderStatItem = (
    icon: string,
    value: string,
    label: string,
    color: string = designTokens.colors.text.primary,
    index: number = 0
  ) => (
    <Animated.View 
      entering={SlideInUp.delay(index * 100)}
      style={styles.statItem}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <VStack alignItems="center" space="xs">
        <RTLText style={[styles.statValue, { color }]}>{value}</RTLText>
        <RTLText style={styles.statLabel}>{label}</RTLText>
      </VStack>
    </Animated.View>
  );

  const renderProgressStat = (
    label: string,
    current: number,
    total: number,
    color: string,
    index: number
  ) => (
    <Animated.View 
      entering={SlideInUp.delay(index * 150)}
      style={styles.progressItem}
    >
      <HStack justifyContent="space-between" alignItems="center" marginBottom="xs">
        <RTLText style={styles.progressLabel}>{label}</RTLText>
        <RTLText style={styles.progressValue}>
          {current}/{total}
        </RTLText>
      </HStack>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            { backgroundColor: color, width: `${(current / total) * 100}%` },
            progressAnimatedStyle
          ]}
        />
      </View>
    </Animated.View>
  );

  const renderAchievement = (achievement: Achievement, index: number) => (
    <Animated.View
      key={achievement.id}
      entering={SlideInUp.delay(index * 100)}
      style={[
        styles.achievementItem,
        !achievement.unlocked && styles.achievementLocked
      ]}
    >
      <View style={[
        styles.achievementIcon,
        { backgroundColor: achievement.unlocked ? designTokens.colors.warning[100] : designTokens.colors.secondary[100] }
      ]}>
        <MaterialCommunityIcons 
          name={achievement.icon}
          size={20}
          color={achievement.unlocked ? designTokens.colors.warning[600] : designTokens.colors.text.tertiary}
        />
      </View>
      <VStack flex={1} space="xs">
        <RTLText style={[
          styles.achievementTitle,
          !achievement.unlocked && styles.achievementTitleLocked
        ]}>
          {achievement.title}
        </RTLText>
        <RTLText style={styles.achievementDescription}>
          {achievement.description}
        </RTLText>
        {achievement.progress !== undefined && achievement.maxProgress && (
          <View style={styles.achievementProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: achievement.unlocked ? designTokens.colors.warning[500] : designTokens.colors.secondary[300],
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                  }
                ]}
              />
            </View>
            <RTLText style={styles.achievementProgressText}>
              {achievement.progress}/{achievement.maxProgress}
            </RTLText>
          </View>
        )}
      </VStack>
    </Animated.View>
  );

  const completionRate = getCompletionRate();
  const growthPercentage = getGrowthPercentage();
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <Animated.View entering={FadeIn} style={[styles.container, style]}>
      <TouchableOpacity
        onPress={onViewDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header with Gradient Background */}
        <LinearGradient
          colors={[designTokens.colors.primary[600], designTokens.colors.primary[700]]}
          style={styles.header}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" space="sm">
              <MaterialCommunityIcons 
                name="chart-line" 
                size={28} 
                color={designTokens.colors.text.inverse} 
              />
              <VStack>
                <RTLText style={styles.headerTitle}>הסטטיסטיקות שלי</RTLText>
                <RTLText style={styles.headerSubtitle}>
                  {stats.totalBookings} הזמנות כולל
                </RTLText>
              </VStack>
            </HStack>
            
            <TouchableOpacity>
              <MaterialCommunityIcons 
                name="chevron-left" 
                size={24} 
                color={designTokens.colors.text.inverse} 
              />
            </TouchableOpacity>
          </HStack>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <VStack style={styles.content} space="lg">
          <HStack justifyContent="space-around" alignItems="center">
            {renderStatItem(
              'calendar-check',
              stats.upcomingBookings.toString(),
              'הזמנות קרובות',
              designTokens.colors.primary[600],
              0
            )}
            {renderStatItem(
              'check-circle',
              stats.completedBookings.toString(),
              'הושלמו',
              designTokens.colors.success[600],
              1
            )}
            {renderStatItem(
              'heart',
              stats.favoriteVenues.toString(),
              'מגרשים מועדפים',
              designTokens.colors.error[500],
              2
            )}
          </HStack>

          {/* Financial Stats */}
          <View style={styles.financialStats}>
            <HStack justifyContent="space-between" alignItems="center" marginBottom="md">
              <VStack>
                <RTLText style={styles.spentAmount}>
                  {stats.currency}{stats.totalSpent.toLocaleString()}
                </RTLText>
                <RTLText style={styles.spentLabel}>סך כל ההוצאות</RTLText>
              </VStack>
              
              <View style={[
                styles.growthBadge,
                { backgroundColor: growthPercentage >= 0 ? designTokens.colors.success[100] : designTokens.colors.error[100] }
              ]}>
                <MaterialCommunityIcons 
                  name={growthPercentage >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={growthPercentage >= 0 ? designTokens.colors.success[600] : designTokens.colors.error[600]}
                />
                <RTLText style={[
                  styles.growthText,
                  { color: growthPercentage >= 0 ? designTokens.colors.success[600] : designTokens.colors.error[600] }
                ]}>
                  {Math.abs(growthPercentage).toFixed(0)}%
                </RTLText>
              </View>
            </HStack>
          </View>

          {/* Performance Metrics */}
          <VStack space="md">
            <RTLText style={styles.sectionTitle}>ביצועים</RTLText>
            
            {renderProgressStat(
              'שיעור השלמת הזמנות',
              stats.completedBookings,
              stats.completedBookings + stats.cancelledBookings,
              designTokens.colors.success[500],
              0
            )}
            
            {renderProgressStat(
              'רצף הזמנות נוכחי',
              stats.currentStreak,
              stats.longestStreak || 30,
              designTokens.colors.primary[500],
              1
            )}
          </VStack>

          {/* Insights */}
          <View style={styles.insights}>
            <RTLText style={styles.sectionTitle}>תובנות</RTLText>
            <VStack space="sm">
              <HStack alignItems="center" space="sm">
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={20} 
                  color={designTokens.colors.text.secondary} 
                />
                <RTLText style={styles.insightText}>
                  אתה בדרך כלל מזמין ב-{stats.preferredTime}
                </RTLText>
              </HStack>
              
              <HStack alignItems="center" space="sm">
                <MaterialCommunityIcons 
                  name="star" 
                  size={20} 
                  color={designTokens.colors.warning[500]} 
                />
                <RTLText style={styles.insightText}>
                  המגרש המועדף: {stats.mostBookedVenue.name} ({stats.mostBookedVenue.count} פעמים)
                </RTLText>
              </HStack>
              
              <HStack alignItems="center" space="sm">
                <MaterialCommunityIcons 
                  name="thumb-up" 
                  size={20} 
                  color={designTokens.colors.success[500]} 
                />
                <RTLText style={styles.insightText}>
                  דירוג ממוצע: {stats.avgRating.toFixed(1)}/5.0
                </RTLText>
              </HStack>
            </VStack>
          </View>

          {/* Achievements Preview */}
          {achievements.length > 0 && (
            <View style={styles.achievements}>
              <HStack justifyContent="space-between" alignItems="center" marginBottom="md">
                <RTLText style={styles.sectionTitle}>הישגים</RTLText>
                <TouchableOpacity onPress={onViewAchievements}>
                  <RTLText style={styles.viewAllText}>
                    הצג הכל ({unlockedAchievements}/{achievements.length})
                  </RTLText>
                </TouchableOpacity>
              </HStack>
              
              <VStack space="sm">
                {achievements.slice(0, 3).map((achievement, index) => 
                  renderAchievement(achievement, index)
                )}
              </VStack>
            </View>
          )}
        </VStack>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.card,
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.lg,
  },
  header: {
    padding: designTokens.spacing.lg,
  },
  headerTitle: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.inverse,
    opacity: 0.9,
  },
  content: {
    padding: designTokens.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: designTokens.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  statValue: {
    fontSize: designTokens.typography.sizes.xxl,
    fontWeight: designTokens.typography.weights.bold,
  },
  statLabel: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
  financialStats: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
  },
  spentAmount: {
    fontSize: designTokens.typography.sizes.xxxl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  spentLabel: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.full,
  },
  growthText: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    marginLeft: designTokens.spacing.xs,
  },
  sectionTitle: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.text.primary,
  },
  progressItem: {
    marginBottom: designTokens.spacing.md,
  },
  progressLabel: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    fontWeight: designTokens.typography.weights.medium,
  },
  progressValue: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.secondary,
    fontWeight: designTokens.typography.weights.semibold,
  },
  progressBar: {
    height: 8,
    backgroundColor: designTokens.colors.secondary[200],
    borderRadius: designTokens.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: designTokens.borderRadius.full,
  },
  insights: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
  },
  insightText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.text.primary,
    flex: 1,
  },
  achievements: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
  },
  viewAllText: {
    fontSize: designTokens.typography.sizes.md,
    color: designTokens.colors.primary[600],
    fontWeight: designTokens.typography.weights.medium,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.sm,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: designTokens.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designTokens.spacing.md,
  },
  achievementTitle: {
    fontSize: designTokens.typography.sizes.md,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.text.primary,
  },
  achievementTitleLocked: {
    color: designTokens.colors.text.tertiary,
  },
  achievementDescription: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: designTokens.spacing.xs,
  },
  achievementProgressText: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.text.secondary,
    marginLeft: designTokens.spacing.sm,
    minWidth: 40,
  },
});