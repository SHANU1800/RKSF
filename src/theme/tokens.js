// Design system tokens - centralized theme configuration
// Single source of truth for all design values
export const tokens = {
  // Simplified color palette - 1 primary + 1 accent + neutrals
  colors: {
    // Primary - Blue (trust, reliability)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Accent - Emerald (success, growth, positive actions)
    accent: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Neutral palette (slate-based for dark theme)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },

  // Spacing scale (rem-based)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Typography - distinct heading/body fonts
  typography: {
    fontFamily: {
      // Heading: DM Sans - geometric, modern, sharp
      heading: '"DM Sans", system-ui, -apple-system, sans-serif',
      // Body: Inter - clean, highly readable
      body: '"Inter", system-ui, -apple-system, sans-serif',
      // Mono: JetBrains Mono for code
      mono: '"JetBrains Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 30,
    popover: 40,
    tooltip: 50,
    toast: 60,
  },
};

// Theme variants (dark/light)
export const themes = {
  light: {
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      inverse: '#111827',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      light: '#e5e7eb',
      base: '#d1d5db',
      dark: '#9ca3af',
    },
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      inverse: '#ffffff',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.05)',
      base: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(255, 255, 255, 0.2)',
    },
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Helper function to generate CSS custom properties
export const generateCSSVariables = (theme = 'dark') => {
  const _themeMode = tokens.themes[theme];
  
  return {
    // Spacing
    '--spacing-xs': tokens.spacing[2],
    '--spacing-sm': tokens.spacing[3],
    '--spacing-md': tokens.spacing[4],
    '--spacing-lg': tokens.spacing[6],
    '--spacing-xl': tokens.spacing[8],
    '--spacing-2xl': tokens.spacing[12],
    
    // Typography
    '--font-sans': tokens.typography.fontFamily.sans,
    '--font-mono': tokens.typography.fontFamily.mono,
    '--text-xs': tokens.typography.fontSize.xs,
    '--text-sm': tokens.typography.fontSize.sm,
    '--text-base': tokens.typography.fontSize.base,
    '--text-lg': tokens.typography.fontSize.lg,
    '--text-xl': tokens.typography.fontSize.xl,
    '--text-2xl': tokens.typography.fontSize['2xl'],
    '--text-3xl': tokens.typography.fontSize['3xl'],
    
    // Colors
    '--color-primary': tokens.colors.primary[500],
    '--color-primary-light': tokens.colors.primary[400],
    '--color-primary-dark': tokens.colors.primary[600],
    '--color-success': tokens.colors.success,
    '--color-warning': tokens.colors.warning,
    '--color-error': tokens.colors.error,
    '--color-info': tokens.colors.info,
    
    // Border radius
    '--radius-sm': tokens.borderRadius.sm,
    '--radius-md': tokens.borderRadius.md,
    '--radius-lg': tokens.borderRadius.lg,
    '--radius-xl': tokens.borderRadius.xl,
    '--radius-2xl': tokens.borderRadius['2xl'],
  };
};

export default tokens;
