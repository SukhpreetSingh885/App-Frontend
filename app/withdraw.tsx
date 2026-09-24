import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { getWalletBalance } from "@/services/wallet.service";
import {
  createWithdrawal,
  getMyWithdrawals,
  getWithdrawalSettings,
  type PayoutMethod,
  type Withdrawal,
  type WithdrawalSettings,
} from "@/services/withdrawal.service";

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function WithdrawScreen() {
  const [balance, setBalance] = useState(0);
  const [settings, setSettings] =
    useState<WithdrawalSettings | null>(null);
  const [history, setHistory] =
    useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] =
    useState<PayoutMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] =
    useState("");
  const [bankAccountNumber, setBankAccountNumber] =
    useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [nextBalance, nextSettings, nextHistory] =
        await Promise.all([
          getWalletBalance(),
          getWithdrawalSettings(),
          getMyWithdrawals(),
        ]);
      setBalance(nextBalance);
      setSettings(nextSettings);
      setHistory(nextHistory);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load withdrawal details",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const numericAmount = Number(amount);
  const validationError = useMemo(() => {
    if (!settings) return "Withdrawal settings are unavailable.";
    if (!settings.withdrawalsEnabled) {
      return "Withdrawals are currently disabled.";
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Enter a valid withdrawal amount.";
    }
    if (numericAmount < settings.minimumWithdrawalAmount) {
      return `Minimum withdrawal is ${money(settings.minimumWithdrawalAmount)}.`;
    }
    if (numericAmount > balance) {
      return "Amount exceeds your available balance.";
    }
    if (method === "upi" && !upiId.trim()) {
      return "Enter your UPI ID.";
    }
    if (
      method === "bank" &&
      (!accountHolderName.trim() ||
        !bankAccountNumber.trim() ||
        !ifscCode.trim())
    ) {
      return "Complete all bank account details.";
    }
    return "";
  }, [
    accountHolderName,
    balance,
    bankAccountNumber,
    ifscCode,
    method,
    numericAmount,
    settings,
    upiId,
  ]);

  const submit = async () => {
    if (submitting || validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await createWithdrawal(
        method === "upi"
          ? {
              amount: numericAmount,
              payoutMethod: "upi",
              upiId: upiId.trim(),
            }
          : {
              amount: numericAmount,
              payoutMethod: "bank",
              accountHolderName:
                accountHolderName.trim(),
              bankAccountNumber:
                bankAccountNumber.trim(),
              ifscCode:
                ifscCode.trim().toUpperCase(),
            },
      );

      setSuccess(
        "Withdrawal requested. Payment will be reviewed and handled externally.",
      );
      setAmount("");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create withdrawal request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Loading withdrawal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Withdraw earnings</Text>
              <Text style={styles.muted}>Request a payout from your referral wallet.</Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.label}>Available balance</Text>
            <Text style={styles.balance}>{money(balance)}</Text>
            <Text style={styles.muted}>
              Minimum withdrawal: {money(settings?.minimumWithdrawalAmount ?? 0)}
            </Text>
          </View>

          {!settings?.withdrawalsEnabled ? (
            <View style={styles.notice}>
              <Text style={styles.errorText}>Withdrawals are currently disabled.</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payout details</Text>
            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={(value) => {
                setAmount(value);
                setError("");
                setSuccess("");
              }}
              placeholder="0"
              keyboardType="decimal-pad"
              editable={!submitting && settings?.withdrawalsEnabled}
            />

            <Text style={styles.fieldLabel}>Payout method</Text>
            <View style={styles.selector}>
              {(["upi", "bank"] as PayoutMethod[]).map((item) => (
                <Pressable
                  key={item}
                  style={[styles.selectorButton, method === item && styles.selectorActive]}
                  onPress={() => {
                    setMethod(item);
                    setError("");
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.selectorText, method === item && styles.selectorTextActive]}>
                    {item === "upi" ? "UPI" : "Bank Account"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {method === "upi" ? (
              <>
                <Text style={styles.fieldLabel}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="name@bank"
                  autoCapitalize="none"
                  editable={!submitting}
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Account holder name</Text>
                <TextInput style={styles.input} value={accountHolderName} onChangeText={setAccountHolderName} editable={!submitting} />
                <Text style={styles.fieldLabel}>Account number</Text>
                <TextInput style={styles.input} value={bankAccountNumber} onChangeText={setBankAccountNumber} keyboardType="number-pad" secureTextEntry editable={!submitting} />
                <Text style={styles.fieldLabel}>IFSC</Text>
                <TextInput style={styles.input} value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" editable={!submitting} />
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Review request</Text>
            <View style={styles.summaryRow}><Text style={styles.muted}>Withdrawal amount</Text><Text style={styles.summaryValue}>{money(Number.isFinite(numericAmount) ? numericAmount : 0)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.muted}>Available balance</Text><Text style={styles.summaryValue}>{money(balance)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.muted}>Payout method</Text><Text style={styles.summaryValue}>{method === "upi" ? "UPI" : "Bank Account"}</Text></View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Pressable
            style={[styles.submitButton, (submitting || !!validationError) && styles.disabled]}
            disabled={submitting || !!validationError}
            onPress={() => void submit()}
          >
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Request withdrawal</Text>}
          </Pressable>

          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent requests</Text>
            <Pressable onPress={() => router.push("/withdrawals")}>
              <Text style={styles.link}>View all</Text>
            </Pressable>
          </View>
          {history.slice(0, 3).map((item) => (
            <View key={item._id} style={styles.historyItem}>
              <View><Text style={styles.summaryValue}>{money(item.amount)}</Text><Text style={styles.muted}>{item.payoutMethod === "upi" ? "UPI" : "Bank Account"}</Text></View>
              <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            </View>
          ))}
          {!history.length ? <Text style={styles.muted}>No withdrawal requests yet.</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.sm },
  header: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
  headerCopy: { flex: 1, marginLeft: SPACING.sm },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surface },
  title: { color: COLORS.text, fontSize: 24, fontWeight: "900" },
  muted: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  balanceCard: { backgroundColor: COLORS.softBlue, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  label: { color: COLORS.muted, fontWeight: "700" },
  balance: { color: COLORS.text, fontSize: 34, fontWeight: "900", marginVertical: SPACING.xs },
  notice: { padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.danger, marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  fieldLabel: { color: COLORS.text, fontSize: 13, fontWeight: "800", marginTop: SPACING.md, marginBottom: SPACING.xs },
  input: { minHeight: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, color: COLORS.text, backgroundColor: COLORS.background },
  selector: { flexDirection: "row", gap: SPACING.sm },
  selectorButton: { flex: 1, padding: 13, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  selectorActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectorText: { color: COLORS.text, fontWeight: "800" },
  selectorTextActive: { color: "#FFFFFF" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.sm },
  summaryValue: { color: COLORS.text, fontWeight: "800" },
  errorText: { color: COLORS.danger, textAlign: "center", marginBottom: SPACING.sm },
  successText: { color: COLORS.success, textAlign: "center", marginBottom: SPACING.sm, fontWeight: "700" },
  submitButton: { minHeight: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.5 },
  submitText: { color: "#FFFFFF", fontWeight: "900" },
  historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.lg, marginBottom: SPACING.sm },
  link: { color: COLORS.primary, fontWeight: "800" },
  historyItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  status: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },
});
