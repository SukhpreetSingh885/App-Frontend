import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = {
  title: string;
  action?: string;
  onPress?: () => void;
};

export default function SectionHeader({
  title,
  action,
  onPress,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>

      {action ? (
        <Pressable onPress={onPress}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  action: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
