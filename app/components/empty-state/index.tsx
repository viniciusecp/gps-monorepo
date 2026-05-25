import { Colors, getTypography } from "@/src/theme";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getStyles } from "./styles";

export default function EmptyState() {
  const styles = getStyles();

  const pulse = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const arrowY = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    const options = { reduceMotion: ReduceMotion.System } as const;

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, ...options }),
        withTiming(1, { duration: 1200, ...options }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1200, ...options }),
        withTiming(1, { duration: 1200, ...options }),
      ),
      -1,
    );
    arrowY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 800, ...options }),
        withTiming(0, { duration: 800, ...options }),
      ),
      -1,
    );

    const t = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 800, ...options });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulseOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 1.5 }],
    opacity: pulseOpacity.value * 0.15,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.arrowContainer, arrowStyle]}>
          <Ionicons
            name="chevron-up"
            size={getTypography("h2")}
            color={Colors.primaryLight}
          />
        </Animated.View>
        <Animated.View style={[styles.glowEffect, glowStyle]} />
        <Animated.View style={carStyle}>
          <FontAwesome6
            name="car"
            size={getTypography("h1")}
            color={Colors.primary}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Animated.Text style={styles.title}>Selecione um veículo</Animated.Text>
      </Animated.View>
    </View>
  );
}
