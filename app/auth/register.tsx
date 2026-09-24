import {
  Alert,
  Image,
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
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useState } from "react";

import { registerUser } from "@/services/auth.service";
import {
  sendEmailOtp,
  verifyEmailOtp,
} from "@/services/verification.service";

import CountryPicker from "react-native-country-picker-modal";

import {
  AsYouType,
  isValidPhoneNumber,
  type CountryCode as PhoneCountryCode,
} from "libphonenumber-js";

import type {
  CountryCode as PickerCountryCode,
} from "react-native-country-picker-modal";

export default function RegisterScreen() {
  const { referralCode } =
    useLocalSearchParams<{
      referralCode?: string;
    }>();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [countryCode, setCountryCode] =
    useState<PickerCountryCode>("IN");

  const [
    phoneCountryCode,
    setPhoneCountryCode,
  ] = useState<PhoneCountryCode>("IN");

  const [callingCode, setCallingCode] =
    useState("91");

  const [
    countryVisible,
    setCountryVisible,
  ] = useState(false);

  const [nameError, setNameError] =
    useState("");

  const [mobileError, setMobileError] =
    useState("");

  const [emailError, setEmailError] =
    useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [confirmError, setConfirmError] =
    useState("");

  const [emailOtp, setEmailOtp] =
    useState("");

  const [emailOtpSent, setEmailOtpSent] =
    useState(false);

  const [
    emailVerified,
    setEmailVerified,
  ] = useState(false);

  const [
    sendingEmailOtp,
    setSendingEmailOtp,
  ] = useState(false);

  const [
    verifyingEmailOtp,
    setVerifyingEmailOtp,
  ] = useState(false);

  const [registering, setRegistering] =
    useState(false);

  const formatPhoneNumber = (
    value: string,
  ) => {
    const formatter =
      new AsYouType(phoneCountryCode);

    const formatted = formatter.input(
      value.replace(/\D/g, ""),
    );

    setMobile(formatted);
  };

  const handleEmailChange = (
    value: string,
  ) => {
    setEmail(value);

    if (emailVerified || emailOtpSent) {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp("");
    }
  };

  const handleSendEmailOtp = async () => {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError(
        "Please enter your email address",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      setEmailError(
        "Please enter a valid email address",
      );
      return;
    }

    setEmailError("");
    setSendingEmailOtp(true);

    try {
      await sendEmailOtp(normalizedEmail);

      setEmail(normalizedEmail);
      setEmailOtp("");
      setEmailOtpSent(true);
      setEmailVerified(false);

      Alert.alert(
        "OTP Sent",
        "Verification code sent to your email.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send OTP";

      Alert.alert(
        "Unable to send OTP",
        message,
      );
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp =
    async () => {
      if (!/^\d{6}$/.test(emailOtp)) {
        Alert.alert(
          "Invalid OTP",
          "Please enter the 6-digit OTP.",
        );
        return;
      }

      setVerifyingEmailOtp(true);

      try {
        const result =
          await verifyEmailOtp(
            email.trim().toLowerCase(),
            emailOtp,
          );

        if (result.verified) {
          setEmailVerified(true);
          setEmailOtp("");

          Alert.alert(
            "Email Verified",
            "Your email has been verified successfully.",
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to verify OTP";

        Alert.alert(
          "Verification Failed",
          message,
        );
      } finally {
        setVerifyingEmailOtp(false);
      }
    };

  const validate = () => {
    let valid = true;

    setNameError("");
    setMobileError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    if (!name) {
      setNameError(
        "Please enter your name",
      );

      valid = false;
    } else if (
      !/^[A-Za-z ]+$/.test(name)
    ) {
      setNameError(
        "Name should contain only letters",
      );

      valid = false;
    }

    if (!mobile) {
      setMobileError(
        "Please enter your mobile number",
      );

      valid = false;
    } else {
      const phoneNumber =
        `+${callingCode}${mobile.replace(
          /\D/g,
          "",
        )}`;

      if (
        !isValidPhoneNumber(phoneNumber)
      ) {
        setMobileError(
          "Please enter a valid mobile number",
        );

        valid = false;
      }
    }

    if (!email) {
      setEmailError(
        "Please enter your email address",
      );

      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setEmailError(
        "Please enter a valid email address",
      );

      valid = false;
    } else if (!emailVerified) {
      setEmailError(
        "Please verify your email address",
      );

      valid = false;
    }

    if (!password) {
      setPasswordError(
        "Please enter your password",
      );

      valid = false;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
        password,
      )
    ) {
      setPasswordError(
        "Password needs 8 characters, uppercase, lowercase, number and special character",
      );

      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError(
        "Please confirm your password",
      );

      valid = false;
    } else if (
      password !== confirmPassword
    ) {
      setConfirmError(
        "Passwords do not match",
      );

      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    const isValid = validate();

    if (!isValid) {
      return;
    }

    setRegistering(true);

    try {
      await registerUser({
        name,
        email: email.trim().toLowerCase(),
        password,

        mobile: mobile.replace(
          /\D/g,
          "",
        ),

        countryCode:
          `+${callingCode}`,

        referralCode:
          typeof referralCode === "string"
            ? referralCode
            : undefined,
      });

      Alert.alert(
        "Account Created Successfully 🎉",
        "Welcome to Viralstan Academy.\nPlease login to continue learning.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/auth/login",
              ),
          },
        ],
        {
          cancelable: false,
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed";

      if (
        message ===
        "Mobile number already registered"
      ) {
        Alert.alert(
          "Mobile Number Already Registered",
          "Mobile number already registered. Please login or use another number.",
        );
      } else {
        Alert.alert(
          "Registration failed",
          message,
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <Image
          source={require(
            "@/assets/images/headlogo.png"
          )}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Start learning with Viralstan
          Academy
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputBox}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#2563EB"
            />

            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          {nameError ? (
            <Text style={styles.error}>
              {nameError}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Mobile Number
          </Text>

          <View style={styles.inputBox}>
            <TouchableOpacity
              onPress={() =>
                setCountryVisible(true)
              }
              style={
                styles.countryPicker
              }
            >
              <CountryPicker
                countryCode={countryCode}
                withFlag
                withFilter
                withCallingCode
                visible={countryVisible}
                onClose={() =>
                  setCountryVisible(
                    false,
                  )
                }
                onSelect={(country) => {
                  setCountryCode(
                    country.cca2,
                  );

                  setPhoneCountryCode(
                    country.cca2 as PhoneCountryCode,
                  );

                  setCallingCode(
                    country
                      .callingCode[0],
                  );

                  setMobile("");

                  setCountryVisible(
                    false,
                  );
                }}
              />

              <Text
                style={
                  styles.countryCode
                }
              >
                +{callingCode}
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Enter mobile number"
              placeholderTextColor="#94A3B8"
              value={mobile}
              onChangeText={
                formatPhoneNumber
              }
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          {mobileError ? (
            <Text style={styles.error}>
              {mobileError}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
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
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={
                handleEmailChange
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailVerified}
              style={styles.input}
              returnKeyType="next"
            />

            {!emailVerified ? (
              <TouchableOpacity
                onPress={
                  handleSendEmailOtp
                }
                disabled={sendingEmailOtp}
              >
                <Text
                  style={
                    styles.otpButtonText
                  }
                >
                  {sendingEmailOtp
                    ? "Sending..."
                    : emailOtpSent
                      ? "Resend"
                      : "Send OTP"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={
                  styles.verifiedRow
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />

                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verified
                </Text>
              </View>
            )}
          </View>

          {emailError ? (
            <Text style={styles.error}>
              {emailError}
            </Text>
          ) : null}

          {emailOtpSent &&
          !emailVerified ? (
            <View
              style={
                styles.otpContainer
              }
            >
              <View
                style={
                  styles.otpInputBox
                }
              >
                <TextInput
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#94A3B8"
                  value={emailOtp}
                  onChangeText={(value) =>
                    setEmailOtp(
                      value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(0, 6),
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.otpInput}
                />
              </View>

              <TouchableOpacity
                style={
                  styles.verifyButton
                }
                onPress={
                  handleVerifyEmailOtp
                }
                disabled={
                  verifyingEmailOtp
                }
              >
                <Text
                  style={
                    styles.verifyButtonText
                  }
                >
                  {verifyingEmailOtp
                    ? "Verifying..."
                    : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.inputBox}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#2563EB"
            />

            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="next"
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              style={styles.eyeButton}
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

          {passwordError ? (
            <Text style={styles.error}>
              {passwordError}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
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
              placeholder="Re-enter your password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={
                handleRegister
              }
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword,
                )
              }
              style={styles.eyeButton}
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

          {confirmError ? (
            <Text style={styles.error}>
              {confirmError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!emailVerified ||
              registering) &&
              styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={
            !emailVerified ||
            registering
          }
          activeOpacity={0.85}
        >
          <Text
            style={styles.buttonText}
          >
            {registering
              ? "Creating Account..."
              : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push("/auth/login")
          }
          style={styles.loginButton}
        >
          <Text
            style={styles.loginText}
          >
            Already have an account?
            <Text style={styles.link}>
              {" "}
              Login
            </Text>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  logo: {
    width: 200,
    height: 90,
    alignSelf: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 7,
    marginLeft: 4,
  },

  inputBox: {
    minHeight: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  countryCode: {
    color: "#2563EB",
    fontWeight: "700",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  eyeButton: {
    padding: 6,
  },

  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },

  otpButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "800",
    paddingVertical: 10,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  verifiedText: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
  },

  otpContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  otpInputBox: {
    flex: 1,
    minHeight: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
  },

  otpInput: {
    fontSize: 16,
    color: "#111827",
    paddingHorizontal: 15,
    paddingVertical: 12,
    letterSpacing: 2,
  },

  verifyButton: {
    minWidth: 92,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  button: {
    height: 58,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  loginButton: {
    alignSelf: "center",
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748B",
    fontSize: 15,
  },

  link: {
    color: "#2563EB",
    fontWeight: "800",
  },
});