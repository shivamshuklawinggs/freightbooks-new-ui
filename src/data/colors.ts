// ─── All theme data is sourced from defaults.json (single source of truth) ──
// Edit defaults.json to change colors, fonts, or defaults, then everything
// stays in sync automatically. You can copy-paste defaults.json anywhere.

import defaults from './defaults.json';

// Type definitions for color presets
export type ColorPreset = {
  main: string;
  light: string;
  dark: string;
  contrast: string;
};

export type SemanticColorPreset = {
  main: string;
  light: string;
  dark: string;
  contrastText?: string;
};

export type ColorPresets = Record<string, ColorPreset>;
export type BackgroundPresets = Record<string, { default: string; paper: string; sidebar: string }>;
export type TextColors = Record<string, { primary: string; secondary: string; disabled: string }>;
export type SemanticColors = Record<string, SemanticColorPreset>;
export type FontFamilies = Record<string, string>;
export type FormFontSizes = Record<string, any>;
export type TypographyScales = Record<string, { htmlFontSize: number; fontSize: number }>;

export const colorPresets: ColorPresets = defaults.colorPresets;
export const secondaryPresets: ColorPresets = defaults.secondaryPresets;
export const lightBackgrounds: BackgroundPresets = defaults.lightBackgrounds;
export const darkBackgrounds: BackgroundPresets = defaults.darkBackgrounds;
export const textColors: TextColors = defaults.textColors;
export const semanticColors: SemanticColors = defaults.semanticColors;
export const fontFamilies: FontFamilies = defaults.fontFamilies;
export const formFontSizes: FormFontSizes = defaults.formFontSizes;
export const typographyScales: TypographyScales = defaults.typographyScales;
export const defaultThemeSettings = defaults.defaultSettings;

// Sidebar styles as an object for backward compatibility
export const sidebarStyles = defaults.sidebarStyles.reduce<Record<string, string>>(
  (acc, s) => {
    acc[s] = s;
    return acc;
  },
  {}
);
export const Colors = {
     // Status colors - matching new theme
     PartiallyPaid: "#f59e0b",  // amber
     Paid: "#10b981",           // green
     Overdue: "#ef4444",        // red
     Pending: "#f59e0b",        // amber
     Delivered: "#10b981",      // green
     Cancelled: "#ef4444",      // red
     InProgress: "#3b82f6",     // blue
     Dispatched: "#10b981",     // green
     PickedUp: "#3b82f6",       // blue
     Claimed: "#ef4444",        // red
     ClaimedDelivered: "#ef4444", // red
     
     // Load/Data colors - using teal accent
     loadNumber: "#00c9a7",     // teal
     loadAmount: "#00c9a7",     // teal
     customeramt: "#00c9a7",    // teal
     dipsatchRateAmt: "#00c9a7", // teal
     carrierPay: "#00c9a7",     // teal
     status: "#00c9a7",         // teal
     invoice: "#00c9a7",        // teal
     customer: "#8b5cf6",       // purple
     repair: "#f59e0b",         // amber
     picks: "#00c9a7",          // teal
     pickDate: "#00c9a7",       // teal
     currentLocation: "#00c9a7", // teal
     drops: "#00c9a7",          // teal
     dropDate: "#00c9a7",       // teal
     carrier: "#00c9a7",        // teal
     driver: "#00c9a7",         // teal
     equipment: "#00c9a7",      // teal
     powerUnit: "#00c9a7",      // teal
     trailer: "#00c9a7",        // teal
     createdBy: "#94a3b8",      // grey
     
     // Equipment types - using blue/teal variants
     equipmentType: "#3b82f6",  // blue
     Partial: "#3b82f6",        // blue
     Full: "#10b981",           // green
     Van: "#3b82f6",            // blue
     Reefer: "#60a5fa",         // light blue
     VanAirRide: "#3b82f6",     // blue
     VanHazardous: "#f59e0b",   // amber warning
     VanVented: "#3b82f6",      // blue
     VanCurtains: "#3b82f6",    // blue
     VanPalletExchange: "#3b82f6", // blue
     ReeferHazardous: "#f59e0b", // amber warning
     ReeferPalletExchange: "#60a5fa", // light blue
     DoubleDrop: "#8b5cf6",     // purple
     Flatbed: "#00c9a7",        // teal
     FlatbedHazardous: "#f59e0b", // amber warning
     FlatbedPalletExchange: "#00c9a7", // teal
     FlatbedSides: "#00c9a7",   // teal
     Lowboy: "#8b5cf6",         // purple
     Maxi: "#8b5cf6",           // purple
     RemovableGooseneck: "#8b5cf6", // purple
     StepDeck: "#00c9a7",       // teal
     AutoCarrier: "#ec4899",    // pink
     DumpTrailer: "#f59e0b",    // amber
     HopperBottom: "#f59e0b",   // amber
     Hotshot: "#ef4444",        // red
     Tanker: "#3b82f6",         // blue
     FlatbedStepDeck: "#00c9a7", // teal
     FlatbedVan: "#3b82f6",     // blue
     FlatbedReefer: "#60a5fa",  // light blue
     ReeferVan: "#60a5fa",      // light blue
     FlatbedReeferVan: "#60a5fa", // light blue
     PowerOnly: "#94a3b8",      // grey
     unknown: "#64748b"         // grey
}


