import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

export default function EmptyLearning() {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="school-outline" size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Your learning journey starts here</Text>
      <Text style={styles.text}>
        Once you enroll in a course, your progress and Continue Learning section
        will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 21,
    textAlign: "center",
  },
});
