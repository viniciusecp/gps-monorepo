import { Coordinate } from "@/common/model";
import { Colors, getTypography, getSpacing } from "@/src/theme";
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
  const itemTranslateY = useSharedValue(20);

  useEffect(() => {
    const delayMs = index * 60;
    itemOpacity.value = withDelay(delayMs, withTiming(1, { duration: 250, reduceMotion: ReduceMotion.System }));
    itemTranslateY.value = withDelay(delayMs, withSpring(0, { damping: 20, stiffness: 200, reduceMotion: ReduceMotion.System }));
  }, [index, itemOpacity, itemTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ translateY: itemTranslateY.value }, { scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withTiming(0.97, {
      duration: 80,
      reduceMotion: ReduceMotion.System,
    });
  }

  function handlePressOut() {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
      reduceMotion: ReduceMotion.System,
    });
  }

  const speedValue = Number(coordinate.speed);
  const isMoving = speedValue > 0;

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
      >
        <View style={styles.header}>
          <View style={styles.dateTimeContainer}>
            <FontAwesome6 name="calendar" size={12} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{coordinate.date}</Text>
          </View>
          <View style={styles.timeContainer}>
            <FontAwesome6 name="clock" size={12} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{coordinate.time}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.coordinates}>
            <View style={styles.coordinateRow}>
              <FontAwesome6 name="location-arrow" size={14} color={Colors.primary} style={{ transform: [{ rotate: "45deg" }] }} />
              <Text style={styles.coordinateText} numberOfLines={1}>
                {Number(coordinate.latitude).toFixed(6)}, {Number(coordinate.longitude).toFixed(6)}
              </Text>
            </View>
          </View>

          <View style={styles.speedContainer}>
            <View style={[styles.speedBadge, isMoving ? styles.speedMoving : styles.speedStopped]}>
              <FontAwesome6
                name={isMoving ? "gauge-high" : "gauge"}
                size={14}
                color={isMoving ? Colors.success : Colors.textSecondary}
              />
              <Text style={[styles.speedText, isMoving ? styles.speedTextActive : styles.speedTextInactive]}>
                {speedValue} <Text style={styles.speedUnit}>km/h</Text>
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(CoordinateItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.glassBackground,
    borderRadius: 16,
    padding: getSpacing("px3"),
    marginHorizontal: 4,
    marginVertical: getSpacing("px1_5"),
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: getSpacing("px1_5"),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px1"),
  },
  dateText: {
    fontSize: getTypography("caption"),
    color: Colors.textSecondary,
    fontWeight: getTypography("fontWeight").medium,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px1"),
  },
  timeText: {
    fontSize: getTypography("caption"),
    color: Colors.textSecondary,
    fontWeight: getTypography("fontWeight").medium,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: getSpacing("px2"),
  },
  coordinates: {
    flex: 1,
  },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
  },
  coordinateText: {
    fontSize: getTypography("body"),
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.2,
  },
  speedContainer: {
    alignItems: "flex-end",
  },
  speedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px1"),
    paddingHorizontal: getSpacing("px2"),
    paddingVertical: getSpacing("px0_5"),
    borderRadius: 20,
  },
  speedMoving: {
    backgroundColor: "rgba(0, 200, 83, 0.2)",
  },
  speedStopped: {
    backgroundColor: Colors.glassBorder,
  },
  speedText: {
    fontSize: getTypography("body"),
    fontWeight: getTypography("fontWeight").semibold,
  },
  speedTextActive: {
    color: Colors.success,
  },
  speedTextInactive: {
    color: Colors.textSecondary,
  },
  speedUnit: {
    fontSize: getTypography("caption"),
    fontWeight: getTypography("fontWeight").regular,
  },
});