import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SurveyProvider } from '../context/SurveyContext';
import { CustomDrawerContent } from '../components/CustomDrawerContent';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <SurveyProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
              drawerType: 'slide',
              drawerStyle: {
                width: 280,
              },
            }}
          >
            {/* The Bottom Tabs navigator */}
            <Drawer.Screen
              name="(tabs)"
              options={{
                drawerLabel: 'Dashboard',
              }}
            />

            {/* Utility Screens outside Bottom Tabs but inside the Drawer */}
            <Drawer.Screen
              name="camera"
              options={{
                drawerLabel: 'Camera',
              }}
            />
            <Drawer.Screen
              name="contacts"
              options={{
                drawerLabel: 'Contacts',
              }}
            />
            <Drawer.Screen
              name="location"
              options={{
                drawerLabel: 'Location',
              }}
            />
            <Drawer.Screen
              name="clipboard"
              options={{
                drawerLabel: 'Clipboard',
              }}
            />
            <Drawer.Screen
              name="settings"
              options={{
                drawerLabel: 'Settings',
              }}
            />
          </Drawer>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SurveyProvider>
  );
}
