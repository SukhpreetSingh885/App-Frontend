import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useFocusEffect,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import CourseCard from "@/components/CourseCard";
import EmptyLearning from "@/components/EmptyLearning";

import {
  getCourses,
} from "@/services/course.service";

import {
  getEnrollments,
} from "@/services/enrollment";

import {
  getCourseProgress,
} from "@/services/progress";

import type { Course } from "@/types/course";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "@/constants/theme";


export default function LearningScreen() {

  const [enrolledIds, setEnrolledIds] =
    useState<string[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [progressMap, setProgressMap] =
    useState<Record<string, number>>({});

  const [lessonMap, setLessonMap] =
    useState<Record<string, string | undefined>>({});

  const [loading, setLoading] =
    useState(true);



  useFocusEffect(
    useCallback(() => {

      let active = true;


      const loadLearning = async () => {

        try {

          setLoading(true);


          const ids =
            await getEnrollments();


          const allCourses =
            await getCourses();


          const newProgressMap:
            Record<string, number> = {};


          const newLessonMap:
            Record<string, string | undefined> = {};



          for (const courseId of ids) {


            const course =
              allCourses.find(
                (item) =>
                  item.id === courseId
              );


            if (!course) {
              continue;
            }



            const progress =
              await getCourseProgress(
                course.id,
              );



            const lessons =
              course.modules?.flatMap(
                (module) =>
                  module.lessons,
              ) ?? [];



            const totalLessons =
              lessons.length;



            const completedLessons =
              lessons.filter(
                (lesson) =>
                  progress.completedLessonIds.includes(
                    lesson.id,
                  ),
              ).length;



            const percentage =
              totalLessons > 0
                ? completedLessons === totalLessons
                  ? 100
                  : Math.min(
                      99,
                      Math.round(
                        (completedLessons /
                          totalLessons) *
                          100,
                      ),
                    )
                : 0;



            newProgressMap[course.id] =
              percentage;



            newLessonMap[course.id] =
              (
                lessons.find(
                  (lesson) =>
                    lesson.id ===
                    progress.lastLessonId,
                ) ??
                lessons[0]
              )?.id;

          }



          if (active) {

            setCourses(allCourses);

            setEnrolledIds(ids);

            setProgressMap(
              newProgressMap,
            );

            setLessonMap(
              newLessonMap,
            );

          }


        } catch (error) {

          console.log(
            "Learning loading error:",
            error,
          );

        } finally {

          if (active) {
            setLoading(false);
          }

        }

      };


      loadLearning();


      return () => {
        active = false;
      };


    }, []),
  );



  const enrolledCourses =
    courses.filter(
      (course) =>
        enrolledIds.includes(
          course.id,
        ),
    );



  return (

    <SafeAreaView style={styles.safe}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <Text style={styles.title}>
          My Learning
        </Text>


        <Text style={styles.subtitle}>
          Continue learning from your enrolled courses.
        </Text>



        {!loading &&
        enrolledCourses.length === 0 ? (

          <EmptyLearning />

        ) : (

          <View>

            {enrolledCourses.map(
              (course) => {

                const progress =
                  progressMap[course.id] || 0;


                const completed =
                  progress === 100;


                const lessonId =
                  lessonMap[course.id];



                return (

                  <View
                    key={course.id}
                    style={styles.learningItem}
                  >

                    <CourseCard
                      course={course}
                    />


                    <View
                      style={styles.progressHeader}
                    >

                      <Text
                        style={styles.progressLabel}
                      >

                        {
                          completed
                            ? "✓ Course Completed"
                            : "Course Progress"
                        }

                      </Text>


                      <Text
                        style={styles.progressValue}
                      >

                        {
                          completed
                            ? "Progress: 100%"
                            : `${progress}%`
                        }

                      </Text>

                    </View>



                    <View
                      style={styles.progressTrack}
                    >

                      <View
                        style={[
                          styles.progressFill,
                          {
                            width:
                              `${progress}%`,
                          },
                        ]}
                      />

                    </View>



                    <Pressable
                      disabled={
                        loading ||
                        (!completed && !lessonId)
                      }

                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed &&
                        styles.actionDimmed,
                      ]}


                      onPress={() => {

                        if (completed) {

                          router.push({
                            pathname:
                              "/certificate/[courseId]",

                            params: {
                              courseId:
                                course.id,
                            },

                          });


                        } else if (lessonId) {

                          router.push({

                            pathname:
                              "/learn/[courseId]/[lessonId]",

                            params: {
                              courseId:
                                course.id,

                              lessonId,

                            },

                          });

                        }

                      }}
                    >

                      <Ionicons
                        name={
                          completed
                            ? "ribbon-outline"
                            : "play"
                        }

                        size={19}

                        color="#FFFFFF"
                      />


                      <Text
                        style={styles.actionText}
                      >

                        {
                          completed
                            ? "Get Certificate"
                            : "Continue Learning"
                        }

                      </Text>


                    </Pressable>


                  </View>

                );

              },
            )}

          </View>

        )}

      </ScrollView>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe:{
    flex:1,
    backgroundColor:COLORS.background,
  },

  content:{
    padding:SPACING.md,
    paddingBottom:30,
  },

  title:{
    fontSize:28,
    fontWeight:"900",
    color:COLORS.text,
  },

  subtitle:{
    color:COLORS.muted,
    marginTop:6,
    marginBottom:20,
  },

  learningItem:{
    marginBottom:24,
  },

  progressHeader:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:4,
  },

  progressLabel:{
    color:COLORS.muted,
    fontSize:13,
  },

  progressValue:{
    color:COLORS.primary,
    fontWeight:"900",
  },

  progressTrack:{
    height:8,
    backgroundColor:COLORS.border,
    borderRadius:999,
    marginTop:8,
    overflow:"hidden",
  },

  progressFill:{
    height:"100%",
    backgroundColor:COLORS.primary,
  },

  actionButton:{
    backgroundColor:COLORS.primary,
    borderRadius:RADIUS.md,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:8,
    paddingVertical:14,
    marginTop:14,
  },

  actionText:{
    color:"#FFFFFF",
    fontWeight:"800",
  },

  actionDimmed:{
    opacity:0.7,
  },

});