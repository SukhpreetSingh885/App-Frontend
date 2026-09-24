import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack, router, useRootNavigationState, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey={
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
      }
    >
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </StripeProvider>
  );
}

function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
    retrySessionValidation,
    sessionValidationError,
  } = useAuth();

  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!rootNavigationState?.key) {
      return;
    }

    if (sessionValidationError) {
      void SplashScreen.hideAsync();
      return;
    }

    const isAuthRoute = segments[0] === "auth";

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/auth/login");
      void SplashScreen.hideAsync();
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/(tabs)");
      void SplashScreen.hideAsync();
      return;
    }

    void SplashScreen.hideAsync();
  }, [
    isAuthenticated,
    isLoading,
    rootNavigationState?.key,
    segments,
    sessionValidationError,
  ]);

  if (sessionValidationError) {
    return (
      <View style={styles.sessionCheckContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.sessionCheckTitle}>
          Unable to verify your account
        </Text>

        <Text style={styles.sessionCheckMessage}>
          Check your internet connection and try again.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            void retrySessionValidation()
          }
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="account" />
        <Stack.Screen name="about" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="withdrawals" />

        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="course/preview/[id]" />

        <Stack.Screen name="enroll/[id]" />
        <Stack.Screen name="payment/[id]" />

        <Stack.Screen name="learn/[courseId]/[lessonId]" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  sessionCheckContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F8FF",
  },

  sessionCheckTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  sessionCheckMessage: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
  },

  retryButton: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 28,
    paddingVertical: 14,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
