import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

import {
  resetForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "@/services/auth.service";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const normalizeEmail = () =>
    email.trim().toLowerCase();

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (otpSent || otpVerified) {
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = normalizeEmail();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await sendForgotPasswordOtp(
          normalizedEmail,
        );

      setOtpSent(true);

      Alert.alert(
        "OTP Sent",
        response.message,
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to send OTP",
        error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await verifyForgotPasswordOtp(
          normalizeEmail(),
          otp.trim(),
        );

      if (response.verified) {
        setOtpVerified(true);

        Alert.alert(
          "Verified",
          "OTP verified successfully.",
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Verification failed",
        error?.message ||
          "Invalid or expired OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert(
        "Missing password",
        "Please enter your new password.",
      );
      return;
    }

    const passwordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
        newPassword,
      );

    if (!passwordValid) {
      Alert.alert(
        "Weak password",
        "Password needs 8 characters, uppercase, lowercase, number and special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both passwords are the same.",
      );
      return;
    }

    try {
      setLoading(true);

      await resetForgotPassword(
        normalizeEmail(),
        newPassword,
      );

      Alert.alert(
        "Password Reset",
        "Your password has been reset successfully.",
        [
          {
            text: "Login",
            onPress: () =>
              router.replace("/auth/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Reset failed",
        error?.message ||
          "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Ionicons
            name="lock-closed-outline"
            size={36}
            color="#2563EB"
          />
        </View>

        <Text style={styles.title}>
          Forgot Password?
        </Text>

        <Text style={styles.subtitle}>
          Enter your registered email address and
          we'll send you a verification code.
        </Text>

        <Text style={styles.label}>
          Email Address
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="mail-outline"
            size={22}
            color="#2563EB"
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!otpVerified}
          />
        </View>

        {!otpVerified && (
          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.disabled,
            ]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {otpSent && !otpVerified && (
          <>
            <Text style={styles.label}>
              Verification Code
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="key-outline"
                size={22}
                color="#2563EB"
              />

              <TextInput
                style={styles.input}
                placeholder="6-digit OTP"
                value={otp}
                onChangeText={(value) =>
                  setOtp(
                    value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  )
                }
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.disabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  Verify OTP
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {otpVerified && (
          <>
            <View style={styles.verifiedBox}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#16A34A"
              />

              <Text style={styles.verifiedText}>
                Email verified
              </Text>
            </View>

            <Text style={styles.label}>
              New Password
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#2563EB"
              />

              <TextInput
                style={styles.input}
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Confirm Password
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#2563EB"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.disabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() =>
            router.replace("/auth/login")
          }
        >
          <Text style={styles.loginLink}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
  },

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 35,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 8,
  },

  inputBox: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111827",
  },

  button: {
    height: 58,
    backgroundColor: "#2563EB",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.65,
  },

  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  verifiedText: {
    color: "#15803D",
    fontWeight: "700",
    marginLeft: 8,
  },

  loginLink: {
    textAlign: "center",
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
});