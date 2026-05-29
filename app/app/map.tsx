import * as Linking from "expo-linking";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, getSpacing, getTypography, Typography } from "@/src/theme";
import { reverseGeocode } from "@/src/services/geocode";

function PulsingMarker() {
  const ringOpacity = useSharedValue(0.5);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    ringOpacity.value = withRepeat(
      withTiming(0, {
        duration: 2200,
        easing: Easing.out(Easing.ease),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );
    ringScale.value = withRepeat(
      withTiming(2.2, {
        duration: 2200,
        easing: Easing.out(Easing.ease),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );
  }, [ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={markerStyles.container}>
      <Animated.View style={[markerStyles.ring, ringStyle]} />
      <View style={markerStyles.core}>
        <View style={markerStyles.innerDot} />
      </View>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  core: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text,
  },
});

export default function Map() {
  const router = useRouter();
  const { latitude, longitude, speed, date, time } = useLocalSearchParams();
  const lat = Number(latitude);
  const lon = Number(longitude);
  const speedValue = speed ? Number(speed) : undefined;

  const isValidCoord =
    latitude !== undefined &&
    longitude !== undefined &&
    !isNaN(lat) &&
    !isNaN(lon);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(isValidCoord);
  const [addressError, setAddressError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const fetchAddress = useCallback(() => {
    if (!isValidCoord) return;
    setAddressLoading(true);
    setAddressError(null);

    reverseGeocode(lat, lon)
      .then((data) => {
        setDisplayName(data.display_name);
        setAddressLoading(false);
      })
      .catch((err: Error) => {
        setAddressError(err.message);
        setAddressLoading(false);
      });
  }, [lat, lon, isValidCoord]);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  const handleAddressPress = useCallback(() => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lon}`);
  }, [lat, lon]);

  const isMoving = speedValue !== undefined && speedValue > 0;

  if (!isValidCoord) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="map-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorTitle}>Localização indisponível</Text>
          <Text style={styles.errorMessage}>
            Coordenadas inválidas ou ausentes.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        mapType="standard"
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lon }}
          tracksViewChanges={false}
        >
          <PulsingMarker />
        </Marker>
      </MapView>

      <LinearGradient
        colors={["transparent", "rgba(10,10,10,0.95)"]}
        locations={[0.4, 1]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      <Animated.View
        entering={FadeIn.duration(400).delay(200)}
        style={styles.backButtonContainer}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.text} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(300)}
        style={styles.topStrip}
      >
        <View style={styles.coordBlock}>
          <Text style={styles.coordLabel}>LAT</Text>
          <Text style={styles.coordValue}>{lat.toFixed(6)}°</Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordBlock}>
          <Text style={styles.coordLabel}>LNG</Text>
          <Text style={styles.coordValue}>{lon.toFixed(6)}°</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(500)}
        style={styles.instrumentPanel}
      >
        <View style={styles.addressSection}>
          {addressLoading ? (
            <View style={styles.addressLoadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.addressLoadingText}>Buscando endereço...</Text>
            </View>
          ) : addressError ? (
            <View style={styles.addressErrorSection}>
              <Text style={styles.addressError}>{addressError}</Text>
              <TouchableOpacity onPress={fetchAddress} activeOpacity={0.7}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddressPress}
              style={styles.addressTouchable}
              activeOpacity={0.6}
            >
              <FontAwesome6
                name="location-dot"
                size={14}
                color={Colors.primaryLight}
                style={styles.locationIcon}
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {displayName}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.dataRow}>
          {speedValue !== undefined && (
            <View
              style={[
                styles.dataBadge,
                isMoving ? styles.dataBadgeMoving : styles.dataBadgeStopped,
              ]}
            >
              <FontAwesome6
                name={isMoving ? "gauge-high" : "pause"}
                size={13}
                color={isMoving ? Colors.success : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.dataValue,
                  { color: isMoving ? Colors.success : Colors.textSecondary },
                ]}
              >
                {speedValue}
              </Text>
              <Text style={styles.dataUnit}>km/h</Text>
            </View>
          )}

          {date && (
            <View style={styles.dataBadge}>
              <Ionicons
                name="time-outline"
                size={13}
                color={Colors.textTertiary}
              />
              <Text style={styles.dateTimeText}>
                {date} {time}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: getSpacing("px8"),
    gap: getSpacing("px3"),
  },
  errorTitle: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: getTypography("body"),
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: getSpacing("px2"),
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
  },

  backButtonContainer: {
    position: "absolute",
    top: 54,
    left: getSpacing("px3"),
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px1"),
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: getSpacing("px3"),
    paddingVertical: getSpacing("px2"),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  backText: {
    color: Colors.text,
    fontSize: getTypography("bodySmall"),
    fontWeight: getTypography("fontWeight").medium,
  },

  topStrip: {
    position: "absolute",
    top: 54,
    right: getSpacing("px3"),
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: getSpacing("px3"),
    paddingVertical: getSpacing("px1_5"),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: getSpacing("px2"),
  },
  coordBlock: {
    alignItems: "center",
  },
  coordLabel: {
    fontSize: getTypography("overline"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.primaryLight,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  coordValue: {
    fontSize: getTypography("caption"),
    fontWeight: getTypography("fontWeight").medium,
    color: Colors.text,
    fontVariant: ["tabular-nums"],
  },
  coordDivider: {
    width: 1,
    height: 26,
    backgroundColor: Colors.glassBorder,
  },

  instrumentPanel: {
    position: "absolute",
    bottom: 44,
    left: getSpacing("px3"),
    right: getSpacing("px3"),
    backgroundColor: Colors.glassBackground,
    borderRadius: 20,
    padding: getSpacing("px4"),
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: getSpacing("px3"),
  },

  addressSection: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressTouchable: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  locationIcon: {
    marginTop: 2,
    marginRight: getSpacing("px2"),
  },
  addressText: {
    flex: 1,
    fontSize: getTypography("body"),
    color: Colors.text,
    fontWeight: getTypography("fontWeight").medium,
    lineHeight: getTypography("body") * Typography.lineHeight.normal,
  },
  addressLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
    flex: 1,
  },
  addressLoadingText: {
    color: Colors.textSecondary,
    fontSize: getTypography("bodySmall"),
  },
  addressErrorSection: {
    flex: 1,
    gap: getSpacing("px1_5"),
  },
  addressError: {
    color: Colors.error,
    fontSize: getTypography("bodySmall"),
  },
  retryText: {
    fontSize: getTypography("bodySmall"),
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
  },
  dataBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px1_5"),
    paddingHorizontal: getSpacing("px2"),
    paddingVertical: getSpacing("px1"),
    borderRadius: 10,
    backgroundColor: Colors.glassHighlight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dataBadgeMoving: {
    borderColor: "rgba(0,200,83,0.3)",
  },
  dataBadgeStopped: {
    borderColor: Colors.glassBorder,
  },
  dataValue: {
    fontSize: getTypography("button"),
    fontWeight: getTypography("fontWeight").bold,
    fontVariant: ["tabular-nums"],
  },
  dataUnit: {
    fontSize: getTypography("caption"),
    color: Colors.textTertiary,
    fontWeight: getTypography("fontWeight").medium,
  },
  dateTimeText: {
    fontSize: getTypography("caption"),
    color: Colors.textSecondary,
    fontWeight: getTypography("fontWeight").medium,
  },
});
