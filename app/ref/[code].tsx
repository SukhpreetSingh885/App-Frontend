import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

export default function ReferralLinkScreen() {
  const { code } =
    useLocalSearchParams<{
      code?: string;
    }>();

  useEffect(() => {
    if (!code) {
      router.replace("/auth/register");
      return;
    }

    router.replace({
      pathname: "/auth/register",
      params: {
        referralCode: code,
      },
    });
  }, [code]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>
        Opening referral...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  text: {
    marginTop: 12,
    fontSize: 16,
  },
});