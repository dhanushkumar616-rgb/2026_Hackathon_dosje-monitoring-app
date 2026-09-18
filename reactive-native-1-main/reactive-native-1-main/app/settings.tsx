import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import { STUDENT_DETAILS } from '../constants/config';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { surveys, clearDraft } = useSurveys();

  const handleClearDraft = () => {
    Alert.alert(
      'Clear Survey Draft',
      'This will clear all data from the current survey draft including photo, location, and contact attachments. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Draft',
          style: 'destructive',
          onPress: () => {
            clearDraft();
            Alert.alert('Done', 'Survey draft has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Settings" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* App Version Info */}
        <View style={[styles.appCard, { backgroundColor: themeColors.primary }]}>
          <View style={styles.appCardIcon}>
            <Ionicons name="shield-checkmark-outline" size={36} color="#FF9933" />
          </View>
          <Text style={styles.appName}>DoSJE Monitor</Text>
          <Text style={styles.appVersion}>MoSJE PMU Inspection Portal • v1.0.0</Text>
        </View>

        {/* Inspector Info */}
        <SectionHeader title="Inspector Credentials" themeColors={themeColors} />
        <View style={[styles.infoCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <InfoRow icon="person-outline" label="Name" value={STUDENT_DETAILS.name} themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="card-outline" label="Inspector ID" value={STUDENT_DETAILS.id} themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="business-outline" label="Department" value={STUDENT_DETAILS.course} themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="ribbon-outline" label="Badge Status" value={STUDENT_DETAILS.badge} themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="mail-outline" label="Email" value={STUDENT_DETAILS.email} themeColors={themeColors} />
        </View>

        {/* Stats */}
        <SectionHeader title="App Statistics" themeColors={themeColors} />
        <View style={[styles.infoCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <InfoRow icon="documents-outline" label="Total Inspections" value={String(surveys.length)} themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow
            icon="today-outline"
            label="Today's Inspections"
            value={String(surveys.filter((s) => new Date(s.date).toDateString() === new Date().toDateString()).length)}
            themeColors={themeColors}
          />
        </View>

        {/* Data Management */}
        <SectionHeader title="Data Management" themeColors={themeColors} />
        <Pressable
          style={({ pressed }) => [
            styles.dangerRow,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            pressed && styles.pressed,
          ]}
          onPress={handleClearDraft}
        >
          <View style={[styles.dangerIconBg, { backgroundColor: themeColors.warning + '15' }]}>
            <Ionicons name="document-outline" size={22} color={themeColors.warning} />
          </View>
          <View style={styles.dangerInfo}>
            <Text style={[styles.dangerTitle, { color: themeColors.text }]}>Clear Inspection Draft</Text>
            <Text style={[styles.dangerDesc, { color: themeColors.textSecondary }]}>
              Reset the active inspection form and attachments
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
        </Pressable>

        {/* About */}
        <SectionHeader title="About" themeColors={themeColors} />
        <View style={[styles.infoCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <InfoRow icon="camera-outline" label="Camera" value="expo-camera" themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="people-outline" label="Contacts" value="expo-contacts" themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="location-outline" label="Location" value="expo-location" themeColors={themeColors} />
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <InfoRow icon="clipboard-outline" label="Clipboard" value="expo-clipboard" themeColors={themeColors} />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, themeColors }: { title: string; themeColors: typeof Colors.light }) {
  return (
    <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
      {title.toUpperCase()}
    </Text>
  );
}

function InfoRow({
  icon, label, value, themeColors,
}: {
  icon: string;
  label: string;
  value: string;
  themeColors: typeof Colors.light;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={themeColors.primary} style={{ marginRight: Spacing.md }} />
      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: themeColors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },

  appCard: {
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  appCardIcon: { marginBottom: Spacing.sm },
  appName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  appVersion: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  infoCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.light,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    flex: 0.4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    flex: 0.6,
    textAlign: 'right',
    fontWeight: '700',
  },
  divider: { height: 1 },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.light,
  },
  dangerIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerInfo: { flex: 1 },
  dangerTitle: { fontSize: 15, fontWeight: '700' },
  dangerDesc: { fontSize: 12, marginTop: 2 },

  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
