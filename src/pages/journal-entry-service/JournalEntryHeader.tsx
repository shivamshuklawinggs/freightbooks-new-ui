import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, Grid, TextField, Typography } from '@mui/material';
import {IJournalEntry} from './Schema/JournalEntrySchema';
import CustomDatePicker from '@/components/common/CommonDatePicker';
const JournalEntryHeader: React.FC = () => {
  const { control ,formState:{errors},watch,setValue } = useFormContext<IJournalEntry>();
useEffect(()=>{
        if(!watch('postingDate')){
          setValue("postingDate",watch('journalDate'))
        }
  },[watch('journalDate')])
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Journal details
      </Typography>
      <Grid container spacing={2.5}>
      <Grid item xs={12} sm={4}>
        <Controller
          name="journalDate"
          control={control}
          render={({ field }) => (
            <CustomDatePicker
              label="Journal Date"
              value={field.value}
              fullWidth={true}
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
              label="Posting Date"
              value={field.value}
              fullWidth={true}
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
              error={errors.journalNumber?.message?true:false}
              helperText={errors.journalNumber?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Grid>
      </Grid>
    </Box>
  );
};

export default JournalEntryHeader;
