// Module 5: Contacts — Permission, Searchable FlatList, Count, Initials Avatar, Copy Number, Attach to Draft, Pull-to-Refresh, Empty State
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

interface ContactItem {
  id: string;
  name: string;
  phoneNumber: string | null;
}

export default function ContactsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { updateDraft, draft } = useSurveys();

  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: ContactItem[] = data
        .filter((c) => c.name)
        .map((c) => ({
          id: c.id ?? c.name,
          name: c.name,
          phoneNumber: c.phoneNumbers?.[0]?.number ?? null,
        }));

      setContacts(mapped);
    } catch {
      Alert.alert('Error', 'Failed to fetch contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyNumber = async (contact: ContactItem) => {
    if (!contact.phoneNumber) {
      Alert.alert('No Number', `${contact.name} has no phone number saved.`);
      return;
    }
    await Clipboard.setStringAsync(contact.phoneNumber);
    Alert.alert('Copied', `${contact.phoneNumber} copied to clipboard.`);
  };

  const handleAttachContact = (contact: ContactItem) => {
    updateDraft({
      contact: {
        name: contact.name,
        phoneNumber: contact.phoneNumber ?? 'No Number',
      },
    });
    Alert.alert('Attached', `${contact.name} has been attached to the survey draft.`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.success,
      themeColors.warning,
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  // ----- PERMISSION DENIED -----
  if (permissionStatus === 'denied') {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Contacts" showBackButton />
        <View style={styles.centeredContent}>
          <View style={[styles.stateIcon, { backgroundColor: themeColors.error + '15' }]}>
            <Ionicons name="people-outline" size={56} color={themeColors.error} />
          </View>
          <Text style={[styles.stateTitle, { color: themeColors.text }]}>Contacts Access Denied</Text>
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>
            Contacts permission is required to search and attach client contacts to your surveys.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: themeColors.primary }, pressed && styles.pressed]}
            onPress={() => fetchContacts()}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFF" style={{ marginRight: Spacing.xs }} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- INITIAL (not yet fetched) -----
  if (permissionStatus === 'unknown' && contacts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Contacts" showBackButton />
        <View style={styles.centeredContent}>
          <View style={[styles.stateIcon, { backgroundColor: themeColors.primary + '15' }]}>
            <Ionicons name="people-circle-outline" size={56} color={themeColors.primary} />
          </View>
          <Text style={[styles.stateTitle, { color: themeColors.text }]}>Load Contacts</Text>
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>
            Grant access to your contacts to quickly attach a client contact to any survey.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: themeColors.primary }, pressed && styles.pressed]}
            onPress={() => fetchContacts()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="people-outline" size={18} color="#FFF" style={{ marginRight: Spacing.xs }} />
                <Text style={styles.primaryButtonText}>Load Contacts</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- LOADING -----
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Contacts" showBackButton />
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.stateText, { color: themeColors.textSecondary, marginTop: Spacing.md }]}>
            Loading contacts...
          </Text>
        </View>
      </View>
    );
  }

  // ----- CONTACTS LIST -----
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title="Contacts" showBackButton />

      {/* Search Bar + Counter */}
      <View style={styles.searchBar}>
        <View style={[styles.searchInputWrapper, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Ionicons name="search-outline" size={20} color={themeColors.textSecondary} style={{ marginRight: Spacing.sm }} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search by name..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </Pressable>
          )}
        </View>
        <View style={[styles.counter, { backgroundColor: themeColors.primary + '15' }]}>
          <Text style={[styles.counterText, { color: themeColors.primary }]}>
            {filteredContacts.length}
          </Text>
        </View>
      </View>

      {/* Attached contact indicator */}
      {draft.contact && (
        <View style={[styles.attachedBanner, { backgroundColor: themeColors.success + '15', borderColor: themeColors.success }]}>
          <Ionicons name="checkmark-circle" size={18} color={themeColors.success} />
          <Text style={[styles.attachedText, { color: themeColors.success }]}>
            Attached: {draft.contact.name}
          </Text>
        </View>
      )}

      {/* FlatList */}
      {filteredContacts.length === 0 ? (
        /* Empty state */
        <View style={styles.centeredContent}>
          <View style={[styles.stateIcon, { backgroundColor: themeColors.textSecondary + '15' }]}>
            <Ionicons name="person-outline" size={56} color={themeColors.textSecondary} />
          </View>
          <Text style={[styles.stateTitle, { color: themeColors.text }]}>
            {searchQuery ? 'No Results Found' : 'No Contacts'}
          </Text>
          <Text style={[styles.stateText, { color: themeColors.textSecondary }]}>
            {searchQuery
              ? `No contacts match "${searchQuery}". Try a different name.`
              : 'Your contacts list appears to be empty.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchContacts(true)}
              tintColor={themeColors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const avatarColor = getAvatarColor(item.name);
            const isAttached = draft.contact?.name === item.name;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.contactCard,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: isAttached ? themeColors.success : themeColors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                </View>

                {/* Info */}
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: themeColors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.contactPhone, { color: item.phoneNumber ? themeColors.textSecondary : themeColors.error }]}>
                    {item.phoneNumber ?? 'No Number'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.contactActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconButton,
                      { backgroundColor: themeColors.secondary + '15' },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleCopyNumber(item)}
                  >
                    <Ionicons name="copy-outline" size={18} color={themeColors.secondary} />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.iconButton,
                      { backgroundColor: isAttached ? themeColors.success + '15' : themeColors.primary + '15' },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleAttachContact(item)}
                  >
                    <Ionicons
                      name={isAttached ? 'checkmark-circle' : 'attach-outline'}
                      size={18}
                      color={isAttached ? themeColors.success : themeColors.primary}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      )}
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
    width: 110,
    height: 110,
    borderRadius: Radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 16,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  counter: {
    width: 42,
    height: 42,
    borderRadius: Radii.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '800',
  },

  attachedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  attachedText: {
    fontSize: 13,
    fontWeight: '700',
  },

  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    ...Shadows.light,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
