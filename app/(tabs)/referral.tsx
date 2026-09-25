import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import {
  getMyReferralCodes,
  MyReferralsResponse,
  ReferralCode,
} from "@/services/referral.service";

import {
  getWalletBalance,
  getWalletTransactions,
  WalletTransaction,
} from "@/services/wallet.service";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";

export default function ReferralScreen() {
  const [data, setData] =
    useState<MyReferralsResponse | null>(null);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [transactions, setTransactions] =
    useState<WalletTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadReferralData =
    useCallback(async () => {
      try {
        setError("");

        const [
          referralResult,
          balanceResult,
          transactionResult,
        ] = await Promise.all([
          getMyReferralCodes(),
          getWalletBalance(),
          getWalletTransactions(),
        ]);

        setData(referralResult);
        setWalletBalance(balanceResult);
        setTransactions(transactionResult);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load referral details",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadReferralData();
    }, [loadReferralData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReferralData();
  };

  const handleShare = async (
    referral: ReferralCode,
  ) => {
    try {
      await Share.share({
        message:
          `Join ViralStan Academy using my referral code ${referral.code}.\n\n` +
          `${referral.link}`,
      });
    } catch {
      setError(
        "Unable to open sharing options",
      );
    }
  };

  const formatDate = (
    date: string,
  ) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatAmount = (amount: number) =>
    `\u20B9${amount.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading referral details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />

          <View style={styles.heroIcon}>
            <Ionicons
              name="gift"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroEyebrow}>
            SHARE THE LEARNING
          </Text>

          <Text style={styles.title}>
            Refer & Earn
          </Text>

          <Text style={styles.subtitle}>
            Invite friends to ViralStan Academy and
            earn rewards when they become eligible.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={COLORS.danger}
              />
            </View>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadReferralData}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!error && data ? (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.overviewMetrics}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconBlue}>
                    <Ionicons
                      name="wallet-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text style={styles.metricLabel}>
                    Wallet balance
                  </Text>

                  <Text style={styles.metricAmount}>
                    {formatAmount(walletBalance)}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <View style={styles.metricIconPurple}>
                    <Ionicons
                      name="sparkles-outline"
                      size={21}
                      color={COLORS.secondary}
                    />
                  </View>

                  <Text style={styles.metricLabel}>
                    Reward per referral
                  </Text>

                  <Text
                    style={[
                      styles.metricAmount,
                      styles.rewardAmount,
                    ]}
                  >
                    {formatAmount(data.rewardAmount)}
                  </Text>
                </View>
              </View>

              <View style={styles.walletActions}>
                <Pressable
                  style={styles.withdrawButton}
                  onPress={() => router.push("/withdraw")}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.withdrawButtonText}>
                    Withdraw
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.historyButton}
                  onPress={() => router.push("/withdrawals")}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={COLORS.primary}
                  />

                  <Text style={styles.historyLink}>
                    Withdrawals
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              How it works
            </Text>

            <View style={styles.stepsCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>Invite</Text>
                <Text style={styles.stepText}>Share your code</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>They join</Text>
                <Text style={styles.stepText}>Friend enrolls</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepTitle}>You earn</Text>
                <Text style={styles.stepText}>Reward is added</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Your Referral Codes
            </Text>

            {data.codes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="lock-closed-outline"
                  size={34}
                  color={COLORS.muted}
                />

                <Text style={styles.emptyTitle}>
                  No referral codes yet
                </Text>

                <Text style={styles.emptyText}>
                  Referral codes become available
                  after you enroll in a course.
                </Text>
              </View>
            ) : (
              data.codes.map((referral) => (
                <View
                  key={referral.code}
                  style={styles.codeCard}
                >
                  <View style={styles.codeHeader}>
                    <View style={styles.codeIcon}>
                      <Ionicons
                        name="ticket-outline"
                        size={21}
                        color={COLORS.secondary}
                      />
                    </View>

                    <View style={styles.codeDetails}>
                      <Text style={styles.codeLabel}>
                        YOUR REFERRAL CODE
                      </Text>

                      <Text style={styles.code}>
                        {referral.code}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.linkBox}>
                    <Ionicons
                      name="link-outline"
                      size={16}
                      color={COLORS.muted}
                    />

                    <Text
                      style={styles.link}
                      numberOfLines={1}
                    >
                      {referral.link}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.shareButton}
                    onPress={() =>
                      handleShare(referral)
                    }
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.shareButtonText}
                    >
                      Share Code
                    </Text>
                  </Pressable>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>
              Earning History
            </Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="receipt-outline"
                  size={34}
                  color={COLORS.muted}
                />

                <Text style={styles.emptyTitle}>
                  No earnings yet
                </Text>

                <Text style={styles.emptyText}>
                  Your referral rewards will
                  appear here after they are
                  credited to your wallet.
                </Text>
              </View>
            ) : (
              <View style={styles.historyCard}>
                {transactions.map(
                  (transaction, index) => (
                    <View
                      key={transaction._id}
                    >
                      <View
                        style={
                          styles.transactionRow
                        }
                      >
                        <View
                          style={
                            styles.transactionIcon
                          }
                        >
                          <Ionicons
                            name={
                              transaction.type ===
                              "credit"
                                ? "arrow-down-outline"
                                : "arrow-up-outline"
                            }
                            size={20}
                            color={
                              transaction.type ===
                              "credit"
                                ? COLORS.success
                                : COLORS.danger
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.transactionInfo
                          }
                        >
                          <Text
                            style={
                              styles.transactionReason
                            }
                          >
                            {transaction.reason}
                          </Text>

                          <Text
                            style={
                              styles.transactionDate
                            }
                          >
                            {formatDate(
                              transaction.createdAt,
                            )}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.transactionAmount,
                            transaction.type ===
                            "credit"
                              ? styles.creditAmount
                              : styles.debitAmount,
                          ]}
                        >
                          {transaction.type ===
                          "credit"
                            ? "+"
                            : "-"}
                          {formatAmount(
                            transaction.amount,
                          )}
                        </Text>
                      </View>

                      {index <
                      transactions.length - 1 ? (
                        <View
                          style={styles.divider}
                        />
                      ) : null}
                    </View>
                  ),
                )}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
  },

  loadingText: {
    color: COLORS.muted,
    marginTop: SPACING.md,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: SPACING.xs,
  },

  subtitle: {
    color: "rgba(255, 255, 255, 0.84)",
    marginTop: SPACING.sm,
    lineHeight: 22,
    maxWidth: 285,
  },

  heroCard: {
    minHeight: 220,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },

  heroCircleLarge: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    right: -65,
    top: -70,
  },

  heroCircleSmall: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(124, 58, 237, 0.34)",
    right: 38,
    bottom: -38,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },

  heroEyebrow: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },

  overviewMetrics: {
    flexDirection: "row",
    paddingBottom: SPACING.md,
  },

  metricItem: {
    flex: 1,
    minWidth: 0,
  },

  metricIconBlue: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  metricIconPurple: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.softPurple,
    alignItems: "center",
    justifyContent: "center",
  },

  metricDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },

  metricLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },

  metricAmount: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },

  walletActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },

  withdrawButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },

  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  historyButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },

  historyLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  rewardAmount: {
    color: COLORS.secondary,
  },

  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepItem: {
    flex: 1,
    alignItems: "center",
  },

  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumberText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  stepLine: {
    flex: 0.45,
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 17,
  },

  stepTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: SPACING.sm,
    textAlign: "center",
  },

  stepText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 2,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  codeIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.softPurple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },

  codeDetails: {
    flex: 1,
  },

  codeLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  code: {
    color: COLORS.secondary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginTop: 2,
  },

  linkBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 11,
    marginTop: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },

  link: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
  },

  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    marginTop: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.sm,
  },

  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: SPACING.sm,
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: SPACING.xs,
  },

  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    overflow: "hidden",
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },

  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },

  transactionInfo: {
    flex: 1,
  },

  transactionReason: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },

  transactionDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },

  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
    marginLeft: SPACING.sm,
  },

  creditAmount: {
    color: COLORS.success,
  },

  debitAmount: {
    color: COLORS.danger,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  errorBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: SPACING.lg,
    alignItems: "center",
  },

  errorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  errorText: {
    color: COLORS.danger,
    textAlign: "center",
  },

  retryButton: {
    alignSelf: "center",
    marginTop: SPACING.sm,
  },

  retryText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
