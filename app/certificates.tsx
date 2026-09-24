import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  CertificateRecord,
  getMyCertificates,
} from "@/services/certificates";

import {
  getCourseById,
} from "@/services/course.service";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";

type CertificateItem = {
  certificate: CertificateRecord;
  courseTitle: string;
};

export default function CertificatesScreen() {
  const [items, setItems] =
    useState<CertificateItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadCertificates =
        async () => {
          try {
            setLoading(true);
            setError("");

            const certificates =
              await getMyCertificates();

            const results =
              await Promise.all(
                certificates.map(
                  async (
                    certificate,
                  ) => {
                    try {
                      const course =
                        await getCourseById(
                          certificate.courseId,
                        );

                      return {
                        certificate,
                        courseTitle:
                          course.title,
                      };
                    } catch {
                      return {
                        certificate,
                        courseTitle:
                          "Course Certificate",
                      };
                    }
                  },
                ),
              );

            if (active) {
              setItems(results);
            }
          } catch (requestError) {
            console.log(
              "Certificate loading error:",
              requestError,
            );

            if (active) {
              setError(
                "Unable to load certificates.",
              );
            }
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        };

      void loadCertificates();

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          My Certificates
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading certificates...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />

          <Text style={styles.emptyTitle}>
            Unable to load
          </Text>

          <Text style={styles.emptyText}>
            {error}
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="ribbon-outline"
              size={34}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No certificates yet
          </Text>

          <Text style={styles.emptyText}>
            Complete all lessons in a course
            to earn your certificate.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.subtitle}>
            Certificates you have earned
            from completed courses.
          </Text>

          {items.map(
            ({
              certificate,
              courseTitle,
            }) => (
              <Pressable
                key={certificate._id}
                style={({ pressed }) => [
                  styles.card,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname:
                      "/certificate/[courseId]",
                    params: {
                      courseId:
                        certificate.courseId,
                    },
                  })
                }
              >
                <View
                  style={
                    styles.certificateIcon
                  }
                >
                  <Ionicons
                    name="ribbon"
                    size={26}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.cardContent
                  }
                >
                  <Text
                    style={
                      styles.courseTitle
                    }
                    numberOfLines={2}
                  >
                    {courseTitle}
                  </Text>

                  <Text
                    style={
                      styles.certificateNumber
                    }
                  >
                    {
                      certificate.certificateNumber
                    }
                  </Text>

                  <Text
                    style={styles.date}
                  >
                    Issued{" "}
                    {new Date(
                      certificate.issuedAt,
                    ).toLocaleDateString()}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={COLORS.muted}
                />
              </Pressable>
            ),
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: 30,
  },

  subtitle: {
    color: COLORS.muted,
    marginBottom: 18,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },

  certificateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.softBlue,
  },

  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },

  courseTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  certificateNumber: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },

  date: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    color: COLORS.muted,
    marginTop: 12,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.softBlue,
    marginBottom: 16,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.7,
  },
});