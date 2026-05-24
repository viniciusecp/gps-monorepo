import { Coordinate } from "@/common/model";
import { Colors } from "@/src/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

interface Props {
  coordinate: Coordinate;
}

function CoordinateItem({ coordinate }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/map?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}`
        )
      }
      style={styles.container}
    >
      <View style={styles.property}>
        <FontAwesome6 name="calendar-days" size={24} color={Colors.text} />

        <Text style={styles.text}>{coordinate.date}</Text>
      </View>

      <View style={styles.property}>
        <FontAwesome6 name="clock" size={24} color={Colors.text} />

        <Text style={styles.text}>{coordinate.time}</Text>
      </View>

      <View style={styles.property}>
        <FontAwesome6 name="gauge-high" size={24} color={Colors.text} />

        <Text style={styles.text}>{coordinate.speed} km/h</Text>
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  property: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  text: {
    color: Colors.text,
    fontSize: 18,
    lineHeight: 18,
  },
});
