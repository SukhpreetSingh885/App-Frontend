import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import SearchBar from "@/components/SearchBar";
import CourseCard from "@/components/CourseCard";
import { COLORS, SPACING } from "@/constants/theme";
import { getCourses } from "@/services/course.service";

const categories = [
  "All",
  "Development",
  "Design",
  "Marketing",
  "Business",
  "AI",
];

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ category?: string }>();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses", error);
      setCourses([]);
    }
  };

  useEffect(() => {
    if (
      params.category &&
      categories.includes(params.category)
    ) {
      setCategory(params.category);
    }
  }, [params.category]);

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        category === "All" ||
        course.category === category;

      const matchesQuery = course.title
        ?.toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [query, category, courses]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>
          Explore Courses
        </Text>

        <Text style={styles.subtitle}>
          Find the right skill and start learning at your pace.
        </Text>

        <SearchBar
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {categories.map((item) => {
            const active = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.filter,
                  active && styles.filterActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.map((course) => (
          <CourseCard
            key={course._id || course.id}
            course={course}
          />
        ))}

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
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 18,
  },

  filters: {
    gap: 10,
    paddingVertical: 16,
  },

  filter: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
  },

  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    color: COLORS.text,
    fontWeight: "700",
  },

  filterTextActive: {
    color: "#fff",
  },
});
