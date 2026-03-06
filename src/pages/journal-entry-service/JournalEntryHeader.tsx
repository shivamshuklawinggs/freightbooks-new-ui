import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, Grid, TextField, Paper, useTheme, alpha } from '@mui/material';
import { IJournalEntry } from './Schema/JournalEntrySchema';
import CustomDatePicker from '@/components/common/CommonDatePicker';
const JournalEntryHeader: React.FC = () => {
  const { control, formState: { errors }, watch, setValue } = useFormContext<IJournalEntry>();
  const theme = useTheme();

  useEffect(() => {
    if (!watch('postingDate')) {
      setValue("postingDate", watch('journalDate'));
    }
  }, [watch('journalDate')]);

  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Controller
              name="journalDate"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  value={field.value}
                  fullWidth={true}
                  label='Journal Date'
                  name='journalDate'
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="postingDate"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  value={field.value}
                  fullWidth={true}
                  label='Posting Date'
                  name='postingDate'
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="journalNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Journal No."
                  variant="outlined"
                  size="medium"
                  error={errors.journalNumber?.message ? true : false}
                  helperText={errors.journalNumber?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default JournalEntryHeader;
