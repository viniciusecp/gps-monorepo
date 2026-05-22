import { Coordinate, User } from "@/common/model";
import BackButton from "@/components/back-button";
import CoordinateItem from "@/components/coordinates/coordinate-item";
import { DateTimePicker } from "@/components/date-time-picker";
import ErrorPopup from "@/components/error-popup";
import { SubmitButton } from "@/components/submit-button";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const HOURS_AGO = 1;
const now = dayjs();

export default function History() {
  const { imei } = useLocalSearchParams();

  const startDateRef = useRef<Date>(now.subtract(HOURS_AGO, "hour").toDate());
  const endDateRef = useRef<Date>(now.toDate());

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  async function handleFetchHistory() {
    setIsLoading(true);
    setCoordinates([]);

    try {
      const storageUsers = await AsyncStorage.getItem("users");

      if (!storageUsers) {
        throw new Error("Users not found");
      }

      const user: User | undefined = JSON.parse(storageUsers).find((u: User) =>
        u.vehicles.some((v) => v.imei === imei)
      );

      if (!user) {
        throw new Error("User not found");
      }

      const dataInicio = dayjs(startDateRef.current).format("YYYY-MM-DD");
      const horaInicio = dayjs(startDateRef.current).format("HH:mm");
      const dataFinal = dayjs(endDateRef.current).format("YYYY-MM-DD");
      const horaFinal = dayjs(endDateRef.current).format("HH:mm");

      const query = `?dataInicio=${dataInicio}&horaInicio=${horaInicio}&dataFinal=${dataFinal}&horaFinal=${horaFinal}`;

      const data: { coordinates: any[] } = await tryAuthRequest(
        `/api/gprmc/history/${imei}${query}`,
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
      const message =
        error instanceof ApiError
          ? `Erro no servidor (${error.status})`
          : error instanceof Error
            ? error.message
            : "Erro desconhecido";
      setErrorPopup({ visible: true, title: "Erro ao buscar histórico", message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <BackButton />

      <View style={styles.card}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
          Histórico
        </Text>

        <View style={{ ...styles.hr, marginBottom: 8 }} />

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Período inicial:</Text>

          <DateTimePicker
            onConfirm={(date) => {
              startDateRef.current = date;
            }}
            hoursAgo={HOURS_AGO}
          />
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Período final:</Text>

          <DateTimePicker
            onConfirm={(date) => {
              endDateRef.current = date;
            }}
          />
        </View>

        <SubmitButton
          label="Buscar"
          onClick={handleFetchHistory}
          loading={isLoading}
          containerStyle={{ marginTop: 8 }}
        />

              </View>

      {!!coordinates.length && (
        <FlatList
          data={coordinates}
          renderItem={({ item }) => <CoordinateItem coordinate={item} />}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 10 }}
        />
      )}

      <ErrorPopup
        visible={errorPopup.visible}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={() => setErrorPopup((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff0b",
    borderWidth: 1,
    borderColor: "#ffffff26",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  hr: {
    height: 1,
    backgroundColor: "#ffffff26",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "space-between",
  },
  dateLabel: {
    color: "white",
    fontSize: 20,
  },
});
