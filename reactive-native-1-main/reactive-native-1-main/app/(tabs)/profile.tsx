import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { CustomHeader } from '../../components/CustomHeader';
import { Colors, Spacing, Radii, Shadows } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { STUDENT_DETAILS } from '../../constants/config';
import { useSurveys } from '../../context/SurveyContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { surveys, draft } = useSurveys();

  // Fetch live stats from the local context database
  const completedCount = surveys.length;
  const draftStatusText = draft.siteName ? 'Draft Active' : 'No Draft';
  const draftStatusColor = draft.siteName ? themeColors.warning : themeColors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Inspector Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Banner Cover */}
        <View style={[styles.profileBanner, { backgroundColor: themeColors.primary }]}>
          <View style={styles.headerMesh1} />
          <View style={styles.headerMesh2} />
        </View>

        {/* Center Circular Profile Photo */}
        <View style={[styles.avatarRing, { borderColor: themeColors.surface }, Shadows.medium]}>
          <Image
            source={{ uri: STUDENT_DETAILS.profileImage }}
            style={styles.avatarImage}
          />
        </View>

        {/* Identity Headers */}
        <Text style={[styles.name, { color: themeColors.text }]}>{STUDENT_DETAILS.name}</Text>
        <Text style={[styles.email, { color: themeColors.textSecondary }]}>{STUDENT_DETAILS.email}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: themeColors.success + '15', borderColor: themeColors.success }]}>
          <View style={[styles.statusDot, { backgroundColor: themeColors.success }]} />
          <Text style={[styles.statusBadgeText, { color: themeColors.success }]}>{STUDENT_DETAILS.badge}</Text>
        </View>

        {/* Live Statistics Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <Ionicons name="checkmark-done" size={18} color={themeColors.success} />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <Ionicons name="document-text" size={18} color={draftStatusColor} />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{draft.projectName || draft.siteName ? '1' : '0'}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{draftStatusText}</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <Ionicons name="shield-checkmark" size={18} color={themeColors.primary} />
            <Text style={[styles.statValue, { color: themeColors.text }]}>PMU-1</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Clearance</Text>
          </View>
        </View>

        {/* Details Card 1: Inspector Credentials */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Inspector Credentials</Text>
        <View style={[styles.infoCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color={themeColors.primary} style={styles.infoIcon} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Inspector ID</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{STUDENT_DETAILS.id}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={themeColors.primary} style={styles.infoIcon} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Department / Cell</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{STUDENT_DETAILS.course}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="ribbon-outline" size={18} color={themeColors.primary} style={styles.infoIcon} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Tenure / Batch</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{STUDENT_DETAILS.batch}</Text>
            </View>
          </View>
        </View>

        {/* Details Card 2: Device Node Metrics */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Device Node Diagnostics</Text>
        <View style={[styles.infoCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
          <View style={styles.infoRow}>
            <Ionicons name="hardware-chip-outline" size={18} color={themeColors.secondary} style={styles.infoIcon} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>System Role</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>Offline Sync Node</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="cloud-done-outline" size={18} color={themeColors.secondary} style={styles.infoIcon} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Storage Mode</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>SQLite State Database</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  profileBanner: {
    height: 100,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  headerMesh1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    position: 'absolute',
    top: -50,
    right: -40,
  },
  headerMesh2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'absolute',
    bottom: -45,
    left: -25,
  },
  avatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -53,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginLeft: Spacing.lg,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    width: '90%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoIcon: {
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
});
