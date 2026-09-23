import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
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
  if (isLoading) return;

  // Wait until Expo Router is ready
  if (!rootNavigationState?.key) return;

  if (sessionValidationError) {
    void SplashScreen.hideAsync();
    return;
  }

  const isAuthRoute = segments[0] === "auth";
if (!isAuthenticated && !isAuthRoute) {
  return router.replace("/auth/login");
}

if (isAuthenticated && isAuthRoute) {
  return router.replace("/(tabs)");
}

  void SplashScreen.hideAsync();

}, [
  isAuthenticated,
  isLoading,
  segments,
  sessionValidationError,
  rootNavigationState?.key,
]);
if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

  if (sessionValidationError) {
    return (
      <View style={styles.sessionCheckContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.sessionCheckTitle}>Unable to verify your account</Text>
        <Text style={styles.sessionCheckMessage}>
          Check your internet connection and try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => void retrySessionValidation()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
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
  loadingContainer: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F5F8FF",
},
});
