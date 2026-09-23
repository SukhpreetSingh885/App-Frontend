import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Course } from "@/types/course";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
  course: Partial<Course> & { _id?: string };
  variant?: "default" | "carousel" | "continue";
  completedLessonIds?: string[];
  lastLessonId?: string;
};

export default function CourseCard({
  course,
  variant = "default",
  completedLessonIds = [],
  lastLessonId,
}: Props) {
  const courseId = course._id || course.id || "";
  const imageSource = course.thumbnail
    ? { uri: course.thumbnail }
    : require("@/assets/images/home.png");

  if (variant === "continue") {
    const lessons = course.modules?.flatMap((module) => module.lessons) ?? [];
    const resumeLessonId = lastLessonId ?? lessons[0]?.id;
    const totalLessons = lessons.length || course.lessons || 0;
    const completedCount = lessons.length > 0
      ? lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
      : Math.min(completedLessonIds.length, totalLessons);
    const progress = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;
    const href = resumeLessonId
      ? {
          pathname: "/learn/[courseId]/[lessonId]" as const,
          params: { courseId, lessonId: resumeLessonId },
        }
      : `/course/${courseId}` as const;

    return (
      <Link href={href} asChild>
        <Pressable style={styles.continueCard}>
          {course.thumbnail ? (
            <Image source={{ uri: course.thumbnail }} style={styles.continueImage} />
          ) : (
            <View style={styles.continueImage} />
          )}

          <View style={styles.continueBody}>
            {course.category ? (
              <Text style={styles.continueCategory}>{course.category}</Text>
            ) : null}

            <Text style={styles.continueTitle} numberOfLines={2}>
              {course.title}
            </Text>

            {course.instructor ? (
              <Text style={styles.continueInstructor} numberOfLines={1}>
                {course.instructor}
              </Text>
            ) : null}

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{progress}% complete</Text>
              <Text style={styles.progressCount}>
                {completedCount}/{totalLessons} lessons
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.continueButton}>
              <Ionicons name="play-circle" size={18} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>
                {resumeLessonId ? "Continue Learning" : "View Course"}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  }

  if (variant === "carousel") {
    const details = [course.instructor, course.category]
      .filter(Boolean)
      .join(" · ");

    return (
      <Link href={`/course/${courseId}`} asChild>
        <Pressable style={styles.carouselCard}>
          {course.thumbnail ? (
            <Image source={{ uri: course.thumbnail }} style={styles.carouselImage} />
          ) : (
            <View style={styles.carouselImage} />
          )}

          <View style={styles.carouselBody}>
            <Text style={styles.carouselTitle} numberOfLines={2}>
              {course.title}
            </Text>

            {details ? (
              <Text style={styles.carouselDetails} numberOfLines={1}>
                {details}
              </Text>
            ) : null}

            <View style={styles.carouselFooter}>
              {typeof course.price === "number" ? (
                <Text style={styles.carouselPrice}>
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </Text>
              ) : <View />}

              <View style={styles.carouselButton}>
                <Text style={styles.carouselButtonText}>View Course</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={`/course/${courseId}`} asChild>
      <Pressable style={styles.card}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.category}>{course.category}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.instructor}>{course.instructor}</Text>

          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Ionicons name="star" size={15} color="#F59E0B" />
              <Text style={styles.metaText}>{course.rating ?? 0}</Text>
            </View>
            <Text style={styles.metaText}>{course.lessons ?? 0} lessons</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{course.price ?? 0}</Text>
            <Text style={styles.oldPrice}>₹{course.originalPrice ?? 0}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  continueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  continueImage: {
    width: "100%",
    height: 156,
    backgroundColor: COLORS.softBlue,
  },
  continueBody: {
    padding: 16,
  },
  continueCategory: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  continueTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    marginTop: 5,
  },
  continueInstructor: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  progressText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  progressCount: {
    color: COLORS.muted,
    fontSize: 11,
  },
  progressTrack: {
    height: 7,
    backgroundColor: COLORS.softBlue,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 7,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  continueButton: {
    minHeight: 44,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  carouselCard: {
    width: 264,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  carouselImage: {
    width: "100%",
    height: 144,
    backgroundColor: COLORS.softBlue,
  },
  carouselBody: {
    minHeight: 142,
    padding: 15,
  },
  carouselTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  carouselDetails: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
  },
  carouselPrice: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  carouselFooter: {
    marginTop: "auto",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  carouselButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  carouselButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.softBlue,
  },
  body: {
    padding: 16,
  },
  category: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 24,
  },
  instructor: {
    color: COLORS.muted,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  price: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  oldPrice: {
    color: COLORS.muted,
    textDecorationLine: "line-through",
  },
});
