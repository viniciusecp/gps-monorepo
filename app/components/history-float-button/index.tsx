import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

interface Props {
  selectedImei: string;
}

export function HistoryFloatButton({ selectedImei }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 30,
        right: 10,
        padding: 12,
        borderRadius: "50%",
        backgroundColor: "#1449e686",
        borderWidth: 1,
        borderColor: "#1447e6",
        elevation: 5,
      }}
      onPress={() => router.push(`/history?imei=${selectedImei}`)}
    >
      <FontAwesome6 name="clock-rotate-left" size={40} color="#fafafa" />
    </TouchableOpacity>
  );
}
