import  { FC } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import apiService from '@/service/apiService';
import CustomDatePicker from '@/components/common/CommonDatePicker';
import { capitalizeFirstLetter } from '@/utils';
import { IPaymentTerm ,IInvoice} from '@/types';
import { PAYMENT_METHODS } from '@/pages/customer-service/load-customers/Schema/CustomerSchema';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

const CustomerSection :FC<{openPaymentTermModal:()=>void}> = ({openPaymentTermModal}) => {
  const {data:paymentTerms} = useQuery({
    queryKey: ['paymenterms'],
    queryFn: async() => apiService.getPaymentTerms(),
   
  });
 const form=useFormContext<IInvoice>(); 
 
  
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
            label={"Customer Email"}
            type="email"
            variant='outlined'
            {...form.register('email')}
            error={!!form.formState.errors.email}  
            InputLabelProps={{
              shrink: true,
            }}
            helperText={form.formState.errors.email?.message}
            // InputProps={{ readOnly: true }}
            placeholder="Customer email will auto-fill"
          />
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth error={!!form.formState.errors.paymentOptions}>
            <InputLabel>Payment Options</InputLabel>
            <Select
              {...form.register('paymentOptions')}
              aria-hidden={false}
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
              aria-hidden={false}
              label="Terms"
              value={form.watch('terms')}
              inputProps={{ shrink: true }}
            >
              <MenuItem value="">Select Terms</MenuItem>
              <MenuItem value="" onClick={openPaymentTermModal}>Add New Terms</MenuItem>
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
            label='Invoice Date'
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