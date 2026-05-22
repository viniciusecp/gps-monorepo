import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkAuth() {
      const storageUsers = await AsyncStorage.getItem("users");
      const hasUsers = storageUsers ? JSON.parse(storageUsers).length > 0 : false;
      const isOnAddAccount = segments[0] === "add-account";

      if (!hasUsers && !isOnAddAccount) {
        router.replace("/add-account");
      }
    }

    checkAuth();
  }, [router, segments]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="add-account"
          options={{ gestureEnabled: false }}
        />
      </Stack>
    </SafeAreaView>
  );
}
