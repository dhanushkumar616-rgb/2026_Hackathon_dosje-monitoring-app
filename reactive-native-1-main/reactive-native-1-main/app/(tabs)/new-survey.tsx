// Module 2: Create Survey — Project Name (Dropdown), Beneficiaries Present (Numeric), Description, Inspection Type, Date, Validation, Draft Persistence
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../../constants/theme';
import { useSurveys, DOSJE_PROJECTS, InspectionType, ProjectLocation } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

interface FormErrors {
  projectName?: string;
  beneficiariesPresent?: string;
  description?: string;
}

export default function NewSurveyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { draft, updateDraft, editingId } = useSurveys();

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const inspectionTypes: InspectionType[] = ['Scheduled', 'Surprise', 'AI-Random'];

  const getInspectionTypeColor = (t: InspectionType) => {
    switch (t) {
      case 'Surprise': return themeColors.error;
      case 'AI-Random': return themeColors.accent;
      case 'Scheduled': return themeColors.primary;
    }
  };

  const getInspectionTypeIcon = (t: InspectionType) => {
    switch (t) {
      case 'Surprise': return 'flash-outline';
      case 'AI-Random': return 'hardware-chip-outline';
      case 'Scheduled': return 'calendar-outline';
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const projName = draft.projectName || draft.siteName || '';
    const benef = draft.beneficiariesPresent || draft.clientName || '';
    if (!projName.trim()) newErrors.projectName = 'Project selection is required';
    if (!benef.trim()) newErrors.beneficiariesPresent = 'Beneficiaries count is required';
    if (!draft.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      router.push('/preview');
    }
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const now = new Date();
      const validDate = selectedDate > now ? now : selectedDate;
      updateDraft({ date: validDate });
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const selectProject = (project: ProjectLocation) => {
    updateDraft({ projectName: project.name, siteName: project.name });
    setErrors((e) => ({ ...e, projectName: undefined }));
    setShowProjectModal(false);
  };

  const formattedDate = draft.date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const selectedProjectName = draft.projectName || draft.siteName || '';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title={editingId ? 'Edit Inspection' : 'New Inspection'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Clean Header */}
        <View style={styles.formHeader}>
          <Text style={[styles.formTitle, { color: themeColors.text }]}>
            {editingId ? 'Update Inspection Details' : 'MoSJE Field Inspection Form'}
          </Text>
          <Text style={[styles.formSubtitle, { color: themeColors.textSecondary }]}>
            Department of Social Justice and Empowerment Monitoring Form
          </Text>
        </View>

        {/* Project Name Dropdown Selector */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
            PROJECT NAME <Text style={{ color: themeColors.error }}>*</Text>
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.inputContainer,
              {
                backgroundColor: themeColors.surface,
                borderColor: errors.projectName
                  ? themeColors.error
                  : selectedProjectName
                    ? themeColors.primary
                    : themeColors.border,
              },
              Shadows.light,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowProjectModal(true)}
          >
            <Ionicons
              name="business"
              size={18}
              color={selectedProjectName ? themeColors.primary : themeColors.textSecondary}
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.dropdownText,
                { color: selectedProjectName ? themeColors.text : themeColors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {selectedProjectName || 'Select MoSJE Project...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={themeColors.textSecondary} />
          </Pressable>
          {errors.projectName && (
            <Text style={[styles.errorLabel, { color: themeColors.error }]}>{errors.projectName}</Text>
          )}
        </View>

        {/* Beneficiaries Present Numeric Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
            BENEFICIARIES PRESENT <Text style={{ color: themeColors.error }}>*</Text>
          </Text>
          <View style={[
            styles.inputContainer,
            {
              backgroundColor: themeColors.surface,
              borderColor: errors.beneficiariesPresent
                ? themeColors.error
                : activeField === 'beneficiariesPresent'
                  ? themeColors.primary
                  : themeColors.border,
            },
            Shadows.light,
          ]}>
            <Ionicons
              name="people"
              size={18}
              color={activeField === 'beneficiariesPresent' ? themeColors.primary : themeColors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, { color: themeColors.text }]}
              placeholder="e.g. 45"
              placeholderTextColor={themeColors.textSecondary}
              value={draft.beneficiariesPresent || draft.clientName || ''}
              keyboardType="numeric"
              onFocus={() => setActiveField('beneficiariesPresent')}
              onBlur={() => setActiveField(null)}
              onChangeText={(v) => {
                const numericOnly = v.replace(/[^0-9]/g, '');
                updateDraft({ beneficiariesPresent: numericOnly, clientName: numericOnly });
                setErrors((e) => ({ ...e, beneficiariesPresent: undefined }));
              }}
              returnKeyType="next"
            />
          </View>
          {errors.beneficiariesPresent && (
            <Text style={[styles.errorLabel, { color: themeColors.error }]}>{errors.beneficiariesPresent}</Text>
          )}
        </View>

        {/* Description Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
            INSPECTION ASSESSMENT NOTES <Text style={{ color: themeColors.error }}>*</Text>
          </Text>
          <View style={[
            styles.textAreaContainer,
            {
              backgroundColor: themeColors.surface,
              borderColor: errors.description
                ? themeColors.error
                : activeField === 'description'
                  ? themeColors.primary
                  : themeColors.border,
            },
            Shadows.light,
          ]}>
            <TextInput
              style={[styles.textAreaInput, { color: themeColors.text }]}
              placeholder="Record facility physical status, attendance verification, staff availability..."
              placeholderTextColor={themeColors.textSecondary}
              value={draft.description}
              onFocus={() => setActiveField('description')}
              onBlur={() => setActiveField(null)}
              onChangeText={(v) => {
                updateDraft({ description: v });
                setErrors((e) => ({ ...e, description: undefined }));
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {errors.description && (
            <Text style={[styles.errorLabel, { color: themeColors.error }]}>{errors.description}</Text>
          )}
        </View>

        {/* Inspection Type Selector */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>INSPECTION TYPE</Text>
          <View style={styles.prioritySelectorRow}>
            {inspectionTypes.map((t) => {
              const currentType = draft.inspectionType || 'Scheduled';
              const isSelected = currentType === t;
              const color = getInspectionTypeColor(t);
              const icon = getInspectionTypeIcon(t);
              return (
                <Pressable
                  key={t}
                  style={({ pressed }) => [
                    styles.priorityChip,
                    {
                      backgroundColor: isSelected ? color : themeColors.surface,
                      borderColor: isSelected ? color : themeColors.border,
                    },
                    Shadows.light,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => updateDraft({ inspectionType: t })}
                >
                  <Ionicons
                    name={icon as any}
                    size={15}
                    color={isSelected ? '#FFFFFF' : color}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[
                    styles.priorityChipText,
                    {
                      color: isSelected ? '#FFFFFF' : themeColors.text,
                      fontWeight: isSelected ? '800' : '600',
                    }
                  ]}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date Picker Button */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>INSPECTION DATE</Text>
          <Pressable
            style={({ pressed }) => [
              styles.inputContainer,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              Shadows.light,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={themeColors.primary} style={styles.inputIcon} />
            <Text style={[styles.dateValueText, { color: themeColors.text }]}>{formattedDate}</Text>
            <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={draft.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Vertical Attachments Checklist (Human Designed Style!) */}
        <Text style={[styles.fieldLabel, { color: themeColors.textSecondary, alignSelf: 'flex-start', marginLeft: Spacing.lg, marginBottom: Spacing.xs }]}>
          REQUIRED ATTACHMENTS
        </Text>
        <View style={[styles.checklistCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
          
          {/* Item 1: Photo */}
          <Pressable
            style={({ pressed }) => [styles.checklistItem, pressed && styles.pressed]}
            onPress={() => router.push('/camera')}
          >
            <View style={[styles.checklistIconWrapper, { backgroundColor: draft.photoUri ? themeColors.success + '15' : themeColors.primary + '10' }]}>
              <Ionicons name="camera" size={18} color={draft.photoUri ? themeColors.success : themeColors.primary} />
            </View>
            <View style={styles.checklistTextWrapper}>
              <Text style={[styles.checklistLabel, { color: themeColors.text }]}>Site Image Capture</Text>
              <Text style={[styles.checklistStatus, { color: draft.photoUri ? themeColors.success : themeColors.textSecondary }]}>
                {draft.photoUri ? 'Image attached successfully' : 'Inspection photo is required'}
              </Text>
            </View>
            <Ionicons
              name={draft.photoUri ? "checkmark-circle" : "chevron-forward"}
              size={18}
              color={draft.photoUri ? themeColors.success : themeColors.border}
            />
          </Pressable>

          <View style={[styles.checklistDivider, { backgroundColor: themeColors.border }]} />

          {/* Item 2: Location */}
          <Pressable
            style={({ pressed }) => [styles.checklistItem, pressed && styles.pressed]}
            onPress={() => router.push('/location')}
          >
            <View style={[styles.checklistIconWrapper, { backgroundColor: draft.location ? themeColors.success + '15' : themeColors.primary + '10' }]}>
              <Ionicons name="location" size={18} color={draft.location ? themeColors.success : themeColors.primary} />
            </View>
            <View style={styles.checklistTextWrapper}>
              <Text style={[styles.checklistLabel, { color: themeColors.text }]}>GPS Marker Coordinates</Text>
              <Text style={[styles.checklistStatus, { color: draft.location ? themeColors.success : themeColors.textSecondary }]}>
                {draft.location ? 'GPS coordinates pinned' : 'Satellite marker coordinates required'}
              </Text>
            </View>
            <Ionicons
              name={draft.location ? "checkmark-circle" : "chevron-forward"}
              size={18}
              color={draft.location ? themeColors.success : themeColors.border}
            />
          </Pressable>

          <View style={[styles.checklistDivider, { backgroundColor: themeColors.border }]} />

          {/* Item 3: Contact */}
          <Pressable
            style={({ pressed }) => [styles.checklistItem, pressed && styles.pressed]}
            onPress={() => router.push('/contacts')}
          >
            <View style={[styles.checklistIconWrapper, { backgroundColor: draft.contact ? themeColors.success + '15' : themeColors.primary + '10' }]}>
              <Ionicons name="people" size={18} color={draft.contact ? themeColors.success : themeColors.primary} />
            </View>
            <View style={styles.checklistTextWrapper}>
              <Text style={[styles.checklistLabel, { color: themeColors.text }]}>Site Representative Contact</Text>
              <Text style={[styles.checklistStatus, { color: draft.contact ? themeColors.success : themeColors.textSecondary }]}>
                {draft.contact ? `${draft.contact.name} linked` : 'Link site representative contact (Optional)'}
              </Text>
            </View>
            <Ionicons
              name={draft.contact ? "checkmark-circle" : "chevron-forward"}
              size={18}
              color={draft.contact ? themeColors.success : themeColors.border}
            />
          </Pressable>

        </View>

        {/* Notes Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>ADDITIONAL NOTES</Text>
          <View style={[styles.textAreaContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, Shadows.light]}>
            <TextInput
              style={[styles.textAreaInput, { color: themeColors.text }]}
              placeholder="Type additional remarks or climate parameters here..."
              placeholderTextColor={themeColors.textSecondary}
              value={draft.notes}
              onChangeText={(v) => updateDraft({ notes: v })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Preview Button */}
        <Pressable
          style={({ pressed }) => [
            styles.previewButton,
            { backgroundColor: themeColors.primary },
            pressed && styles.pressed,
          ]}
          onPress={handleNext}
        >
          <Ionicons name="eye" size={18} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.previewButtonText}>Preview Inspection Report</Text>
        </Pressable>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* MoSJE Project Picker Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Select MoSJE Project</Text>
                <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
                  Authorized PMU Inspection Registry (10 Projects)
                </Text>
              </View>
              <Pressable
                onPress={() => setShowProjectModal(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Ionicons name="close-circle" size={26} color={themeColors.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={DOSJE_PROJECTS}
              keyExtractor={(item) => item.name}
              ItemSeparatorComponent={() => <View style={[styles.projectDivider, { backgroundColor: themeColors.border }]} />}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const isSelected = selectedProjectName === item.name;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.projectItem,
                      isSelected && { backgroundColor: themeColors.primary + '12' },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => selectProject(item)}
                  >
                    <View style={[styles.projectIndexBadge, { backgroundColor: isSelected ? themeColors.primary : themeColors.border }]}>
                      <Text style={[styles.projectIndexText, { color: isSelected ? '#FFFFFF' : themeColors.text }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectNameText, { color: themeColors.text, fontWeight: isSelected ? '800' : '700' }]}>
                        {item.name}
                      </Text>
                      <View style={styles.coordRow}>
                        <Ionicons name="location-sharp" size={12} color={themeColors.primary} style={{ marginRight: 3 }} />
                        <Text style={[styles.projectCoordText, { color: themeColors.textSecondary }]}>
                          Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={themeColors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
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
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  formHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  fieldGroup: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  textAreaContainer: {
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 100,
  },
  textAreaInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  errorLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  
  // Segmented priority/inspection type chips
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 12,
  },

  dateValueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Checklist Card Styles
  checklistCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  checklistIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  checklistTextWrapper: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  checklistStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  checklistDivider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },

  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radii.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    ...Shadows.medium,
  },
  previewButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '80%',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
  },
  projectIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  projectIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  projectInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  projectNameText: {
    fontSize: 14,
    marginBottom: 3,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectCoordText: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  projectDivider: {
    height: 1,
  },
});
