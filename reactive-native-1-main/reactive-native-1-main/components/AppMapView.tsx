import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, MapType } from 'react-native-maps';

export interface AppMapViewProps {
  latitude: number;
  longitude: number;
  mapType?: 'standard' | 'satellite' | 'hybrid';
  markerColor?: string;
  style?: any;
}

export function AppMapView({
  latitude,
  longitude,
  mapType = 'standard',
  markerColor = '#000080',
  style,
}: AppMapViewProps) {
  const mapTypeVal = (mapType === 'satellite' ? 'satellite' : mapType === 'hybrid' ? 'hybrid' : 'standard') as MapType;

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={[styles.map, style]}
      mapType={mapTypeVal}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      scrollEnabled={true}
      zoomEnabled={true}
    >
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
      >
        <View style={[styles.markerBg, { backgroundColor: markerColor }]}>
          <View style={styles.markerInner} />
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  markerBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000080',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
});
