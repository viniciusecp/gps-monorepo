import { Coordinate, User } from "@/common/model";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View, Text } from "react-native";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import CoordinateItem from "./coordinate-item";
import { FontAwesome6 } from "@expo/vector-icons";

interface Props {
  users: User[];
  selectedImei: string;
  onTokenExpired?: (userEmail: string) => void;
}

export function Coordinates({ users, selectedImei, onTokenExpired }: Props) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useErrorPopup();

  const renderCoordinateItem = useCallback(({ item, index }: { item: Coordinate, index: number }) => (
    <CoordinateItem coordinate={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: Coordinate) =>
    `${item.latitude}-${item.longitude}-${item.time}`, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCoordinates() {
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

        if (cancelled) return;

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
        if (cancelled) return;

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
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCoordinates();

    return () => {
      cancelled = true;
    };
  }, [users, selectedImei, onTokenExpired, showError]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (coordinates.length === 0) {
    return (
      <View style={styles.loader}>
        <FontAwesome6 name="map-pin" size={getTypography("h1")} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>Nenhuma coordenada encontrada</Text>
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
    gap: getSpacing("px4"),
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: getTypography("body"),
  },
  list: {
    marginTop: getSpacing("px4"),
  },
});