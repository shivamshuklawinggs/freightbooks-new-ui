import  { FC } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import apiService from '@/service/apiService';
import CustomDatePicker from '@/components/common/CommonDatePicker';
import { capitalizeFirstLetter } from '@/utils';
import { IPaymentTerm } from '@/types';
import { PAYMENT_METHODS } from '@/pages/customer-service/load-customers/Schema/CustomerSchema';
import { useFormContext } from 'react-hook-form';
import { IVendorBill } from '@/types';
import { useQuery } from '@tanstack/react-query';
const CustomerSection :FC<{openPaymentTermModal:()=>void}> = ({openPaymentTermModal}) => {
 const form=useFormContext<IVendorBill>(); 
  const {data:paymentTerms} = useQuery({
    queryKey: ['paymenterms'],
    queryFn: async() => apiService.getPaymentTerms(),
   
  });
 
  const handleInvoiceDateChange = (e:any) => {
    if (e.target.value) {
      form.setValue('invoiceDate', new Date(e.target.value));
    }
  };

  const handleDueDateChange = (e:any) => {
    if (e.target.value) {
      form.setValue('dueDate', new Date(e.target.value));
    }
  };
  return (
    <>
    <Grid item xs={12}>
      <Grid container spacing={3}>
        <Grid item md={6}>
          <TextField
            fullWidth
            label={"Email"}
            type="email"
            variant='outlined'
            {...form.register('email')}
            error={!!form.formState.errors.email}  
            InputLabelProps={{
              shrink: true,
            }}
            helperText={form.formState.errors.email?.message}
            // InputProps={{ readOnly: true }}
            placeholder="Email will auto-fill"
          />
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth error={!!form.formState.errors.paymentOptions}>
            <InputLabel>Payment Options</InputLabel>
            <Select
              {...form.register('paymentOptions')}
              label="Payment Options"
              value={form.watch('paymentOptions')}
              inputProps={{ shrink: true }}
            >
              <MenuItem value="">Select payment option</MenuItem>
              {PAYMENT_METHODS?.map((method:{value:string,label:string}) => (
                <MenuItem key={method.value} value={method.value}>
                  {capitalizeFirstLetter(method.label)}
                </MenuItem>
              ))}
            </Select>
            {form.formState.errors.paymentOptions && (
              <FormHelperText>{form.formState.errors.paymentOptions.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth error={!!form.formState.errors.terms}>
            <InputLabel>Terms</InputLabel>
            <Select
              {...form.register('terms')}
              label="Terms"
              value={form.watch('terms')}
              inputProps={{ shrink: true }}
            >
              {/* create new */}
               <MenuItem value="" onClick={openPaymentTermModal}>Create New</MenuItem>
               <MenuItem value="">Select Payment Term</MenuItem>
              {paymentTerms?.data.map((term:IPaymentTerm) => (
                <MenuItem key={term._id} value={term._id}>
                  {term.name + " " + term.days + " days"}
                </MenuItem>
              ))}
            </Select>
            {form.formState.errors.terms && (
              <FormHelperText>{form.formState.errors.terms.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item md={6}>
          <CustomDatePicker
            name="invoiceDate"
            label='Bill Date'
            value={form.watch('invoiceDate')}
            onChange={handleInvoiceDateChange}
            required
          />
        </Grid>
        <Grid item md={6}>
          <CustomDatePicker
            name="dueDate"
            label='Due Date'
             value={new Date(form.watch('dueDate'))}
            onChange={handleDueDateChange}
            required
            minDate={form.watch('invoiceDate')}
          />
        </Grid>
         <Grid item md={6}>
          <CustomDatePicker
            name="postingDate"
            label='Posting Date'
            value={new Date(form.watch('postingDate'))}
            onChange={(e:any) => {
                  if (e.target.value) {
                    form.setValue('postingDate', new Date(e.target.value));
                  }
                }}
                error={!!form.formState.errors.postingDate}
            helperText={form.formState.errors.postingDate?.message}
            required
          />
        </Grid>
    
      </Grid>
    </Grid>
 
    </>
  );
};

export default CustomerSection;