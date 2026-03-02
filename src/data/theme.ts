import { createTheme, alpha, Theme, PaletteMode } from '@mui/material/styles';
import {
  colorPresets,
  secondaryPresets,
  lightBackgrounds,
  darkBackgrounds,
  textColors,
  semanticColors,
  fontFamilies,
  formFontSizes,
  typographyScales,
  defaultThemeSettings,
  Colors,
} from './colors';
import type { ThemeSettings } from '@/redux/Slice/themeSlice';

/* ================================
   Create App Theme (Typed)
================================ */

export const createAppTheme = (
  settings: Partial<ThemeSettings> = {}
): Theme => {
  const s: ThemeSettings = { ...defaultThemeSettings, ...settings };
  const isDark = s.mode === 'dark';

  /* ───────── Resolve Tokens ───────── */

  const primary =
    colorPresets[s.primaryColor] ?? colorPresets.blue;

  const secondary =
    secondaryPresets[s.secondaryColor] ?? secondaryPresets.slate;

  const bgPreset = isDark
    ? darkBackgrounds[s.backgroundTone] ?? darkBackgrounds.charcoal
    : lightBackgrounds[s.backgroundTone] ?? lightBackgrounds.white;

  const text = isDark ? textColors.dark : textColors.light;

  const typoScale =
    typographyScales[s.typographyScale] ?? typographyScales.default;

  const fontFamily =
    fontFamilies[s.fontFamily] ?? fontFamilies.inter;

  const radius = Number(s.borderRadius) || 12;

  const formFont =
    formFontSizes[s.formFontSize] ?? formFontSizes.medium;

  /* ───────── Create Theme ───────── */

  const theme = createTheme({
    palette: {
      mode: s.mode as PaletteMode,
      primary: {
        main: primary.main,
        light: primary.light,
        dark: primary.dark,
        contrastText: primary.contrast,
      },
      secondary: {
        main: secondary.main,
        light: secondary.light,
        dark: secondary.dark,
        contrastText: secondary.contrast,
      },
      background: {
        default: bgPreset.default,
        paper: bgPreset.paper,
      },
      text: {
        primary: text.primary,
        secondary: text.secondary,
        disabled: text.disabled,
      },
      success: {
        main: semanticColors.success.main,
        light: semanticColors.success.light,
        dark: semanticColors.success.dark,
        contrastText: semanticColors.success.contrastText || '#ffffff',
      },
      warning: {
        main: semanticColors.warning.main,
        light: semanticColors.warning.light,
        dark: semanticColors.warning.dark,
        contrastText: semanticColors.warning.contrastText || '#ffffff',
      },
      error: {
        main: semanticColors.error.main,
        light: semanticColors.error.light,
        dark: semanticColors.error.dark,
        contrastText: semanticColors.error.contrastText || '#ffffff',
      },
      info: {
        main: semanticColors.info.main,
        light: semanticColors.info.light,
        dark: semanticColors.info.dark,
        contrastText: semanticColors.info.contrastText || '#ffffff',
      },
      divider: isDark ? '#334155' : alpha('#1E293B', 0.08),
      grey: {
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
      },
      accent: {
        teal: '#00c9a7',
        tealLight: '#33d4b8',
        tealDark: '#00a08c',
        amber: '#f59e0b',
        amberLight: '#f7b547',
        amberDark: '#d97706',
      },
      status: {
        pending: {
          main: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
        },
        inTransit: {
          main: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
        delivered: {
          main: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        cancelled: {
          main: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        paid: {
          main: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        overdue: {
          main: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
      },
      action: {
        active: '#ffffff',
        hover: 'rgba(0, 201, 167, 0.08)',
        selected: 'rgba(0, 201, 167, 0.16)',
        disabled: 'rgba(255, 255, 255, 0.3)',
        disabledBackground: 'rgba(255, 255, 255, 0.12)',
        focus: 'rgba(0, 201, 167, 0.12)',
      },
      charts: {
        revenue: {
          main: '#00c9a7',
          gradient: ['rgba(0, 201, 167, 0.3)', 'rgba(0, 201, 167, 0)'],
        },
        expense: {
          main: '#f59e0b',
          gradient: ['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0)'],
        },
        profit: {
          main: '#10b981',
          gradient: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0)'],
        },
        series: ['#00C9A7', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
      },
      border: {
        main: '#334155',
        light: '#475569',
        accent: 'rgba(0, 201, 167, 0.3)',
      },
      glass: {
        background: 'rgba(30, 41, 59, 0.8)',
        border: 'rgba(148, 163, 184, 0.1)',
      },
    },

    shape: {
      borderRadius: radius,
    },

    typography: {
      fontFamily,
      htmlFontSize: typoScale.htmlFontSize,
      fontSize: typoScale.fontSize,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
    },

    shadows: [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 0 20px rgba(0, 201, 167, 0.15)',
      '0 0 30px rgba(0, 201, 167, 0.2)',
      '0 0 40px rgba(0, 201, 167, 0.25)',
      '0 10px 40px rgba(0, 0, 0, 0.2)',
      '0 15px 50px rgba(0, 0, 0, 0.25)',
      '0 20px 60px rgba(0, 0, 0, 0.3)',
      '0 25px 70px rgba(0, 0, 0, 0.35)',
      '0 30px 80px rgba(0, 0, 0, 0.4)',
      '0 35px 90px rgba(0, 0, 0, 0.45)',
      '0 40px 100px rgba(0, 0, 0, 0.5)',
      '0 45px 110px rgba(0, 0, 0, 0.55)',
      '0 50px 120px rgba(0, 0, 0, 0.6)',
      '0 55px 130px rgba(0, 0, 0, 0.65)',
      '0 60px 140px rgba(0, 0, 0, 0.7)',
      '0 65px 150px rgba(0, 0, 0, 0.75)',
      '0 70px 160px rgba(0, 0, 0, 0.8)',
      '0 75px 170px rgba(0, 0, 0, 0.85)',
      '0 80px 180px rgba(0, 0, 0, 0.9)',
    ],

    spacing: 8,
  });

  /* ───────── Attach Custom Tokens ───────── */

  theme.custom = {
    sidebarStyle: s.sidebarStyle,
    sidebarCollapsed: s.sidebarCollapsed,
    sidebarWidth: s.sidebarCollapsed ? 72 : 260,
    sidebarWidthCollapsed: 72,
    sidebarWidthExpanded: 260,
    headerHeight: 64,
    formFont,
  };

  return theme;
};

/* ────────────────────────────────
   Convenience Exports
──────────────────────────────── */

export const lightTheme: Theme = createAppTheme({ mode: 'light' });
export const darkTheme: Theme = createAppTheme({ mode: 'dark' });

// Re-export Colors for other modules
export { Colors };

export default createAppTheme;