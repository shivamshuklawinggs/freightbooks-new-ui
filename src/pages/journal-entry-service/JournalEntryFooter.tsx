import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Grid, TextField, Typography, Paper, Box, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, Delete } from '@mui/icons-material';
import { IJournalEntry } from './Schema/JournalEntrySchema';
import { getFileName, getFilePreview, getFileSize } from '@/utils/getFilePreview';
import { JOURNAL_ENTRY_UPLOAD_URL } from '@/config';
import { toast } from 'react-toastify';

const JournalEntryFooter: React.FC = () => {
  const { control, setValue, watch } = useFormContext<IJournalEntry>();
  const uploadedFile = watch('attachments'); // watch uploaded file

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    // error throw on max file 
    onDropRejected: (fileRejections) => {
      toast.error("Only one file is allowed");
    },
    onDrop: (acceptedFiles) => {
      setValue('attachments', acceptedFiles[0]);
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleRemoveFile = () => {
    setValue('attachments', "");
  };

  return (
    <Grid container spacing={3}>
      {/* Memo */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Memo
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Controller
            name="memo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                placeholder="Add a memo for this journal entry"
              />
            )}
          />
        </Paper>
      </Grid>

      {/* Attachments */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Attachments
        </Typography>

        {!uploadedFile ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: 'grey.400',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              bgcolor: 'action.hover',
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 40, color: 'grey.500' }} />
            <Typography variant="body1" color="textSecondary">
              Choose a file or drag & drop it here
            </Typography>
            <Typography variant="caption" color="textSecondary">
              JPEG, PNG, PDF, DOC, XLS (up to 50MB)
            </Typography>
          </Paper>
        ) : (
          <Paper
            variant="outlined"
            sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}
          >
            {/* Show preview if image */}
            {uploadedFile ? (
              <Box
                component="img"
                src={getFilePreview(uploadedFile as any,JOURNAL_ENTRY_UPLOAD_URL) || ""}
                alt="preview"
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              <CloudUpload sx={{ fontSize: 40, color: 'grey.500' }} />
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2">{getFileName(uploadedFile as any)}</Typography>
              <Typography variant="caption" color="textSecondary">
                {getFileSize(uploadedFile as any)}
              </Typography>
            </Box>

            <IconButton color="error" onClick={handleRemoveFile}>
              <Delete />
            </IconButton>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default JournalEntryFooter;
