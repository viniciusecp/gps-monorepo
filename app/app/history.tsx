import { Coordinate } from "@/common/model";
import CoordinateItem from "@/components/coordinates/coordinate-item";

import { useErrorPopup } from "@/src/context/ErrorPopupContext";
import { ApiError, tryAuthRequest } from "@/src/services/api";
import { Colors, getSpacing, getTypography } from "@/src/theme";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "@/components/datetime-picker-modal";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewToken,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

dayjs.extend(utc);
dayjs.extend(timezone);

type PickerTarget = "startDate" | "startTime" | "endDate" | "endTime";

const QUICK_RANGES = [
  { label: "Última hora", getRange: () => ({ start: dayjs().subtract(1, "hour").toDate(), end: dayjs().toDate() }) },
  { label: "Hoje", getRange: () => ({ start: dayjs().startOf("day").toDate(), end: dayjs().toDate() }) },
] as const;

const darkMapStyle = [
	{ elementType: "geometry", stylers: [{ color: "#141414" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#808080" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#141414" }] },
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#2a2a2a" }],
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#333" }],
	},
	{
		featureType: "road",
		elementType: "labels.text.fill",
		stylers: [{ color: "#b0b0b0" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#0d0d0d" }],
	},
	{
		featureType: "poi",
		elementType: "geometry",
		stylers: [{ color: "#1a1a1a" }],
	},
	{
		featureType: "poi",
		elementType: "labels.text.fill",
		stylers: [{ color: "#666" }],
	},
	{ featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function History() {
	const router = useRouter();
	const { imei } = useLocalSearchParams<{ imei: string }>();
	const { showError } = useErrorPopup();

	const [startDate, setStartDate] = useState(dayjs().subtract(30, "minute").toDate());
	const [endDate, setEndDate] = useState(new Date());
	const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);
	const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showMap, setShowMap] = useState(false);

	const initialViewableIndices = useRef<Set<number> | null>(null);
	const everSeenIndices = useRef<Set<number>>(new Set());

	const fetchHistory = useCallback(async () => {
		if (!imei) return;

		if (startDate > endDate) {
			showError(
				"Período inválido",
				"A data de início deve ser anterior à data de fim.",
			);
			return;
		}

		setIsLoading(true);
		setCoordinates([]);
		initialViewableIndices.current = null;
		everSeenIndices.current = new Set();
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
				const message =
					error.status >= 500
						? "Servidor temporariamente indisponível. Tente novamente em alguns segundos."
						: error.status === 401 || error.status === 403
							? "Sua sessão expirou. Faça login novamente."
							: `Erro inesperado (${error.status}). Tente novamente.`;
				showError("Erro ao carregar histórico", message);
			} else {
				showError(
					"Erro de conexão",
					"Verifique sua internet e tente novamente.",
				);
			}
		} finally {
			setIsLoading(false);
		}
	}, [imei, startDate, endDate, showError]);

	const handlePickerConfirm = useCallback(
		(selectedDate: Date) => {
			if (activePicker === "startDate") setStartDate(selectedDate);
			if (activePicker === "startTime") setStartDate(selectedDate);
			if (activePicker === "endDate") setEndDate(selectedDate);
			if (activePicker === "endTime") setEndDate(selectedDate);
			setActivePicker(null);
		},
		[activePicker],
	);

	const handlePickerCancel = useCallback(() => {
		setActivePicker(null);
	}, []);

	const handleQuickRange = useCallback(
		(range: (typeof QUICK_RANGES)[number]) => {
			const { start, end } = range.getRange();
			setStartDate(start);
			setEndDate(end);
		},
		[],
	);

	function formatDateLabel(date: Date) {
		return dayjs(date).format("DD/MM/YYYY");
	}

	function formatTimeLabel(date: Date) {
		return dayjs(date).format("HH:mm");
	}

	const viewabilityConfig = useMemo(
		() => ({ itemVisiblePercentThreshold: 0 }),
		[],
	);

	const onViewableItemsChanged = useCallback(
		({
			viewableItems,
		}: {
			viewableItems: ViewToken<Coordinate>[];
			changed: ViewToken<Coordinate>[];
		}) => {
			if (initialViewableIndices.current === null) {
				initialViewableIndices.current = new Set(
					viewableItems.map((v) => v.index!),
				);
			}
			viewableItems.forEach((v) => everSeenIndices.current.add(v.index!));
		},
		[],
	);

	const renderCoordinateItem = useCallback(
		({ item, index }: { item: Coordinate; index: number }) => {
			const isInitialViewable =
				initialViewableIndices.current?.has(index) ?? true;
			const hasBeenSeen = everSeenIndices.current.has(index);
			const animateOnMount = isInitialViewable && !hasBeenSeen;
			return (
				<CoordinateItem
					coordinate={item}
					index={index}
					animateOnMount={animateOnMount}
				/>
			);
		},
		[],
	);

	const keyExtractor = useCallback(
		(item: Coordinate, index: number) =>
			`${item.latitude}-${item.longitude}-${item.time}-${index}`,
		[],
	);

	const hasResults = coordinates.length > 0;

	if (!imei) {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<FontAwesome6 name="arrow-left" size={20} color={Colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Histórico</Text>
					<View style={{ width: 20 }} />
				</View>
				<View style={styles.centerContent}>
					<FontAwesome6 name="map-location-dot" size={48} color={Colors.textTertiary} />
					<Text style={styles.emptyText}>Nenhum veículo selecionado</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<FontAwesome6 name="arrow-left" size={20} color={Colors.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Histórico</Text>
				<View style={{ width: 20 }} />
			</View>

			<View style={styles.searchCard}>
				<View style={styles.pickerRow}>
					<View style={styles.pickerColumn}>
						<Text style={styles.pickerLabel}>INÍCIO</Text>
						<TouchableOpacity
							style={styles.pickerButton}
							onPress={() => setActivePicker("startDate")}
						>
							<FontAwesome6
								name="calendar-days"
								size={14}
								color={Colors.primary}
							/>
							<Text style={styles.pickerButtonText}>
								{formatDateLabel(startDate)}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.pickerButton}
							onPress={() => setActivePicker("startTime")}
						>
							<FontAwesome6
								name="clock"
								size={14}
								color={Colors.primary}
							/>
							<Text style={styles.pickerButtonText}>
								{formatTimeLabel(startDate)}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.pickerDivider} />
					<View style={styles.pickerColumn}>
						<Text style={styles.pickerLabel}>FIM</Text>
						<TouchableOpacity
							style={styles.pickerButton}
							onPress={() => setActivePicker("endDate")}
						>
							<FontAwesome6
								name="calendar-days"
								size={14}
								color={Colors.primary}
							/>
							<Text style={styles.pickerButtonText}>
								{formatDateLabel(endDate)}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.pickerButton}
							onPress={() => setActivePicker("endTime")}
						>
							<FontAwesome6
								name="clock"
								size={14}
								color={Colors.primary}
							/>
							<Text style={styles.pickerButtonText}>
								{formatTimeLabel(endDate)}
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.quickRow}>
					{QUICK_RANGES.map((r) => (
						<TouchableOpacity
							key={r.label}
							style={styles.quickChip}
							onPress={() => handleQuickRange(r)}
							activeOpacity={0.7}
						>
							<Text style={styles.quickChipText}>{r.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				<DateTimePickerModal
					visible={activePicker !== null}
					mode={
						activePicker === "startDate" || activePicker === "endDate"
							? "date"
							: "time"
					}
					value={
						activePicker === "startDate" || activePicker === "startTime"
							? startDate
							: endDate
					}
					onConfirm={handlePickerConfirm}
					onCancel={handlePickerCancel}
				/>

				<TouchableOpacity
					style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
					onPress={fetchHistory}
					disabled={isLoading}
					activeOpacity={0.85}
				>
					{isLoading ? (
						<ActivityIndicator size="small" color={Colors.text} />
					) : (
						<FontAwesome6 name="magnifying-glass" size={16} color={Colors.text} />
					)}
					<Text style={styles.searchButtonText}>
						{isLoading ? "Buscando..." : "Buscar"}
					</Text>
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<View style={styles.centerContent}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : hasResults ? (
				<View style={styles.resultsContainer}>
					<View style={styles.segmentedControl}>
						<TouchableOpacity
							style={[
								styles.segment,
								!showMap && styles.segmentActive,
							]}
							onPress={() => setShowMap(false)}
							activeOpacity={0.7}
						>
							<View style={styles.segmentInner}>
								<FontAwesome6
									name="list"
									size={15}
									color={!showMap ? Colors.primary : Colors.textSecondary}
								/>
								<Text
									style={[
										styles.segmentText,
										!showMap && styles.segmentTextActive,
									]}
								>
									Lista
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.segment,
								showMap && styles.segmentActive,
							]}
							onPress={() => setShowMap(true)}
							activeOpacity={0.7}
						>
							<View style={styles.segmentInner}>
								<FontAwesome6
									name="map"
									size={15}
									color={showMap ? Colors.primary : Colors.textSecondary}
								/>
								<Text
									style={[
										styles.segmentText,
										showMap && styles.segmentTextActive,
									]}
								>
									Mapa
								</Text>
							</View>
						</TouchableOpacity>
					</View>

					{showMap ? (
						<MapView
							style={styles.map}
							customMapStyle={darkMapStyle}
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
								pinColor={Colors.success}
							/>
							<Marker
								coordinate={{
									latitude: coordinates[coordinates.length - 1].latitude,
									longitude: coordinates[coordinates.length - 1].longitude,
								}}
								title="Fim"
								pinColor={Colors.error}
							/>
						</MapView>
					) : (
						<FlatList
							data={coordinates}
							renderItem={renderCoordinateItem}
							keyExtractor={keyExtractor}
							onViewableItemsChanged={onViewableItemsChanged}
							viewabilityConfig={viewabilityConfig}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.listContent}
							removeClippedSubviews
							maxToRenderPerBatch={10}
							windowSize={5}
						/>
					)}
				</View>
			) : (
				<View style={styles.centerContent}>
					<FontAwesome6
						name="route"
						size={48}
						color={Colors.textTertiary}
					/>
					<Text style={styles.emptyHint}>
						Selecione um período e busque
					</Text>
				</View>
			)}
		</View>
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
		justifyContent: "space-between",
		paddingHorizontal: getSpacing("px4"),
		paddingTop: getSpacing("px4"),
		paddingBottom: getSpacing("px3"),
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border,
	},
	headerTitle: {
		fontSize: getTypography("h3"),
		fontWeight: getTypography("fontWeight").bold,
		color: Colors.text,
		letterSpacing: -0.3,
	},
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: getSpacing("px3"),
	},
	emptyText: {
		color: Colors.textSecondary,
		fontSize: getTypography("body"),
	},
	emptyHint: {
		color: Colors.textTertiary,
		fontSize: getTypography("body"),
	},
	searchCard: {
		backgroundColor: Colors.backgroundLight,
		marginHorizontal: getSpacing("px4"),
		marginTop: getSpacing("px4"),
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.border,
		padding: getSpacing("px4"),
		gap: getSpacing("px4"),
	},
	pickerRow: {
		flexDirection: "row",
		gap: getSpacing("px4"),
	},
	pickerColumn: {
		flex: 1,
		gap: getSpacing("px2"),
	},
	pickerDivider: {
		width: 1,
		backgroundColor: Colors.border,
	},
	pickerLabel: {
		color: Colors.textTertiary,
		fontSize: getTypography("overline"),
		fontWeight: getTypography("fontWeight").semibold,
		letterSpacing: 0.8,
	},
	pickerButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: getSpacing("px2"),
		backgroundColor: Colors.backgroundDark,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: 8,
		paddingVertical: getSpacing("px3"),
		paddingHorizontal: getSpacing("px3"),
		minHeight: 46,
	},
	pickerButtonText: {
		color: Colors.text,
		fontSize: getTypography("body"),
		fontWeight: getTypography("fontWeight").semibold,
	},
	searchButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: getSpacing("px2"),
		backgroundColor: Colors.primary,
		paddingVertical: getSpacing("px3"),
		borderRadius: 8,
	},
	searchButtonDisabled: {
		backgroundColor: Colors.primaryDark,
		opacity: 0.7,
	},
	searchButtonText: {
		color: Colors.text,
		fontSize: getTypography("button"),
		fontWeight: getTypography("fontWeight").bold,
	},
	quickRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: getSpacing("px2"),
	},
	quickChip: {
		paddingVertical: getSpacing("px1_5"),
		paddingHorizontal: getSpacing("px3"),
		borderRadius: 20,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.backgroundDark,
	},
	quickChipText: {
		fontSize: getTypography("caption"),
		color: Colors.textSecondary,
		fontWeight: getTypography("fontWeight").medium,
	},
	resultsContainer: {
		flex: 1,
		marginTop: getSpacing("px3"),
	},
	segmentedControl: {
		flexDirection: "row",
		marginHorizontal: getSpacing("px4"),
		backgroundColor: Colors.backgroundDark,
		borderRadius: 8,
		padding: 3,
		borderWidth: 1,
		borderColor: Colors.border,
		marginBottom: getSpacing("px2"),
	},
	segment: {
		flex: 1,
		borderRadius: 6,
		paddingVertical: getSpacing("px2"),
		borderWidth: 1,
		borderColor: "transparent",
	},
	segmentActive: {
		borderColor: Colors.primary,
	},
	segmentInner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: getSpacing("px1"),
	},
	segmentText: {
		fontSize: getTypography("bodySmall"),
		fontWeight: getTypography("fontWeight").medium,
		color: Colors.text,
	},
	segmentTextActive: {
		color: Colors.primary,
		fontWeight: getTypography("fontWeight").bold,
	},
	listContent: {
		paddingHorizontal: getSpacing("px4"),
		paddingBottom: getSpacing("px8"),
	},
	map: {
		flex: 1,
		marginHorizontal: getSpacing("px4"),
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: getSpacing("px2"),
	},
});
