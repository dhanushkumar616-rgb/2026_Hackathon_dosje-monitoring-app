import { Platform } from 'react-native';

const primaryColor = '#000080'; // Government Navy Blue
const secondaryColor = '#0EA5E9'; // Sky Blue
const accentColor = '#FF9933'; // Saffron
const successColor = '#10B981'; // Emerald
const warningColor = '#F59E0B'; // Amber
const errorColor = '#EF4444'; // Rose Red

export const Colors = {
  light: {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    neutral: '#64748B',
    
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF', // Pure White
    border: '#E2E8F0', // Slate 200
    card: '#FFFFFF',
    tint: primaryColor,
    icon: '#64748B',
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: primaryColor,
  },
  dark: {
    primary: '#818CF8', // Indigo 400
    secondary: '#38BDF8', // Sky Blue 400
    accent: '#F472B6', // Fuchsia 400
    success: '#34D399', // Emerald 400
    warning: '#FBBF24', // Amber 400
    error: '#F87171', // Rose Red 400
    neutral: '#94A3B8', // Slate 400

    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    border: '#334155', // Slate 700
    card: '#1E293B',
    tint: '#818CF8',
    icon: '#94A3B8',
    tabIconDefault: '#475569', // Slate 600
    tabIconSelected: '#818CF8',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Fonts = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
  sansMedium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'sans-serif-medium' }),
  sansBold: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'sans-serif-medium' }),
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export const Shadows = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
