import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
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
  getEnrolledCourse,
  isCourseEnrolled,
} from "@/services/enrollment";
import {
  getCourseProgress,
  markLessonComplete,
  setLastLesson,
} from "@/services/progress";
import {
  clearVideoPosition,
  getVideoPosition,
  saveVideoPosition,
} from "@/services/videoProgress";
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

export default function LessonPlayerScreen() {
  const {
    courseId,
    lessonId,
    autoplay,
  } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
    autoplay?: string;
  }>();

  const { width } =
    useWindowDimensions();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [enrolled, setEnrolled] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    completedLessons,
    setCompletedLessons,
  ] = useState<string[]>([]);

  const completionCalls = useRef(
    new Map<string, Promise<void>>(),
  );

  const completedIds =
    useRef<string[]>([]);

  const completeCurrentLesson =
    useRef<
      (() => Promise<void>) | null
    >(null);

  const autoplayConsumed =
    useRef<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        return;
      }

      try {
        const data =
          await getEnrolledCourse(
            courseId,
          );

        setCourse(data);
      } catch (error) {
        console.log(
          "Course loading error:",
          error,
        );

        setCourse(null);
      }
    };

    void loadCourse();
  }, [courseId]);

  const lessons = useMemo(() => {
    if (!course?.modules) {
      return [];
    }

    return course.modules.flatMap(
      (module) =>
        module.lessons.map(
          (lesson) => ({
            ...lesson,
            moduleTitle:
              module.title,
          }),
        ),
    );
  }, [course]);

  const currentIndex =
    lessons.findIndex(
      (lesson) =>
        lesson.id === lessonId,
    );

  const currentLesson =
    lessons[currentIndex];

  const previousLesson =
    currentIndex > 0
      ? lessons[
          currentIndex - 1
        ]
      : undefined;

  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      lessons.length - 1
      ? lessons[
          currentIndex + 1
        ]
      : undefined;

  const videoUrl =
    currentLesson?.videoUrl?.trim();

  const youtubeVideoId =
    getYouTubeVideoId(
      videoUrl,
    );

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

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let ended = false;
      let isPlaying = false;
      let lastPosition = 0;
      let saveQueue =
        Promise.resolve();

      const subscriptions: {
        remove(): void;
      }[] = [];

      const queuePositionSave = (
        position: number,
      ) => {
        if (
          !course ||
          !currentLesson ||
          ended ||
          position <= 0
        ) {
          return;
        }

        saveQueue = saveQueue
          .then(() =>
            saveVideoPosition(
              course.id,
              currentLesson.id,
              position,
            ),
          )
          .catch((error) => {
            console.log(
              "Error saving video position:",
              error,
            );
          });
      };

      setLoading(true);
      player.pause();

      const completeLesson =
        async () => {
          if (
            !active ||
            !course ||
            !currentLesson
          ) {
            return;
          }

          const key = `${course.id}/${currentLesson.id}`;

          const pending =
            completionCalls.current.get(
              key,
            );

          if (pending) {
            return pending;
          }

          if (
            completedIds.current.includes(
              currentLesson.id,
            )
          ) {
            return;
          }

          const completion =
            markLessonComplete(
              course.id,
              currentLesson.id,
            )
              .then(() => {
                if (!active) {
                  return;
                }

                completedIds.current = [
                  ...completedIds.current,
                  currentLesson.id,
                ];

                setCompletedLessons([
                  ...completedIds.current,
                ]);
              })
              .catch((error) => {
                completionCalls.current.delete(
                  key,
                );

                throw error;
              });

          completionCalls.current.set(
            key,
            completion,
          );

          return completion;
        };

      completeCurrentLesson.current =
        completeLesson;

      const checkEnrollment =
        async () => {
          if (!course) {
            if (active) {
              setLoading(false);
            }

            return;
          }

          const [
            result,
            progress,
            savedPosition,
          ] = await Promise.all([
            isCourseEnrolled(
              course.id,
            ),
            getCourseProgress(
              course.id,
            ),
            currentLesson
              ? getVideoPosition(
                  course.id,
                  currentLesson.id,
                )
              : Promise.resolve(
                  0,
                ),
          ]);

          if (active) {
            setEnrolled(result);

            completedIds.current =
              progress.completedLessonIds;

            setCompletedLessons(
              progress.completedLessonIds,
            );

            setLoading(false);
          }

          if (
            !active ||
            !result ||
            !currentLesson ||
            !course
          ) {
            return;
          }

          await setLastLesson(
            course.id,
            currentLesson.id,
          );

          if (!active) {
            return;
          }

          if (youtubeVideoId) {
            return;
          }

          if (!directVideoUrl) {
            return;
          }

          await player.replaceAsync(
            directVideoUrl,
          );

          if (!active) {
            return;
          }

          lastPosition =
            savedPosition;

          player.currentTime =
            savedPosition;

          player.timeUpdateEventInterval =
            5;

          subscriptions.push(
            player.addListener(
              "playingChange",
              ({
                isPlaying:
                  playing,
              }) => {
                isPlaying =
                  playing;

                if (
                  !playing &&
                  lastPosition >
                    0
                ) {
                  queuePositionSave(
                    lastPosition,
                  );
                }
              },
            ),
          );

          subscriptions.push(
            player.addListener(
              "timeUpdate",
              ({
                currentTime,
              }) => {
                if (
                  !active ||
                  ended ||
                  !isPlaying
                ) {
                  return;
                }

                lastPosition =
                  currentTime;

                queuePositionSave(
                  currentTime,
                );
              },
            ),
          );

          subscriptions.push(
            player.addListener(
              "playToEnd",
              () => {
                if (
                  !active ||
                  ended
                ) {
                  return;
                }

                ended = true;

                const finishLesson =
                  async () => {
                    try {
                      await saveQueue;

                      await clearVideoPosition(
                        course.id,
                        currentLesson.id,
                      );

                      await completeLesson();

                      if (
                        active &&
                        nextLesson
                      ) {
                        router.replace(
                          {
                            pathname:
                              "/learn/[courseId]/[lessonId]",
                            params: {
                              courseId:
                                course.id,
                              lessonId:
                                nextLesson.id,
                              autoplay:
                                "1",
                            },
                          },
                        );
                      }
                    } catch (
                      error
                    ) {
                      ended = false;

                      console.log(
                        "Error completing lesson:",
                        error,
                      );
                    }
                  };

                void finishLesson();
              },
            ),
          );

          const playbackKey = `${course.id}/${lessonId}`;

          if (
            autoplay === "1" &&
            autoplayConsumed.current !==
              playbackKey
          ) {
            autoplayConsumed.current =
              playbackKey;

            player.play();
          }
        };

      checkEnrollment().catch(
        (error) => {
          if (active) {
            setLoading(false);
          }

          console.log(
            "Error loading lesson:",
            error,
          );
        },
      );

      return () => {
        active = false;

        subscriptions.forEach(
          (subscription) =>
            subscription.remove(),
        );

        if (
          !ended &&
          lastPosition > 0
        ) {
          queuePositionSave(
            lastPosition,
          );
        }

        completeCurrentLesson.current =
          null;
      };
    }, [
      course,
      currentLesson,
      nextLesson,
      lessonId,
      autoplay,
      player,
      youtubeVideoId,
      directVideoUrl,
    ]),
  );

  const handleComplete =
    async () => {
      try {
        await completeCurrentLesson.current?.();
      } catch (error) {
        console.log(
          "Error completing lesson:",
          error,
        );
      }
    };

  const handleYouTubeStateChange =
    useCallback(
      (state: string) => {
        if (
          state !== "ended" ||
          !course ||
          !currentLesson
        ) {
          return;
        }

        const finishLesson =
          async () => {
            try {
              await clearVideoPosition(
                course.id,
                currentLesson.id,
              );

              await completeCurrentLesson.current?.();

              if (nextLesson) {
                router.replace({
                  pathname:
                    "/learn/[courseId]/[lessonId]",
                  params: {
                    courseId:
                      course.id,
                    lessonId:
                      nextLesson.id,
                    autoplay:
                      "1",
                  },
                });
              }
            } catch (error) {
              console.log(
                "Error completing YouTube lesson:",
                error,
              );
            }
          };

        void finishLesson();
      },
      [
        course,
        currentLesson,
        nextLesson,
      ],
    );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const openLesson = (
    targetLessonId: string,
  ) => {
    autoplayConsumed.current =
      null;

    router.replace({
      pathname:
        "/learn/[courseId]/[lessonId]",
      params: {
        courseId,
        lessonId:
          targetLessonId,
        autoplay: "0",
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  if (
    !course ||
    !currentLesson
  ) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.center}
        >
          <Text
            style={
              styles.errorTitle
            }
          >
            Lesson not found
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={
              handleBack
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!enrolled) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.center}
        >
          <Ionicons
            name="lock-closed-outline"
            size={50}
            color={COLORS.muted}
          />

          <Text
            style={
              styles.errorTitle
            }
          >
            Lesson Locked
          </Text>

          <Text
            style={styles.lockText}
          >
            Enroll in this course
            to access this
            lesson.
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.replace(
                `/course/${course.id}`,
              )
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              View Course
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
              styles.iconButton
            }
            onPress={
              handleBack
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <View
            style={
              styles.headerCenter
            }
          >
            <Text
              style={
                styles.headerCourse
              }
              numberOfLines={1}
            >
              {course.title}
            </Text>

            <Text
              style={
                styles.headerLesson
              }
            >
              Lesson{" "}
              {currentIndex + 1}{" "}
              of {lessons.length}
            </Text>
          </View>

          <View
            style={{
              width: 42,
            }}
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
              onChangeState={
                handleYouTubeStateChange
              }
            />
          ) : directVideoUrl ? (
            <VideoView
              player={player}
              style={
                styles.video
              }
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
                Video unavailable
              </Text>
            </View>
          )}
        </View>

        <View
          style={styles.content}
        >
          <Text
            style={
              styles.moduleLabel
            }
          >
            {
              currentLesson.moduleTitle
            }
          </Text>

          <Text
            style={
              styles.lessonTitle
            }
          >
            {
              currentLesson.title
            }
          </Text>

          <View
            style={
              styles.lessonInfo
            }
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={COLORS.muted}
            />

            <Text
              style={
                styles.lessonDuration
              }
            >
              {
                currentLesson.duration
              }
            </Text>
          </View>

          <Pressable
            onPress={
              handleComplete
            }
            disabled={completedLessons.includes(
              currentLesson.id,
            )}
            style={[
              styles.completeButton,
              completedLessons.includes(
                currentLesson.id,
              ) &&
                styles.completedButton,
            ]}
          >
            <Ionicons
              name={
                completedLessons.includes(
                  currentLesson.id,
                )
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={21}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.completeButtonText
              }
            >
              {completedLessons.includes(
                currentLesson.id,
              )
                ? "Completed"
                : "Mark Complete"}
            </Text>
          </Pressable>

          <View
            style={
              styles.navigation
            }
          >
            <Pressable
              disabled={
                !previousLesson
              }
              onPress={() => {
                if (
                  previousLesson
                ) {
                  openLesson(
                    previousLesson.id,
                  );
                }
              }}
              style={[
                styles.previousButton,
                !previousLesson &&
                  styles.disabledButton,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={
                  previousLesson
                    ? COLORS.text
                    : COLORS.muted
                }
              />

              <Text
                style={
                  styles.previousText
                }
              >
                Previous
              </Text>
            </Pressable>

            <Pressable
              disabled={
                !nextLesson
              }
              onPress={() => {
                if (
                  nextLesson
                ) {
                  openLesson(
                    nextLesson.id,
                  );
                }
              }}
              style={[
                styles.nextButton,
                !nextLesson &&
                  styles.disabledNextButton,
              ]}
            >
              <Text
                style={
                  styles.nextText
                }
              >
                {nextLesson
                  ? "Next Lesson"
                  : lessons.every(
                        (
                          lesson,
                        ) =>
                          completedLessons.includes(
                            lesson.id,
                          ),
                      )
                    ? "Course Completed"
                    : "Course End"}
              </Text>

              {nextLesson && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Course Lessons
          </Text>

          {course.modules?.map(
            (
              module,
              moduleIndex,
            ) => (
              <View
                key={module.id}
                style={
                  styles.moduleCard
                }
              >
                <View
                  style={
                    styles.moduleHeader
                  }
                >
                  <Text
                    style={
                      styles.moduleNumber
                    }
                  >
                    Module{" "}
                    {moduleIndex +
                      1}
                  </Text>

                  <Text
                    style={
                      styles.moduleTitle
                    }
                  >
                    {
                      module.title
                    }
                  </Text>
                </View>

                {module.lessons.map(
                  (lesson) => {
                    const active =
                      lesson.id ===
                      lessonId;

                    const completed =
                      completedLessons.includes(
                        lesson.id,
                      );

                    return (
                      <Pressable
                        key={
                          lesson.id
                        }
                        onPress={() =>
                          openLesson(
                            lesson.id,
                          )
                        }
                        style={[
                          styles.lessonRow,
                          active &&
                            styles.activeLesson,
                        ]}
                      >
                        <View
                          style={[
                            styles.lessonIcon,
                            active &&
                              styles.activeLessonIcon,
                          ]}
                        >
                          <Ionicons
                            name={
                              completed
                                ? "checkmark"
                                : active
                                  ? "play"
                                  : "play-outline"
                            }
                            size={
                              16
                            }
                            color={
                              completed
                                ? COLORS.success
                                : active
                                  ? "#FFFFFF"
                                  : COLORS.primary
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.lessonRowContent
                          }
                        >
                          <Text
                            style={[
                              styles.lessonRowTitle,
                              active &&
                                styles.activeLessonText,
                            ]}
                          >
                            {
                              lesson.title
                            }
                          </Text>

                          <Text
                            style={
                              styles.lessonRowDuration
                            }
                          >
                            {
                              lesson.duration
                            }
                          </Text>
                        </View>
                      </Pressable>
                    );
                  },
                )}
              </View>
            ),
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
      paddingBottom: 40,
    },

    header: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal:
        SPACING.md,
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerCenter: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 12,
    },

    headerCourse: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: "800",
    },

    headerLesson: {
      color: COLORS.muted,
      fontSize: 11,
      marginTop: 2,
    },

    videoContainer: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor:
        "#000000",
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

    moduleLabel: {
      color: COLORS.primary,
      fontSize: 12,
      fontWeight: "900",
    },

    lessonTitle: {
      color: COLORS.text,
      fontSize: 25,
      lineHeight: 32,
      fontWeight: "900",
      marginTop: 6,
    },

    lessonInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 10,
    },

    lessonDuration: {
      color: COLORS.muted,
    },

    navigation: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },

    previousButton: {
      flex: 1,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      backgroundColor:
        COLORS.surface,
      borderRadius:
        RADIUS.md,
    },

    previousText: {
      color: COLORS.text,
      fontWeight: "800",
    },

    nextButton: {
      flex: 1,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        COLORS.primary,
      borderRadius:
        RADIUS.md,
    },

    nextText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },

    disabledButton: {
      opacity: 0.4,
    },

    disabledNextButton: {
      opacity: 0.4,
    },

    sectionTitle: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 30,
      marginBottom: 14,
    },

    moduleCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        RADIUS.md,
      overflow: "hidden",
      marginBottom: 14,
    },

    moduleHeader: {
      padding: 14,
      backgroundColor:
        COLORS.softBlue,
    },

    moduleNumber: {
      color: COLORS.primary,
      fontSize: 10,
      fontWeight: "900",
    },

    moduleTitle: {
      color: COLORS.text,
      fontWeight: "800",
      marginTop: 3,
    },

    lessonRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    activeLesson: {
      backgroundColor:
        COLORS.softBlue,
    },

    lessonIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        COLORS.softBlue,
      alignItems: "center",
      justifyContent:
        "center",
    },

    activeLessonIcon: {
      backgroundColor:
        COLORS.primary,
    },

    lessonRowContent: {
      flex: 1,
    },

    lessonRowTitle: {
      color: COLORS.text,
      fontWeight: "700",
    },

    activeLessonText: {
      color: COLORS.primary,
      fontWeight: "900",
    },

    lessonRowDuration: {
      color: COLORS.muted,
      fontSize: 12,
      marginTop: 3,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      padding: 30,
    },

    errorTitle: {
      color: COLORS.text,
      fontSize: 22,
      fontWeight: "900",
      marginTop: 12,
    },

    lockText: {
      color: COLORS.muted,
      textAlign: "center",
      marginTop: 8,
    },

    primaryButton: {
      backgroundColor:
        COLORS.primary,
      borderRadius:
        RADIUS.md,
      paddingHorizontal: 24,
      paddingVertical: 14,
      marginTop: 20,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
    },

    completeButton: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        COLORS.primary,
      paddingVertical: 14,
      borderRadius:
        RADIUS.md,
    },

    completedButton: {
      backgroundColor:
        COLORS.success,
    },

    completeButtonText: {
      color: "#FFFFFF",
      fontWeight: "900",
    },
  });
