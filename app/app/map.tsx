import BackButton from "@/components/back-button";
import { Colors, getSpacing } from "@/src/theme";
import { reverseGeocode } from "@/src/services/geocode";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const { latitude, longitude } = useLocalSearchParams();
  const lat = Number(latitude);
  const lon = Number(longitude);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    reverseGeocode(lat, lon)
      .then((data) => {
        setDisplayName(data.display_name);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [lat, lon]);

  return (
    <View style={styles.container}>
      <BackButton />

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lon,
          }}
          title="Ultima localização"
        />
      </MapView>

      <View style={styles.infoCard}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.infoText}>Buscando endereço...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.infoText}>{displayName}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
    marginTop: getSpacing("px3"),
  },
  infoCard: {
    position: "absolute",
    bottom: getSpacing("px4"),
    left: getSpacing("px3"),
    right: getSpacing("px3"),
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    padding: getSpacing("px3"),
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing("px2"),
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
  },
});
