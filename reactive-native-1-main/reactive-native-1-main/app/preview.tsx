// Module 7: Survey Preview — Detailed Summary, Edit Survey, Submit Survey with Geo-Anomaly Detection
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppMapView } from '../components/AppMapView';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import {
  useSurveys,
  Survey,
  DOSJE_PROJECTS,
  calculateHaversineDistanceMeters,
} from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

export default function PreviewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { draft, surveys, submitDraft, loadSurveyIntoDraft } = useSurveys();
  const params = useLocalSearchParams<{ id?: string }>();
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // If an ID param is provided, we're in read-only view of a past survey.
  const readOnlySurvey: Survey | undefined = params.id
    ? surveys.find((s) => s.id === params.id)
    : undefined;

  const isReadOnly = !!readOnlySurvey;

  const projName = isReadOnly ? (readOnlySurvey?.projectName || readOnlySurvey?.siteName || '') : (draft.projectName || draft.siteName || '');
  const benef = isReadOnly ? (readOnlySurvey?.beneficiariesPresent || readOnlySurvey?.clientName || '') : (draft.beneficiariesPresent || draft.clientName || '');
  const inspType = isReadOnly ? (readOnlySurvey?.inspectionType || readOnlySurvey?.priority || 'Scheduled') : (draft.inspectionType || draft.priority || 'Scheduled');

  // The data to render: either read-only survey or active draft
  const data = isReadOnly ? readOnlySurvey! : {
    id: 'DRAFT PREVIEW',
    projectName: projName,
    siteName: projName,
    beneficiariesPresent: benef,
    clientName: benef,
    description: draft.description,
    inspectionType: inspType,
    priority: draft.priority || 'Medium',
    date: draft.date.toISOString(),
    photoUri: draft.photoUri,
    photoTimestamp: draft.photoTimestamp,
    location: draft.location,
    contact: draft.contact,
    notes: draft.notes,
    createdAt: new Date().toISOString(),
    anomaly: false,
    anomalyDistanceMeters: 0,
  };

  // Step 4: Geo-Anomaly calculation
  const targetProject = DOSJE_PROJECTS.find((p) => p.name === projName);
  let isGeoAnomaly = isReadOnly ? data.anomaly : false;
  let distanceMeters = isReadOnly ? data.anomalyDistanceMeters : 0;

  if (targetProject && data.location) {
    distanceMeters = calculateHaversineDistanceMeters(
      data.location.latitude,
      data.location.longitude,
      targetProject.latitude,
      targetProject.longitude
    );
    isGeoAnomaly = distanceMeters > 500;
  } else if (!data.location) {
    isGeoAnomaly = true;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Surprise':
      case 'High':
        return themeColors.error;
      case 'AI-Random':
      case 'Medium':
        return themeColors.accent;
      default:
        return themeColors.primary;
    }
  };

  const handleSubmit = () => {
    const result = submitDraft();
    if (!result.success) {
      Alert.alert('Cannot Submit', result.error ?? 'Please complete the form before submitting.');
      return;
    }
    Alert.alert(
      'Inspection Submitted!',
      `Inspection ID: ${result.id}\n\nYour DoSJE field inspection report has been saved successfully.`,
      [
        {
          text: 'Go to Reports',
          onPress: () => router.push('/(tabs)/history'),
        },
        {
          text: 'Back to Dashboard',
          onPress: () => router.push('/(tabs)'),
        },
      ]
    );
  };

  const handleEdit = () => {
    if (isReadOnly) {
      loadSurveyIntoDraft(readOnlySurvey!);
    }
    router.push('/(tabs)/new-survey');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title={isReadOnly ? 'Inspection Details' : 'Preview Inspection'} showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Geo-Anomaly or Verified Banner (Step 4) */}
        {isGeoAnomaly ? (
          <View style={[styles.anomalyBanner, { backgroundColor: themeColors.error + '15', borderColor: themeColors.error }]}>
            <View style={styles.anomalyBannerHeader}>
              <Ionicons name="warning" size={20} color={themeColors.error} style={{ marginRight: 8 }} />
              <Text style={[styles.anomalyBannerTitle, { color: themeColors.error }]}>
                🚩 GEO-ANOMALY DETECTED — possible fake/proxy report
              </Text>
            </View>
            <Text style={[styles.anomalyBannerSub, { color: themeColors.text }]}>
              {data.location
                ? `GPS is ${distanceMeters > 1000 ? (distanceMeters / 1000).toFixed(2) + ' km' : distanceMeters + ' meters'} away from official project coordinates (Allowed threshold: 500m).`
                : 'No GPS satellite fix attached. Physical presence cannot be verified.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.verifiedBanner, { backgroundColor: themeColors.success + '15', borderColor: themeColors.success }]}>
            <View style={styles.anomalyBannerHeader}>
              <Ionicons name="checkmark-circle" size={20} color={themeColors.success} style={{ marginRight: 8 }} />
              <Text style={[styles.verifiedBannerTitle, { color: themeColors.success }]}>
                ✓ VERIFIED — location matches project site
              </Text>
            </View>
            <Text style={[styles.verifiedBannerSub, { color: themeColors.textSecondary }]}>
              GPS coordinates confirmed within official site perimeter ({distanceMeters}m offset).
            </Text>
          </View>
        )}

        {/* ID + Inspection Type Banner */}
        <View style={[styles.banner, { backgroundColor: getTypeColor(inspType) + '15', borderColor: getTypeColor(inspType) }]}>
          <View>
            <Text style={[styles.surveyId, { color: themeColors.textSecondary }]}>
              {isReadOnly ? data.id : 'DRAFT PREVIEW'}
            </Text>
            <Text style={[styles.surveyDate, { color: themeColors.text }]}>
              {new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.priorityChip, { backgroundColor: getTypeColor(inspType) }]}>
            <Text style={styles.priorityChipText}>{inspType}</Text>
          </View>
        </View>

        {/* Site Details */}
        <DetailCard title="Project Site Details" icon="business-outline" themeColors={themeColors}>
          <DetailRow label="Project Name" value={data.projectName || data.siteName} themeColors={themeColors} />
          <DetailRow label="Beneficiaries Present" value={data.beneficiariesPresent || data.clientName} themeColors={themeColors} />
          <DetailRow label="Assessment Notes" value={data.description} themeColors={themeColors} multiline />
        </DetailCard>

        {/* Photo */}
        <DetailCard title="Site Photo" icon="camera-outline" themeColors={themeColors}>
          {data.photoUri ? (
            <View>
              <Image source={{ uri: data.photoUri }} style={styles.photoThumbnail} resizeMode="cover" />
              {data.photoTimestamp && (
                <View style={styles.photoTimestamp}>
                  <Ionicons name="time-outline" size={13} color={themeColors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.photoTimestampText, { color: themeColors.textSecondary }]}>
                    {data.photoTimestamp}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <EmptyField label="No photo attached" themeColors={themeColors} />
          )}
        </DetailCard>

        {/* Location with Embedded Map View */}
        <DetailCard title="Location Markers" icon="location-outline" themeColors={themeColors}>
          {data.location ? (
            <View>
              <DetailRow label="Latitude" value={data.location.latitude.toFixed(6)} themeColors={themeColors} />
              <DetailRow label="Longitude" value={data.location.longitude.toFixed(6)} themeColors={themeColors} />
              <DetailRow label="Accuracy" value={`±${data.location.accuracy} meters`} themeColors={themeColors} />
              
              {/* Embedded Map widget */}
              <Text style={[styles.mapSectionTitle, { color: themeColors.textSecondary }]}>MAP POSITION</Text>
              <View style={[styles.mapContainer, { borderColor: themeColors.border }, Shadows.light]}>
                <AppMapView
                  latitude={data.location.latitude}
                  longitude={data.location.longitude}
                  mapType={mapType}
                  markerColor={themeColors.primary}
                  style={styles.map}
                />

                {/* Satellite toggle controls inside map card */}
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
                      mapType === 'hybrid' && { backgroundColor: themeColors.primary },
                    ]}
                    onPress={() => setMapType('hybrid')}
                  >
                    <Text style={[styles.mapControlText, { color: mapType === 'hybrid' ? '#FFF' : themeColors.text }]}>
                      Satellite
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <EmptyField label="No location attached" themeColors={themeColors} />
          )}
        </DetailCard>

        {/* Contact */}
        <DetailCard title="Contact Details" icon="people-outline" themeColors={themeColors}>
          {data.contact ? (
            <>
              <DetailRow label="Name" value={data.contact.name} themeColors={themeColors} />
              <DetailRow label="Phone" value={data.contact.phoneNumber} themeColors={themeColors} />
            </>
          ) : (
            <EmptyField label="No contact attached" themeColors={themeColors} />
          )}
        </DetailCard>

        {/* Notes */}
        {data.notes ? (
          <DetailCard title="Notes" icon="document-text-outline" themeColors={themeColors}>
            <Text style={[styles.notesText, { color: themeColors.text }]}>{data.notes}</Text>
          </DetailCard>
        ) : null}

        {/* Actions buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              pressed && styles.pressed,
            ]}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color={themeColors.primary} style={{ marginRight: Spacing.sm }} />
            <Text style={[styles.actionButtonText, { color: themeColors.primary }]}>
              {isReadOnly ? 'Edit Report' : 'Edit Fields'}
            </Text>
          </Pressable>

          {!isReadOnly && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.submitButton,
                { backgroundColor: themeColors.primary },
                pressed && styles.pressed,
              ]}
              onPress={handleSubmit}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{ marginRight: Spacing.sm }} />
              <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Submit Survey</Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

/* -- Sub-components -- */

function DetailCard({
  title, icon, themeColors, children,
}: {
  title: string;
  icon: string;
  themeColors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.detailCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={18} color={themeColors.primary} style={{ marginRight: Spacing.sm }} />
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function DetailRow({ label, value, themeColors, multiline }: {
  label: string;
  value: string;
  themeColors: typeof Colors.light;
  multiline?: boolean;
}) {
  return (
    <View style={[styles.detailRow, multiline && { flexDirection: 'column' }]}>
      <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: themeColors.text }, multiline && { marginTop: 4 }]}>
        {value || '—'}
      </Text>
    </View>
  );
}

function EmptyField({ label, themeColors }: { label: string; themeColors: typeof Colors.light }) {
  return (
    <View style={styles.emptyField}>
      <Ionicons name="ellipse-outline" size={16} color={themeColors.textSecondary} style={{ marginRight: 6 }} />
      <Text style={[styles.emptyFieldText, { color: themeColors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  anomalyBanner: {
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  anomalyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  anomalyBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  anomalyBannerSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  verifiedBanner: {
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  verifiedBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  verifiedBannerSub: {
    fontSize: 12,
    lineHeight: 17,
  },

  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  surveyId: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  surveyDate: { fontSize: 15, fontWeight: '700' },
  priorityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.round,
  },
  priorityChipText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },

  detailCard: {
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  detailLabel: { fontSize: 13, fontWeight: '600', flex: 0.4 },
  detailValue: { fontSize: 13, flex: 0.6, textAlign: 'right' },

  emptyField: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  emptyFieldText: { fontSize: 13, fontStyle: 'italic' },

  photoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  photoTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoTimestampText: { fontSize: 12 },

  mapSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  mapContainer: {
    height: 180,
    borderRadius: Radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  mapControls: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 2,
  },
  mapControlButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  mapControlText: {
    fontSize: 10,
    fontWeight: '700',
  },

  notesText: { fontSize: 14, lineHeight: 22 },

  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
  },
  submitButton: {
    borderWidth: 0,
    ...Shadows.medium,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
