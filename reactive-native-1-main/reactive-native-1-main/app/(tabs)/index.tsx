import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, Modal, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows, Fonts } from '../../constants/theme';
import { STUDENT_DETAILS } from '../../constants/config';
import { useSurveys, Survey, DOSJE_PROJECTS, ProjectLocation } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

interface InspectorNode {
  name: string;
  distance_km: number;
  active_tasks: number;
}

const INSPECTORS: InspectorNode[] = [
  { name: 'R. Sharma', distance_km: 4.2, active_tasks: 1 },
  { name: 'A. Verma', distance_km: 11.8, active_tasks: 0 },
  { name: 'S. Iyer', distance_km: 6.5, active_tasks: 3 },
  { name: 'M. Khan', distance_km: 2.1, active_tasks: 2 },
];

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { surveys, updateDraft } = useSurveys();

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAssignment, setAiAssignment] = useState<{
    inspector: InspectorNode;
    project: ProjectLocation;
    timestamp: string;
  } | null>(null);

  const triggerAIRandomInspection = () => {
    // AI weighted random — nearer & less-loaded inspectors get higher probability; randomness prevents pre-planning
    // Weight formula: weight = 1/(1+distance_km) * 1/(1+active_tasks)
    const weights = INSPECTORS.map((insp) => (1 / (1 + insp.distance_km)) * (1 / (1 + insp.active_tasks)));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedInsp = INSPECTORS[0];

    for (let i = 0; i < INSPECTORS.length; i++) {
      if (randomVal < weights[i]) {
        selectedInsp = INSPECTORS[i];
        break;
      }
      randomVal -= weights[i];
    }

    // Pick random project from DoSJE registry
    const randomProject = DOSJE_PROJECTS[Math.floor(Math.random() * DOSJE_PROJECTS.length)];

    setAiAssignment({
      inspector: selectedInsp,
      project: randomProject,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
    setShowAiModal(true);
  };

  const handleStartAssignedInspection = () => {
    if (aiAssignment) {
      updateDraft({
        projectName: aiAssignment.project.name,
        siteName: aiAssignment.project.name,
        inspectionType: 'AI-Random',
      });
      setShowAiModal(false);
      router.push('/(tabs)/new-survey');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'sunny-outline';
    if (hour < 17) return 'partly-sunny-outline';
    return 'moon-outline';
  };

  const todayString = new Date().toDateString();
  const todaySurveys = surveys.filter(
    (s) => new Date(s.date).toDateString() === todayString
  );
  const todayCount = todaySurveys.length;
  const recentSurveys = surveys.slice(0, 5);

  const quickActions = [
    {
      title: 'New Inspection',
      icon: 'create',
      color: themeColors.primary,
      bgColor: themeColors.primary + '10',
      route: '/(tabs)/new-survey',
      description: 'Start survey draft',
    },
    {
      title: 'Camera Capture',
      icon: 'camera',
      color: themeColors.secondary,
      bgColor: themeColors.secondary + '10',
      route: '/camera',
      description: 'Capture site photos',
    },
    {
      title: 'GPS Location',
      icon: 'location',
      color: themeColors.success,
      bgColor: themeColors.success + '10',
      route: '/location',
      description: 'Pin coordinates',
    },
    {
      title: 'Contacts List',
      icon: 'people',
      color: themeColors.accent,
      bgColor: themeColors.accent + '10',
      route: '/contacts',
      description: 'Associate contact',
    },
  ];

  const renderSurveyItem = ({ item }: { item: Survey }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'High':
        case 'Surprise':
          return themeColors.error;
        case 'Medium':
        case 'AI-Random':
          return themeColors.accent;
        default:
          return themeColors.success;
      }
    };

    const prColor = getPriorityColor(item.inspectionType || item.priority);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.recentItem,
          {
            backgroundColor: themeColors.surface,
            borderColor: item.anomaly ? themeColors.error : themeColors.border,
            borderLeftColor: item.anomaly ? themeColors.error : prColor,
          },
          pressed && styles.pressed,
          Shadows.light,
        ]}
        onPress={() => router.push({ pathname: '/preview', params: { id: item.id } })}
      >
        <View style={styles.recentItemMain}>
          <View style={styles.recentItemHeader}>
            <Text style={[styles.recentItemTitle, { color: themeColors.text }]} numberOfLines={1}>
              {item.projectName || item.siteName}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: prColor + '15' }]}>
              <Text style={[styles.priorityBadgeText, { color: prColor }]}>
                {item.inspectionType || item.priority}
              </Text>
            </View>
          </View>

          {item.anomaly ? (
            <View style={[styles.anomalyRow, { backgroundColor: themeColors.error + '15', borderColor: themeColors.error }]}>
              <Text style={[styles.anomalyRowText, { color: themeColors.error }]}>
                🚩 GEO-ANOMALY DETECTED — possible fake/proxy report
              </Text>
            </View>
          ) : (
            <View style={[styles.verifiedRow, { backgroundColor: themeColors.success + '15', borderColor: themeColors.success }]}>
              <Text style={[styles.verifiedRowText, { color: themeColors.success }]}>
                ✓ VERIFIED — location matches project site
              </Text>
            </View>
          )}

          <Text style={[styles.recentItemSubtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
            Beneficiaries: {item.beneficiariesPresent || item.clientName}
          </Text>

          <View style={styles.recentItemFooter}>
            <View style={styles.footerInfoItem}>
              <Ionicons name="calendar-outline" size={13} color={themeColors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.recentItemDate, { color: themeColors.textSecondary }]}>
                {formattedDate}
              </Text>
            </View>
            <View style={styles.attachmentIcons}>
              {item.photoUri && <Ionicons name="camera-outline" size={12} color={themeColors.textSecondary} style={styles.miniIcon} />}
              {item.location && <Ionicons name="location-outline" size={12} color={themeColors.textSecondary} style={styles.miniIcon} />}
              {item.contact && <Ionicons name="person-outline" size={12} color={themeColors.textSecondary} style={styles.miniIcon} />}
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={themeColors.border} style={styles.chevron} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Dashboard" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section with geometric art */}
        <View style={[styles.welcomeBanner, { backgroundColor: themeColors.primary }]}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
          <View style={styles.greetingRow}>
            <Ionicons name={getGreetingIcon() as any} size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 5 }} />
            <Text style={styles.greetingText}>{getGreeting()}</Text>
          </View>
          <Text style={styles.welcomeTitle}>DoSJE Monitor</Text>
          <Text style={styles.welcomeSubtitle}>Smart Monitoring & Inspection — DoSJE Schemes</Text>
        </View>

        {/* Inspector Profile Badge Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderLeftColor: themeColors.primary }, Shadows.medium]}>
          <View style={styles.badgeHeader}>
            <Text style={[styles.badgeLabel, { color: themeColors.primary }]}>{STUDENT_DETAILS.badge}</Text>
            <View style={[styles.statusIndicator, { backgroundColor: themeColors.success }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: STUDENT_DETAILS.profileImage }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.inspectorName, { color: themeColors.text }]}>
                {STUDENT_DETAILS.name}
              </Text>
              <Text style={[styles.inspectorSub, { color: themeColors.textSecondary }]}>
                {STUDENT_DETAILS.id}
              </Text>
              <View style={[styles.batchBadge, { backgroundColor: themeColors.background }]}>
                <Ionicons name="shield-checkmark" size={12} color={themeColors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.batchText, { color: themeColors.text }]}>{STUDENT_DETAILS.course}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section - Side-by-Side Widgets */}
        <View style={styles.statsRow}>
          <View style={[styles.statHalfCard, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <View style={[styles.statIconWrapper, { backgroundColor: themeColors.primary + '15' }]}>
              <Ionicons name="today" size={20} color={themeColors.primary} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{todayCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{"Today's Inspections"}</Text>
          </View>

          <View style={[styles.statHalfCard, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <View style={[styles.statIconWrapper, { backgroundColor: themeColors.secondary + '15' }]}>
              <Ionicons name="checkmark-done-circle" size={20} color={themeColors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{surveys.length}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{"Total Completed"}</Text>
          </View>
        </View>

        {/* AI Random Inspection Prominent Card (Step 3) */}
        <View style={[styles.aiCard, { backgroundColor: themeColors.surface, borderColor: themeColors.primary }, Shadows.medium]}>
          <View style={styles.aiCardHeader}>
            <View style={[styles.aiBadgeIcon, { backgroundColor: themeColors.accent + '20' }]}>
              <Ionicons name="hardware-chip" size={20} color={themeColors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiCardTitle, { color: themeColors.text }]}>PMU Automated Dispatch</Text>
              <Text style={[styles.aiCardSubtitle, { color: themeColors.textSecondary }]}>
                Anti-Proxy & Fraud Prevention Protocol
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.aiTriggerButton,
              { backgroundColor: themeColors.primary },
              pressed && styles.pressed,
              Shadows.light,
            ]}
            onPress={triggerAIRandomInspection}
          >
            <Ionicons name="flash" size={18} color="#FF9933" style={{ marginRight: 8 }} />
            <Text style={styles.aiTriggerButtonText}>⚡ TRIGGER AI RANDOM INSPECTION</Text>
          </Pressable>

          <Text style={[styles.aiTagline, { color: themeColors.textSecondary }]}>
            AI assigns nearest available inspector — random & tamper-proof.
          </Text>
        </View>

        {/* Quick Actions Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Inspection Modules</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.gridItem,
                { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                pressed && styles.pressed,
                Shadows.light,
              ]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.gridText, { color: themeColors.text }]}>{action.title}</Text>
              <Text style={[styles.gridSubText, { color: themeColors.textSecondary }]}>{action.description}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Survey List Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Recent Inspections</Text>
          {surveys.length > 0 && (
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.seeAllText, { color: themeColors.primary }]}>View History</Text>
            </Pressable>
          )}
        </View>

        {surveys.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: themeColors.surface }, Shadows.light]}>
            <Ionicons name="reader-outline" size={42} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.text }]}>No site inspections logged</Text>
            <Text style={[styles.emptySubText, { color: themeColors.textSecondary }]}>
              {"Your completed inspection reports will appear here. Press 'New Inspection' below to start logging."}
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: Spacing.xl }}>
            {recentSurveys.map((survey) => (
              <View key={survey.id} style={{ marginBottom: Spacing.sm }}>
                {renderSurveyItem({ item: survey })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* AI Random Inspection Assignment Modal */}
      <Modal
        visible={showAiModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAiModal(false)}
      >
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiModalCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            {/* Header with animation badge */}
            <View style={styles.aiModalHeader}>
              <View style={[styles.aiModalIconRing, { backgroundColor: themeColors.accent + '20' }]}>
                <Ionicons name="sparkles" size={28} color={themeColors.accent} />
              </View>
              <Text style={[styles.aiModalTitle, { color: themeColors.text }]}>
                AI Inspection Assigned
              </Text>
              <Text style={[styles.aiModalSubtitle, { color: themeColors.textSecondary }]}>
                Tamper-Proof Weighted Random Selection
              </Text>
            </View>

            {aiAssignment && (
              <View style={styles.aiDetailsContainer}>
                {/* Assigned Inspector Card */}
                <View style={[styles.aiDetailBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <View style={styles.aiBoxHeader}>
                    <Ionicons name="person-circle" size={18} color={themeColors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.aiBoxLabel, { color: themeColors.textSecondary }]}>SELECTED INSPECTOR</Text>
                  </View>
                  <Text style={[styles.aiInspectorName, { color: themeColors.text }]}>
                    {aiAssignment.inspector.name}
                  </Text>
                  <View style={styles.aiMetricsRow}>
                    <View style={styles.aiMetricChip}>
                      <Ionicons name="navigate-outline" size={13} color={themeColors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.aiMetricText, { color: themeColors.text }]}>
                        {aiAssignment.inspector.distance_km} km away
                      </Text>
                    </View>
                    <View style={styles.aiMetricChip}>
                      <Ionicons name="layers-outline" size={13} color={themeColors.warning} style={{ marginRight: 4 }} />
                      <Text style={[styles.aiMetricText, { color: themeColors.text }]}>
                        {aiAssignment.inspector.active_tasks} Active Task{aiAssignment.inspector.active_tasks !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Target Project Card */}
                <View style={[styles.aiDetailBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <View style={styles.aiBoxHeader}>
                    <Ionicons name="business" size={18} color={themeColors.secondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.aiBoxLabel, { color: themeColors.textSecondary }]}>ASSIGNED PROJECT SITE</Text>
                  </View>
                  <Text style={[styles.aiProjectName, { color: themeColors.text }]}>
                    {aiAssignment.project.name}
                  </Text>
                  <View style={styles.aiCoordRow}>
                    <Ionicons name="location-outline" size={13} color={themeColors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.aiCoordText, { color: themeColors.textSecondary }]}>
                      GPS: {aiAssignment.project.latitude.toFixed(4)}, {aiAssignment.project.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>

                <View style={styles.aiTimestampRow}>
                  <Ionicons name="time-outline" size={13} color={themeColors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.aiTimestampText, { color: themeColors.textSecondary }]}>
                    Dispatched at {aiAssignment.timestamp} • Algorithmic Weight Active
                  </Text>
                </View>
              </View>
            )}

            {/* Modal Actions */}
            <View style={styles.aiModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.aiStartButton,
                  { backgroundColor: themeColors.primary },
                  pressed && styles.pressed,
                ]}
                onPress={handleStartAssignedInspection}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.aiStartButtonText}>Open Inspection Form</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.aiCloseButton,
                  { borderColor: themeColors.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowAiModal(false)}
              >
                <Text style={[styles.aiCloseButtonText, { color: themeColors.textSecondary }]}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },
  welcomeBanner: {
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerCircle1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    top: -50,
    right: -40,
  },
  bannerCircle2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    position: 'absolute',
    bottom: -30,
    left: -20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: Fonts.sansMedium,
  },
  welcomeTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: Spacing.xs,
    fontFamily: Fonts.sansBold,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Fonts.sansMedium,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.xs,
  },
  statusText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  profileInfo: {
    flex: 1,
  },
  inspectorName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sansMedium,
  },
  inspectorSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts.sans,
  },
  batchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  batchText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.sansMedium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statHalfCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Fonts.sansBold,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: Fonts.sans,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: Fonts.sansBold,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.sansMedium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  gridItem: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.sansMedium,
  },
  gridSubText: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: Fonts.sans,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  recentItemMain: {
    flex: 1,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
    fontFamily: Fonts.sansMedium,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Fonts.sansBold,
  },
  recentItemSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    fontFamily: Fonts.sans,
  },
  recentItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemDate: {
    fontSize: 11,
    fontFamily: Fonts.sans,
  },
  attachmentIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniIcon: {
    marginLeft: 2,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontFamily: Fonts.sansBold,
  },
  emptySubText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // Anomaly and Verification rows
  anomalyRow: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
    borderWidth: 1,
    marginBottom: 6,
  },
  anomalyRowText: {
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedRow: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
    borderWidth: 1,
    marginBottom: 6,
  },
  verifiedRowText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // AI Random Inspection Card
  aiCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Fonts.sansBold,
  },
  aiCardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    fontFamily: Fonts.sans,
  },
  aiTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  aiTriggerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Fonts.sansBold,
  },
  aiTagline: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    fontFamily: Fonts.sans,
  },

  // AI Modal Styles
  aiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  aiModalCard: {
    width: '100%',
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    ...Shadows.dark,
  },
  aiModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  aiModalIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  aiModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: Fonts.sansBold,
  },
  aiModalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  aiDetailsContainer: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  aiDetailBox: {
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  aiBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  aiInspectorName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: Fonts.sansBold,
  },
  aiProjectName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Fonts.sansMedium,
  },
  aiMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  aiMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiMetricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiCoordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiCoordText: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  aiTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  aiTimestampText: {
    fontSize: 10,
    fontWeight: '600',
  },
  aiModalActions: {
    gap: Spacing.sm,
  },
  aiStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radii.md,
    ...Shadows.medium,
  },
  aiStartButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  aiCloseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  aiCloseButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
