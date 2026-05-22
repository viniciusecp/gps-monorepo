import { Coordinate, User } from "@/common/model";
import ErrorPopup from "../error-popup";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import CoordinateItem from "./coordinate-item";

interface Props {
  users: User[];
  selectedImei: string;
  onTokenExpired?: (userEmail: string) => void;
}

export function Coordinates({ users, selectedImei, onTokenExpired }: Props) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  const showError = (title: string, message: string) => {
    setErrorPopup({ visible: true, title, message });
  };

  const loadCoordinates = useCallback(async () => {
    setIsLoading(true);
    setCoordinates([]);

    try {
      const user = users.find((u) =>
        u.vehicles.some((v) => v.imei === selectedImei),
      );

      if (!user) {
        return;
      }

      const data: { coordinates: any[] } = await tryAuthRequest(
        `/api/gprmc/coordinates/${selectedImei}`,
        user.email,
        () => user.accessToken,
        () => user.refreshToken,
      );

      setCoordinates(
        data.coordinates.map((coordinate: any) => ({
          latitude: coordinate.latitudeDecimalDegrees,
          longitude: coordinate.longitudeDecimalDegrees,
          date: dayjs(coordinate.date).format("DD/MM/YYYY"),
          time: dayjs(coordinate.date)
            .tz("America/Sao_Paulo")
            .format("HH:mm:ss"),
          speed: Math.round(coordinate.speed),
        })),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const user = users.find((u) =>
          u.vehicles.some((v) => v.imei === selectedImei),
        );
        if (user && onTokenExpired) {
          onTokenExpired(user.email);
        }
      } else {
        const message =
          error instanceof ApiError
            ? `Erro no servidor (${error.status})`
            : error instanceof Error
              ? error.message
              : "Erro desconhecido";
        showError("Erro ao carregar coordenadas", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [users, selectedImei, onTokenExpired]);

  useEffect(() => {
    loadCoordinates();
  }, [loadCoordinates]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#1447e6" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={coordinates}
        renderItem={({ item }) => <CoordinateItem coordinate={item} />}
        showsVerticalScrollIndicator={false}
        style={{
          marginTop: 16,
        }}
      />
      <ErrorPopup
        visible={errorPopup.visible}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={() => setErrorPopup((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

Coordinates.displayName = "Coordinates";

export default Coordinates;