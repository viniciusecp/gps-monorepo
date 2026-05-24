import BackButton from "@/components/back-button";
import { Colors, getSpacing } from "@/src/theme";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const { latitude, longitude } = useLocalSearchParams();
  const lat = Number(latitude);
  const lon = Number(longitude);

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
});
