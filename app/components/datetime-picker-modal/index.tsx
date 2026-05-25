import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
	Modal,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Colors, getSpacing, getTypography } from "@/src/theme";

interface DateTimePickerModalProps {
	visible: boolean;
	mode: "date" | "time";
	value: Date;
	onConfirm: (date: Date) => void;
	onCancel: () => void;
}

export default function DateTimePickerModal({
	visible,
	mode,
	value,
	onConfirm,
	onCancel,
}: DateTimePickerModalProps) {
	const [tempDate, setTempDate] = useState(value);

	useEffect(() => {
		if (visible) setTempDate(value);
	}, [visible, value]);

	const handleChange = useCallback(
		(_event: any, selectedDate?: Date) => {
			if (selectedDate) setTempDate(selectedDate);
		},
		[],
	);

	if (Platform.OS === "ios") {
		return (
			<Modal visible={visible} transparent animationType="fade">
				<View style={styles.overlay}>
					<View style={styles.modalContainer}>
						<DateTimePicker
							value={tempDate}
							mode={mode}
							display="spinner"
							onChange={handleChange}
						/>
						<View style={styles.buttonRow}>
							<TouchableOpacity onPress={onCancel} style={styles.button}>
								<Text style={styles.buttonText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => onConfirm(tempDate)}
								style={[styles.button, styles.confirmButton]}
							>
								<Text style={[styles.buttonText, styles.confirmText]}>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		);
	}

	if (!visible) return null;

	return (
		<DateTimePicker
			value={value}
			mode={mode}
			display="spinner"
			onChange={(_event: any, date?: Date) => {
				if (_event.type === "set" && date) {
					onConfirm(date);
				} else {
					onCancel();
				}
			}}
		/>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: Colors.overlay,
		justifyContent: "flex-end",
	},
	modalContainer: {
		backgroundColor: Colors.backgroundLight,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingTop: getSpacing("px6"),
		paddingBottom: getSpacing("px8"),
		paddingHorizontal: getSpacing("px4"),
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: getSpacing("px4"),
		gap: getSpacing("px3"),
	},
	button: {
		flex: 1,
		alignItems: "center",
		paddingVertical: getSpacing("px3"),
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	confirmButton: {
		backgroundColor: Colors.primary,
		borderColor: Colors.primary,
	},
	buttonText: {
		color: Colors.text,
		fontSize: getTypography("body"),
		fontWeight: "bold",
	},
	confirmText: {
		color: Colors.text,
	},
});
