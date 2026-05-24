import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Colors, getSpacing, getTypography } from "../../src/theme";
import React from "react";

interface Props {
  label: string;
  onClick: () => void;
  loading?: boolean;
  containerStyle?: ViewStyle;
}

function SubmitButton({
  label,
  onClick,
  loading,
  containerStyle,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, containerStyle]}
      disabled={loading}
      onPress={onClick}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export default React.memo(SubmitButton);

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingVertical: getSpacing("px3"),
    borderRadius: 8,
  },
  text: {
    color: Colors.text,
    fontSize: getTypography("button"),
    fontWeight: "bold",
  },
});