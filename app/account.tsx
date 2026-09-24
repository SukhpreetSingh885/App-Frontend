import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";
import {
  getMyProfile,
  sendEmailChangeOtp,
  updateMyProfile,
  verifyEmailChangeOtp,
  type ProfileUser,
} from "@/services/users";

type EmailStep =
  | "idle"
  | "email"
  | "otp";

export default function AccountScreen() {
  const {
    logout,
    refreshUser,
  } = useAuth();

  const [profile, setProfile] =
    useState<ProfileUser | null>(null);

  const [name, setName] =
    useState("");

  const [newEmail, setNewEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [emailStep, setEmailStep] =
    useState<EmailStep>("idle");

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isSavingName,
    setIsSavingName,
  ] = useState(false);

  const [
    isSendingOtp,
    setIsSendingOtp,
  ] = useState(false);

  const [
    isVerifyingOtp,
    setIsVerifyingOtp,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const loadProfile = async () => {
    try {
      setError("");

      const result =
        await getMyProfile();

      setProfile(result);
      setName(result.name ?? "");
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        (requestError.status === 401 ||
          requestError.status === 404)
      ) {
        await logout();
        router.replace("/auth/login");
        return;
      }

      setError(
        "Unable to load account information.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const initials = useMemo(() => {
    const value =
      profile?.name?.trim();

    if (!value) {
      return "VA";
    }

    const parts = value
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }, [profile?.name]);

  const mobile = useMemo(() => {
    if (!profile) {
      return "";
    }

    if (profile.phoneNumber) {
      return profile.phoneNumber;
    }

    if (
      profile.countryCode &&
      profile.mobile
    ) {
      return `${profile.countryCode}${profile.mobile}`;
    }

    return profile.mobile ?? "";
  }, [profile]);

  const getErrorMessage = (
    requestError: unknown,
    fallback: string,
  ) => {
    if (
      requestError instanceof ApiError
    ) {
      return requestError.message;
    }

    if (
      requestError instanceof Error
    ) {
      return requestError.message;
    }

    return fallback;
  };

  const handleSaveName = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      Alert.alert(
        "Invalid name",
        "Please enter at least 2 characters.",
      );
      return;
    }

    if (
      trimmedName ===
      profile?.name?.trim()
    ) {
      return;
    }

    try {
      setIsSavingName(true);

      const updated =
        await updateMyProfile(
          trimmedName,
        );

      setProfile(updated);
      setName(updated.name);

      await refreshUser();

      Alert.alert(
        "Name updated",
        "Your name has been updated successfully.",
      );
    } catch (requestError) {
      Alert.alert(
        "Unable to update name",
        getErrorMessage(
          requestError,
          "Please try again.",
        ),
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const startEmailChange = () => {
    setNewEmail("");
    setOtp("");
    setEmailStep("email");
  };

  const cancelEmailChange = () => {
    setNewEmail("");
    setOtp("");
    setEmailStep("idle");
  };

  const handleSendOtp = async () => {
    const email =
      newEmail
        .trim()
        .toLowerCase();

    if (!email) {
      Alert.alert(
        "Email required",
        "Enter your new email address.",
      );
      return;
    }

    if (
      email ===
      profile?.email
        ?.trim()
        .toLowerCase()
    ) {
      Alert.alert(
        "Same email",
        "Enter an email different from your current email.",
      );
      return;
    }

    try {
      setIsSendingOtp(true);

      await sendEmailChangeOtp(
        email,
      );

      setNewEmail(email);
      setOtp("");
      setEmailStep("otp");

      Alert.alert(
        "OTP sent",
        "A verification code has been sent to your new email address.",
      );
    } catch (requestError) {
      Alert.alert(
        "Unable to send OTP",
        getErrorMessage(
          requestError,
          "Please try again.",
        ),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

 const handleVerifyOtp = async () => {
  const code = otp.trim();

  if (code.length !== 6) {
    Alert.alert(
      "Invalid OTP",
      "Enter the 6-digit verification code.",
    );
    return;
  }

  try {
    setIsVerifyingOtp(true);

    await verifyEmailChangeOtp(
      newEmail,
      code,
    );

    const refreshed =
      await getMyProfile();

    setProfile(refreshed);
    setName(refreshed.name);

    setNewEmail("");
    setOtp("");
    setEmailStep("idle");

    Alert.alert(
      "Email updated",
      "Your email address has been changed successfully.",
    );
  } catch (requestError) {
    Alert.alert(
      "Unable to verify OTP",
      getErrorMessage(
        requestError,
        "Please check the code and try again.",
      ),
    );
  } finally {
    setIsVerifyingOtp(false);
  }
};

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={styles.loadingText}
          >
            Loading account...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={COLORS.text}
              />
            </Pressable>

            <View
              style={styles.headerText}
            >
              <Text style={styles.title}>
                Account
              </Text>

              <Text
                style={styles.subtitle}
              >
                Manage your account details
              </Text>
            </View>
          </View>

          {error ? (
            <View
              style={styles.errorBox}
            >
              <Text
                style={styles.errorText}
              >
                {error}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setIsLoading(true);
                  void loadProfile();
                }}
              >
                <Text
                  style={styles.retryText}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {profile ? (
            <>
              <View
                style={styles.identity}
              >
                <View
                  style={styles.avatar}
                >
                  <Text
                    style={styles.initials}
                  >
                    {initials}
                  </Text>
                </View>

                <View
                  style={
                    styles.identityText
                  }
                >
                  <Text
                    style={
                      styles.identityName
                    }
                  >
                    {profile.name}
                  </Text>

                  <Text
                    style={
                      styles.identityLabel
                    }
                  >
                    Student Account
                  </Text>
                </View>
              </View>

              <View
                style={styles.section}
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Personal Details
                </Text>

                <Text
                  style={styles.label}
                >
                  Name
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={
                    COLORS.muted
                  }
                  style={styles.input}
                  autoCapitalize="words"
                  editable={
                    !isSavingName
                  }
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    isSavingName
                      ? styles.disabledButton
                      : null,
                  ]}
                  onPress={
                    handleSaveName
                  }
                  disabled={
                    isSavingName
                  }
                  activeOpacity={0.85}
                >
                  {isSavingName ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Save Name
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={styles.section}
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Email Address
                </Text>

                <View
                  style={styles.detailRow}
                >
                  <View
                    style={
                      styles.detailIcon
                    }
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.detailContent
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Current email
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {profile.email}
                    </Text>
                  </View>
                </View>

                {emailStep ===
                "idle" ? (
                  <TouchableOpacity
                    style={
                      styles.outlineButton
                    }
                    onPress={
                      startEmailChange
                    }
                    activeOpacity={0.85}
                  >
                    <Text
                      style={
                        styles.outlineButtonText
                      }
                    >
                      Change Email
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {emailStep ===
                "email" ? (
                  <View
                    style={
                      styles.emailForm
                    }
                  >
                    <Text
                      style={styles.label}
                    >
                      New email
                    </Text>

                    <TextInput
                      value={newEmail}
                      onChangeText={
                        setNewEmail
                      }
                      placeholder="Enter new email"
                      placeholderTextColor={
                        COLORS.muted
                      }
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={
                        !isSendingOtp
                      }
                    />

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        isSendingOtp
                          ? styles.disabledButton
                          : null,
                      ]}
                      onPress={
                        handleSendOtp
                      }
                      disabled={
                        isSendingOtp
                      }
                      activeOpacity={0.85}
                    >
                      {isSendingOtp ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                        />
                      ) : (
                        <Text
                          style={
                            styles.primaryButtonText
                          }
                        >
                          Send OTP
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.cancelButton
                      }
                      onPress={
                        cancelEmailChange
                      }
                      disabled={
                        isSendingOtp
                      }
                    >
                      <Text
                        style={
                          styles.cancelText
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {emailStep ===
                "otp" ? (
                  <View
                    style={
                      styles.emailForm
                    }
                  >
                    <Text
                      style={
                        styles.otpInfo
                      }
                    >
                      Enter the 6-digit
                      code sent to{" "}
                      {newEmail}
                    </Text>

                    <Text
                      style={styles.label}
                    >
                      Verification code
                    </Text>

                    <TextInput
                      value={otp}
                      onChangeText={(
                        value,
                      ) =>
                        setOtp(
                          value
                            .replace(
                              /\D/g,
                              "",
                            )
                            .slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      placeholderTextColor={
                        COLORS.muted
                      }
                      style={[
                        styles.input,
                        styles.otpInput,
                      ]}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={
                        !isVerifyingOtp
                      }
                    />

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        isVerifyingOtp
                          ? styles.disabledButton
                          : null,
                      ]}
                      onPress={
                        handleVerifyOtp
                      }
                      disabled={
                        isVerifyingOtp
                      }
                      activeOpacity={0.85}
                    >
                      {isVerifyingOtp ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                        />
                      ) : (
                        <Text
                          style={
                            styles.primaryButtonText
                          }
                        >
                          Verify & Change
                          Email
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.cancelButton
                      }
                      onPress={
                        cancelEmailChange
                      }
                      disabled={
                        isVerifyingOtp
                      }
                    >
                      <Text
                        style={
                          styles.cancelText
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <View
                style={styles.section}
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Mobile Number
                </Text>

                <View
                  style={styles.detailRow}
                >
                  <View
                    style={
                      styles.detailIcon
                    }
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.detailContent
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Registered mobile
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {mobile ||
                        "No mobile number available"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.readOnlyBadge
                    }
                  >
                    <Text
                      style={
                        styles.readOnlyText
                      }
                    >
                      Read only
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.muted,
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.muted,
    marginTop: 3,
  },

  identity: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 22,
    paddingHorizontal: 4,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },

  identityText: {
    flex: 1,
    marginLeft: 14,
  },

  identityName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },

  identityLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },

  section: {
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 16,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor:
      COLORS.background,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
  },

  primaryButton: {
    minHeight: 50,
    borderRadius: RADIUS.lg,
    backgroundColor:
      COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  outlineButton: {
    minHeight: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor:
      COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },

  emailForm: {
    marginTop: 18,
  },

  otpInfo: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },

  otpInput: {
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: "800",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  cancelText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },

  readOnlyBadge: {
    backgroundColor:
      COLORS.softBlue,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginLeft: 8,
  },

  readOnlyText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  errorBox: {
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginTop: 20,
  },

  errorText: {
    color: COLORS.text,
    fontSize: 14,
  },

  retryText: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },
});