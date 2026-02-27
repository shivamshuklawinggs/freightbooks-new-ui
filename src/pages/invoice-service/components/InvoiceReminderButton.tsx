import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '@/utils/axiosInterceptor';
import { toast } from 'react-toastify';

interface InvoiceReminderButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

const InvoiceReminderButton: React.FC<InvoiceReminderButtonProps> = ({
  invoiceId,
  invoiceNumber,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminderType, setReminderType] = useState<'before_due' | 'overdue'>('before_due');
  const [days, setDays] = useState(2);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setReminderType('before_due');
    setDays(2);
  };

  const handleSendReminder = async () => {
    setLoading(true);
    try {
      const payload = {
        invoiceId,
        type: reminderType,
        ...(reminderType === 'before_due'
          ? { daysUntilDue: days }
          : { daysOverdue: days }),
      };

      const response = await api.post('/notifications/invoice-reminder/send', payload);

      if (response.data.success) {
        toast.success(`Email reminder sent for invoice ${invoiceNumber}`);
        handleClose();
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

  return (
    <>
      <Tooltip title="Send Payment Reminder">
        <IconButton onClick={handleOpen} size="small" color="primary">
          <EmailIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Send Payment Reminder</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Invoice: <strong>{invoiceNumber}</strong>
            </Typography>

            <TextField
              select
              fullWidth
              label="Reminder Type"
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as 'before_due' | 'overdue')}
            >
              <MenuItem value="before_due">Before Due Date</MenuItem>
              <MenuItem value="overdue">Overdue Notice</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label={reminderType === 'before_due' ? 'Days Until Due' : 'Days Overdue'}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 60 } }}
              helperText={
                reminderType === 'before_due'
                  ? 'Number of days before the due date'
                  : 'Number of days past the due date'
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSendReminder}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceReminderButton;
