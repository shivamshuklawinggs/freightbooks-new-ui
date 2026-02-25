import React from 'react'
import { Grid, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { ICarrier } from '@/types';
import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';


const AdditionalInfo = () => {
  const form = useFormContext<ICarrier>();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={4}>
        <Controller
          name="alternatphone"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              inputProps={{
                maxLength: 15,
                // readOnly: true,

              }}
              onChange={(e) => {
                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                field.onChange(e);
              }}
              onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}

              label="Alternate Contact"
              error={!!form.formState.errors.alternatphone}
              helperText={form.formState.errors.alternatphone?.message}
              size='small'
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="extentionNo"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="Extension No"
              onKeyDown={preventStringInput}
              error={!!form.formState.errors.extentionNo}
              helperText={form.formState.errors.extentionNo?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="rate"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              error={!!form.formState.errors.rate}
              helperText={form.formState.errors.rate?.message}
              label="Dispatch Rate (%)"
              onInput={preventStringInput}
              inputProps={{ min: 0, max: 100 }}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  field.onChange(e);
                }
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default AdditionalInfo