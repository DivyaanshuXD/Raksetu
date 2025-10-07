/**
 * Raksetu Design System - Centralized Design Tokens
 * Week 2: World-Class UI Foundation
 * 
 * This file contains all design tokens following a 4px grid system
 * and modern design principles for blood donation platform
 */

// ============================================
// COLOR PALETTE
// ============================================

/**
 * Primary Colors - Red (Blood theme)
 * Used for: Primary actions, blood-related elements, urgency
 */
export const COLORS = {
  primary: {
    50: '#fef2f2',   // Lightest - backgrounds
    100: '#fee2e2',  // Light - hover states
    200: '#fecaca',  // Soft - borders
    300: '#fca5a5',  // Medium light
    400: '#f87171',  // Medium
    500: '#ef4444',  // Base - primary buttons
    600: '#dc2626',  // Dark - hover
    700: '#b91c1c',  // Darker
    800: '#991b1b',  // Very dark
    900: '#7f1d1d',  // Darkest
  },

  /**
   * Secondary Colors - Blue (Trust, Medical)
   * Used for: Blood banks, medical resources, information
   */
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Base
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  /**
   * Accent Colors - Green (Success, Health)
   * Used for: Success states, health indicators, confirmations
   */
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Base
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  /**
   * Warning Colors - Amber/Orange
   * Used for: Warnings, medium urgency, attention needed
   */
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Base
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  /**
   * Error/Danger Colors - Deep Red
   * Used for: Errors, critical alerts, destructive actions
   */
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Base
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  /**
   * Neutral/Gray Scale
   * Used for: Text, backgrounds, borders, dividers
   */
  neutral: {
    0: '#ffffff',      // Pure white
    50: '#fafafa',     // Off-white
    100: '#f5f5f5',    // Lightest gray
    200: '#e5e5e5',    // Very light gray
    300: '#d4d4d4',    // Light gray
    400: '#a3a3a3',    // Medium light gray
    500: '#737373',    // Medium gray
    600: '#525252',    // Dark gray
    700: '#404040',    // Darker gray
    800: '#262626',    // Very dark gray
    900: '#171717',    // Almost black
    950: '#0a0a0a',    // Near black
    1000: '#000000',   // Pure black
  },

  /**
   * Semantic Colors (mapped for easy use)
   */
  semantic: {
    // Backgrounds
    background: '#ffffff',
    backgroundAlt: '#fafafa',
    backgroundMuted: '#f5f5f5',
    
    // Text
    textPrimary: '#171717',      // neutral-900
    textSecondary: '#525252',    // neutral-600
    textTertiary: '#737373',     // neutral-500
    textDisabled: '#a3a3a3',     // neutral-400
    textOnPrimary: '#ffffff',    // White on red buttons
    
    // Borders
    border: '#e5e5e5',           // neutral-200
    borderStrong: '#d4d4d4',     // neutral-300
    borderSubtle: '#f5f5f5',     // neutral-100
    
    // Interactive
    link: '#2563eb',             // secondary-600
    linkHover: '#1d4ed8',        // secondary-700
    focus: '#3b82f6',            // secondary-500
    
    // Status indicators
    online: '#22c55e',           // success-500
    offline: '#737373',          // neutral-500
    busy: '#ef4444',             // error-500
  },
};

// ============================================
// TYPOGRAPHY SCALE
// ============================================

/**
 * Font Families
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    display: "'Poppins', 'Inter', sans-serif",
  },

  /**
   * Font Sizes (rem based on 16px base)
   * Using modular scale (1.25 ratio)
   */
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px - body text
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  /**
   * Font Weights
   */
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  /**
   * Line Heights
   */
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  /**
   * Letter Spacing
   */
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================
// SPACING SYSTEM (4px Grid)
// ============================================

/**
 * Spacing Scale - Based on 4px grid
 * All spacing should be multiples of 4px for consistency
 */
export const SPACING = {
  0: '0',           // 0px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px - base unit
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px - touch target
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// ============================================
// SHADOW ELEVATION
// ============================================

/**
 * Shadow System - 5 levels of elevation
 * Based on Material Design elevation
 */
export const SHADOWS = {
  /**
   * Level 0 - No elevation
   */
  none: 'none',

  /**
   * Level 1 - Subtle elevation
   * Cards, buttons at rest
   */
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  /**
   * Level 2 - Low elevation
   * Dropdowns, tooltips, hover states
   */
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',

  /**
   * Level 3 - Medium elevation
   * Modals, popovers, raised cards
   */
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',

  /**
   * Level 4 - High elevation
   * Sticky headers, important modals
   */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',

  /**
   * Level 5 - Highest elevation
   * Dialogs, drawers, FAB
   */
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  /**
   * Level 6 - Maximum elevation
   * Full screen modals, important overlays
   */
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  /**
   * Colored shadows for emphasis
   */
  primary: '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -4px rgba(239, 68, 68, 0.1)',
  success: '0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -4px rgba(34, 197, 94, 0.1)',
  warning: '0 10px 15px -3px rgba(245, 158, 11, 0.2), 0 4px 6px -4px rgba(245, 158, 11, 0.1)',
  error: '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -4px rgba(239, 68, 68, 0.1)',
};

// ============================================
// BORDER RADIUS
// ============================================

/**
 * Border Radius Scale
 * Consistent rounding for modern UI
 */
export const RADIUS = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',     // Pill shape
};

// ============================================
// Z-INDEX SCALE
// ============================================

/**
 * Z-Index Layering System
 * Consistent stacking order
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
};

// ============================================
// BREAKPOINTS
// ============================================

/**
 * Responsive Breakpoints
 * Mobile-first approach
 */
export const BREAKPOINTS = {
  xs: '360px',    // Small phones
  sm: '640px',    // Large phones
  md: '768px',    // Tablets
  lg: '1024px',   // Laptops
  xl: '1280px',   // Desktops
  '2xl': '1536px', // Large desktops
};

// ============================================
// TRANSITIONS & ANIMATIONS
// ============================================

/**
 * Transition Durations
 */
export const DURATION = {
  fastest: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
};

/**
 * Easing Functions
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/**
 * Common Transition Presets
 */
export const TRANSITIONS = {
  fast: `all ${DURATION.fast} ${EASING.easeOut}`,
  normal: `all ${DURATION.normal} ${EASING.easeInOut}`,
  slow: `all ${DURATION.slow} ${EASING.easeInOut}`,
  spring: `all ${DURATION.normal} ${EASING.spring}`,
};

// ============================================
// COMPONENT SPECIFIC TOKENS
// ============================================

/**
 * Button Sizes
 */
export const BUTTON_SIZES = {
  xs: {
    height: SPACING[8],      // 32px
    padding: `${SPACING[2]} ${SPACING[3]}`,  // 8px 12px
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  sm: {
    height: SPACING[9],      // 36px
    padding: `${SPACING[2]} ${SPACING[4]}`,  // 8px 16px
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  md: {
    height: SPACING[10],     // 40px
    padding: `${SPACING[3]} ${SPACING[5]}`,  // 12px 20px
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  lg: {
    height: SPACING[11],     // 44px (touch-friendly)
    padding: `${SPACING[3]} ${SPACING[6]}`,  // 12px 24px
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  xl: {
    height: SPACING[12],     // 48px
    padding: `${SPACING[4]} ${SPACING[8]}`,  // 16px 32px
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
};

/**
 * Input Sizes
 */
export const INPUT_SIZES = {
  sm: {
    height: SPACING[9],      // 36px
    padding: `${SPACING[2]} ${SPACING[3]}`,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  md: {
    height: SPACING[10],     // 40px
    padding: `${SPACING[3]} ${SPACING[4]}`,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  lg: {
    height: SPACING[11],     // 44px (touch-friendly)
    padding: `${SPACING[3]} ${SPACING[4]}`,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
};

/**
 * Card Padding
 */
export const CARD_PADDING = {
  sm: SPACING[4],   // 16px
  md: SPACING[6],   // 24px
  lg: SPACING[8],   // 32px
};

// ============================================
// ACCESSIBILITY
// ============================================

/**
 * Accessibility Constants
 */
export const A11Y = {
  /**
   * Minimum touch target size (WCAG 2.1 AA)
   */
  minTouchTarget: SPACING[11],  // 44px

  /**
   * Focus ring style
   */
  focusRing: `0 0 0 3px ${COLORS.secondary[100]}`,
  
  /**
   * Focus ring width
   */
  focusRingWidth: '3px',

  /**
   * Minimum color contrast ratios
   */
  contrastRatio: {
    normal: 4.5,    // WCAG AA
    large: 3,       // WCAG AA for large text
    enhanced: 7,    // WCAG AAA
  },
};

// ============================================
// EXPORT ALL
// ============================================

export const DESIGN_TOKENS = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  radius: RADIUS,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS,
  duration: DURATION,
  easing: EASING,
  transitions: TRANSITIONS,
  buttonSizes: BUTTON_SIZES,
  inputSizes: INPUT_SIZES,
  cardPadding: CARD_PADDING,
  a11y: A11Y,
};

export default DESIGN_TOKENS;
