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
import { useFocusEffect } from "expo-router";

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Text style={styles.title}>
          Refer & Earn
        </Text>

        <Text style={styles.subtitle}>
          Invite friends to ViralStan Academy
          and earn rewards when they become
          eligible students.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
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
            <View style={styles.walletCard}>
              <View style={styles.walletIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={28}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text style={styles.walletLabel}>
                  Wallet Balance
                </Text>

                <Text style={styles.walletAmount}>
                  ₹{walletBalance}
                </Text>
              </View>
            </View>

            <View style={styles.rewardCard}>
              <Ionicons
                name="gift-outline"
                size={42}
                color={COLORS.secondary}
              />

              <Text style={styles.rewardTitle}>
                Your Referral Reward
              </Text>

              <Text style={styles.rewardAmount}>
                ₹{data.rewardAmount}
              </Text>

              <Text style={styles.rewardText}>
                You can earn this reward for an
                eligible successful referral.
              </Text>
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
                  <Text style={styles.codeLabel}>
                    Referral Code
                  </Text>

                  <Text style={styles.code}>
                    {referral.code}
                  </Text>

                  <Text
                    style={styles.link}
                    numberOfLines={1}
                  >
                    {referral.link}
                  </Text>

                  <Pressable
                    style={styles.shareButton}
                    onPress={() =>
                      handleShare(referral)
                    }
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
                          ₹{transaction.amount}
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
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.muted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    lineHeight: 21,
  },

  walletCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },

  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  walletLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  walletAmount: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },

  rewardCard: {
    backgroundColor: COLORS.softPurple,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: "center",
  },

  rewardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: SPACING.sm,
  },

  rewardAmount: {
    color: COLORS.secondary,
    fontSize: 34,
    fontWeight: "900",
    marginTop: SPACING.xs,
  },

  rewardText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: SPACING.xs,
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

  codeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  code: {
    color: COLORS.secondary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: SPACING.xs,
  },

  link: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: SPACING.sm,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: SPACING.md,
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