import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';
import { STUDENT_DETAILS } from '../constants/config';

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Helper to determine if the route is active
  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname === route || pathname.startsWith(route + '/');
  };

  // Navigate and close drawer helper
  const handleNavigation = (route: string) => {
    router.push(route as any);
    if (props.navigation) {
      props.navigation.closeDrawer();
    }
  };

  // Reusable custom Pressable Drawer Item for full layout control
  const CustomItem = ({
    label,
    iconName,
    route,
  }: {
    label: string;
    iconName: string;
    route: string;
  }) => {
    const active = isActive(route);
    return (
      <Pressable
        onPress={() => handleNavigation(route)}
        style={({ pressed }) => [
          styles.drawerItem,
          active
            ? {
                backgroundColor: themeColors.primary,
                ...Shadows.medium,
              }
            : {
                backgroundColor: 'transparent',
              },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={(active ? iconName : `${iconName}-outline`) as any}
          size={20}
          color={active ? '#FFFFFF' : themeColors.textSecondary}
          style={styles.itemIcon}
        />
        <Text
          style={[
            styles.drawerItemLabel,
            {
              color: active ? '#FFFFFF' : themeColors.text,
              fontWeight: active ? '700' : '600',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      {/* LinkedIn-style Header Profile Card */}
      <View
        style={[
          styles.profileBanner,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.primary,
          },
        ]}
      >
        <View style={styles.headerMesh1} />
        <View style={styles.headerMesh2} />
      </View>

      <View style={[styles.profileDetailsContainer, { borderBottomColor: themeColors.border }]}>
        <View style={[styles.avatarRing, { borderColor: themeColors.surface }, Shadows.medium]}>
          <Image
            source={{ uri: STUDENT_DETAILS.profileImage }}
            style={styles.avatarImage}
          />
        </View>
        <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
          {STUDENT_DETAILS.name}
        </Text>
      </View>

      {/* Navigation Items ScrollView */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
          CORE MODULES
        </Text>

        <CustomItem label="Dashboard" iconName="grid" route="/" />
        <CustomItem label="New Inspection" iconName="create" route="/new-survey" />
        <CustomItem label="Inspection Reports" iconName="document-text" route="/history" />

        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
        
        <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
          HARDWARE UTILITIES
        </Text>

        <CustomItem label="Camera Capture" iconName="camera" route="/camera" />
        <CustomItem label="Contacts Integration" iconName="people" route="/contacts" />
        <CustomItem label="GPS Mapping" iconName="location" route="/location" />
        <CustomItem label="Clipboard Actions" iconName="clipboard" route="/clipboard" />

        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

        <CustomItem label="App Settings" iconName="settings" route="/settings" />
      </DrawerContentScrollView>

      {/* Simple Footer */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.md,
            borderTopColor: themeColors.border,
          },
        ]}
      >
        <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
          Field App © 2026
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileBanner: {
    height: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  headerMesh1: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    position: 'absolute',
    top: -40,
    right: -30,
  },
  headerMesh2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'absolute',
    bottom: -45,
    left: -25,
  },
  profileDetailsContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  email: {
    fontSize: 11,
    marginBottom: 3,
  },
  courseText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Radii.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: 3,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: Radii.md,
  },
  itemIcon: {
    marginRight: Spacing.md,
  },
  drawerItemLabel: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    opacity: 0.5,
  },
  sectionHeader: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: Spacing.xl,
    marginBottom: Spacing.sm,
    letterSpacing: 1.2,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  syncStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  syncDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
