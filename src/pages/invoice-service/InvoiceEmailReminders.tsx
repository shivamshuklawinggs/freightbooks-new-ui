import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '@/utils/axiosInterceptor';
import { getIcon } from '@/components/common/icons/getIcon';

interface EmailReminderSettings {
  enabled: boolean;
  beforeDueDays: number;
  overdueDays1: number;
  overdueDays2: number;
  timezone: string;
}

interface EmailLog {
  invoiceId: string;
  sentAt: string;
  type: 'before_due' | 'overdue_7' | 'overdue_15';
  status: 'sent' | 'failed';
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reminder-tabpanel-${index}`}
      aria-labelledby={`reminder-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InvoiceEmailReminders: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [runAllLoading, setRunAllLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<EmailReminderSettings>({
    defaultValues: {
      enabled: true,
      beforeDueDays: 2,
      overdueDays1: 7,
      overdueDays2: 15,
      timezone: 'America/New_York',
    },
  });

  const {
    control: sendControl,
    handleSubmit: handleSendSubmit,
    reset: resetSendForm,
  } = useForm({
    defaultValues: {
      invoiceId: '',
      type: 'before_due',
      daysUntilDue: 2,
      daysOverdue: 7,
    },
  });

  const enabled = watch('enabled');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSaveSettings = async (data: EmailReminderSettings) => {
    setLoading(true);
    try {
      console.log('Saving settings:', data);
      toast.success('Email reminder settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const onSendManualReminder = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post('/notifications/invoice-reminder/send', data);
      
      if (response.data.success) {
        toast.success('Email reminder sent successfully');
        setSendDialogOpen(false);
        resetSendForm();
      } else {
        toast.error(response.data.message || 'Failed to send reminder');
      }
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAllReminders = async () => {
    setRunAllLoading(true);
    try {
      const response = await api.post('/notifications/invoice-reminder/run-all');
      
      if (response.data.success) {
        const { data } = response.data;
        toast.success(
          `Reminders processed: ${data.beforeDue} before due, ${data.overdue7Days} overdue (7d), ${data.overdue15Days} overdue (15d)`
        );
      } else {
        toast.error('Failed to process reminders');
      }
    } catch (error: any) {
      console.error('Error running reminders:', error);
      toast.error(error.response?.data?.message || 'Failed to process reminders');
    } finally {
      setRunAllLoading(false);
    }
  };

  const fetchEmailLogs = async (invoiceId: string) => {
    try {
      const response = await api.get(`/notifications/invoice-reminder/logs/${invoiceId}`);
      if (response.data.success) {
        setEmailLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch email logs');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EmailIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Invoice Payment Reminders
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Automatically send email reminders to customers for upcoming and overdue invoice payments.
        Reminders are sent 2 days before due date, and at 7 and 15 days after due date.
      </Alert>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="reminder tabs">
            <Tab icon={<SettingsIcon />} label="Settings" />
            <Tab icon={<SendIcon />} label="Manual Send" />
            <Tab icon={<HistoryIcon />} label="Activity Log" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleSubmit(onSaveSettings)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} color="primary" />}
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            Enable Automatic Reminders
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Automatically send email reminders based on the schedule below
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="beforeDueDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Days Before Due Date"
                      disabled={!enabled}
                      helperText="Send reminder this many days before invoice is due"
                      InputProps={{ inputProps: { min: 1, max: 30 } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="overdueDays1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="First Overdue Reminder (Days)"
                      disabled={!enabled}
                      helperText="Send first overdue reminder after this many days"
                      InputProps={{ inputProps: { min: 1, max: 30 } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="overdueDays2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Second Overdue Reminder (Days)"
                      disabled={!enabled}
                      helperText="Send urgent reminder after this many days"
                      InputProps={{ inputProps: { min: 1, max: 60 } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="600">
                    <ScheduleIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    Reminder Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automated reminders run daily at 9:00 AM Eastern Time
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
                  >
                    Save Settings
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRunAllReminders}
                    disabled={runAllLoading}
                    startIcon={runAllLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  >
                    Run All Reminders Now
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Send Manual Reminder
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send a one-time email reminder for a specific invoice
            </Typography>

            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setSendDialogOpen(true)}
            >
              Send Manual Reminder
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Email Activity Log
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              View the history of sent email reminders
            </Typography>

            {emailLogs.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.invoiceId}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.type.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={log.type === 'before_due' ? 'info' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          {log.status === 'sent' ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Sent"
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Chip
                              icon={<ErrorIcon />}
                              label="Failed"
                              size="small"
                              color="error"
                            />
                          )}
                        </TableCell>
                        <TableCell>{new Date(log.sentAt).toLocaleString()}</TableCell>
                        <TableCell>{log.error || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No email logs available. Enter an invoice ID to view logs.</Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Invoice ID"
                placeholder="Enter invoice ID to view logs"
                size="small"
                onBlur={(e) => {
                  if (e.target.value) {
                    fetchEmailLogs(e.target.value);
                  }
                }}
              />
            </Box>
          </Box>
        </TabPanel>
      </Card>

      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogActions>
          <IconButton onClick={() => setSendDialogOpen(false)} size="small">
            {getIcon('CloseIcon')}
          </IconButton>
        </DialogActions>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Send Manual Reminder
            <IconButton onClick={() => setSendDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSendSubmit(onSendManualReminder)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="invoiceId"
                  control={sendControl}
                  rules={{ required: 'Invoice ID is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Invoice ID"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={sendControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Reminder Type"
                      SelectProps={{ native: true }}
                    >
                      <option value="before_due">Before Due Date</option>
                      <option value="overdue">Overdue</option>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="daysUntilDue"
                  control={sendControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Days Until Due (for before_due type)"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="daysOverdue"
                  control={sendControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Days Overdue (for overdue type)"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send Reminder
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InvoiceEmailReminders;
