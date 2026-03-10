import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/redux/store';
import superadminService from '@/service/superadmin.service';
import {
  setCleanupResult,
  setCleanupLoading,
  setCleanupError,
  clearCleanupResult,
} from '@/redux/Slice/SuperadminSlice';
import { getIcon } from '@/components/common/icons/getIcon';

const SuperadminDataCleanup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleanupResult, cleanupLoading, cleanupError } = useSelector(
    (state: RootState) => state.superadmin
  );
  const currentCompany = useSelector((state: RootState) => state.user.currentCompany);

  const [companyId, setCompanyId] = useState(currentCompany || '');
  const [dryRun, setDryRun] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: string;
    action: () => void;
  }>({ open: false, type: '', action: () => {} });

  // User cleanup options
  const [keepAdmins, setKeepAdmins] = useState(true);

  // Financial cleanup options
  const [includeInvoices, setIncludeInvoices] = useState(true);
  const [includeBills, setIncludeBills] = useState(true);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeJournalEntries, setIncludeJournalEntries] = useState(true);

  // Operational cleanup options
  const [includeLoads, setIncludeLoads] = useState(true);
  const [includeCarriers, setIncludeCarriers] = useState(true);
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [includeDrivers, setIncludeDrivers] = useState(true);

  const handleCleanup = async (cleanupFn: () => Promise<any>, type: string) => {
    if (!dryRun) {
      setConfirmDialog({
        open: true,
        type,
        action: () => executeCleanup(cleanupFn),
      });
    } else {
      executeCleanup(cleanupFn);
    }
  };

  const executeCleanup = async (cleanupFn: () => Promise<any>) => {
    try {
      dispatch(setCleanupLoading(true));
      dispatch(clearCleanupResult());
      const response = await cleanupFn();
      dispatch(setCleanupResult(response.data));
      dispatch(setCleanupError(null));
    } catch (error: any) {
      dispatch(setCleanupError(error.response?.data?.message || 'Cleanup failed'));
    } finally {
      dispatch(setCleanupLoading(false));
      setConfirmDialog({ open: false, type: '', action: () => {} });
    }
  };

  const handleCleanupUsers = () => {
    handleCleanup(
      () =>
        superadminService.cleanupUsers({
          companyId,
          keepAdmins,
          dryRun,
        }),
      'Users'
    );
  };

  const handleCleanupFinancial = () => {
    handleCleanup(
      () =>
        superadminService.cleanupFinancial({
          companyId,
          includeInvoices,
          includeBills,
          includePayments,
          includeJournalEntries,
          dryRun,
        }),
      'Financial Data'
    );
  };

  const handleCleanupOperational = () => {
    handleCleanup(
      () =>
        superadminService.cleanupOperational({
          companyId,
          includeLoads,
          includeCarriers,
          includeCustomers,
          includeDrivers,
          dryRun,
        }),
      'Operational Data'
    );
  };

  

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <DeleteIcon fontSize="large" />
        <Typography variant="h4" fontWeight="bold">
          Data Cleanup
        </Typography>
      </Box>

      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Global Settings
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company ID"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter company ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                  />
                }
                label="Dry Run (Preview only - no data will be deleted)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Cleanup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            User Cleanup
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Remove users from the system
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={keepAdmins}
                  onChange={(e) => setKeepAdmins(e.target.checked)}
                />
              }
              label="Keep Admin Users"
            />
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleCleanupUsers}
            disabled={cleanupLoading || !companyId}
            startIcon={cleanupLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ mt: 2 }}
          >
            {cleanupLoading ? 'Processing...' : 'Cleanup Users'}
          </Button>
        </CardContent>
      </Card>

      {/* Financial Cleanup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Financial Data Cleanup
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Remove financial records
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeInvoices}
                    onChange={(e) => setIncludeInvoices(e.target.checked)}
                  />
                }
                label="Include Invoices"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeBills}
                    onChange={(e) => setIncludeBills(e.target.checked)}
                  />
                }
                label="Include Bills"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePayments}
                    onChange={(e) => setIncludePayments(e.target.checked)}
                  />
                }
                label="Include Payments"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeJournalEntries}
                    onChange={(e) => setIncludeJournalEntries(e.target.checked)}
                  />
                }
                label="Include Journal Entries"
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="error"
            onClick={handleCleanupFinancial}
            disabled={cleanupLoading || !companyId}
            startIcon={cleanupLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ mt: 2 }}
          >
            {cleanupLoading ? 'Processing...' : 'Cleanup Financial Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Operational Cleanup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Operational Data Cleanup
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Remove operational records
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeLoads}
                    onChange={(e) => setIncludeLoads(e.target.checked)}
                  />
                }
                label="Include Loads"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCarriers}
                    onChange={(e) => setIncludeCarriers(e.target.checked)}
                  />
                }
                label="Include Carriers"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCustomers}
                    onChange={(e) => setIncludeCustomers(e.target.checked)}
                  />
                }
                label="Include Customers"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeDrivers}
                    onChange={(e) => setIncludeDrivers(e.target.checked)}
                  />
                }
                label="Include Drivers"
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="error"
            onClick={handleCleanupOperational}
            disabled={cleanupLoading || !companyId}
            startIcon={cleanupLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ mt: 2 }}
          >
            {cleanupLoading ? 'Processing...' : 'Cleanup Operational Data'}
          </Button>
        </CardContent>
      </Card>

    
      {/* Results */}
      {cleanupError && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {cleanupError}
        </Alert>
      )}

      {cleanupResult && (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {cleanupResult.dryRun
              ? 'Dry Run Results (No data deleted)'
              : 'Cleanup Completed'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total Affected Records: {cleanupResult.affectedRecords}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Breakdown:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            {Object.entries(cleanupResult.deletedCounts).map(([key, value]) => (
              <li key={key}>
                <Typography variant="body2">
                  {key}: {String(value)}
                </Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogActions>
          <IconButton onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} size="small">
            {getIcon('CloseIcon')}
          </IconButton>
        </DialogActions>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Confirm Cleanup
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cleanup {confirmDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            color="error"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperadminDataCleanup;
