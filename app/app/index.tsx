import { User } from "@/common/model";
import Accounts from "@/components/accounts";
import { Coordinates } from "@/components/coordinates";
import EmptyState from "@/components/empty-state";
import { ChatFloatButton } from "@/components/chat-float-button";
import { HistoryFloatButton } from "@/components/history-float-button";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { refreshAccessToken } from "@/src/services/api";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const [selectedImei, setSelectedImei] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [expiredUserEmail, setExpiredUserEmail] = useState("");
  const { showError, setOnClose } = useErrorPopup();

  const loadUsers = useCallback(async () => {
    const storageUsers = await AsyncStorage.getItem("users");

    if (storageUsers) {
      const parsed: User[] = JSON.parse(storageUsers);

      const refreshed = await Promise.all(
        parsed.map(async (user) => {
          try {
            const newToken = await refreshAccessToken(user.email, user.refreshToken);
            return { ...user, accessToken: newToken };
          } catch {
            return user;
          }
        }),
      );

      await AsyncStorage.setItem("users", JSON.stringify(refreshed));
      setUsers(refreshed);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleTokenExpired(userEmail: string) {
    setExpiredUserEmail(userEmail);
    showError("Sessão expirada", "Sua sessão expirou. Faça login novamente.");
  }

  useEffect(() => {
    setOnClose(async () => {
      if (expiredUserEmail) {
        const newUsers = users.filter((user) => user.email !== expiredUserEmail);
        await AsyncStorage.setItem("users", JSON.stringify(newUsers));
        setUsers(newUsers);
        setExpiredUserEmail("");

        if (newUsers.length === 0) {
          router.replace("/add-account");
        }
      }
    });
  }, [expiredUserEmail, users, router, setOnClose]);

  function onVehicleClick(vehicleImei: string) {
    setSelectedImei(vehicleImei);
  }

  async function onRemoveAccount(removeUser: User) {
    const newUsers = users.filter(
      (user) => user.email !== removeUser.email,
    );

    await AsyncStorage.setItem("users", JSON.stringify(newUsers));
    setUsers(newUsers);
  }

  const selectedVehicle = users
    .flatMap((u) => u.vehicles)
    .find((v) => v.imei === selectedImei);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {selectedImei ? (
          <>
            <FontAwesome6 name="car" size={20} color={Colors.primary} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedVehicle?.name || "Veículo"}
            </Text>
          </>
        ) : (
          <Text style={styles.appTitle}>RastroApp</Text>
        )}
      </View>

      <Accounts
        users={users}
        selectedImei={selectedImei}
        onVehicleClick={onVehicleClick}
        onRemoveAccount={onRemoveAccount}
      />

      {!selectedImei ? (
        <View style={styles.content}>
          <EmptyState />
        </View>
      ) : (
        <View style={styles.content}>
          <Coordinates
            users={users}
            selectedImei={selectedImei}
            onTokenExpired={handleTokenExpired}
          />
          <HistoryFloatButton selectedImei={selectedImei} />
          <ChatFloatButton />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
    paddingHorizontal: getSpacing("px5"),
    paddingTop: getSpacing("px4"),
    paddingBottom: getSpacing("px3"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  appTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
  },
});