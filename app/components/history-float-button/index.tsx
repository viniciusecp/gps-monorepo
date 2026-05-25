import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Colors, getSpacing } from "@/src/theme";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

interface Props {
  selectedImei: string;
}

export function HistoryFloatButton({ selectedImei }: Props) {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/history?imei=${selectedImei}`)}
        accessibilityRole="button"
        accessibilityLabel="Histórico"
        accessibilityHint="Visualizar histórico de coordenadas"
      >
        <FontAwesome6 name="clock-rotate-left" size={32} color={Colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: getSpacing("px8"),
    right: getSpacing("px3"),
    padding: getSpacing("px3"),
    borderRadius: 999,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});
