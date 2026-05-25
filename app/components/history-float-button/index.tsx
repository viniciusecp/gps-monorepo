import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  selectedImei: string;
}

export function HistoryFloatButton({ selectedImei }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withTiming(0.96, {
      duration: 80,
      reduceMotion: ReduceMotion.System,
    });
  }

  function handlePressOut() {
    scale.value = withTiming(1, {
      duration: 100,
      reduceMotion: ReduceMotion.System,
    });
  }

  return (
    <Animated.View
      style={[styles.wrapper, animatedStyle]}
      entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/history?imei=${selectedImei}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Histórico"
        accessibilityHint="Visualizar histórico de coordenadas"
      >
        <FontAwesome6 name="clock-rotate-left" size={18} color={Colors.primary} />
        <Text style={styles.label}>Histórico</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: getSpacing("px8"),
    right: getSpacing("px3"),
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
    backgroundColor: "rgba(20, 71, 230, 0.15)",
    borderRadius: 999,
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px4"),
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: getTypography("body"),
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.primary,
  },
});
