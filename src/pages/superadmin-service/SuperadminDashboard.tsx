import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as TruckIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchSuperadminStats } from '@/redux/api/superadminApi';
import { formatCurrency } from '@/utils';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SuperadminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.superadmin);
  const currentCompany = useSelector((state: RootState) => state.user.currentCompany);

  useEffect(() => {
    dispatch(fetchSuperadminStats(currentCompany));
  }, [dispatch, currentCompany]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Superadmin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.counts.users}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.counts.invoices}
            icon={<DescriptionIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<MoneyIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Loads"
            value={stats.counts.loads}
            icon={<TruckIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Invoice Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Invoice Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${stats.invoicesSummary.totalInvoiceAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Paid Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    ${stats.invoicesSummary.totalPaidAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Total Due Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error.main">
                    ${stats.invoicesSummary.invoicePaidAmt.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Bill Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Bill Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${stats.billsSummary.totalInvoiceAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Paid Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    ${stats.billsSummary.billPaidAmt.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Total Due Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error.main">
                    ${stats.billsSummary.totalDueAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Entity Counts
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body1">Carriers:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.carriers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body1">Customers:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.customers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body1">Drivers:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.drivers}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <MoneyIcon fontSize="small" />
                    <Typography variant="body1">Payments:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.payments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Additional Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Bills:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.bills}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Expenses:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.expenses}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Journal Entries:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.counts.journalEntries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Operational Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Loads:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats.operational.totalLoads}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Total Load Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${stats.operational.totalLoadAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperadminDashboard;
