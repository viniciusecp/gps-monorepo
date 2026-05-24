import { Coordinate, User } from "@/common/model";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import { Colors, getSpacing } from "@/src/theme";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import CoordinateItem from "./coordinate-item";

interface Props {
  users: User[];
  selectedImei: string;
  onTokenExpired?: (userEmail: string) => void;
}

export function Coordinates({ users, selectedImei, onTokenExpired }: Props) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useErrorPopup();

  const renderCoordinateItem = useCallback(({ item }: { item: Coordinate }) => (
    <CoordinateItem coordinate={item} />
  ), []);

  const keyExtractor = useCallback((item: Coordinate) =>
    `${item.latitude}-${item.longitude}-${item.time}`, []);

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
  }, [users, selectedImei, onTokenExpired, showError]);

  useEffect(() => {
    loadCoordinates();
  }, [loadCoordinates]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={coordinates}
      renderItem={renderCoordinateItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      style={styles.list}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

export default Coordinates;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    marginTop: getSpacing("px4"),
  },
});