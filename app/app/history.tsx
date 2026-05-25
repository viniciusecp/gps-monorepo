import BackButton from "@/components/back-button";
import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

dayjs.extend(utc);
dayjs.extend(timezone);

type PickerTarget = "startDate" | "startTime" | "endDate" | "endTime";

interface HistoryCoordinate {
	latitude: number;
	longitude: number;
	date: string;
	time: string;
	speed: number;
}

export default function History() {
	const { imei } = useLocalSearchParams<{ imei: string }>();
	const router = useRouter();
	const { showError } = useErrorPopup();

	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());
	const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);
	const [coordinates, setCoordinates] = useState<HistoryCoordinate[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showMap, setShowMap] = useState(false);

	const fetchHistory = useCallback(async () => {
		if (!imei) return;
		setIsLoading(true);
		setCoordinates([]);
		try {
			const storageUsers = await AsyncStorage.getItem("users");
			if (!storageUsers) return;
			const users = JSON.parse(storageUsers);
			const user = users.find((u: any) =>
				u.vehicles.some((v: any) => v.imei === imei),
			);
			if (!user) return;

			const startISO = dayjs(startDate).toISOString();
			const endISO = dayjs(endDate).toISOString();
			const path = `/api/gprmc/history/${imei}?startDate=${encodeURIComponent(startISO)}&endDate=${encodeURIComponent(endISO)}`;

			const data: { coordinates: any[] } = await tryAuthRequest(
				path,
				user.email,
				() => user.accessToken,
				() => user.refreshToken,
			);

			setCoordinates(
				data.coordinates.map((c: any) => ({
					latitude: c.latitudeDecimalDegrees,
					longitude: c.longitudeDecimalDegrees,
					date: dayjs(c.date).format("DD/MM/YYYY"),
					time: dayjs(c.date).tz("America/Sao_Paulo").format("HH:mm:ss"),
					speed: Math.round(c.speed),
				})),
			);
		} catch (error) {
			if (error instanceof ApiError) {
				showError(
					"Erro ao carregar histórico",
					`Servidor retornou erro ${error.status}`,
				);
			} else {
				showError("Erro", "Não foi possível carregar o histórico");
			}
		} finally {
			setIsLoading(false);
		}
	}, [imei, startDate, endDate, showError]);

	const handlePickerChange = (_event: any, selectedDate?: Date) => {
		if (!activePicker || !selectedDate) {
			setActivePicker(null);
			return;
		}
		if (activePicker === "startDate") setStartDate(selectedDate);
		if (activePicker === "startTime") setStartDate(selectedDate);
		if (activePicker === "endDate") setEndDate(selectedDate);
		if (activePicker === "endTime") setEndDate(selectedDate);
		setActivePicker(null);
	};

	function formatDateLabel(date: Date) {
		return dayjs(date).format("DD/MM/YYYY");
	}

	function formatTimeLabel(date: Date) {
		return dayjs(date).format("HH:mm");
	}

	const keyExtractor = useCallback(
		(item: HistoryCoordinate, index: number) =>
			`${item.latitude}-${item.longitude}-${item.time}-${index}`,
		[],
	);

	function renderCoordinateItem({ item }: { item: HistoryCoordinate }) {
		return (
			<TouchableOpacity
				onPress={() =>
					router.push(
						`/map?latitude=${item.latitude}&longitude=${item.longitude}`,
					)
				}
				style={styles.coordinateRow}
			>
				<View style={styles.property}>
					<FontAwesome6 name="calendar-days" size={24} color={Colors.text} />
					<Text style={styles.propertyText}>{item.date}</Text>
				</View>
				<View style={styles.property}>
					<FontAwesome6 name="clock" size={24} color={Colors.text} />
					<Text style={styles.propertyText}>{item.time}</Text>
				</View>
				<View style={styles.property}>
					<FontAwesome6 name="gauge-high" size={24} color={Colors.text} />
					<Text style={styles.propertyText}>{item.speed} km/h</Text>
				</View>
			</TouchableOpacity>
		);
	}

	if (!imei) {
		return (
			<View style={styles.container}>
				<BackButton />
				<View style={styles.centerContent}>
					<Text style={styles.emptyText}>Nenhum veículo selecionado</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<BackButton />

			<View style={styles.pickerRow}>
				<View style={styles.pickerGroup}>
					<Text style={styles.pickerLabel}>Início</Text>
					<TouchableOpacity
						style={styles.pickerButton}
						onPress={() => setActivePicker("startDate")}
					>
						<FontAwesome6
							name="calendar-days"
							size={16}
							color={Colors.text}
						/>
						<Text style={styles.pickerButtonText}>
							{formatDateLabel(startDate)}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.pickerButton}
						onPress={() => setActivePicker("startTime")}
					>
						<FontAwesome6 name="clock" size={16} color={Colors.text} />
						<Text style={styles.pickerButtonText}>
							{formatTimeLabel(startDate)}
						</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.pickerGroup}>
					<Text style={styles.pickerLabel}>Fim</Text>
					<TouchableOpacity
						style={styles.pickerButton}
						onPress={() => setActivePicker("endDate")}
					>
						<FontAwesome6
							name="calendar-days"
							size={16}
							color={Colors.text}
						/>
						<Text style={styles.pickerButtonText}>
							{formatDateLabel(endDate)}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.pickerButton}
						onPress={() => setActivePicker("endTime")}
					>
						<FontAwesome6 name="clock" size={16} color={Colors.text} />
						<Text style={styles.pickerButtonText}>
							{formatTimeLabel(endDate)}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{activePicker && (
				<DateTimePicker
					value={activePicker === "startDate" || activePicker === "endDate" ? (activePicker === "startDate" ? startDate : endDate) : (activePicker === "startTime" ? startDate : endDate)}
					mode={activePicker === "startDate" || activePicker === "endDate" ? "date" : "time"}
					display={Platform.OS === "ios" ? "spinner" : "default"}
					onChange={handlePickerChange}
				/>
			)}

			<TouchableOpacity
				style={styles.searchButton}
				onPress={fetchHistory}
				disabled={isLoading}
			>
				<Text style={styles.searchButtonText}>Buscar</Text>
			</TouchableOpacity>

			{isLoading ? (
				<View style={styles.centerContent}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : coordinates.length > 0 ? (
				<View style={styles.resultsContainer}>
					<View style={styles.toggleRow}>
						<TouchableOpacity
							style={[
								styles.toggleButton,
								!showMap && styles.toggleButtonActive,
							]}
							onPress={() => setShowMap(false)}
						>
							<FontAwesome6
								name="list"
								size={18}
								color={!showMap ? Colors.primary : Colors.text}
							/>
							<Text
								style={[
									styles.toggleText,
									!showMap && styles.toggleTextActive,
								]}
							>
								Lista
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.toggleButton,
								showMap && styles.toggleButtonActive,
							]}
							onPress={() => setShowMap(true)}
						>
							<FontAwesome6
								name="map"
								size={18}
								color={showMap ? Colors.primary : Colors.text}
							/>
							<Text
								style={[
									styles.toggleText,
									showMap && styles.toggleTextActive,
								]}
							>
								Mapa
							</Text>
						</TouchableOpacity>
					</View>

					{showMap ? (
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: coordinates[0].latitude,
								longitude: coordinates[0].longitude,
								latitudeDelta: 0.05,
								longitudeDelta: 0.05,
							}}
						>
							<Polyline
								coordinates={coordinates.map((c) => ({
									latitude: c.latitude,
									longitude: c.longitude,
								}))}
								strokeColor={Colors.primary}
								strokeWidth={3}
							/>
							<Marker
								coordinate={{
									latitude: coordinates[0].latitude,
									longitude: coordinates[0].longitude,
								}}
								title="Início"
							/>
							<Marker
								coordinate={{
									latitude: coordinates[coordinates.length - 1].latitude,
									longitude: coordinates[coordinates.length - 1].longitude,
								}}
								title="Fim"
							/>
						</MapView>
					) : (
						<FlatList
							data={coordinates}
							renderItem={renderCoordinateItem}
							keyExtractor={keyExtractor}
							showsVerticalScrollIndicator={false}
							removeClippedSubviews
							maxToRenderPerBatch={10}
							windowSize={5}
						/>
					)}
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.background },
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: { color: Colors.textSecondary, fontSize: getTypography("body") },
	pickerRow: {
		flexDirection: "row",
		paddingHorizontal: getSpacing("px3"),
		marginTop: getSpacing("px3"),
		gap: getSpacing("px3"),
	},
	pickerGroup: { flex: 1, gap: getSpacing("px1") },
	pickerLabel: {
		color: Colors.textSecondary,
		fontSize: getTypography("bodySmall"),
		marginBottom: getSpacing("px1"),
	},
	pickerButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: getSpacing("px2"),
		backgroundColor: Colors.backgroundLight,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: 8,
		paddingVertical: getSpacing("px2"),
		paddingHorizontal: getSpacing("px2"),
	},
	pickerButtonText: {
		color: Colors.text,
		fontSize: getTypography("bodySmall"),
	},
	searchButton: {
		backgroundColor: Colors.primary,
		alignItems: "center",
		paddingVertical: getSpacing("px3"),
		borderRadius: 8,
		marginHorizontal: getSpacing("px3"),
		marginTop: getSpacing("px3"),
	},
	searchButtonText: {
		color: Colors.text,
		fontSize: getTypography("button"),
		fontWeight: "bold",
	},
	resultsContainer: { flex: 1, marginTop: getSpacing("px3") },
	toggleRow: {
		flexDirection: "row",
		paddingHorizontal: getSpacing("px3"),
		gap: getSpacing("px2"),
		marginBottom: getSpacing("px2"),
	},
	toggleButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: getSpacing("px1"),
		paddingVertical: getSpacing("px1"),
		paddingHorizontal: getSpacing("px3"),
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	toggleButtonActive: {
		borderColor: Colors.primary,
	},
	toggleText: { color: Colors.text, fontSize: getTypography("body") },
	toggleTextActive: { color: Colors.primary, fontWeight: "bold" },
	coordinateRow: {
		flexDirection: "row",
		backgroundColor: Colors.backgroundLight,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 12,
		marginHorizontal: getSpacing("px3"),
		marginTop: 8,
	},
	property: { alignItems: "center", flex: 1, gap: 8 },
	propertyText: {
		color: Colors.text,
		fontSize: 18,
		lineHeight: 18,
	},
	map: { flex: 1, marginHorizontal: getSpacing("px3") },
});
