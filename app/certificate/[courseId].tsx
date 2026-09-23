import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getCourseById } from "@/data/courses";
import { getCourseProgress } from "@/services/progress";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

export default function CertificateScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = getCourseById(courseId);
  const [completedCourseId, setCompletedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadCertificate = async () => {
        setLoading(true);
        setCompletedCourseId(null);

        if (!course) {
          if (active) setLoading(false);
          return;
        }

        const progress = await getCourseProgress(course.id);
        const lessons = course.modules?.flatMap((module) => module.lessons) ?? [];
        const totalLessons = lessons.length;
        const completed = totalLessons > 0 && lessons.every((lesson) =>
          progress.completedLessonIds.includes(lesson.id)
        );

        if (active) {
          setCompletedCourseId(completed ? course.id : null);
          setLoading(false);
        }
      };

      loadCertificate();

      return () => {
        active = false;
      };
    }, [course])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const completionDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Course Certificate</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!course ? (
          <View style={styles.message}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.muted} />
            <Text style={styles.messageTitle}>Course not found</Text>
          </View>
        ) : loading ? (
          <View style={styles.message}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.messageText}>Loading certificate...</Text>
          </View>
        ) : completedCourseId !== course.id ? (
          <View style={styles.message}>
            <Ionicons name="lock-closed-outline" size={48} color={COLORS.primary} />
            <Text style={styles.messageTitle}>Certificate Locked</Text>
            <Text style={styles.messageText}>
              Complete all lessons to unlock your certificate.
            </Text>
          </View>
        ) : (
          <View style={styles.certificate}>
            <View style={styles.certificateInner}>
              <Text style={styles.brand}>Viralstan Academy</Text>
              <Text style={styles.tagline}>Learn Skills. Build Your Future.</Text>

              <View style={styles.seal}>
                <Ionicons name="ribbon" size={44} color={COLORS.secondary} />
              </View>
              <Text style={styles.eyebrow}>CERTIFICATE OF</Text>
              <Text style={styles.certificateTitle}>Completion</Text>
              <Text style={styles.description}>This certificate is presented to</Text>
              <Text style={styles.studentName}>Student Name</Text>
              <View style={styles.nameDivider} />
              <Text style={styles.description}>for successfully completing</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>

              <View style={styles.status}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.statusText}>100% complete</Text>
              </View>

              <View style={styles.details}>
                <Text style={styles.detailLabel}>INSTRUCTOR</Text>
                <Text style={styles.detailValue}>{course.instructor}</Text>
                <Text style={styles.detailLabel}>COMPLETION DATE</Text>
                <Text style={styles.detailValue}>{completionDate}</Text>
                <Text style={styles.detailLabel}>CERTIFICATE ID</Text>
                <Text style={styles.certificateId}>VA-XXXX-XXXX</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: SPACING.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: COLORS.text },
  content: { flexGrow: 1, padding: SPACING.md, paddingBottom: SPACING.xl },
  message: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  messageTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text, textAlign: "center", marginTop: 18 },
  messageText: { color: COLORS.muted, textAlign: "center", lineHeight: 22, marginTop: 12 },
  certificate: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 10,
  },
  certificateInner: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  brand: { color: COLORS.primary, fontSize: 23, fontWeight: "900", textAlign: "center" },
  tagline: { color: COLORS.muted, fontSize: 12, textAlign: "center", marginTop: 6 },
  seal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.softPurple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 20,
  },
  eyebrow: { color: COLORS.secondary, fontSize: 12, fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  certificateTitle: { color: COLORS.primary, fontSize: 34, fontWeight: "900", textAlign: "center", marginTop: 4 },
  description: { color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 22 },
  studentName: { color: COLORS.text, fontSize: 27, fontWeight: "800", textAlign: "center", marginTop: 12 },
  nameDivider: { height: 2, width: "70%", backgroundColor: COLORS.secondary, marginTop: 12 },
  courseTitle: { color: COLORS.text, fontSize: 21, fontWeight: "800", lineHeight: 29, textAlign: "center", marginTop: 12 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18 },
  statusText: { color: COLORS.success, fontWeight: "700", fontSize: 13 },
  details: { alignSelf: "stretch", alignItems: "center", borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 26, paddingTop: 8 },
  detailLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 1.2, fontWeight: "700", marginTop: 18 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: "600", textAlign: "center", marginTop: 5 },
  certificateId: { color: COLORS.muted, fontSize: 12, textAlign: "center", marginTop: 5 },
});
