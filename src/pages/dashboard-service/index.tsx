// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import AccRecieveable from './Charts/AccRecieveable';
import AccPayable from './Charts/AccPayable';
import ExpenSes from './Charts/ExpenSes';
import ProfitAndLoss from './Charts/ProfitAndLoss';
import Sales from './Charts/Sales';
import { Grid, Typography, Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { fetchAllLoadStats } from '@/redux/Slice/DashboardSlice';

interface totalData {
  _id: string; // Changed from LoadStatus to string to match DashboardData
  total: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    dashboard,
  
  } = useAppSelector((state) => state.dashboard);
  useEffect(() => {
    // Fetch accounts payable data
    dispatch(fetchAllLoadStats());
  }, [dispatch]);

  return (
    <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Array.isArray(dashboard.Loads) && dashboard.Loads.map((item: totalData) => (
          <Grid item xs={12} md={3} key={item._id}>
            <Box
              sx={{
                padding: 2,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {item._id} Loads
              </Typography>
              <Typography variant="h4" sx={{ mb: 0 }}>
                {item.total}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ProfitAndLoss />
        </Grid>
        <Grid item xs={12} md={6}>
          <ExpenSes />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Sales />
        </Grid>
        <Grid item xs={12} md={4}>
          <AccRecieveable />
        </Grid>
        <Grid item xs={12} md={4}>
          <AccPayable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default withPermission("view", ["dashboard"])(Dashboard);
