import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { ApiError, apiRequest } from "@/services/api";
import type { StoredUser } from "@/services/auth.storage";

type ProfileUser = StoredUser & {
  countryCode?: string;
  mobile?: string;
  phoneNumber?: string;
};

const items = [
  ["person-outline", "Account"],
  ["notifications-outline", "Notifications"],
  ["help-circle-outline", "Help & Support"],
  ["information-circle-outline", "About Viralstan Academy"],
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(user);
  const [isLoading, setIsLoading] = useState(!user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfile(user);
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        setIsLoading(true);
        setError("");
        setProfile(await apiRequest<ProfileUser>("/users/me"));
      } catch (requestError) {
        if (
          requestError instanceof ApiError &&
          (requestError.status === 401 || requestError.status === 404)
        ) {
          await logout();
          router.replace("/auth/login");
          return;
        }

        setError("Unable to load profile information.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [logout, user]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const phoneNumber = profile?.countryCode && profile.mobile
    ? `${profile.countryCode} ${profile.mobile}`
    : profile?.phoneNumber;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Your Viralstan Academy account
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : profile ? (
              <>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.muted}>{profile.email}</Text>
                <Text style={styles.muted}>{phoneNumber || "Mobile number unavailable"}</Text>
                <Text style={styles.muted}>Role: {profile.role}</Text>
              </>
            ) : (
              <Text style={styles.muted}>{error}</Text>
            )}
          </View>
        </View>

        <View style={styles.menu}>
          {items.map(([icon, label]) => (
            <View key={label} style={styles.menuRow}>
              <Ionicons name={icon as any} size={22} color={COLORS.text} />
              <Text style={styles.menuText}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.text },
  subtitle: { color: COLORS.muted, marginTop: 6, marginBottom: 20 },
  profileCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  muted: { color: COLORS.muted, marginTop: 4 },
  menu: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: { flex: 1, color: COLORS.text, fontWeight: "700" },
  logoutButton: {
    height: 54,
    marginTop: 20,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
