import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// SETUP COLORS

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#FFFFFF',
  800: '#2B2F3D',
  900: '#161C24',
};

const PRIMARY = {
  lighter: '#FFF9B3',
  light: '#FFEF80',
  main: '#FFE71A', 
  dark: '#E6CF00',
  darker: '#B8A600',
  contrastText: '#000000',
};

const SECONDARY = {
  lighter: '#FFF9B3',
  light: '#FFEF80',
  main: '#FFE71A',
  dark: '#E6CF00',
  darker: '#B8A600',
  contrastText: '#000000',
};

const INFO = {
  lighter: '#E6D9A8',
  light: '#D8C377',
  main: '#FFFFFF',
  dark: '#1F2A1F',
  darker: '#0F150F',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#FFF9B3',
  light: '#FFEF80',
  main: '#FFE71A',
  dark: '#E6D117',
  darker: '#CDB814',
  contrastText: '#000000',
};

const WARNING = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#e9113c',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  action: {
    hover: alpha(GREY[700], 0.08),
    selected: alpha(GREY[700], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[700], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export function palette(mode: 'light' | 'dark') {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      disabled: GREY[600],
    },
    background: {
      paper: '#2B2F3D',
      default: '#FFFFFF',
      sidebar: '#2B2F3D',
      neutral: GREY[200],
    },
    action: {
      ...COMMON.action,
      active: GREY[700],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      disabled: GREY[600],
    },
    background: {
      paper: GREY[800],
      default: '#1A1D29',
      sidebar: '#2B2F3D',
      neutral: alpha(GREY[500], 0.12),
    },
    action: {
      ...COMMON.action,
      active: GREY[700],
    },
  };

  return mode === 'light' ? light : dark;
}