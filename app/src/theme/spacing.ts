/**
 * Spacing scale for rastroapp-v2
 * Based on 4px grid system
 */

export const Spacing = {
  // Base 4px scale
  px0: 0,
  px0_5: 2, // 2px
  px1: 4,   // 4px
  px1_5: 6, // 6px
  px2: 8,   // 8px
  px3: 12,  // 12px
  px4: 16,  // 16px
  px5: 20,  // 20px
  px6: 24,  // 24px
  px7: 28,  // 28px
  px8: 32,  // 32px
  px9: 40,  // 40px
  px10: 48, // 48px
  px11: 56, // 56px
  px12: 64, // 64px
} as const;

export type SpacingType = keyof typeof Spacing;