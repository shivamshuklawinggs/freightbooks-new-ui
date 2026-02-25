
import { Grid, FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { ICarrier, IPaymentTerm } from '@/types';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { PaymentMethodsOptions } from '@/types/enum';
interface IAdditionalInfoProps {
  setOpenDialog: (open: boolean) => void;
}
const AccountsInfo = ({ setOpenDialog }: IAdditionalInfoProps) => {
  const form = useFormContext<ICarrier>();
  const {data:paymentTerms} = useQuery({
    queryKey: ['paymenterms'],
    queryFn: async() => apiService.getPaymentTerms(),
  });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
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
      <Grid item xs={12} md={6}>
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
    </Grid>
  )
}

export default AccountsInfo