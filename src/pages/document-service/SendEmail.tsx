import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { IFile } from '@/types';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';

interface SendEmailProps {
  selectedDocuments: IFile[];
  setSelectedDocuments: React.Dispatch<React.SetStateAction<IFile[]>>;
  emailDialogOpen: boolean;
  setEmailDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendEmail: React.FC<SendEmailProps> = ({
  selectedDocuments,
  setSelectedDocuments,
  emailDialogOpen,
  setEmailDialogOpen
}) => {
  const [emailDetails, setEmailDetails] = React.useState({
    recipientEmail: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
    setEmailDetails({
      recipientEmail: '',
      subject: '',
      message: ''
    });
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const { recipientEmail, subject, message } = emailDetails;
      
      if (!recipientEmail || !subject) {
        toast.error('Email and subject are required');
        return;
      }

      const documentPaths = selectedDocuments.map(doc => ({
        filename: doc.filename,
        path: doc.url
      }));

      await apiService.sendDocumentByEmail({
        documentPaths,
        recipientEmail,
        subject,
        message
      });

      toast.success('Documents sent successfully');
      handleEmailDialogClose();
      setSelectedDocuments([]);
    } catch (error) {
      console.warn('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={emailDialogOpen} 
      onClose={handleEmailDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Send Documents via Email</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Recipient Email"
            fullWidth
            value={emailDetails.recipientEmail}
            onChange={(e) => setEmailDetails(prev => ({ ...prev, recipientEmail: e.target.value }))}
          />
          <TextField
            label="Subject"
            fullWidth
            value={emailDetails.subject}
            onChange={(e) => setEmailDetails(prev => ({ ...prev, subject: e.target.value }))}
          />
          <TextField
            label="Message (Optional)"
            fullWidth
            multiline
            rows={4}
            value={emailDetails.message}
            onChange={(e) => setEmailDetails(prev => ({ ...prev, message: e.target.value }))}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedDocuments.map((doc, index) => (
              <Chip
                key={index}
                label={doc.filename}
                onDelete={() => {
                  setSelectedDocuments(prev => prev.filter(d => d.filename !== doc.filename));
                }}
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEmailDialogClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSendEmail} 
          variant="contained" 
          disabled={loading || !emailDetails.recipientEmail || !emailDetails.subject}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmail;