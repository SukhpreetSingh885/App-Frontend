import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { ApiError, apiRequest } from "@/services/api";
import type { StoredUser } from "@/services/auth.storage";

type ProfileUser = StoredUser & {
  countryCode?: string;
  mobile?: string;
  phoneNumber?: string;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [profile, setProfile] =
    useState<ProfileUser | null>(user);

  const [isLoading, setIsLoading] =
    useState(!user);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

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

        const result =
          await apiRequest<ProfileUser>("/users/me");

        setProfile(result);
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
          "Unable to load profile information.",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [logout, user]);

  const initials = useMemo(() => {
    const name = profile?.name?.trim();

    if (!name) {
      return "VA";
    }

    const parts = name
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

  const menuItems: MenuItem[] = [
    {
  icon: "person-outline",
  label: "Account",
  onPress: () =>
    router.push("/account"),
},
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () =>
        router.push("/notifications"),
    },
    {
      icon: "ribbon-outline",
      label: "Certificates",
      onPress: () =>
    router.push("/certificates"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
    },
    {
      icon: "information-circle-outline",
      label: "About Viralstan Academy",
      onPress: () =>
        router.push("/about"),
    },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Profile
        </Text>

        <Text style={styles.subtitle}>
          Your Viralstan Academy account
        </Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />
            ) : (
              <Text style={styles.initials}>
                {initials}
              </Text>
            )}
          </View>

          <View style={styles.identityText}>
            {isLoading ? (
              <Text style={styles.muted}>
                Loading profile...
              </Text>
            ) : profile ? (
              <>
                <Text style={styles.name}>
                  {profile.name}
                </Text>

                <Text style={styles.accountLabel}>
                  Student Account
                </Text>
              </>
            ) : (
              <Text style={styles.muted}>
                {error}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map(
            (item, index) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                disabled={!item.onPress}
                style={[
                  styles.menuRow,
                  index ===
                  menuItems.length - 1
                    ? styles.lastMenuRow
                    : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.menuText}>
                  {item.label}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.muted}
                />
              </Pressable>
            ),
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoggingOut
              ? styles.disabledButton
              : null,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#FFFFFF"
              />

              <Text style={styles.logoutText}>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
  },

  identity: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 26,
    paddingHorizontal: 4,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: "900",
  },

  identityText: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },

  accountLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },

  muted: {
    color: COLORS.muted,
  },

  menu: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastMenuRow: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  logoutButton: {
    height: 54,
    marginTop: 22,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.65,
  },
});
