import { Grid, TextField, } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { ICarrier } from '@/types';
import { useEffect } from 'react';

const BillingAddress = () => {
  const form = useFormContext<ICarrier>();
  useEffect(() => {
    if (form.watch('sameAsBillingAddress')) {
      form.setValue('shippingAddress', form.watch('billingAddress'));
    }
  }, [form.watch(['sameAsBillingAddress'])]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4} >
        <Controller
          name="billingAddress.address"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              multiline
              fullWidth
              rows={2}
              label="Street Address"
              error={!!form.formState.errors.billingAddress?.address}
              helperText={form.formState.errors.billingAddress?.address?.message}
              size='small'
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="billingAddress.city"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size='small'
              label="City"
              error={!!form.formState.errors.billingAddress?.city}
              helperText={form.formState.errors.billingAddress?.city?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="billingAddress.state"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="State"
              error={!!form.formState.errors.billingAddress?.state}
              helperText={form.formState.errors.billingAddress?.state?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="billingAddress.zipCode"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="Zip Code"
              error={!!form.formState.errors.billingAddress?.zipCode}
              helperText={form.formState.errors.billingAddress?.zipCode?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="billingAddress.country"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="Country"
              error={!!form.formState.errors.billingAddress?.country}
              helperText={form.formState.errors.billingAddress?.country?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default BillingAddress