// ─── All theme data is sourced from defaults.json (single source of truth) ──
// Edit defaults.json to change colors, fonts, or defaults, then everything
// stays in sync automatically. You can copy-paste defaults.json anywhere.

import defaults from './defaults.json';



export const colorPresets = {
    "blue": {
      "main": "#2563EB",
      "light": "#60A5FA",
      "dark": "#1D4ED8",
      "contrast": "#FFFFFF"
    },
      "grey": {
        "main": "#6B7280",
        "light": "#9CA3AF",
        "dark": "#4B5563",
        "contrast": "#FFFFFF"
      },
    "indigo": {
      "main": "#4F46E5",
      "light": "#818CF8",
      "dark": "#3730A3",
      "contrast": "#FFFFFF"
    },
    "violet": {
      "main": "#7C3AED",
      "light": "#A78BFA",
      "dark": "#5B21B6",
      "contrast": "#FFFFFF"
    },
    "purple": {
      "main": "#9333EA",
      "light": "#C084FC",
      "dark": "#6B21A8",
      "contrast": "#FFFFFF"
    },
    "pink": {
      "main": "#EC4899",
      "light": "#F472B6",
      "dark": "#BE185D",
      "contrast": "#FFFFFF"
    },
    "rose": {
      "main": "#F43F5E",
      "light": "#FB7185",
      "dark": "#BE123C",
      "contrast": "#FFFFFF"
    },
    "orange": {
      "main": "#EA580C",
      "light": "#FB923C",
      "dark": "#C2410C",
      "contrast": "#FFFFFF"
    },
    "teal": {
      "main": "#00c9a7",
      "light": "#33d4b8",
      "dark": "#00a08c",
      "contrast": "#ffffff"
    },
    "cyan": {
      "main": "#0891B2",
      "light": "#22D3EE",
      "dark": "#0E7490",
      "contrast": "#FFFFFF"
    },
    "green": {
      "main": "#16A34A",
      "light": "#4ADE80",
      "dark": "#15803D",
      "contrast": "#FFFFFF"
    },
    "slate": {
      "main": "#475569",
      "light": "#94A3B8",
      "dark": "#1E293B",
      "contrast": "#FFFFFF"
    },
    "darkSlate": {
      "main": "#383e4b",
      "light": "#475569",
      "dark": "#2d3440",
      "contrast": "#FFFFFF"
    }
  }
export const secondaryPresets ={
    "slate": {
      "main": "#64748B",
      "light": "#94A3B8",
      "dark": "#475569",
      "contrast": "#FFFFFF"
    },
    "gray": {
      "main": "#6B7280",
      "light": "#9CA3AF",
      "dark": "#4B5563",
      "contrast": "#FFFFFF"
    },
    "teal": {
      "main": "#14B8A6",
      "light": "#5EEAD4",
      "dark": "#0D9488",
      "contrast": "#FFFFFF"
    },
    "amber": {
      "main": "#F59E0B",
      "light": "#FCD34D",
      "dark": "#D97706",
      "contrast": "#000000"
    },
    "rose": {
      "main": "#FB7185",
      "light": "#FDA4AF",
      "dark": "#F43F5E",
      "contrast": "#FFFFFF"
    },
    "indigo": {
      "main": "#818CF8",
      "light": "#A5B4FC",
      "dark": "#6366F1",
      "contrast": "#FFFFFF"
    }
  }
export const lightBackgrounds = {
    "white": {
      "default": "#F8FAFC",
      "paper": "#FFFFFF",
      "sidebar": "#FFFFFF"
    },
    "warm": {
      "default": "#FFFBF5",
      "paper": "#FFFFFF",
      "sidebar": "#FFF8F0"
    },
    "cool": {
      "default": "#F0F4F8",
      "paper": "#FFFFFF",
      "sidebar": "#E8EDF2"
    },
    "neutral": {
      "default": "#F5F5F5",
      "paper": "#FFFFFF",
      "sidebar": "#EEEEEE"
    }
  }
export const darkBackgrounds = {
    "charcoal": {
      "default": "#0a0f1e",
      "paper": "#111827",
      "sidebar": "#0a0f1e",
      "card": "#1e293b"
    },
    "dark": {
      "default": "#111827",
      "paper": "#1F2937",
      "sidebar": "#111827"
    },
    "midnight": {
      "default": "#0A0E1A",
      "paper": "#151B2B",
      "sidebar": "#0A0E1A"
    },
    "carbon": {
      "default": "#171717",
      "paper": "#262626",
      "sidebar": "#171717"
    }
  }
export const textColors = {
    "light": {
      "primary": "#1E293B",
      "secondary": "#64748B",
      "disabled": "#94A3B8"
    },
    "dark": {
      "primary": "#ffffff",
      "secondary": "#94a3b8",
      "disabled": "#64748b"
    }
  }
export const semanticColors = {
    "success": {
      "main": "#10b981",
      "light": "#34d399",
      "dark": "#059669",
      "contrastText": "#ffffff"
    },
    "warning": {
      "main": "#f59e0b",
      "light": "#fcd34d",
      "dark": "#d97706",
      "contrastText": "#ffffff"
    },
    "error": {
      "main": "#ef4444",
      "light": "#f87171",
      "dark": "#dc2626",
      "contrastText": "#ffffff"
    },
    "info": {
      "main": "#3b82f6",
      "light": "#60a5fa",
      "dark": "#2563eb",
      "contrastText": "#ffffff"
    }
  }
export const sidebarStyles = [
    "solid",
    "gradient",
    "glass"
  ]
export const fontFamilies = {
    "inter": "\"Inter\", \"Helvetica\", \"Arial\", sans-serif",
    "poppins": "\"Poppins\", \"Helvetica\", \"Arial\", sans-serif",
    "roboto": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
    "dmSans": "\"DM Sans\", \"Helvetica\", \"Arial\", sans-serif",
    "nunito": "\"Nunito\", \"Helvetica\", \"Arial\", sans-serif",
    "lato": "\"Lato\", \"Helvetica\", \"Arial\", sans-serif",
    "openSans": "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
    "montserrat": "\"Montserrat\", \"Helvetica\", \"Arial\", sans-serif",
    "raleway": "\"Raleway\", \"Helvetica\", \"Arial\", sans-serif",
    "sourceSans": "\"Source Sans 3\", \"Helvetica\", \"Arial\", sans-serif",
    "outfit": "\"Outfit\", \"Helvetica\", \"Arial\", sans-serif",
    "plusJakarta": "\"Plus Jakarta Sans\", \"Helvetica\", \"Arial\", sans-serif",
    "manrope": "\"Manrope\", \"Helvetica\", \"Arial\", sans-serif",
    "figtree": "\"Figtree\", \"Helvetica\", \"Arial\", sans-serif",
    "lexend": "\"Lexend\", \"Helvetica\", \"Arial\", sans-serif",
    "mulish": "\"Mulish\", sans-serif",
    "quicksand": "\"Quicksand\", \"Helvetica\", \"Arial\", sans-serif",
    "urbanist": "\"Urbanist\", \"Helvetica\", \"Arial\", sans-serif",
    "spaceGrotesk": "\"Space Grotesk\", \"Helvetica\", \"Arial\", sans-serif",
    "sora": "\"Sora\", \"Helvetica\", \"Arial\", sans-serif",
    "barlow": "\"Barlow\", \"Helvetica\", \"Arial\", sans-serif",
    "rubik": "\"Rubik\", \"Helvetica\", \"Arial\", sans-serif",
    "karla": "\"Karla\", \"Helvetica\", \"Arial\", sans-serif",
    "workSans": "\"Work Sans\", \"Helvetica\", \"Arial\", sans-serif",
    "josefinSans": "\"Josefin Sans\", \"Helvetica\", \"Arial\", sans-serif",
    "cabin": "\"Cabin\", \"Helvetica\", \"Arial\", sans-serif",
    "notoSans": "\"Noto Sans\", \"Helvetica\", \"Arial\", sans-serif"
  }
export const formFontSizes = {
    "small": {
      "inputText": "0.8rem",
      "inputLabel": "0.75rem",
      "helperText": "0.675rem",
      "buttonText": "0.8rem",
      "buttonPadding": "4px 12px",
      "buttonIconSize": 16,
      "selectText": "0.8rem",
      "chipText": "0.75rem",
      "chipHeight": 24,
      "chipIconSize": 14,
      "inputPadding": "6px 12px",
      "avatarSize": 28,
      "avatarFontSize": "0.75rem",
      "iconSize": 18,
      "iconButtonSize": 30,
      "tableCellPadding": "8px 12px",
      "tableHeadFontSize": "0.7rem",
      "tabFontSize": "0.8rem",
      "tabMinHeight": 36,
      "listItemPadding": "4px 8px",
      "listItemIconSize": 18,
      "tooltipFontSize": "0.675rem",
      "alertFontSize": "0.8rem",
      "dialogTitleSize": "1rem",
      "badgeSize": 16,
      "progressHeight": 4,
      "switchSize": "small"
    },
    "medium": {
      "inputText": "1rem",
      "inputLabel": "1rem",
      "helperText": "0.75rem",
      "buttonText": "0.875rem",
      "buttonPadding": "6px 16px",
      "buttonIconSize": 18,
      "selectText": "0.875rem",
      "chipText": "0.8125rem",
      "chipHeight": 28,
      "chipIconSize": 16,
      "inputPadding": "8px 14px",
      "avatarSize": 34,
      "avatarFontSize": "0.8125rem",
      "iconSize": 20,
      "iconButtonSize": 36,
      "tableCellPadding": "10px 14px",
      "tableHeadFontSize": "0.75rem",
      "tabFontSize": "0.85rem",
      "tabMinHeight": 42,
      "listItemPadding": "6px 10px",
      "listItemIconSize": 20,
      "tooltipFontSize": "0.7rem",
      "alertFontSize": "0.85rem",
      "dialogTitleSize": "1.1rem",
      "badgeSize": 18,
      "progressHeight": 5,
      "switchSize": "small"
    },
    "large": {
      "inputText": "1rem",
      "inputLabel": "0.925rem",
      "helperText": "0.8rem",
      "buttonText": "0.95rem",
      "buttonPadding": "8px 20px",
      "buttonIconSize": 20,
      "selectText": "1rem",
      "chipText": "0.875rem",
      "chipHeight": 32,
      "chipIconSize": 18,
      "inputPadding": "10px 16px",
      "avatarSize": 40,
      "avatarFontSize": "0.875rem",
      "iconSize": 22,
      "iconButtonSize": 40,
      "tableCellPadding": "12px 16px",
      "tableHeadFontSize": "0.8125rem",
      "tabFontSize": "0.9rem",
      "tabMinHeight": 48,
      "listItemPadding": "8px 12px",
      "listItemIconSize": 22,
      "tooltipFontSize": "0.75rem",
      "alertFontSize": "0.9rem",
      "dialogTitleSize": "1.2rem",
      "badgeSize": 20,
      "progressHeight": 6,
      "switchSize": "medium"
    },
    "xlarge": {
      "inputText": "1.125rem",
      "inputLabel": "1rem",
      "helperText": "0.85rem",
      "buttonText": "1.05rem",
      "buttonPadding": "10px 24px",
      "buttonIconSize": 22,
      "selectText": "1.125rem",
      "chipText": "0.95rem",
      "chipHeight": 36,
      "chipIconSize": 20,
      "inputPadding": "12px 18px",
      "avatarSize": 44,
      "avatarFontSize": "0.95rem",
      "iconSize": 24,
      "iconButtonSize": 44,
      "tableCellPadding": "14px 18px",
      "tableHeadFontSize": "0.875rem",
      "tabFontSize": "0.95rem",
      "tabMinHeight": 52,
      "listItemPadding": "10px 14px",
      "listItemIconSize": 24,
      "tooltipFontSize": "0.8rem",
      "alertFontSize": "0.95rem",
      "dialogTitleSize": "1.3rem",
      "badgeSize": 22,
      "progressHeight": 7,
      "switchSize": "medium"
    }
  }
export const typographyScales = {
    "compact": {
      "htmlFontSize": 16,
      "fontSize": 13
    },
    "default": {
      "htmlFontSize": 16,
      "fontSize": 14
    },
    "large": {
      "htmlFontSize": 16,
      "fontSize": 15
    },
    "xlarge": {
      "htmlFontSize": 16,
      "fontSize": 16
    }
  }
export const defaultThemeSettings = {
   "mode": "light",
    "primaryColor": "grey",
    "secondaryColor": "amber",
    "backgroundTone": "charcoal",
    "borderRadius": 8,
    "sidebarStyle": "solid",
    "fontFamily": "mulish",
    "typographyScale": "default",
    "formFontSize": "medium",
    "sidebarCollapsed": false
}

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


