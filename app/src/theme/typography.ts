/**
 * Typography scale for rastroapp-v2
 * Based on system fonts with clear hierarchy
 */

export const Typography = {
  // Font sizes
  h1: 32, // Main headings
  h2: 28, // Section headings
  h3: 24, // Subheadings
  h4: 20, // Minor headings
  body: 16, // Body text
  bodySmall: 14, // Small body text
  button: 22, // Button text
  caption: 12, // Captions, labels
  overline: 10, // Supplementary text

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    normal: 0,
    wide: 0.5,
    tighter: -0.5,
  },

  // Font family (using system fonts)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
} as const;

export type TypographyType = keyof Omit<typeof Typography, 'fontWeight' | 'lineHeight' | 'letterSpacing' | 'fontFamily'>;
export type FontWeightType = keyof typeof Typography.fontWeight;
export type LineHeightType = keyof typeof Typography.lineHeight;
export type LetterSpacingType = keyof typeof Typography.letterSpacing;
export type FontFamilyType = keyof typeof Typography.fontFamily;