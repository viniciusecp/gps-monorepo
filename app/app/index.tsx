import { User } from "@/common/model";
import Accounts from "@/components/accounts";
import { Coordinates } from "@/components/coordinates";
import EmptyState from "@/components/empty-state";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { refreshAccessToken } from "@/src/services/api";
import { getSpacing } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

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

  return (
    <View style={{ flex: 1, padding: getSpacing("px2") }}>
      <Accounts
        users={users}
        onVehicleClick={onVehicleClick}
        onRemoveAccount={onRemoveAccount}
      />

      {!selectedImei ? (
        <EmptyState />
      ) : (
        <Coordinates
          users={users}
          selectedImei={selectedImei}
          onTokenExpired={handleTokenExpired}
        />
      )}
    </View>
  );
}
