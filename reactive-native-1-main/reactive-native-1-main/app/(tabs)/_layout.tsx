import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

function CustomTabBarButton({ onPress, themeColors }: any) {
  return (
    <TouchableOpacity
      style={{
        top: -16, // Float the button upwards
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: themeColors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 4,
          borderColor: themeColors.surface, // Custom cut-out stroke effect
          elevation: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Floating tab bar dimensions
  const barBottomMargin = insets.bottom > 0 ? insets.bottom : Spacing.md;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: barBottomMargin,
          left: Spacing.lg,
          right: Spacing.lg,
          backgroundColor: themeColors.surface,
          borderRadius: Radii.xl,
          height: 66,
          paddingBottom: 0, // Reset default padding since it's floating
          paddingTop: 0,
          borderTopWidth: 0, // Remove default top border
          borderWidth: 1,
          borderColor: themeColors.border,
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.08,
          shadowRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          // Do NOT overflow: 'hidden' so the floating middle button can extend above
        },
        tabBarItemStyle: {
          height: 64,
          paddingVertical: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: 0.2,
          marginBottom: Spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={20}
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              style={{ marginTop: 2 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={20}
              name={focused ? 'document-text' : 'document-text-outline'}
              color={color}
              style={{ marginTop: 2 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new-survey"
        options={{
          title: 'New Survey',
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} themeColors={themeColors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Inspector',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={20}
              name={focused ? 'person' : 'person-outline'}
              color={color}
              style={{ marginTop: 2 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={20}
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              style={{ marginTop: 2 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
