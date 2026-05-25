import { FontAwesome6 } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, getTypography, getSpacing } from "@/src/theme";
import React from "react";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const a11yLabels: Record<string, Record<string, string>> = {
  user: { hint: "Toque e segure para remover" },
  vehicle: { hint: "Selecionar veículo" },
  add: { label: "Adicionar conta", hint: "Adicionar nova conta" },
};

interface Props {
  type: "user" | "vehicle" | "add";
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
  onRemoveAccount?: () => void;
}

function AccountItem({
  type,
  title,
  isSelected,
  onClick,
  onRemoveAccount,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const icon = type === "user" ? "user" : type === "vehicle" ? "car" : "plus";
  const color = isSelected
    ? Colors.primary
    : type === "user"
      ? Colors.textSecondary
      : Colors.text;

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

  function handleRemoveUser() {
    if (type !== "user") {
      return;
    }

    Alert.alert("Atenção", "Deseja remover esta conta?", [
      {
        text: "Cancelar",
      },
      {
        text: "Remover",
        onPress: () => onRemoveAccount?.(),
        style: "destructive",
      },
    ]);
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selected,
        ]}
        onPress={onClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleRemoveUser}
        accessibilityRole="button"
        accessibilityLabel={
          type === "add" ? a11yLabels.add.label : title
        }
        accessibilityHint={a11yLabels[type]?.hint}
      >
        <FontAwesome6
          name={icon}
          size={18}
          color={color}
        />
        <Text
          style={[
            styles.text,
            isSelected && styles.selectedText,
            { color }
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(AccountItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    paddingVertical: getSpacing("px2"),
    paddingHorizontal: getSpacing("px3"),
    marginHorizontal: 4,
    gap: getSpacing("px2"),
    minHeight: 40,
  },
  selected: {
    backgroundColor: "rgba(20, 71, 230, 0.15)",
  },
  text: {
    fontSize: getTypography("body"),
    fontWeight: getTypography("fontWeight").medium,
    color: Colors.text,
    flex: 1,
  },
  selectedText: {
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.primary,
  },
});