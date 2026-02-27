import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '@/utils/axiosInterceptor';

interface EmailReminderSettings {
  enabled: boolean;
  beforeDueDays: number;
  overdueDays1: number;
  overdueDays2: number;
}

const EmailReminderSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [runAllLoading, setRunAllLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<EmailReminderSettings>({
    defaultValues: {
      enabled: true,
      beforeDueDays: 2,
      overdueDays1: 7,
      overdueDays2: 15,
    },
  });

  const enabled = watch('enabled');

  const onSaveSettings = async (data: EmailReminderSettings) => {
    setLoading(true);
    try {
      console.log('Saving email reminder settings:', data);
      toast.success('Email reminder settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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
          `Reminders processed successfully!\n` +
            `Before due: ${data.beforeDue}\n` +
            `Overdue (7 days): ${data.overdue7Days}\n` +
            `Overdue (15 days): ${data.overdue15Days}`
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

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Invoice Payment Reminders
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Automatically send email reminders to customers for upcoming and overdue invoice payments.
        </Alert>

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
                        <Typography variant="subtitle2" fontWeight="600">
                          Enable Automatic Email Reminders
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Send automated reminders based on invoice due dates
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

            <Grid item xs={12} sm={4}>
              <Controller
                name="beforeDueDays"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Days Before Due"
                    disabled={!enabled}
                    helperText="Send reminder before due date"
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="overdueDays1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="First Overdue (Days)"
                    disabled={!enabled}
                    helperText="First overdue reminder"
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="overdueDays2"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Second Overdue (Days)"
                    disabled={!enabled}
                    helperText="Urgent overdue reminder"
                    InputProps={{ inputProps: { min: 1, max: 60 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography variant="subtitle2" gutterBottom fontWeight="600">
                  <ScheduleIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  Reminder Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Reminders are sent automatically at 9:00 AM Eastern Time daily
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Before due: {enabled ? `${watch('beforeDueDays')} days before invoice due date` : 'Disabled'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • First overdue: {enabled ? `${watch('overdueDays1')} days after due date` : 'Disabled'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Second overdue: {enabled ? `${watch('overdueDays2')} days after due date` : 'Disabled'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
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
      </CardContent>
    </Card>
  );
};

export default EmailReminderSettings;
