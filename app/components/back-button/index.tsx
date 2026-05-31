import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Colors, getSpacing, getTypography } from "@/src/theme";

function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/")}
      style={styles.button}
    >
      <FontAwesome6 name="arrow-left" size={24} color={Colors.text} />

      <Text style={styles.text}>Voltar</Text>
    </TouchableOpacity>
  );
}

export default React.memo(BackButton);

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px3"),
    padding: getSpacing("px2"),
    marginTop: getSpacing("px2"),
    marginLeft: getSpacing("px2"),
  },
  text: {
    color: Colors.text,
    fontSize: getTypography("h3"),
  },
});