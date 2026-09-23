import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getEnrollments } from "@/services/enrollment";
import { getCourseProgress, type CourseProgress } from "@/services/progress";
import { getCourses } from "@/services/course.service";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import SearchBar from "@/components/SearchBar";
import CourseCard from "@/components/CourseCard";
import SectionHeader from "@/components/SectionHeader";
import { router, useFocusEffect } from "expo-router";

const categories = [
  "Development",
  "Design",
  "Marketing",
  "Business",
  "AI",
];

export default function HomeScreen() {

  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] =
    useState<Record<string, CourseProgress>>({});


  useEffect(() => {
    loadCourses();
  }, []);


  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Course loading error:", error);
      setCourses([]);
    }
  };


  const featured = courses.filter(
    (course) => course.featured
  );

  const popular = courses.filter(
    (course) => course.popular
  );


  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadLearning = async () => {
        const enrollmentData = await getEnrollments();
        const ids = Array.isArray(enrollmentData) ? enrollmentData : [];

        const entries = await Promise.all(
          courses
            .filter((course) => ids.includes(course._id || course.id))
            .map(async (course) =>
              [
                course._id || course.id,
                await getCourseProgress(course._id || course.id),
              ] as const
            )
        );

        if (active) {
          setEnrolledIds(ids);
          setProgressMap(
            Object.fromEntries(entries)
          );
        }
      };

      if (courses.length > 0) {
        loadLearning();
      }

      return () => {
        active = false;
      };

    }, [courses])
  );


  const hasEnrollments = enrolledIds.length > 0;


  const normalizedSearchQuery =
    searchQuery.trim().toLowerCase();


  const searchResults = useMemo(() => {

    if (!normalizedSearchQuery) {
      return [];
    }

    return courses.filter((course) =>
      [
        course.title,
        course.instructor,
        course.category,
        course.description,
      ].some((value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(normalizedSearchQuery)
      )
    );

  }, [normalizedSearchQuery, courses]);



  return (
    <SafeAreaView style={styles.safe}>

      <ScrollView contentContainerStyle={styles.content}>


        <View style={styles.header}>

          <Image
            source={require("@/assets/images/headlogo.png")}
            style={styles.headlogo}
            resizeMode="contain"
          />


          <View style={styles.bell}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.text}
            />
          </View>

        </View>



        <SearchBar
          placeholder="Search courses, skills or topics..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />



        {normalizedSearchQuery ? (

          <View style={styles.section}>

            <SectionHeader title="Search Results" />

            {searchResults.map((course) => (

              <CourseCard
                key={course._id || course.id}
                course={course}
              />

            ))}

          </View>


        ) : (

          <>


            <View style={styles.hero}>

              <Text style={styles.heroEyebrow}>
                LEARN • BUILD • GROW
              </Text>


              <Text style={styles.heroTitle}>
                Skills today.{"\n"}
                A brighter tomorrow.
              </Text>


              <Text style={styles.heroText}>
                Practical video courses designed to help you learn real skills.
              </Text>


              <Pressable
                style={styles.heroButton}
                onPress={() => router.push("/explore")}
              >

                <Text style={styles.heroButtonText}>
                  Explore Courses
                </Text>

                <Ionicons
                  name="arrow-forward-circle"
                  color={COLORS.primary}
                  size={20}
                />

              </Pressable>

            </View>



            <View style={styles.categoriesSection}>
              <SectionHeader title="Categories" />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >

              {categories.map((category) => (

                <Pressable
                  key={category}
                  style={styles.chip}
                  onPress={() =>
                    router.push({
                      pathname: "/explore",
                      params: { category },
                    })
                  }
                >

                  <Text style={styles.chipText}>
                    {category}
                  </Text>

                </Pressable>

              ))}

              </ScrollView>
            </View>



            {hasEnrollments && (

              <View style={styles.section}>

                <SectionHeader
                  title="Continue Learning"
                  action="View all"
                  onPress={() => router.push("/learning")}
                />


                {courses
                  .filter((course) =>
                    enrolledIds.includes(
                      course._id || course.id
                    )
                  )
                  .map((course) => (

                    <CourseCard
                      key={course._id || course.id}
                      course={course}
                      variant="continue"
                      completedLessonIds={
                        progressMap[course._id || course.id]?.completedLessonIds
                      }
                      lastLessonId={
                        progressMap[course._id || course.id]?.lastLessonId
                      }
                    />

                  ))}

              </View>

            )}



            <View style={styles.section}>

              <SectionHeader
                title="Featured Courses"
              />


              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.courseCarousel}
              >
                {featured.map((course) => (
                  <CourseCard
                    key={course._id || course.id}
                    course={course}
                    variant="carousel"
                  />
                ))}
              </ScrollView>

            </View>



            <View style={styles.section}>

              <SectionHeader title="Popular Now" />


              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.courseCarousel}
              >
                {popular.map((course) => (
                  <CourseCard
                    key={course._id || course.id}
                    course={course}
                    variant="carousel"
                  />
                ))}
              </ScrollView>

            </View>


          </>

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

  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:18,
  },

  bell:{
    width:44,
    height:44,
    borderRadius:22,
    backgroundColor:COLORS.surface,
    alignItems:"center",
    justifyContent:"center",
  },

  hero:{
    marginTop:20,
    paddingHorizontal:22,
    paddingVertical:24,
    borderRadius:RADIUS.xl,
    backgroundColor:COLORS.primary,
    shadowColor:COLORS.primary,
    shadowOffset:{ width:0, height:8 },
    shadowOpacity:0.22,
    shadowRadius:14,
    elevation:6,
  },

  heroEyebrow:{
    color:"#DBEAFE",
    fontWeight:"900",
    fontSize:11,
    letterSpacing:0.7,
  },

  heroTitle:{
    color:"#fff",
    fontSize:30,
    lineHeight:36,
    fontWeight:"900",
    marginTop:10,
  },

  heroText:{
    color:"#DBEAFE",
    fontSize:14,
    lineHeight:20,
    marginTop:12,
    maxWidth:290,
  },

  heroButton:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:8,
    backgroundColor:"#fff",
    paddingHorizontal:17,
    paddingVertical:12,
    borderRadius:RADIUS.md,
    marginTop:20,
    alignSelf:"flex-start",
  },

  heroButtonText:{
    color:COLORS.primary,
    fontWeight:"800",
  },

  chips:{
    gap:10,
    paddingTop:2,
    paddingBottom:4,
    paddingRight:SPACING.md,
  },

  chip:{
    paddingHorizontal:14,
    paddingVertical:9,
    backgroundColor:COLORS.surface,
    borderRadius:999,
    borderWidth:1,
    borderColor:COLORS.border,
  },

  chipText:{
    fontWeight:"700",
    color:COLORS.text,
  },

  section:{
    marginTop:28,
  },

  categoriesSection:{
    marginTop:30,
  },

  courseCarousel:{
    gap:14,
    paddingRight:SPACING.md,
  },

  headlogo:{
    width:180,
    height:60,
  },

});
