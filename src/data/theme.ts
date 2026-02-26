import { RootState } from '@/redux/store';
import { createTheme, PaletteMode } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
export const Colors = {
  palette: {
    primary: {
      main: '#dd5d2c', // $primary from _variables
      light: '#e47a51', // $primary-light (lighten by 10%)
      dark: '#0d1442', // $primary-dark
    },
    secondary: {
      main: '#64748b', // $secondary
      light: '#94a3b8', // $gray-400
      dark: '#475569', // $text-secondary
    },
    error: {
      main: '#dc3545', // $danger
    },
    warning: {
      main: '#f59e0b', // $warning
    },
    info: {
      main: '#0ea5e9', // $info
    },
    success: {
      main: '#22c55e', // $success
    },
    text: {
      primary: '#000000', // $text-primary
      secondary: '#475569', // $text-secondary
    },
    background: {
      default: '#f8f9fa', // $gray-50
      paper: '#ffffff', // $white
    },
    divider: '#E5E8EC', // Default divider color (light gray)
  },
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
// Create a theme instance using colors from _variables
const theme = createTheme({
    palette: Colors.palette,
    typography: {
      fontFamily: '"Lexend Deca", serif', // From body in index
      fontSize: 12,
      h1: {
        fontFamily: '"Poppins", sans-serif', // From h1-h4 in index
        fontWeight: 500, // $font-weight-bold
      },
      h2: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
      },
      h3: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
      },
      h4: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500, // $font-weight-medium
      },
    },
    shape: {
      borderRadius: 12, // Modern rounded corners like QuickBooks
    },
    shadows: [
      'none',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 2px 6px rgba(0,0,0,0.08)',
      '0px 4px 12px rgba(0,0,0,0.1)',
      '0px 6px 16px rgba(0,0,0,0.12)',
      '0px 8px 24px rgba(0,0,0,0.14)',
      '0px 12px 32px rgba(0,0,0,0.16)',
      '0px 16px 40px rgba(0,0,0,0.18)',
      '0px 20px 48px rgba(0,0,0,0.2)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
      '0px 1px 3px rgba(0,0,0,0.08)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            transition: 'all 0.2s ease',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid #e5e7eb',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 8, // From .form-control
            '&.Mui-focused': {
              // boxShadow: '0 0 0 0.2rem rgba(221, 93, 44, 0.25)', // From .form-control:focus
            },
          },
          input: {
            height: '1.4375em', // Ensure consistent height for all inputs
            '&[type=number]': {
              height: '1.4375em', // Explicitly set height for number inputs
              padding: '16.5px 14px', // Match the padding of text inputs
              '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                margin: 0,
                WebkitAppearance: 'none'
              },
              MozAppearance: 'textfield' // Firefox
            }
          }
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#dd5d2c', // $primary
            },
            // Ensure input height consistency
            input: {
              height: '1.4375em',
              boxSizing: 'content-box'
            }
          },
          // Ensure number inputs have the same height
          input: {
            '&[type=number]': {
              height: '1.4375em'
            }
          }
        },
      },
      // Ensure Select components have the same height as inputs
      MuiSelect: {
        styleOverrides: {
          select: {
            minHeight: '1.4375em',
            lineHeight: '1.4375em'
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'var(--divider-color, #E5E8EC)',
            '&.custom-divider': {
              borderColor: 'var(--custom-divider-color, #DD5D2C)',
            }
          },
        },
      },
    },
  });
const usecustomeTheme = () => {
  const { themeMode, currentCompany, currentCompanyDetails, primaryColor } =
    useSelector((state: RootState) => state.user);

  // Local state for theme, initialized with a theme based on defaults
  const [customTheme, setCustomTheme] = useState(() =>
    createTheme({
      ...theme,
      palette: {
        ...theme.palette,
        mode: themeMode as PaletteMode,
        primary: {
          ...theme.palette.primary,
          main: theme.palette.primary.main,
        },
        background: {
          default: themeMode === 'dark' ? '#121212' : '#ffffff',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      components: {
        ...theme.components,
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor:
                  currentCompanyDetails?.color || theme.palette.primary.main,
              },
              input: {
                height: '1.4375em',
                boxSizing: 'content-box',
              },
            },
            input: {
              '&[type=number]': {
                height: '1.4375em',
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: 'var(--divider-color, #E5E8EC)',
              '&.custom-divider': {
                borderColor: `${currentCompanyDetails?.color || theme.palette.primary.main}`,
              },
            },
          },
        },
      },
    })
  );

  // Update theme whenever any relevant value changes
  useEffect(() => {

    const updatedTheme = createTheme({
      ...theme,
      palette: {
        ...theme.palette,
        mode: themeMode as PaletteMode,
        primary: {
          ...theme.palette.primary,
          main: theme.palette.primary.main,
        },
        background: {
          default: themeMode === 'dark' ? '#121212' : '#ffffff',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      components: {
        ...theme.components,
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor:
                  currentCompanyDetails?.color || theme.palette.primary.main,
              },
              input: {
                height: '1.4375em',
                boxSizing: 'content-box',
              },
            },
            input: {
              '&[type=number]': {
                height: '1.4375em',
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: 'var(--divider-color, #E5E8EC)',
              '&.custom-divider': {
                borderColor: `${currentCompanyDetails?.color || theme.palette.primary.main}`,
              },
            },
          },
        },
      },
    });

    setCustomTheme(updatedTheme);
  }, [themeMode, primaryColor, currentCompanyDetails?.color, currentCompany]);

  return customTheme;
};
export {usecustomeTheme}

export default theme;