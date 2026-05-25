import { Colors } from "@/src/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { getStyles } from "./styles";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function EmptyState() {
  const styles = getStyles();

  const pulse = useSharedValue(1);
  const iconOpacity = useSharedValue(0);
  const titleOffset = useSharedValue(12);
  const titleOpacity = useSharedValue(0);
  const subtitleOffset = useSharedValue(12);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System });

    pulse.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1200, reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 1200, reduceMotion: ReduceMotion.System }),
        ),
        -1,
        true,
      ),
    );

    titleOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 250, reduceMotion: ReduceMotion.System }),
    );
    titleOffset.value = withDelay(
      500,
      withSpring(0, { damping: 20, stiffness: 200, reduceMotion: ReduceMotion.System }),
    );

    subtitleOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 250, reduceMotion: ReduceMotion.System }),
    );
    subtitleOffset.value = withDelay(
      700,
      withSpring(0, { damping: 20, stiffness: 200, reduceMotion: ReduceMotion.System }),
    );
  }, [iconOpacity, pulse, titleOpacity, titleOffset, subtitleOpacity, subtitleOffset]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: pulse.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleOffset.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleOffset.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <FontAwesome6
          name="car"
          size={32}
          color={Colors.primary}
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, titleAnimatedStyle]}>
        <Text style={styles.title}>Nenhum veículo selecionado</Text>
      </Animated.View>

      <Animated.View style={subtitleAnimatedStyle}>
        <Text style={styles.subtitle}>
          Acesse uma conta para visualizar veículos
        </Text>
      </Animated.View>
    </View>
  );
}