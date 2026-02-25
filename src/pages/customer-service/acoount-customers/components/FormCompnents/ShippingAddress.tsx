import { Grid, TextField,FormControlLabel,Checkbox } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { ICustomer } from '@/types';

const ShippingAddress = () => {
  const form = useFormContext<ICustomer>();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
              <FormControlLabel control={<Controller
                name="sameAsBillingAddress"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => {
                      form.setValue('sameAsBillingAddress', e.target.checked);
                      form.trigger('sameAsBillingAddress');
                    }}
                  />
                )}
              />}
                label="Same As Billing Address"
              />
      
            </Grid>
      <Grid item xs={12} md={4} >
        <Controller
          name="shippingAddress.address"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={2}
              label="Street Address"
              error={!!form.formState.errors.shippingAddress?.address}
              helperText={form.formState.errors.shippingAddress?.address?.message}
              size='small'
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="shippingAddress.city"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size='small'
              label="City"
              error={!!form.formState.errors.shippingAddress?.city}
              helperText={form.formState.errors.shippingAddress?.city?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="shippingAddress.state"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="State"
              error={!!form.formState.errors.shippingAddress?.state}
              helperText={form.formState.errors.shippingAddress?.state?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="shippingAddress.zipCode"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="Zip Code"
              error={!!form.formState.errors.shippingAddress?.zipCode}
              helperText={form.formState.errors.shippingAddress?.zipCode?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="shippingAddress.country"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="Country"
              error={!!form.formState.errors.shippingAddress?.country}
              helperText={form.formState.errors.shippingAddress?.country?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default ShippingAddress