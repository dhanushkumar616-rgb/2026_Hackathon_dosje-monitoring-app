// Module 3: Camera — Permission, Capture, Preview, Timestamp, Retake, Delete with Confirmation, Loading Indicator
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors, Spacing, Radii } from '../constants/theme';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { updateDraft, draft } = useSurveys();

  const [permission, requestPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(draft.photoUri);
  const [captureTime, setCaptureTime] = useState<string | null>(draft.photoTimestamp);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const onCameraReady = () => setIsLoading(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsSaving(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (photo) {
        const timestamp = new Date().toLocaleString();
        setCapturedUri(photo.uri);
        setCaptureTime(timestamp);

        // Save to gallery immediately while the URI is fresh
        try {
          let hasPermission = libraryPermission?.granted;
          if (!hasPermission) {
            const req = await requestLibraryPermission();
            hasPermission = req.granted;
          }
          if (hasPermission) {
            await MediaLibrary.createAssetAsync(photo.uri);
          }
        } catch (galleryErr) {
          console.log('Gallery save error:', galleryErr);
        }
      }
    } catch {
      Alert.alert('Capture Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setCaptureTime(null);
    setIsLoading(true);
  };

  const handleSaveAndGoBack = () => {
    updateDraft({ photoUri: capturedUri, photoTimestamp: captureTime });
    router.back();
  };

  // --- Permission Check views ---
  if (!permission) {
    return (
      <View style={[styles.centeredContent, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centeredContent, { backgroundColor: themeColors.background }]}>
        <View style={[styles.permissionIcon, { backgroundColor: themeColors.primary + '12' }]}>
          <Ionicons name="camera" size={54} color={themeColors.primary} />
        </View>
        <Text style={[styles.permissionTitle, { color: themeColors.text }]}>Camera Access Required</Text>
        <Text style={[styles.permissionText, { color: themeColors.textSecondary }]}>
          Please allow this application to access your device camera to capture structural survey images.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.permissionButton,
            { backgroundColor: themeColors.primary },
            pressed && styles.pressed,
          ]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  // --- Capturing Preview Screen Mode (iOS-style Clean Layout) ---
  if (capturedUri) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <CustomHeader title="Review Photo" showBackButton />
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="contain" />
          
          {/* Metadata Overlay info */}
          <View style={styles.timestampBadge}>
            <Ionicons name="time" size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.timestampText}>{captureTime}</Text>
          </View>
        </View>

        {/* Shutter bottom bar review controls (iOS System Style) */}
        <View style={[styles.reviewBar, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable
            style={({ pressed }) => [styles.reviewTextButton, pressed && styles.pressed]}
            onPress={handleRetake}
          >
            <Text style={[styles.reviewButtonText, { color: '#FFFFFF' }]}>Retake</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.reviewTextButton, pressed && styles.pressed]}
            onPress={handleSaveAndGoBack}
          >
            <Text style={[styles.reviewButtonText, { color: themeColors.primary, fontWeight: '800' }]}>Use Photo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // --- Live Camera View Viewport ---
  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <CustomHeader title="Camera View" showBackButton />

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          onCameraReady={onCameraReady}
        >
          {/* Loading overlay while camera initializes */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}

          {/* Top Control Bar */}
          <View style={styles.topControls}>
            <Pressable
              style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
            </Pressable>
          </View>
        </CameraView>

        {/* Capture Control dock */}
        <View style={[styles.captureBar, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.captureHint}>
            {isSaving ? 'Saving to gallery…' : 'Capture inspection site image'}
          </Text>
          
          <View style={styles.captureRow}>
            {/* Shutter Left: Captured media roll preview */}
            <Pressable 
              style={styles.mediaRollWrapper}
              onPress={() => {
                if (capturedUri) {
                  setCapturedUri(capturedUri);
                } else if (draft.photoUri) {
                  setCapturedUri(draft.photoUri);
                }
              }}
            >
              {draft.photoUri ? (
                <Image source={{ uri: draft.photoUri }} style={styles.mediaRollThumb} />
              ) : (
                <View style={styles.mediaRollEmpty}>
                  <Ionicons name="image" size={18} color="rgba(255, 255, 255, 0.4)" />
                </View>
              )}
            </Pressable>

            {/* Shutter Center: Main Camera shutter button */}
            <Pressable
              style={({ pressed }) => [
                styles.captureButton,
                pressed && styles.pressed,
              ]}
              onPress={handleCapture}
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </Pressable>

            {/* Shutter Right: Empty placeholder to align layout */}
            <View style={{ width: 48, height: 48 }} />
          </View>
        </View>
      </View>
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
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  cameraContainer: { flex: 1 },
  camera: { flex: 1, position: 'relative' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topControls: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureBar: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    backgroundColor: '#000000',
  },
  captureHint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.md,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xxl,
  },
  mediaRollWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  mediaRollThumb: {
    width: '100%',
    height: '100%',
  },
  mediaRollEmpty: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },

  // Preview Image Review View (iOS style)
  previewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
  },
  timestampBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
  },
  timestampText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  reviewTextButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
