import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii, Shadows } from '../constants/theme';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBackButton = false }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleLeftPress = () => {
    if (showBackButton) {
      navigation.goBack();
    } else {
      // Toggle Drawer
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + Spacing.sm,
          backgroundColor: themeColors.surface,
          borderBottomColor: themeColors.border,
        },
        Shadows.light,
      ]}
    >
      <View style={styles.content}>
        <Pressable
          onPress={handleLeftPress}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: themeColors.background },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={showBackButton ? 'chevron-back' : 'menu-outline'}
            size={24}
            color={themeColors.text}
          />
        </Pressable>

        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightPlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  content: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
