import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
};

export default function SearchBar({
  placeholder = "Search courses...",
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={COLORS.muted} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
});
