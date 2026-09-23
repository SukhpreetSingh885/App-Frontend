import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  VideoView,
  useVideoPlayer,
} from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCourseById } from "@/services/course.service";
import { isCourseEnrolled } from "@/services/enrollment";
import { getCourseProgress } from "@/services/progress";
import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";
import type { Course } from "@/types/course";

function getYouTubeVideoId(
  videoUrl?: string,
) {
  if (!videoUrl) {
    return null;
  }

  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );

  return match?.[1] ?? null;
}

export default function CoursePreviewScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const { width } =
    useWindowDimensions();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [enrolled, setEnrolled] =
    useState(false);

  const [
    checkingEnrollment,
    setCheckingEnrollment,
  ] = useState(true);

  const [
    courseCompleted,
    setCourseCompleted,
  ] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (!id) {
          return;
        }

        const data =
          await getCourseById(id);

        setCourse(data);
      } catch (error) {
        console.log(
          "Preview course error:",
          error,
        );

        setCourse(null);
      }
    };

    void loadCourse();
  }, [id]);

  const previewLesson =
    useMemo(() => {
      const allLessons =
        course?.modules?.flatMap(
          (module) =>
            module.lessons,
        ) ?? [];

      return (
        allLessons.find(
          (lesson) =>
            lesson.isPreview,
        ) ??
        allLessons[0]
      );
    }, [course]);

  const videoUrl =
    previewLesson?.videoUrl?.trim();

  const youtubeVideoId =
    getYouTubeVideoId(videoUrl);

  const directVideoUrl =
    youtubeVideoId
      ? undefined
      : videoUrl;

  const player = useVideoPlayer(
    null,
    (videoPlayer) => {
      videoPlayer.loop = false;
    },
  );

  useEffect(() => {
    let active = true;

    const loadVideo =
      async () => {
        player.pause();

        if (!directVideoUrl) {
          return;
        }

        try {
          await player.replaceAsync(
            directVideoUrl,
          );

          if (!active) {
            return;
          }
        } catch (error) {
          console.log(
            "Preview video error:",
            error,
          );
        }
      };

    void loadVideo();

  return () => {
  active = false;
};
  }, [
    directVideoUrl,
    player,
  ]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const checkEnrollment =
        async () => {
          if (!course) {
            if (active) {
              setEnrolled(false);
              setCourseCompleted(
                false,
              );
              setCheckingEnrollment(
                false,
              );
            }

            return;
          }

          setCheckingEnrollment(
            true,
          );

          try {
            const courseId =
              course._id ??
              course.id;

            const isEnrolled =
              await isCourseEnrolled(
                courseId,
              );

            let isCompleted =
              false;

            if (isEnrolled) {
              const progress =
                await getCourseProgress(
                  courseId,
                );

              const lessonIds =
                course.modules?.flatMap(
                  (module) =>
                    module.lessons.map(
                      (lesson) =>
                        lesson.id,
                    ),
                ) ?? [];

              isCompleted =
                lessonIds.length >
                  0 &&
                lessonIds.every(
                  (lessonId) =>
                    progress.completedLessonIds.includes(
                      lessonId,
                    ),
                );
            }

            if (active) {
              setEnrolled(
                isEnrolled,
              );

              setCourseCompleted(
                isCompleted,
              );
            }
          } catch (error) {
            console.log(
              "Enrollment check error:",
              error,
            );

            if (active) {
              setEnrolled(false);
              setCourseCompleted(
                false,
              );
            }
          } finally {
            if (active) {
              setCheckingEnrollment(
                false,
              );
            }
          }
        };

      void checkEnrollment();

      return () => {
        active = false;
      };
    }, [course]),
  );

  if (!course) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.notFound}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />

          <Text
            style={
              styles.notFoundTitle
            }
          >
            Course not found
          </Text>

          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleEnroll =
    async () => {
      const courseId =
        course._id ?? course.id;

      if (enrolled) {
        if (courseCompleted) {
          router.push({
            pathname:
              "/certificate/[courseId]",
            params: {
              courseId,
            },
          });

          return;
        }

        try {
          const progress =
            await getCourseProgress(
              courseId,
            );

          const allLessons =
            course.modules?.flatMap(
              (module) =>
                module.lessons,
            ) ?? [];

          const savedLesson =
            allLessons.find(
              (lesson) =>
                lesson.id ===
                progress.lastLessonId,
            );

          const lessonToOpen =
            savedLesson ??
            allLessons[0];

          if (!lessonToOpen) {
            Alert.alert(
              "No Lessons",
              "This course does not have any lessons yet.",
            );

            return;
          }

          router.push({
            pathname:
              "/learn/[courseId]/[lessonId]",
            params: {
              courseId,
              lessonId:
                lessonToOpen.id,
            },
          });
        } catch (error) {
          console.log(
            "Open course error:",
            error,
          );

          Alert.alert(
            "Error",
            "Unable to open the course right now.",
          );
        }

        return;
      }

      router.push({
        pathname:
          "/enroll/[id]",
        params: {
          id: courseId,
        },
      });
    };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.header}
        >
          <Pressable
            style={
              styles.backIcon
            }
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <Text
            style={
              styles.headerTitle
            }
          >
            Course Preview
          </Text>

          <View
            style={
              styles.headerSpace
            }
          />
        </View>

        <View
          style={
            styles.videoContainer
          }
        >
          {youtubeVideoId ? (
            <YoutubePlayer
              height={
                width * (9 / 16)
              }
              videoId={
                youtubeVideoId
              }
            />
          ) : directVideoUrl ? (
            <VideoView
              player={player}
              style={styles.video}
              nativeControls
              contentFit="contain"
              fullscreenOptions={{
                enable: true,
              }}
            />
          ) : (
            <View
              style={
                styles.videoUnavailable
              }
            >
              <Ionicons
                name="videocam-off-outline"
                size={38}
                color={
                  COLORS.muted
                }
              />

              <Text
                style={
                  styles.videoUnavailableText
                }
              >
                Preview video
                unavailable
              </Text>
            </View>
          )}
        </View>

        <View
          style={styles.content}
        >
          <View
            style={
              styles.previewBadge
            }
          >
            <Ionicons
              name="play-circle"
              size={17}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.previewBadgeText
              }
            >
              FREE PREVIEW
            </Text>
          </View>

          <Text
            style={
              styles.courseTitle
            }
          >
            {course.title}
          </Text>

          <Text
            style={
              styles.instructor
            }
          >
            By {course.instructor}
          </Text>

          <View
            style={styles.divider}
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            Preview Lesson
          </Text>

          <View
            style={
              styles.lessonCard
            }
          >
            <View
              style={
                styles.lessonIcon
              }
            >
              <Ionicons
                name="play"
                size={20}
                color={
                  COLORS.primary
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
                {previewLesson?.title ??
                  "Preview Lesson"}
              </Text>

              <Text
                style={
                  styles.lessonDescription
                }
              >
                {previewLesson?.description ??
                  "Watch this preview to learn more about the course."}
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            About this course
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {course.description}
          </Text>

          <View
            style={
              styles.courseInfo
            }
          >
            <Info
              icon="play-circle-outline"
              value={`${course.lessons} Lessons`}
            />

            <Info
              icon="time-outline"
              value={
                course.duration
              }
            />

            <Info
              icon="language-outline"
              value={
                course.language
              }
            />
          </View>

          <View
            style={
              styles.messageCard
            }
          >
            <Ionicons
              name="lock-open-outline"
              size={24}
              color={
                COLORS.secondary
              }
            />

            <View
              style={
                styles.messageContent
              }
            >
              <Text
                style={
                  styles.messageTitle
                }
              >
                This lesson is free
              </Text>

              <Text
                style={
                  styles.messageText
                }
              >
                Enroll in the course
                to access all lessons
                and learning content.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <View>
          <Text
            style={
              styles.priceLabel
            }
          >
            {enrolled
              ? "Enrollment"
              : "Course price"}
          </Text>

          <Text
            style={styles.price}
          >
            {enrolled
              ? "Enrolled"
              : `₹${course.price}`}
          </Text>
        </View>

        <Pressable
          disabled={
            checkingEnrollment
          }
          style={({ pressed }) => [
            styles.enrollButton,
            pressed &&
              styles.pressed,
          ]}
          onPress={handleEnroll}
        >
         <Text
  style={
    styles.enrollText
  }
>
  {checkingEnrollment
    ? "Checking..."
    : enrolled
      ? courseCompleted
        ? "Certificate"
        : "Continue Course"
      : "Enroll Now"}
</Text>

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
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Info({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View
      style={styles.infoItem}
    >
      <Ionicons
        name={icon}
        size={20}
        color={COLORS.primary}
      />

      <Text
        style={styles.infoText}
      >
        {value}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    scrollContent: {
      paddingBottom: 110,
    },

    header: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        SPACING.md,
    },

    backIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        COLORS.surface,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    headerTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: "800",
    },

    headerSpace: {
      width: 42,
    },

    videoContainer: {
      backgroundColor:
        "#000000",
      width: "100%",
      aspectRatio: 16 / 9,
    },

    video: {
      width: "100%",
      height: "100%",
    },

    videoUnavailable: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    videoUnavailableText: {
      color: "#FFFFFF",
      marginTop: 8,
      fontWeight: "700",
    },

    content: {
      padding: SPACING.md,
    },

    previewBadge: {
      alignSelf:
        "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor:
        COLORS.softBlue,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      marginTop: 6,
    },

    previewBadgeText: {
      color: COLORS.primary,
      fontSize: 11,
      fontWeight: "900",
    },

    courseTitle: {
      color: COLORS.text,
      fontSize: 26,
      lineHeight: 33,
      fontWeight: "900",
      marginTop: 14,
    },

    instructor: {
      color: COLORS.muted,
      marginTop: 8,
      fontSize: 14,
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.border,
      marginTop: 22,
    },

    sectionTitle: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 24,
      marginBottom: 12,
    },

    lessonCard: {
      flexDirection: "row",
      gap: 12,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.md,
      padding: 16,
    },

    lessonIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        COLORS.softBlue,
      alignItems: "center",
      justifyContent:
        "center",
    },

    lessonContent: {
      flex: 1,
    },

    lessonTitle: {
      color: COLORS.text,
      fontWeight: "800",
      fontSize: 16,
    },

    lessonDescription: {
      color: COLORS.muted,
      marginTop: 5,
      lineHeight: 20,
    },

    description: {
      color: COLORS.muted,
      fontSize: 15,
      lineHeight: 23,
    },

    courseInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 20,
    },

    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    infoText: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: "700",
    },

    messageCard: {
      flexDirection: "row",
      gap: 12,
      backgroundColor:
        COLORS.softPurple,
      borderRadius:
        RADIUS.md,
      padding: 16,
      marginTop: 26,
    },

    messageContent: {
      flex: 1,
    },

    messageTitle: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: "800",
    },

    messageText: {
      color: COLORS.muted,
      marginTop: 4,
      lineHeight: 20,
    },

    bottom: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor:
        COLORS.surface,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 16,
    },

    priceLabel: {
      color: COLORS.muted,
      fontSize: 11,
    },

    price: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "900",
    },

    enrollButton: {
      flex: 1,
      maxWidth: 220,
      backgroundColor:
        COLORS.primary,
      borderRadius:
        RADIUS.md,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
      gap: 8,
    },

    enrollText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    pressed: {
      opacity: 0.8,
    },

    notFound: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      padding: 30,
    },

    notFoundTitle: {
      color: COLORS.text,
      fontSize: 22,
      fontWeight: "900",
      marginTop: 12,
    },

    backButton: {
      backgroundColor:
        COLORS.primary,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius:
        RADIUS.md,
      marginTop: 20,
    },

    backButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },
  });