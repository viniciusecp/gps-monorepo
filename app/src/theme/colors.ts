/**
 * Color palette for rastroapp-v2
 * Optimized for dark mode with blue primary color
 */

export const Colors = {
  // Primary colors
  primary: '#1447e6',
  primaryLight: '#4a75f0',
  primaryDark: '#0e3ab8',

  // Background colors
  background: '#0a0a0a', // Main background (dark)
  backgroundLight: '#1a1a1a', // Slightly lighter for cards/surfaces
  backgroundDark: '#050505', // Darker for depth

  // Text colors
  text: '#fafafa', // Primary text
  textSecondary: '#fafafa80', // Secondary text (disabled, hints)
  textTertiary: '#fafafa40', // Tertiary text (placeholders)

  // Border colors
  border: '#ffffff26', // Subtle borders
  borderLight: '#ffffff12', // Very subtle borders

  // Semantic colors
  success: '#00c853',
  warning: '#ffbb33',
  error: '#ff4444',
  info: '#33b5e5',

  // Interactive states
  pressed: '#ffffff10',
  focused: '#ffffff1a',

  // Shadows and overlays
  shadow: '#00000060',
  overlay: '#00000080',

  // Glass effect colors (for frosted glass)
  glassBackground: 'rgba(26, 26, 26, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',
} as const;

export type ColorType = keyof typeof Colors;