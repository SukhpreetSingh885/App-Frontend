import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";

const ABOUT_DESCRIPTION =
  "Viralstan Academy is an online learning platform designed to provide practical, easy-to-follow courses that help students develop useful skills and learn at their own pace.";

const OFFERINGS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  {
    icon: "book-outline",
    label: "Online Courses",
  },
  {
    icon: "play-circle-outline",
    label: "Video Lessons",
  },
  {
    icon: "trending-up-outline",
    label: "Progress Tracking",
  },
  {
    icon: "ribbon-outline",
    label: "Course Certificates",
  },
  {
    icon: "people-outline",
    label: "Refer & Earn",
  },
];

export default function AboutScreen() {
  const appVersion =
    Constants.expoConfig?.version ?? "Unavailable";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.title}>About</Text>
        </View>

        <View style={styles.brandCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Viralstan Academy logo"
            />
          </View>

          <Text style={styles.brandName}>
            Viralstan Academy
          </Text>

          <Text style={styles.tagline}>
            Learn. Build. Grow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About Viralstan Academy
          </Text>

          <Text style={styles.description}>
            {ABOUT_DESCRIPTION}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What We Offer
          </Text>

          <View style={styles.offerList}>
            {OFFERINGS.map((offering, index) => (
              <View
                key={offering.label}
                style={[
                  styles.offerRow,
                  index === OFFERINGS.length - 1
                    ? styles.lastOfferRow
                    : null,
                ]}
              >
                <View style={styles.offerIcon}>
                  <Ionicons
                    name={offering.icon}
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.offerLabel}>
                  {offering.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.versionRow}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color={COLORS.muted}
          />

          <Text style={styles.versionText}>
            Version {appVersion}
          </Text>
        </View>

        <Text style={styles.footer}>
          © 2026 Viralstan Academy. All rights reserved.
        </Text>
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
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
  },

  brandCard: {
    alignItems: "center",
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
  },

  logoContainer: {
    width: 92,
    height: 92,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 80,
    height: 80,
  },

  brandName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: SPACING.md,
  },

  tagline: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },

  section: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },

  description: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },

  offerList: {
    overflow: "hidden",
  },

  offerRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastOfferRow: {
    borderBottomWidth: 0,
  },

  offerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  offerLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },

  versionText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  footer: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: SPACING.md,
  },
});
