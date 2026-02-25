import { createAsyncThunk } from "@reduxjs/toolkit";
import superadminService, { SystemStats } from "@/service/superadmin.service";

export const fetchSuperadminStats = createAsyncThunk(
  'superadmin/fetchStats',
  async (companyId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await superadminService.getStats(companyId);
      return response.data as SystemStats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);
