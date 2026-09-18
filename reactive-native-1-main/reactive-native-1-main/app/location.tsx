// Module 4: Location — Permission, GPS Coords, Accuracy, Refresh, Copy to Clipboard, Attach to Survey Draft
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { AppMapView } from '../components/AppMapView';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';


export default function LocationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { updateDraft, draft } = useSurveys();

  const [coords, setCoords] = useState(draft.location);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const requestAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        setLoading(false);
        return;
      }
      setPermissionStatus('granted');

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy ?? 0),
      };
      setCoords(newCoords);
    } catch (err) {
      console.log('Location error:', err);
      Alert.alert('Error', 'Unable to fetch location. Please ensure location services are enabled on your device.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopyToClipboard = async () => {
    if (!coords) return;
    const text = `Lat: ${coords.latitude.toFixed(6)}, Lon: ${coords.longitude.toFixed(6)} (±${coords.accuracy}m)`;
    await Clipboard.setStringAsync(text);
    Alert.alert('Coordinate Copied!', 'Coordinates copied to clipboard.');
  };

  const handleAttachToSurvey = () => {
    if (!coords) return;
    updateDraft({ location: coords });
    Alert.alert('Attached to Survey Draft', 'Location details updated in active survey template.');
  };

  // ----- PERMISSION DENIED -----
  if (permissionStatus === 'denied') {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Location" showBackButton />
        <View style={styles.centeredContent}>
          <View style={[styles.stateIcon, { backgroundColor: themeColors.error + '15' }]}>
            <Ionicons name="location-outline" size={56} color={themeColors.error} />
          </View>
          <Text style={[styles.stateTitle, { color: themeColors.text }]}>Location Access Denied</Text>
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>
            Location permission is required to log inspect coordinates. Please enable permission in settings.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: themeColors.primary }, pressed && styles.pressed]}
            onPress={requestAndFetch}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFF" style={{ marginRight: Spacing.xs }} />
            <Text style={styles.primaryButtonText}>Request Permission Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- INITIAL / NO COORDS YET -----
  if (permissionStatus === 'unknown' && !coords) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Location Tracker" showBackButton />
        <View style={styles.centeredContent}>
          <View style={[styles.stateIcon, { backgroundColor: themeColors.primary + '15' }]}>
            <Ionicons name="map-outline" size={56} color={themeColors.primary} />
          </View>
          <Text style={[styles.stateTitle, { color: themeColors.text }]}>Record GPS Coordinates</Text>
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>
            Tap the button below to retrieve precise GPS coordinates and pin them to your report.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: themeColors.primary }, pressed && styles.pressed]}
            onPress={requestAndFetch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="locate-outline" size={20} color="#FFF" style={{ marginRight: Spacing.sm }} />
                <Text style={styles.primaryButtonText}>Fetch GPS Coordinates</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- LOADING STATE -----
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Pinning Location" showBackButton />
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.stateText, { color: themeColors.textSecondary, marginTop: Spacing.md }]}>
            Acquiring satellite lock...-
          </Text>
        </View>
      </View>
    );
  }

  // ----- COORDINATES & INTERACTIVE MAP VIEW -----
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Location Utility" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status Indicator banner */}
        <View style={[styles.banner, { backgroundColor: themeColors.success + '15', borderColor: themeColors.success }]}>
          <Ionicons name="checkmark-circle-sharp" size={20} color={themeColors.success} />
          <Text style={[styles.bannerText, { color: themeColors.success }]}>GPS Satellite Lock Acquired</Text>
        </View>

        {/* GPS Card Display */}
        <View style={[styles.coordsTerminal, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalStatusDot} />
            <Text style={[styles.terminalTitle, { color: themeColors.textSecondary }]}>GPS DATA INPUT</Text>
          </View>
          
          <View style={styles.terminalBody}>
            <View style={styles.terminalRow}>
              <Text style={[styles.terminalLabel, { color: themeColors.textSecondary }]}>LATITUDE</Text>
              <Text style={[styles.terminalValue, { color: themeColors.text }]}>{coords!.latitude.toFixed(6)}</Text>
            </View>
            <View style={[styles.terminalDivider, { backgroundColor: themeColors.border }]} />
            <View style={styles.terminalRow}>
              <Text style={[styles.terminalLabel, { color: themeColors.textSecondary }]}>LONGITUDE</Text>
              <Text style={[styles.terminalValue, { color: themeColors.text }]}>{coords!.longitude.toFixed(6)}</Text>
            </View>
            <View style={[styles.terminalDivider, { backgroundColor: themeColors.border }]} />
            <View style={styles.terminalRow}>
              <Text style={[styles.terminalLabel, { color: themeColors.textSecondary }]}>ACCURACY</Text>
              <Text style={[styles.terminalValue, { color: themeColors.secondary }]}>± {coords!.accuracy} meters</Text>
            </View>
          </View>
        </View>

        {/* Map Container */}

        <View style={[styles.mapContainer, { borderColor: themeColors.border }, Shadows.medium]}>
          <AppMapView
            latitude={coords!.latitude}
            longitude={coords!.longitude}
            mapType={mapType}
            markerColor={themeColors.primary}
            style={styles.map}
          />

          {/* Floating Map Mode Selector */}
          <View style={[styles.mapControls, { backgroundColor: themeColors.surface + 'e6', borderColor: themeColors.border }]}>
            <Pressable
              style={[
                styles.mapControlButton,
                mapType === 'standard' && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => setMapType('standard')}
            >
              <Text style={[styles.mapControlText, { color: mapType === 'standard' ? '#FFF' : themeColors.text }]}>
                Default
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.mapControlButton,
                mapType === 'satellite' && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => setMapType('satellite')}
            >
              <Text style={[styles.mapControlText, { color: mapType === 'satellite' ? '#FFF' : themeColors.text }]}>
                Satellite
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Action Panel */}
        <View style={styles.actionsPanel}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, pressed && styles.pressed]}
            onPress={requestAndFetch}
          >
            <View style={[styles.actionIcon, { backgroundColor: themeColors.primary + '15' }]}>
              <Ionicons name="refresh" size={20} color={themeColors.primary} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>Refresh Coordinates</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, pressed && styles.pressed]}
            onPress={handleCopyToClipboard}
          >
            <View style={[styles.actionIcon, { backgroundColor: themeColors.secondary + '15' }]}>
              <Ionicons name="copy" size={20} color={themeColors.secondary} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>Copy Coordinates</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: themeColors.surface,
                borderColor: draft.location ? themeColors.success : themeColors.border,
              },
              pressed && styles.pressed,
            ]}
            onPress={handleAttachToSurvey}
          >
            <View style={[styles.actionIcon, { backgroundColor: themeColors.success + '15' }]}>
              <Ionicons name="attach" size={20} color={themeColors.success} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>Attach to Survey Template</Text>
            {draft.location ? (
              <Ionicons name="checkmark-circle" size={18} color={themeColors.success} style={{ marginRight: 2 }} />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
            )}
          </Pressable>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  stateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stateText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    ...Shadows.medium,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },

  scrollContent: { padding: Spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  bannerText: {
    fontWeight: '700',
    fontSize: 13,
  },

  coordsTerminal: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  terminalStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  terminalTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  terminalBody: {
    gap: Spacing.xs,
  },
  terminalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  terminalLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  terminalValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  terminalDivider: {
    height: 1,
    opacity: 0.5,
  },

  mapContainer: {
    height: 260,
    width: '100%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  mapControls: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    zIndex: 10,
  },
  mapControlButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.sm,
  },
  mapControlText: {
    fontSize: 10,
    fontWeight: '800',
  },

  actionsPanel: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.light,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
