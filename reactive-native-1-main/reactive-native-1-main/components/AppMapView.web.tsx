import React from 'react';
import { StyleSheet, View, Text, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.008}%2C${latitude - 0.005}%2C${longitude + 0.008}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={[styles.container, style]}>
      {/* Web Map Embed */}
      <iframe
        title="OpenStreetMap"
        src={osmEmbedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 12,
        }}
      />

      {/* Map Overlay Badge */}
      <View style={styles.overlayBadge}>
        <View style={[styles.dot, { backgroundColor: markerColor }]} />
        <Text style={styles.badgeText}>
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </Text>
      </View>

      {/* Open external map link */}
      <Pressable style={styles.externalButton} onPress={openInGoogleMaps}>
        <Ionicons name="navigate-outline" size={14} color="#FFF" />
        <Text style={styles.externalText}>Open Maps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  overlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  externalButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#000080',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  externalText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
