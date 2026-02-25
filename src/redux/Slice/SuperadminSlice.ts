import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemStats, CleanupResult } from '@/service/superadmin.service';
import { fetchSuperadminStats } from '../api/superadminApi';

interface SuperadminState {
  stats: SystemStats | null;
  loading: boolean;
  error: string | null;
  cleanupResult: CleanupResult | null;
  cleanupLoading: boolean;
  cleanupError: string | null;
}

const initialState: SuperadminState = {
  stats: null,
  loading: false,
  error: null,
  cleanupResult: null,
  cleanupLoading: false,
  cleanupError: null,
};

const superadminSlice = createSlice({
  name: 'superadmin',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<SystemStats>) => {
      state.stats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCleanupResult: (state, action: PayloadAction<CleanupResult | null>) => {
      state.cleanupResult = action.payload;
    },
    setCleanupLoading: (state, action: PayloadAction<boolean>) => {
      state.cleanupLoading = action.payload;
    },
    setCleanupError: (state, action: PayloadAction<string | null>) => {
      state.cleanupError = action.payload;
    },
    clearCleanupResult: (state) => {
      state.cleanupResult = null;
      state.cleanupError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperadminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperadminStats.fulfilled, (state, action: PayloadAction<SystemStats>) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchSuperadminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to load statistics';
        state.stats = null;
      });
  },
});

export const {
  setStats,
  setLoading,
  setError,
  setCleanupResult,
  setCleanupLoading,
  setCleanupError,
  clearCleanupResult,
} = superadminSlice.actions;

export default superadminSlice.reducer;
