import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

// {"coords": {"accuracy": 20, "altitude": -33, "altitudeAccuracy": 1.559281587600708, "heading": 0, "latitude": 19.1653112, "longitude": 73.0228315, "speed": 0}, "mocked": false, "timestamp": 1686217217720}


export default function App() {
  const [location, setLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [heading, setHeading] = useState(0);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        Location.watchPositionAsync()
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);
  useEffect(() => {
    const watchLocation = async () => {
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update interval in milliseconds
        },
        (location) => {
          setLocation(location);
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    };

    watchLocation();
  }, []);
  useEffect(() => {
    if (location && mapRef) {
      const { latitude, longitude } = location.coords;
      mapRef.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location, mapRef]);

  useEffect(() => {
    Location.watchHeadingAsync((heading) => {
      setHeading(heading.trueHeading);
    });
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          ref={(ref) => setMapRef(ref)}
        >

          <Marker coordinate={location.coords} title="Here I am">
            <FontAwesome name="location-arrow" size={25} color="green" style={{ transform: [{ rotate: `${heading - 45}deg` }] }} />
          </Marker>

        </MapView>
      ) : (
        <View style={styles.container}><ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
