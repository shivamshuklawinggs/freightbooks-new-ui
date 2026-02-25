import React from 'react';
import { IPaymentRecived } from '@/types';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, Checkbox, FormControlLabel, Chip, Paper, Grid } from '@mui/material';
import SearchInvoice from './SearchInvoice';
import { formatDate } from '@/utils/dateUtils';
import CustomDatePicker from '@/components/common/CommonDatePicker';

interface FilterDataProps {
  isLoading: boolean;
}

const FilterData: React.FC<FilterDataProps> = ({ isLoading }) => {
  const { control, watch, setValue } = useFormContext<IPaymentRecived>();
  const watchedFields = watch();
  const handleDatePickerChange = (field: 'fromDate' | 'toDate') => (e: any) => {
    const value = e.target.value || null;
    setValue(field, value, { shouldValidate: true })
  };
  const handleOverdueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('overdueOnly', event.target.checked ? "true" : "", { shouldValidate: true });
  };

  const getActiveFilters = () => {
    const filters = [];
    if (watchedFields.fromDate) {
      filters.push({
        label: `From: ${formatDate(watchedFields.fromDate)}`,
        onDelete: () => setValue('fromDate', null)
      });
    }
    if (watchedFields.toDate) {
      filters.push({
        label: `To: ${formatDate(watchedFields.toDate)}`,
        onDelete: () => setValue('toDate', null)
      });
    }
    if (watchedFields.overdueOnly) {
      filters.push({
        label: 'Overdue Only',
        onDelete: () => setValue('overdueOnly', '')
      });
    }
    if (watchedFields.searchInvoice) {
      filters.push({
        label: `Search: ${watchedFields.searchInvoice}`,
        onDelete: () => setValue('searchInvoice', '')
      });
    }

    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <Box sx={{ mb: 2 }}>
      {activeFilters.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {activeFilters.map((filter, index) => (
              <Chip
                key={index}
                label={filter.label}
                onDelete={filter.onDelete}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
          <SearchInvoice isLoading={isLoading} size='small' />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="fromDate"
            control={control}
            render={({ field }) => (
              <CustomDatePicker
                label="From Date"
                value={field.value}
                size='small'
                fullWidth={true}
                name='fromDate'
                onChange={handleDatePickerChange('fromDate')}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="toDate"
            control={control}
            render={({ field }) => (
              <CustomDatePicker
                label="To Date"
                value={field.value}
                size='small'
                fullWidth={true}
                name='toDate'
                onChange={handleDatePickerChange('toDate')}
              />

            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            control={
              <Controller
                name="overdueOnly"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === "true"}
                    onChange={handleOverdueChange}
                    disabled={isLoading}
                    color="primary"
                  />
                )}
              />
            }
            label="Overdue Only"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FilterData;