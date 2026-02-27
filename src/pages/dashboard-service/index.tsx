// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import { PageHeader } from '@/components/ui';
import AccRecieveable from './Charts/AccRecieveable';
import AccPayable from './Charts/AccPayable';
import ExpenSes from './Charts/ExpenSes';
import ProfitAndLoss from './Charts/ProfitAndLoss';
import Sales from './Charts/Sales';
import { Grid, Typography, Box, Card, CardContent, alpha, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { fetchAllLoadStats } from '@/redux/Slice/DashboardSlice';
import { LocalShipping as TruckIcon } from '@mui/icons-material';

interface totalData {
  _id: string; // Changed from LoadStatus to string to match DashboardData
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:    '#f59e0b',
  InProgress: '#3b82f6',
  Dispatched: '#8b5cf6',
  Delivered:  '#10b981',
  Cancelled:  '#ef4444',
  Claimed:    '#dc2626',
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { dashboard } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAllLoadStats());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PageHeader title="Dashboard" subtitle="Overview of your freight operations" />

      {/* Load Status Cards */}
      {Array.isArray(dashboard.Loads) && dashboard.Loads.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dashboard.Loads.map((item: totalData) => {
            const color = STATUS_COLORS[item._id] || theme.palette.primary.main;
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item._id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha(color, 0.3),
                    bgcolor: alpha(color, 0.04),
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: color,
                      boxShadow: `0 4px 16px ${alpha(color, 0.15)}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: '14px 16px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          bgcolor: alpha(color, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TruckIcon sx={{ fontSize: 16, color }} />
                      </Box>
                      <Chip
                        label={item.total}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          bgcolor: alpha(color, 0.15),
                          color,
                          '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
                    >
                      {item._id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <ProfitAndLoss />
        </Grid>
        <Grid item xs={12} md={6}>
          <ExpenSes />
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5}>
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
