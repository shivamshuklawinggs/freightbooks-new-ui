import React, { useState, useMemo, ReactNode, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { alpha, useTheme, Theme } from '@mui/material/styles';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Palette as PaletteIcon,
  FormatSize as FontSizeIcon,
  RoundedCorner as RadiusIcon,
  ViewSidebar as SidebarIcon,
  RestartAlt as ResetIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

// Assuming standard Redux structure. In a real app, these types would be imported from the store definition.
import {
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
} from '@/redux/Slice/themeSlice'; 

import {
  colorPresets,
  secondaryPresets,
  lightBackgrounds,
  darkBackgrounds,
  fontFamilies,
  formFontSizes,
  typographyScales,
  sidebarStyles,
} from '@/data/colors';

import defaults from '@/data/defaults.json';

/**
 * Types and Interfaces
 */
interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundTone: string;
  borderRadius: number;
  sidebarStyle: string;
  fontFamily: string;
  typographyScale: string;
  formFontSize: string;
  sidebarCollapsed: boolean;
}

interface RootState {
  theme: ThemeState;
}

interface SectionTitleProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  label?: string;
}

interface BgToneSwatchProps {
  bgColor: string;
  selected: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  label: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, subtitle }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Stack>
);

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, selected, onClick, label }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: color,
        border: selected ? '3px solid' : '2px solid transparent',
        borderColor: selected ? 'text.primary' : 'transparent',
        outline: selected ? '2px solid' : 'none',
        outlineColor: selected ? color : 'transparent',
        outlineOffset: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.15)',
          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
        },
      }}
    />
    {label && (
      <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
        {label}
      </Typography>
    )}
  </Box>
);

const BgToneSwatch: React.FC<BgToneSwatchProps> = ({ bgColor, selected, onClick, label }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 32,
        borderRadius: 1.5,
        bgcolor: bgColor,
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main' },
      }}
    />
    <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
      {label}
    </Typography>
  </Box>
);

// Convert camelCase key to display name: "plusJakarta" → "Plus Jakarta"
const fontDisplayName = (key: string): string =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();
  const settings = useSelector((state: RootState) => state.theme);
  const [fontSearch, setFontSearch] = useState<string>('');
  const [copySnackbar, setCopySnackbar] = useState<boolean>(false);

  const bgOptions = settings.mode === 'dark' ? darkBackgrounds : lightBackgrounds;

  const filteredFonts = useMemo(() => {
    const entries = Object.entries(fontFamilies);
    if (!fontSearch.trim()) return entries;
    const q = fontSearch.toLowerCase();
    return entries.filter(([key]) => fontDisplayName(key).toLowerCase().includes(q));
  }, [fontSearch]);

  // Build export data in exact defaults.json format so user can copy-paste directly
  const themeExportData = useMemo(() => {
    // Current settings become the new defaultSettings
    return {
      defaultSettings: {
        mode: settings.mode,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        backgroundTone: settings.backgroundTone,
        borderRadius: settings.borderRadius,
        sidebarStyle: settings.sidebarStyle,
        fontFamily: settings.fontFamily,
        typographyScale: settings.typographyScale,
        formFontSize: settings.formFontSize,
        sidebarCollapsed: settings.sidebarCollapsed,
      },
      colorPresets: defaults.colorPresets,
      secondaryPresets: defaults.secondaryPresets,
      lightBackgrounds: defaults.lightBackgrounds,
      darkBackgrounds: defaults.darkBackgrounds,
      textColors: defaults.textColors,
      semanticColors: defaults.semanticColors,
      sidebarStyles: defaults.sidebarStyles,
      fontFamilies: defaults.fontFamilies,
      formFontSizes: defaults.formFontSizes,
      typographyScales: defaults.typographyScales,
    };
  }, [settings]);

  const handleCopyTheme = () => {
    navigator.clipboard.writeText(JSON.stringify(themeExportData, null, 2)).then(() => {
      setCopySnackbar(true);
    });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Customize the look and feel of your application
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ─── Appearance Mode ─────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={settings.mode === 'dark' ? <DarkModeIcon sx={{ fontSize: 18, color: '#fff' }} /> : <LightModeIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Appearance"
                subtitle="Light or dark mode"
              />
              <ToggleButtonGroup
                value={settings.mode}
                exclusive
                onChange={(_, val) => val && dispatch(setMode(val))}
                fullWidth
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 1 } }}
              >
                <ToggleButton value="light">
                  <LightModeIcon sx={{ mr: 1, fontSize: 18 }} /> Light
                </ToggleButton>
                <ToggleButton value="dark">
                  <DarkModeIcon sx={{ mr: 1, fontSize: 18 }} /> Dark
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Border Radius ──────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<RadiusIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Border Radius"
                subtitle={`${settings.borderRadius}px`}
              />
              <Slider
                value={settings.borderRadius}
                onChange={(_, val) => dispatch(setBorderRadius(val as number))}
                min={0}
                max={24}
                step={2}
                marks={[
                  { value: 0, label: '0' },
                  { value: 8, label: '8' },
                  { value: 12, label: '12' },
                  { value: 16, label: '16' },
                  { value: 24, label: '24' },
                ]}
                sx={{ mt: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Box sx={{ width: 48, height: 32, bgcolor: 'primary.main', borderRadius: `${settings.borderRadius}px` }} />
                <Box sx={{ flex: 1, height: 32, bgcolor: (t) => alpha(t.palette.primary.main, 0.12), borderRadius: `${settings.borderRadius}px` }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Primary Color ──────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<PaletteIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Primary Color"
                subtitle="Main accent color used across the app"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(colorPresets).map(([key, val]) => (
                  <ColorSwatch
                    key={key}
                    color={val.main}
                    selected={settings.primaryColor === key}
                    onClick={() => dispatch(setPrimaryColor(key))}
                    label={key}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Secondary Color ────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<PaletteIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Secondary Color"
                subtitle="Used for secondary actions and accents"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(secondaryPresets).map(([key, val]) => (
                  <ColorSwatch
                    key={key}
                    color={val.main}
                    selected={settings.secondaryColor === key}
                    onClick={() => dispatch(setSecondaryColor(key))}
                    label={key}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Background Tone ────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<PaletteIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Background Tone"
                subtitle={`${settings.mode} mode backgrounds`}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(bgOptions).map(([key, val]) => (
                  <BgToneSwatch
                    key={key}
                    bgColor={val.default}
                    selected={settings.backgroundTone === key}
                    onClick={() => dispatch(setBackgroundTone(key))}
                    label={key}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Sidebar Style ──────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<SidebarIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Sidebar Style"
                subtitle="Choose sidebar appearance"
              />
              <ToggleButtonGroup
                value={settings.sidebarStyle}
                exclusive
                onChange={(_, val) => val && dispatch(setSidebarStyle(val))}
                fullWidth
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 1 } }}
              >
                {Object.keys(sidebarStyles).map((key) => (
                  <ToggleButton key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {/* Preview */}
              <Box
                sx={{
                  mt: 2,
                  height: 60,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: '100%',
                    ...(settings.sidebarStyle === 'gradient' && {
                      background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }),
                    ...(settings.sidebarStyle === 'glass' && {
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(10px)',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }),
                    ...(settings.sidebarStyle === 'solid' && {
                      bgcolor: 'background.paper',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }),
                  }}
                />
                <Box sx={{ flex: 1, bgcolor: 'background.default', p: 1 }}>
                  <Box sx={{ width: '60%', height: 8, bgcolor: 'divider', borderRadius: 1, mb: 0.5 }} />
                  <Box sx={{ width: '40%', height: 6, bgcolor: 'divider', borderRadius: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Font Family ────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<FontSizeIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Font Family"
                subtitle={`${Object.keys(fontFamilies).length} fonts available — currently using "${settings.fontFamily}"`}
              />
              <TextField
                placeholder="Search fonts..."
                size="small"
                fullWidth
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: 1,
                  maxHeight: 320,
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {filteredFonts.map(([key, val]) => (
                  <Chip
                    key={key}
                    label={fontDisplayName(key)}
                    onClick={() => dispatch(setFontFamily(key))}
                    variant={settings.fontFamily === key ? 'filled' : 'outlined'}
                    color={settings.fontFamily === key ? 'primary' : 'default'}
                    sx={{
                      fontFamily: val,
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      height: 38,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'scale(1.03)' },
                    }}
                  />
                ))}
                {filteredFonts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, gridColumn: '1 / -1', textAlign: 'center' }}>
                    No fonts match your search
                  </Typography>
                )}
              </Box>
              {/* Font preview */}
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.04), border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Preview</Typography>
                <Typography variant="h5" sx={{ fontFamily: (fontFamilies as Record<string, string>)[settings.fontFamily] }}>
                  The quick brown fox jumps over the lazy dog
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: (fontFamilies as Record<string, string>)[settings.fontFamily], mt: 0.5 }} color="text.secondary">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Form Font Size ──────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<FontSizeIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Form Font Size"
                subtitle="Adjust text size in all form elements"
              />
              <ToggleButtonGroup
                value={settings.formFontSize}
                exclusive
                onChange={(_, val) => val && dispatch(setFormFontSize(val))}
                fullWidth
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 1 } }}
              >
                {Object.keys(formFontSizes).map((key) => (
                  <ToggleButton key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.04), border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Preview</Typography>
                <TextField
                  label="Sample Input"
                  placeholder="Type something..."
                  size="small"
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Button variant="contained" size="small">Sample Button</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Typography Scale ───────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<FontSizeIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Typography Scale"
                subtitle="Adjust text size globally"
              />
              <ToggleButtonGroup
                value={settings.typographyScale}
                exclusive
                onChange={(_, val) => val && dispatch(setTypographyScale(val))}
                fullWidth
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 1 } }}
              >
                {Object.keys(typographyScales).map((key) => (
                  <ToggleButton key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Preview Heading</Typography>
                <Typography variant="body1" color="text.secondary">Body text preview at current scale.</Typography>
                <Typography variant="caption" color="text.disabled">Caption text preview</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      
        {/* ─── Current Theme Data / Export ────────────────────────── */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <SectionTitle
                  icon={<CodeIcon sx={{ fontSize: 18, color: '#fff' }} />}
                  title="Current Theme Data"
                  subtitle="Matches defaults.json format — copy and paste directly into defaults.json"
                />
                <Button
                  variant="contained"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyTheme}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Copy JSON
                </Button>
              </Box>

              {/* Live color swatches */}
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Applied Colors
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                {[
                  { label: 'Primary', color: theme.palette.primary.main },
                  { label: 'Primary Light', color: theme.palette.primary.light },
                  { label: 'Primary Dark', color: theme.palette.primary.dark },
                  { label: 'Secondary', color: theme.palette.secondary.main },
                  { label: 'Success', color: theme.palette.success.main },
                  { label: 'Warning', color: theme.palette.warning.main },
                  { label: 'Error', color: theme.palette.error.main },
                  { label: 'Info', color: theme.palette.info.main },
                  { label: 'Background', color: theme.palette.background.default },
                  { label: 'Paper', color: theme.palette.background.paper },
                  { label: 'Text Primary', color: theme.palette.text.primary },
                  { label: 'Text Secondary', color: theme.palette.text.secondary },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: item.color,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(item.color);
                        setCopySnackbar(true);
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center', maxWidth: 50 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.disabled', fontFamily: 'monospace' }}>
                      {item.color}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Quick reference table */}
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Reference
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 0.5,
                  mb: 2.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.02),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {[
                  ['Mode', settings.mode],
                  ['Primary', `${settings.primaryColor} (${theme.palette.primary.main})`],
                  ['Secondary', `${settings.secondaryColor} (${theme.palette.secondary.main})`],
                  ['Background', settings.backgroundTone],
                  ['Border Radius', `${theme.shape.borderRadius}px`],
                  ['Sidebar Style', settings.sidebarStyle],
                  ['Sidebar Collapsed', settings.sidebarCollapsed ? 'Yes' : 'No'],
                  ['Font', fontDisplayName(settings.fontFamily)],
                  ['Font Size', `${theme.typography.fontSize}px`],
                  ['Form Font Size', settings.formFontSize],
                  ['Scale', settings.typographyScale],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 0.5 }}>
                    <Typography variant="caption" fontWeight={600}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Sidebar Controls ─────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<SidebarIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Sidebar Controls"
                subtitle="Manage sidebar state and behavior"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sidebarCollapsed}
                      onChange={(e) => dispatch(setSidebarCollapsed(e.target.checked))}
                    />
                  }
                  label="Sidebar Collapsed"
                />
                <Button
                  variant="outlined"
                  onClick={() => dispatch(toggleSidebarCollapsed())}
                  sx={{ textTransform: 'none' }}
                >
                  Toggle Sidebar State
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Theme Actions ─────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <SectionTitle
                icon={<ResetIcon sx={{ fontSize: 18, color: '#fff' }} />}
                title="Theme Actions"
                subtitle="Reset or update theme settings"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => dispatch(resetThemeSettings())}
                  sx={{ textTransform: 'none' }}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Example of updating multiple settings at once
                    dispatch(updateThemeSettings({
                      primaryColor: 'blue',
                      secondaryColor: 'slate',
                      borderRadius: 12,
                    }));
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Apply Preset Theme
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={copySnackbar} 
        autoHideDuration={3000} 
        onClose={() => setCopySnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
