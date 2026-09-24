import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import {
  getMyWithdrawals,
  type Withdrawal,
  type WithdrawalStatus,
} from "@/services/withdrawal.service";

const STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: "#FEF3C7",
  processing: COLORS.softBlue,
  paid: "#DCFCE7",
  failed: "#FEE2E2",
  rejected: "#FEE2E2",
};

export default function WithdrawalsScreen() {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      setError("");
      setItems(await getMyWithdrawals());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load withdrawals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>Withdrawal history</Text>
          <Text style={styles.subtitle}>Track your payout requests.</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, !items.length && styles.emptyList]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.amount}>₹{item.amount.toLocaleString("en-IN")}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              <Text style={styles.method}>{item.payoutMethod === "upi" ? "UPI" : "Bank Account"}{item.payoutDestination ? ` · ${item.payoutDestination}` : ""}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
              {(item.status === "failed" || item.status === "rejected") && item.failureReason ? (
                <Text style={styles.reason}>Reason: {item.failureReason}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="cash-outline" size={40} color={COLORS.muted} /><Text style={styles.emptyTitle}>No withdrawal requests</Text><Text style={styles.subtitle}>Your requests will appear here.</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface, gap: SPACING.sm },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  title: { color: COLORS.text, fontSize: 22, fontWeight: "900" },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  error: { color: COLORS.danger, textAlign: "center", padding: SPACING.md },
  list: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  amount: { color: COLORS.text, fontSize: 20, fontWeight: "900" },
  method: { color: COLORS.text, fontWeight: "700", marginTop: SPACING.sm },
  date: { color: COLORS.muted, fontSize: 12, marginTop: SPACING.xs },
  reason: { color: COLORS.danger, fontSize: 13, marginTop: SPACING.sm },
  badge: { borderRadius: 999, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  badgeText: { color: COLORS.text, fontSize: 11, fontWeight: "900" },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900", marginTop: SPACING.sm },
});
