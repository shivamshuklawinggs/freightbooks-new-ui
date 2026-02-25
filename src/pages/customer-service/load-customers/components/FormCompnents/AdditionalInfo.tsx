import React from 'react'
import { Grid, FormControl, InputLabel, MenuItem, Select, FormHelperText,TextField, } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { ICustomer, IPaymentTerm } from '@/types';
import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { PaymentMethodsOptions } from '@/types/enum';

interface IAdditionalInfoProps {
  setOpenDialog: (open: boolean) => void;
}
const AdditionalInfo = ({ setOpenDialog }: IAdditionalInfoProps) => {
  const form = useFormContext<ICustomer>();
  const {data:paymentTerms} = useQuery({
    queryKey: ['paymenterms'],
    queryFn: async() => apiService.getPaymentTerms(),
  });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4} >
        <Controller
          name="alternatphone"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Alternate Phone No"
              onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
              onChange={(e) => {
                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                field.onChange(e);
              }}
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
              fullWidth
              size='small'
              label="Extension No"
              onKeyDown={preventStringInput}
              error={!!form.formState.errors.extentionNo}
              helperText={form.formState.errors.extentionNo?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!form.formState.errors.paymentMethod}>
          <InputLabel>Payment Method</InputLabel>
          <Controller
            name="paymentMethod"
            control={form.control}
            render={({ field }) => (
              <Select {...field} label="Payment Method" size='small'
                value={field.value || ""}
              >
                {PaymentMethodsOptions.map((method) => (
                  <MenuItem key={method.value} value={method.value} disabled={method.disabled}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText>{form.formState.errors.paymentMethod?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!form.formState.errors.paymentTerms}>
          <InputLabel>Payment Terms</InputLabel>
          <Controller
            name="paymentTerms"
            control={form.control}
            render={({ field }) => (
              <Select {...field} label="Payment Terms" size='small'
                value={field.value || ""}
              >
                <MenuItem value="" onClick={()=>setOpenDialog(true)}>Create New Payment Term</MenuItem>
                {Array.isArray(paymentTerms?.data) && paymentTerms?.data?.map((term:IPaymentTerm) => (
                                <MenuItem key={term._id} value={term._id}>
                                  {term.name} ({term.days} days)
                                </MenuItem>
                              ))}
              </Select>
            )}
          />
          <FormHelperText>{typeof form.formState.errors.paymentTerms?.message === 'string' ? form.formState.errors.paymentTerms.message : ''}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="vatNumber"

          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="VAT Registration Number"
              error={!!form.formState.errors.vatNumber}
              helperText={form.formState.errors.vatNumber?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="utrNumber"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              fullWidth
              label="UTR Number"
              error={!!form.formState.errors.utrNumber}
              helperText={form.formState.errors.utrNumber?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default AdditionalInfo