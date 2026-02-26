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
     PartiallyPaid:"#ffc107",
     Paid:"#8bc34a",
     Overdue:"#e53935",
     Pending:"#ffc107",
     Delivered:"#8bc34a",
     Cancelled:"#e53935",
     InProgress:"#64b5f6",
     Dispatched:"#4caf50",
     PickedUp:"#4582ec",
     Claimed:"#d50000",
     ClaimedDelivered:"#cc1619",
     loadNumber:"#4582ec",
     loadAmount:"#4582ec",
     customeramt:"#4582ec",
     dipsatchRateAmt:"#4582ec",
     carrierPay:"#4582ec",
     status:"#4582ec",
     invoice:"#4582ec",
     customer:"#b14749",
     repair:"#885824",
     picks:"#4582ec",
     pickDate:"#4582ec",
     currentLocation:"#4582ec",
     drops:"#4582ec",
     dropDate:"#4582ec",
     carrier:"#2f8280",
     driver:"#4582ec",
     equipment:"#4582ec",
     powerUnit:"#4582ec",
     trailer:"#4582ec",
     createdBy:"#4582ec",
     equipmentType:"#4582ec",
     Partial:"#4582ec",
     Full:"#4582ec",
     Van:"#4582ec",
     Reefer:"#4582ec",
     VanAirRide:"#4582ec",
     VanHazardous:"#4582ec",
     VanVented:"#4582ec",
     VanCurtains:"#4582ec",
     VanPalletExchange:"#4582ec",
     ReeferHazardous:"#4582ec",
     ReeferPalletExchange:"#4582ec",
     DoubleDrop:"#4582ec",
     Flatbed:"#4582ec",
     FlatbedHazardous:"#4582ec",
     FlatbedPalletExchange:"#4582ec",
     FlatbedSides:"#4582ec",
     Lowboy:"#4582ec",
     Maxi:"#4582ec",
     RemovableGooseneck:"#4582ec",
     StepDeck:"#4582ec",
     AutoCarrier:"#4582ec",
     DumpTrailer:"#4582ec",
     HopperBottom:"#4582ec",
     Hotshot:"#4582ec",
     Tanker:"#4582ec",
     FlatbedStepDeck:"#4582ec",
     FlatbedVan:"#4582ec",
     FlatbedReefer:"#4582ec",
     ReeferVan:"#4582ec",
     FlatbedReeferVan:"#4582ec",
     PowerOnly:"#4582ec",
     unknown:"#e47a51"
}


