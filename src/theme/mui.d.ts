import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar?: {
      main?: string;
    };
  }

  interface PaletteOptions {
    sidebar?: {
      main?: string;
    };
  }

  interface Theme {
    custom: {
      sidebarStyle: string;
      sidebarCollapsed: boolean;
      sidebarWidth: number;
      sidebarWidthCollapsed: number;
      sidebarWidthExpanded: number;
      headerHeight: number;
      formFont: any;
    };
  }

  interface ThemeOptions {
    custom?: Theme['custom'];
  }
}