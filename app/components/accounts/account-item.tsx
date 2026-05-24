import { FontAwesome6 } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, getTypography } from "../../src/theme";
import React from "react";

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
  const icon = type === "user" ? "user" : type === "vehicle" ? "car" : "plus";
  const color = isSelected
    ? Colors.primary
    : type === "user"
      ? Colors.textSecondary
      : Colors.text;

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
    <TouchableOpacity
      style={styles.container}
      onPress={onClick}
      onLongPress={handleRemoveUser}
    >
      <FontAwesome6 name={icon} size={getTypography("h3")} color={color} />
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(AccountItem);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
    marginHorizontal: 12,
  },
  text: {
    fontSize: getTypography("h3"),
  },
});