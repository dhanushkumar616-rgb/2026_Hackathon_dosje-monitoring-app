// Module 6: Clipboard — Copy Survey ID, Contact Number, Location, Paste Notes, Clear Clipboard
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

export default function ClipboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { draft, surveys, updateDraft } = useSurveys();
  const [pastedNotes, setPastedNotes] = useState(draft.notes || '');

  const showCopied = (label: string, value: string) => {
    Alert.alert('Copied', `${label}:\n${value}`);
  };

  // Copy last submitted survey ID
  const handleCopySurveyId = async () => {
    const latest = surveys[0];
    if (!latest) {
      Alert.alert('No Surveys', 'No submitted surveys found. Submit a survey first.');
      return;
    }
    await Clipboard.setStringAsync(latest.id);
    showCopied('Survey ID', latest.id);
  };

  // Copy attached contact's number
  const handleCopyContactNumber = async () => {
    if (!draft.contact?.phoneNumber) {
      Alert.alert('No Contact', 'No contact is attached to the current survey draft.');
      return;
    }
    await Clipboard.setStringAsync(draft.contact.phoneNumber);
    showCopied('Contact Number', draft.contact.phoneNumber);
  };

  // Copy attached location
  const handleCopyLocation = async () => {
    if (!draft.location) {
      Alert.alert('No Location', 'No location is attached to the current survey draft.');
      return;
    }
    const text = `Lat: ${draft.location.latitude.toFixed(6)}, Lon: ${draft.location.longitude.toFixed(6)} (±${draft.location.accuracy}m)`;
    await Clipboard.setStringAsync(text);
    showCopied('Location', text);
  };

  // Paste clipboard content into notes field
  const handlePasteNotes = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert('Empty Clipboard', 'Your clipboard appears to be empty.');
      return;
    }
    setPastedNotes((prev) => prev ? `${prev}\n${text}` : text);
  };

  // Save notes to draft
  const handleSaveNotes = () => {
    updateDraft({ notes: pastedNotes });
    Alert.alert('Saved', 'Notes have been saved to your current survey draft.');
  };

  // Clear clipboard
  const handleClearClipboard = async () => {
    Alert.alert(
      'Clear Clipboard',
      'This will replace your clipboard content with empty text. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await Clipboard.setStringAsync('');
            Alert.alert('Cleared', 'Clipboard has been cleared.');
          },
        },
      ]
    );
  };

  const latestSurvey = surveys[0];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Clipboard" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: themeColors.text }]}>Clipboard Utilities</Text>
          <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
            Copy and paste survey data quickly
          </Text>
        </View>

        {/* Section: Survey ID */}
        <SectionTitle title="Survey Data" themeColors={themeColors} />
        <ClipboardAction
          label="Copy Latest Survey ID"
          description={latestSurvey ? latestSurvey.id : 'No surveys submitted yet'}
          icon="document-text-outline"
          iconColor={themeColors.primary}
          themeColors={themeColors}
          onPress={handleCopySurveyId}
          disabled={!latestSurvey}
        />

        {/* Section: Contact */}
        <SectionTitle title="Contact Info" themeColors={themeColors} />
        <ClipboardAction
          label="Copy Attached Contact Number"
          description={draft.contact ? `${draft.contact.name}: ${draft.contact.phoneNumber}` : 'No contact attached to draft'}
          icon="call-outline"
          iconColor={themeColors.secondary}
          themeColors={themeColors}
          onPress={handleCopyContactNumber}
          disabled={!draft.contact?.phoneNumber}
        />

        {/* Section: Location */}
        <SectionTitle title="Location Data" themeColors={themeColors} />
        <ClipboardAction
          label="Copy Attached Location"
          description={
            draft.location
              ? `${draft.location.latitude.toFixed(4)}, ${draft.location.longitude.toFixed(4)}`
              : 'No location attached to draft'
          }
          icon="location-outline"
          iconColor={themeColors.success}
          themeColors={themeColors}
          onPress={handleCopyLocation}
          disabled={!draft.location}
        />

        {/* Section: Notes */}
        <SectionTitle title="Notes" themeColors={themeColors} />
        <View style={[styles.notesCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <TextInput
            style={[styles.notesInput, { color: themeColors.text }]}
            placeholder="Paste or type notes here..."
            placeholderTextColor={themeColors.textSecondary}
            value={pastedNotes}
            onChangeText={setPastedNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <View style={styles.notesActions}>
            <Pressable
              style={({ pressed }) => [
                styles.notesButton,
                { backgroundColor: themeColors.secondary + '15', borderColor: themeColors.secondary },
                pressed && styles.pressed,
              ]}
              onPress={handlePasteNotes}
            >
              <Ionicons name="clipboard-outline" size={18} color={themeColors.secondary} style={{ marginRight: 4 }} />
              <Text style={[styles.notesButtonText, { color: themeColors.secondary }]}>Paste</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.notesButton,
                { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary },
                pressed && styles.pressed,
              ]}
              onPress={handleSaveNotes}
            >
              <Ionicons name="save-outline" size={18} color={themeColors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.notesButtonText, { color: themeColors.primary }]}>Save to Draft</Text>
            </Pressable>
          </View>
        </View>

        {/* Section: Clear */}
        <SectionTitle title="Manage Clipboard" themeColors={themeColors} />
        <Pressable
          style={({ pressed }) => [
            styles.dangerButton,
            { backgroundColor: themeColors.error + '10', borderColor: themeColors.error },
            pressed && styles.pressed,
          ]}
          onPress={handleClearClipboard}
        >
          <View style={[styles.dangerIconBg, { backgroundColor: themeColors.error + '20' }]}>
            <Ionicons name="trash-outline" size={22} color={themeColors.error} />
          </View>
          <View style={styles.dangerInfo}>
            <Text style={[styles.dangerTitle, { color: themeColors.error }]}>Clear Clipboard</Text>
            <Text style={[styles.dangerDesc, { color: themeColors.textSecondary }]}>Replace clipboard contents with empty text</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={themeColors.error} />
        </Pressable>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, themeColors }: { title: string; themeColors: typeof Colors.light }) {
  return (
    <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{title.toUpperCase()}</Text>
  );
}

function ClipboardAction({
  label, description, icon, iconColor, themeColors, onPress, disabled,
}: {
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  themeColors: typeof Colors.light;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          opacity: disabled ? 0.5 : 1,
        },
        !disabled && pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.actionIconBg, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={[styles.actionLabel, { color: themeColors.text }]}>{label}</Text>
        <Text style={[styles.actionDesc, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {description}
        </Text>
      </View>
      <Ionicons name="copy-outline" size={20} color={themeColors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  pageHeader: { marginBottom: Spacing.xl },
  pageTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  pageSubtitle: { fontSize: 14 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.light,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  actionDesc: { fontSize: 12 },

  notesCard: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    fontSize: 15,
    minHeight: 110,
    lineHeight: 22,
  },
  notesActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  notesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1.5,
  },
  notesButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
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
