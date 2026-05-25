import { Coordinate } from "@/common/model";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  coordinate: Coordinate;
  index?: number;
}

function CoordinateItem({ coordinate, index = 0 }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const itemOpacity = useSharedValue(0);
  const itemTranslateY = useSharedValue(-16);

  useEffect(() => {
    const delayMs = index * 80;
    itemOpacity.value = withDelay(delayMs, withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System }));
    itemTranslateY.value = withDelay(delayMs, withTiming(0, { duration: 200, reduceMotion: ReduceMotion.System }));
  }, [index, itemOpacity, itemTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ translateY: itemTranslateY.value }, { scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withTiming(0.96, {
      duration: 100,
      reduceMotion: ReduceMotion.System,
    });
  }

  function handlePressOut() {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
      reduceMotion: ReduceMotion.System,
    });
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() =>
          router.push(
            `/map?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}`
          )
        }
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel={`${coordinate.date} ${coordinate.time}, ${coordinate.speed} km/h`}
        accessibilityHint="Abrir no mapa"
      >
        <View style={styles.property}>
          <FontAwesome6 name="calendar-days" size={getTypography("h3")} color={Colors.text} />

          <Text style={styles.text} numberOfLines={1}>{coordinate.date}</Text>
        </View>

        <View style={styles.property}>
          <FontAwesome6 name="clock" size={getTypography("h3")} color={Colors.text} />

          <Text style={styles.text} numberOfLines={1}>{coordinate.time}</Text>
        </View>

        <View style={styles.property}>
          <FontAwesome6 name="gauge-high" size={getTypography("h3")} color={Colors.text} />

          <Text style={styles.text} numberOfLines={1}>{coordinate.speed} km/h</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(CoordinateItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: getSpacing("px2"),
    paddingVertical: getSpacing("px3"),
    marginTop: getSpacing("px2"),
  },
  property: {
    alignItems: "center",
    flex: 1,
    gap: getSpacing("px2"),
  },
  text: {
    color: Colors.text,
    fontSize: getTypography("body"),
    lineHeight: getTypography("body") * getTypography("lineHeight").normal,
  },
});
