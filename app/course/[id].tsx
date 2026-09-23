import { useCallback, useEffect, useState } from "react";
import type { Course, CourseModule } from "@/types/course";
import {
  Alert,
  Image,
  Modal,
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
  useLocalSearchParams,
} from "expo-router";
import { getCourseById } from "@/services/course.service";
import { isCourseEnrolled } from "@/services/enrollment";
import { getCourseProgress } from "@/services/progress";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type CourseDetails = Pick<
  Course,
  "id" | "title" | "description" | "instructor" | "category"
> &
  Partial<Omit<Course, "id" | "title" | "description" | "instructor" | "category" | "modules">> & {
    modules?: CourseModule[];
  };

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [saved, setSaved] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [lockedLessonModalVisible, setLockedLessonModalVisible] =
    useState(false);
  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        if (!id) {
          throw new Error("Missing course ID");
        }

        const data = await getCourseById(id);

        if (!data) {
          throw new Error("Course not found");
        }

        if (active) {
          setCourse(data as CourseDetails);
        }
      } catch (error) {
        console.error("Course loading error:", error);

        if (active) {
          setCourse(null);
          setLoadFailed(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const checkEnrollment = async () => {
        if (!course) {
          if (active) {
            setEnrolled(false);
            setCourseCompleted(false);
            setCompletedLessonIds([]);
            setCheckingEnrollment(false);
          }

          return;
        }

        setCheckingEnrollment(true);

    const courseId = course._id ?? course.id;

const result = await isCourseEnrolled(courseId);

if (!result) {
  if (active) {
    setEnrolled(false);
    setCompletedLessonIds([]);
    setCourseCompleted(false);
    setCheckingEnrollment(false);
  }

  return;
}

const progress =
  await getCourseProgress(courseId);

const lessonIds =
  course.modules?.flatMap((module) =>
    module.lessons.map((lesson) => lesson.id)
  ) ?? [];

if (active) {
  setEnrolled(true);

  setCompletedLessonIds(
    progress.completedLessonIds,
  );

  setCourseCompleted(
    lessonIds.length > 0 &&
      lessonIds.every((lessonId) =>
        progress.completedLessonIds.includes(
          lessonId,
        ),
      ),
  );

  setCheckingEnrollment(false);
}
      };

      checkEnrollment();

      return () => {
        active = false;
      };
    }, [course?.id])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>
            Loading course...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadFailed || !course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />

          <Text style={styles.notFoundTitle}>
            Course not found
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const price = course.price ?? 0;
  const originalPrice = course.originalPrice ?? 0;
  const rating = course.rating ?? 0;
  const students = course.students ?? 0;
  const duration = course.duration ?? "Not available";
  const language = course.language ?? "Not available";
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const thumbnailSource = course.thumbnail
    ? { uri: course.thumbnail }
    : require("@/assets/images/home.png");
  const discount = originalPrice > 0
    ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
    : 0;

  const totalLessons =
    modules.reduce(
      (total, module) => total + (module.lessons?.length ?? 0),
      0
    );
  const lessonCount = course.lessons ?? totalLessons;
const completedLessons =
  enrolled
    ? completedLessonIds.length
    : 0;
  const progressPercentage =
    totalLessons > 0
      ? Math.min((completedLessons / totalLessons) * 100, 100)
      : 0;
  const progressWidth: `${number}%` = `${progressPercentage}%`;

  const handlePreview = () => {
router.push(`/course/preview/${course._id ?? course.id}`)
  };

  const handleCertificate = () => {
    router.push({
      pathname: "/certificate/[courseId]",
     params: { courseId: course._id ?? course.id },
    });
  };

  const handleLockedLessonEnroll = () => {
    setLockedLessonModalVisible(false);
    router.push({
      pathname: "/enroll/[id]",
   params: { id: course._id ?? course.id },
    });
  };

const handleEnroll = async () => {
  if (enrolled) {
    const progress = await getCourseProgress(course.id);
    const savedLesson = course.modules
      ?.flatMap((module) => module.lessons)
      .find((lesson) => lesson.id === progress.lastLessonId);
    const lessonToOpen = savedLesson ??
      course.modules?.[0]?.lessons?.[0];

    if (!lessonToOpen) {
      Alert.alert(
        "No Lessons",
        "This course does not have any lessons yet."
      );
      return;
    }

    router.push({
      pathname: "/learn/[courseId]/[lessonId]",
      params: {
      courseId: course._id ?? course.id,
        lessonId: lessonToOpen.id,
      },
    });

    return;
  }

  router.push({
    pathname: "/enroll/[id]",
    params: {
    id: course._id ?? course.id,
    },
  });
};
const handleLessonPress = (
  lessonId: string,
  isPreview?: boolean
) => {
  if (enrolled) {
    router.push({
      pathname: "/learn/[courseId]/[lessonId]",
      params: {
        courseId: course._id ?? course.id,
        lessonId,
      },
    });

    return;
  }
    if (isPreview) {
   router.push(`/course/preview/${course._id ?? course.id}`);

      return;
    }

    setLockedLessonModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}

        <View style={styles.topBar}>
          <Pressable
            style={styles.iconBtn}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.topTitle}>
            Course Details
          </Text>

          <Pressable
            style={styles.iconBtn}
            onPress={() => setSaved(!saved)}
          >
            <Ionicons
              name={
                saved
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={22}
              color={
                saved
                  ? COLORS.primary
                  : COLORS.text
              }
            />
          </Pressable>
        </View>

        {/* Course Image */}

        <View style={styles.imageContainer}>
          <Image
            source={thumbnailSource}
            style={styles.heroImage}
          />

          <Pressable
            style={styles.playButton}
            onPress={handlePreview}
          >
            <Ionicons
              name="play"
              size={26}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Category */}

          <Text style={styles.category}>
            {course.category}
          </Text>

          {/* Course Title */}

          <Text style={styles.title}>
            {course.title}
          </Text>

          {/* Instructor */}

          <View style={styles.instructorRow}>
            <View style={styles.instructorAvatar}>
              <Ionicons
                name="person"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.instructorLabel}>
                Instructor
              </Text>

              <Text style={styles.instructorName}>
                {course.instructor}
              </Text>
            </View>
          </View>

          {/* Stats */}

          <View style={styles.statsCard}>
            <Stat
              icon="star"
              label={rating.toString()}
            />

            <View style={styles.divider} />

            <Stat
              icon="people-outline"
              label={students.toString()}
            />

            <View style={styles.divider} />

            <Stat
              icon="play-circle-outline"   
              label={lessonCount.toString()}
            />
          </View>

          {/* About */}

          <Text style={styles.sectionTitle}>
            About this course
          </Text>

          <Text style={styles.description}>
            {course.description}
          </Text>

          {/* Price */}

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{price}
              </Text>

              <Text style={styles.oldPrice}>
                ₹{originalPrice}
              </Text>

              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {discount}% OFF
                </Text>
              </View>
            </View>
          </View>

          {/* Preview */}

          {!enrolled && (
            <Pressable
              style={({ pressed }) => [
                styles.previewBtn,
                pressed && styles.pressed,
              ]}
              onPress={handlePreview}
            >
              <Ionicons
                name="play-circle-outline"
                size={22}
                color={COLORS.primary}
              />

              <Text style={styles.previewText}>
                Watch Free Preview
              </Text>
            </Pressable>
          )}

          {/* What You'll Learn */}

          <Text style={styles.sectionTitle}>
            What you'll learn
          </Text>

          {[
            "Practical concepts explained step by step",
            "Real-world examples and projects",
            "Structured lessons you can follow at your pace",
            "Build practical skills through video lessons",
          ].map((item) => (
            <View
              key={item}
              style={styles.bulletRow}
            >
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={COLORS.success}
              />

              <Text style={styles.bulletText}>
                {item}
              </Text>
            </View>
          ))}

          {/* Course Progress */}

          <Text style={styles.sectionTitle}>
            Course Progress
          </Text>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: progressWidth },
                  ]}
                />
              </View>

              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>

            <Text style={styles.progressSummary}>
              {completedLessons} / {totalLessons} lessons completed
            </Text>
          </View>

          {/* Curriculum */}

          <View style={styles.curriculumHeader}>
            <Text style={styles.sectionTitle}>
              Course Curriculum
            </Text>

            <Text style={styles.curriculumSummary}>
              {lessonCount} lessons •{" "}
              {duration}
            </Text>
          </View>

          {modules.map(
            (module, moduleIndex) => (
              <View
                key={module.id}
                style={styles.moduleCard}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleNumber}>
                    <Text
                      style={styles.moduleNumberText}
                    >
                      {moduleIndex + 1}
                    </Text>
                  </View>

                  <View
                    style={styles.moduleTitleArea}
                  >
                    <Text
                      style={styles.moduleLabel}
                    >
                      MODULE {moduleIndex + 1}
                    </Text>

                    <Text
                      style={styles.moduleTitle}
                    >
                      {module.title}
                    </Text>
                  </View>

                  <Text style={styles.moduleCount}>
                    {module.lessons.length} lessons
                  </Text>
                </View>

                <View style={styles.lessonList}>
                  {module.lessons.map(
                    (lesson, lessonIndex) => {
             const completed =
  enrolled &&
  completedLessonIds.includes(
    lesson.id,
  );
                      const unlocked =
                        lesson.isPreview ||
                        enrolled;

                      return (
                        <Pressable
                          key={lesson.id}
                          onPress={() =>
                            handleLessonPress(
                              lesson.id,
                              lesson.isPreview
                            )
                          }
                          style={({
                            pressed,
                          }) => [
                            styles.lessonRow,

                            lessonIndex ===
                              module.lessons
                                .length -
                                1 &&
                              styles.lessonRowLast,

                            pressed &&
                              styles.lessonPressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.lessonIcon,
                              unlocked &&
                                styles.previewLessonIcon,
                              completed && styles.completedLessonIcon,
                            ]}
                          >
                            <Ionicons
                              name={
                                completed
                                  ? "checkmark"
                                  : unlocked
                                  ? "play"
                                  : "lock-closed"
                              }
                              size={17}
                              color={
                                completed
                                  ? "#FFFFFF"
                                  : unlocked
                                  ? COLORS.primary
                                  : COLORS.muted
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.lessonContent
                            }
                          >
                            <Text
                              style={
                                styles.lessonTitle
                              }
                            >
                              {lesson.title}
                            </Text>

                            <View
                              style={
                                styles.lessonMeta
                              }
                            >
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color={
                                  COLORS.muted
                                }
                              />

                              <Text
                                style={
                                  styles.lessonDuration
                                }
                              >
                                {lesson.duration}
                              </Text>
                            </View>
                          </View>

                          {lesson.isPreview ? (
                            <View
                              style={
                                styles.freeBadge
                              }
                            >
                              <Text
                                style={
                                  styles.freeText
                                }
                              >
                                FREE
                              </Text>
                            </View>
                          ) : enrolled ? (
                            <Ionicons
                              name={completed ? "checkmark-circle" : "play-circle-outline"}
                              size={20}
                              color={completed ? COLORS.success : COLORS.primary}
                            />
                          ) : (
                            <Ionicons
                              name="lock-closed-outline"
                              size={18}
                              color={COLORS.muted}
                            />
                          )}
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>
            )
          )}

          {/* Course Information */}

          <Text style={styles.sectionTitle}>
            Course information
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="person-outline"
              label="Instructor"
              value={course.instructor}
            />

            <InfoRow
              icon="time-outline"
              label="Duration"
              value={duration}
            />

            <InfoRow
              icon="play-circle-outline"
              label="Lessons"
              value={lessonCount.toString()}
            />

            <InfoRow
              icon="language-outline"
              label="Language"
              value={language}
              last
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>
            {enrolled
              ? "Enrollment"
              : "Course price"}
          </Text>

          <Text style={styles.bottomPrice}>
            {enrolled
              ? "Enrolled"
              : `₹${price}`}
          </Text>
        </View>

        <Pressable
          disabled={checkingEnrollment}
          style={({ pressed }) => [
            styles.enrollBtn,
            pressed && styles.pressed,
            checkingEnrollment &&
              styles.disabledButton,
          ]}
          onPress={enrolled && courseCompleted ? handleCertificate : handleEnroll}
        >
          <Text style={styles.enrollText}>
            {checkingEnrollment
              ? "Checking..."
              : enrolled
                ? courseCompleted
                  ? "Get Certificate"
                  : "Start Learning"
                : "Enroll Now"}
          </Text>

          {!checkingEnrollment && (
            <Ionicons
              name={
                enrolled
                  ? courseCompleted
                    ? "ribbon-outline"
                    : "play"
                  : "arrow-forward"
              }
              size={19}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>

      <Modal
        visible={lockedLessonModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLockedLessonModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.lockedModal}>
            <View style={styles.lockedModalIcon}>
              <Ionicons
                name="lock-closed"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.lockedModalTitle}>
              Lesson Locked
            </Text>

            <Text style={styles.lockedModalMessage}>
              Enroll in this course to access this lesson.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalEnrollButton,
                pressed && styles.pressed,
              ]}
              onPress={handleLockedLessonEnroll}
            >
              <Text style={styles.modalEnrollButtonText}>
                Enroll Now
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancelButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setLockedLessonModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={18}
        color={COLORS.primary}
      />

      <Text style={styles.statText}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
      ]}
    >
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.primary}
        />

        <Text style={styles.infoLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 110,
  },

  topBar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  topTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
  },

  imageContainer: {
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: 230,
    backgroundColor: COLORS.softBlue,
  },

  playButton: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },

  content: {
    padding: SPACING.md,
  },

  category: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 4,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    marginTop: 8,
  },

  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },

  instructorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  instructorLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  instructorName: {
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 2,
  },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    marginTop: 20,
  },

  stat: {
    alignItems: "center",
    gap: 6,
  },

  statText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 12,
  },

  description: {
    color: COLORS.muted,
    lineHeight: 23,
    fontSize: 15,
  },

  priceSection: {
    marginTop: 22,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  price: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },

  oldPrice: {
    color: COLORS.muted,
    fontSize: 16,
    textDecorationLine: "line-through",
  },

  discountBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  discountText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "800",
  },

  previewBtn: {
    marginTop: 18,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  previewText: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  bulletRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },

  bulletText: {
    flex: 1,
    color: COLORS.text,
    lineHeight: 21,
  },

  curriculumHeader: {
    marginTop: 4,
  },

  progressCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 16,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  progressTrack: {
    flex: 1,
    height: 10,
    overflow: "hidden",
    backgroundColor: COLORS.border,
    borderRadius: 999,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },

  progressPercentage: {
    minWidth: 40,
    color: COLORS.text,
    fontWeight: "800",
    textAlign: "right",
  },

  progressSummary: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 12,
  },

  curriculumSummary: {
    color: COLORS.muted,
    marginTop: -6,
    marginBottom: 14,
    fontSize: 13,
  },

  moduleCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: 14,
  },

  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.softBlue,
  },

  moduleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  moduleNumberText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  moduleTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  moduleLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  moduleTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
    marginTop: 2,
  },

  moduleCount: {
    color: COLORS.muted,
    fontSize: 11,
  },

  lessonList: {
    paddingHorizontal: 14,
  },

  lessonRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },

  lessonRowLast: {
    borderBottomWidth: 0,
  },

  lessonPressed: {
    opacity: 0.65,
  },

  lessonIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  previewLessonIcon: {
    backgroundColor: COLORS.softBlue,
  },

  completedLessonIcon: {
    backgroundColor: COLORS.success,
  },

  lessonContent: {
    flex: 1,
  },

  lessonTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  lessonDuration: {
    color: COLORS.muted,
    fontSize: 12,
  },

  freeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },

  freeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "900",
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  infoLabel: {
    color: COLORS.muted,
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    color: COLORS.text,
    fontWeight: "700",
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  bottomLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },

  bottomPrice: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },

  enrollBtn: {
    flex: 1,
    maxWidth: 220,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
  },

  enrollText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  notFoundTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },

  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    marginTop: 20,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },

  lockedModal: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 24,
  },

  lockedModalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  lockedModalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
  },

  lockedModalMessage: {
    color: COLORS.muted,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  modalEnrollButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
  },

  modalEnrollButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  modalCancelButton: {
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginTop: 10,
  },

  modalCancelButtonText: {
    color: COLORS.text,
    fontWeight: "800",
  },
});
