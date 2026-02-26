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
      success: { ...semanticColors.success },
      warning: { ...semanticColors.warning },
      error: { ...semanticColors.error },
      info: { ...semanticColors.info },
      divider: isDark
        ? alpha('#94A3B8', 0.12)
        : alpha('#1E293B', 0.08),
    },

    shape: {
      borderRadius: radius,
    },

    typography: {
      fontFamily,
      htmlFontSize: typoScale.htmlFontSize,
      fontSize: typoScale.fontSize,
    },

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