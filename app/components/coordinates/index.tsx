import { Coordinate, User } from "@/common/model";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View, Text } from "react-native";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import CoordinateItem from "./coordinate-item";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

interface Props {
  users: User[];
  selectedImei: string;
  onTokenExpired?: (userEmail: string) => void;
}

export function Coordinates({ users, selectedImei, onTokenExpired }: Props) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showError } = useErrorPopup();

  const renderCoordinateItem = useCallback(({ item, index }: { item: Coordinate, index: number }) => (
    <CoordinateItem coordinate={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: Coordinate) =>
    `${item.latitude}-${item.longitude}-${item.time}`, []);

  const fetchCoordinates = useCallback(async (): Promise<Coordinate[]> => {
    const user = users.find((u) =>
      u.vehicles.some((v) => v.imei === selectedImei),
    );

    if (!user) {
      return [];
    }

    const data: { coordinates: any[] } = await tryAuthRequest(
      `/api/gprmc/coordinates/${selectedImei}`,
      user.email,
      () => user.accessToken,
      () => user.refreshToken,
    );

    return data.coordinates.map((coordinate: any) => ({
      latitude: coordinate.latitudeDecimalDegrees,
      longitude: coordinate.longitudeDecimalDegrees,
      date: dayjs(coordinate.date).format("DD/MM/YYYY"),
      time: dayjs(coordinate.date)
        .tz("America/Sao_Paulo")
        .format("HH:mm:ss"),
      speed: Math.round(coordinate.speed),
    }));
  }, [users, selectedImei]);

  useEffect(() => {
    let cancelled = false;

    async function loadCoordinates() {
      setIsLoading(true);
      setCoordinates([]);

      try {
        const result = await fetchCoordinates();
        if (cancelled) return;
        setCoordinates(result);
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
  }, [users, selectedImei, onTokenExpired, showError, fetchCoordinates]);

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      const result = await fetchCoordinates();
      setCoordinates(result);
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
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (coordinates.length === 0) {
    return (
      <Animated.View
        entering={FadeIn.duration(400).reduceMotion(ReduceMotion.System)}
        style={styles.emptyContainer}
      >
        <View style={styles.emptyIcon}>
          <FontAwesome6 name="map-pin" size={48} color={Colors.glassBorder} />
        </View>
        <Text style={styles.emptyTitle}>Sem coordenadas</Text>
        <Text style={styles.emptyText}>
          O veículo ainda não possui dados de localização
        </Text>
      </Animated.View>
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
      contentContainerStyle={styles.listContent}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: getSpacing("px4"),
    paddingHorizontal: getSpacing("px6"),
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.text,
  },
  emptyText: {
    fontSize: getTypography("body"),
    color: Colors.textSecondary,
    textAlign: "center",
  },
  list: {
    marginTop: getSpacing("px2"),
  },
  listContent: {
    paddingBottom: getSpacing("px8"),
    paddingHorizontal: getSpacing("px2"),
  },
});