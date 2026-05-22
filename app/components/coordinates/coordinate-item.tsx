import { Coordinate } from "@/common/model";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  coordinate: Coordinate;
}

export default function CoordinateItem({ coordinate }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/map?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}`
        )
      }
      style={{
        flexDirection: "row",
        backgroundColor: "#ffffff0b",
        borderWidth: 1,
        borderColor: "#ffffff26",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        marginTop: 8,
      }}
    >
      <View style={styles.property}>
        <FontAwesome6 name="calendar-days" size={24} color="white" />

        <Text style={styles.text}>{coordinate.date}</Text>
      </View>

      <View style={styles.property}>
        <FontAwesome6 name="clock" size={24} color="white" />

        <Text style={styles.text}>{coordinate.time}</Text>
      </View>

      <View style={styles.property}>
        <FontAwesome6 name="gauge-high" size={24} color="white" />

        <Text style={styles.text}>{coordinate.speed} km/h</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  property: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  text: {
    color: "white",
    fontSize: 18,
    lineHeight: 18,
  },
});
