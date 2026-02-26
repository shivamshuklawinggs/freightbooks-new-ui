import { defaultThemeSettings } from '@/data/colors';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
/**
 * Interface representing the shape of the theme settings state.
 * These types are inferred from the usage in the reducers.
 */
export interface ThemeSettings {
  mode: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundTone: string;
  borderRadius: number;
  sidebarStyle: string;
  fontFamily: string;
  typographyScale: string;
  formFontSize: string;
  sidebarCollapsed: boolean;
  // Index signature to support Object.assign and potential additional properties in defaultThemeSettings
  [key: string]: any;
}



const themeSlice = createSlice({
  name: 'theme',
  initialState: defaultThemeSettings,
  reducers: {
    setMode(state, action: PayloadAction<string>) {
      state.mode = action.payload;
    },
    setPrimaryColor(state, action: PayloadAction<string>) {
      state.primaryColor = action.payload;
    },
    setSecondaryColor(state, action: PayloadAction<string>) {
      state.secondaryColor = action.payload;
    },
    setBackgroundTone(state, action: PayloadAction<string>) {
      state.backgroundTone = action.payload;
    },
    setBorderRadius(state, action: PayloadAction<number>) {
      state.borderRadius = action.payload;
    },
    setSidebarStyle(state, action: PayloadAction<string>) {
      state.sidebarStyle = action.payload;
    },
    setFontFamily(state, action: PayloadAction<string>) {
      state.fontFamily = action.payload;
    },
    setTypographyScale(state, action: PayloadAction<string>) {
      state.typographyScale = action.payload;
    },
    setFormFontSize(state, action: PayloadAction<string>) {
      state.formFontSize = action.payload;
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    updateThemeSettings(state, action: PayloadAction<Partial<ThemeSettings>>) {
      Object.assign(state, action.payload);
    },
    resetThemeSettings() {
      return defaultThemeSettings;
    },
  },
});

export const {
  setMode,
  setPrimaryColor,
  setSecondaryColor,
  setBackgroundTone,
  setBorderRadius,
  setSidebarStyle,
  setFontFamily,
  setTypographyScale,
  setFormFontSize,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  updateThemeSettings,
  resetThemeSettings,
} = themeSlice.actions;

export default themeSlice.reducer;
