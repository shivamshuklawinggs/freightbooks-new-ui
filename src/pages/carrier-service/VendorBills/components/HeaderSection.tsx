import { FC } from 'react';
import { Grid, TextField, FormControl, FormHelperText } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { IVendorBill } from '@/types';
import { useLoadStatusCheck } from '@/hooks/useLoadStatusCheck';
import CustomerSelect from './CustomerSelect';

interface HeaderSectionProps {
  initialData: IVendorBill | null,
  openCustomerModal:()=>void
}
const HeaderSection: FC<HeaderSectionProps> = ({ initialData,openCustomerModal }) => {
  const form = useFormContext<IVendorBill>()
  const billNumber = useWatch({ control: form.control, name: 'BillNumber' });
  const loadId = useWatch({ control: form.control, name: 'loadId' });

  const { isAvailable, isLoading, loadStatusError } = useLoadStatusCheck({
    documentNumber: billNumber,
    documentType: 'bill',
    initialData,
    onDocumentCheckSuccess: (response: any) => {
      // Handle successful document check
      if (!response?.load) {
        // Reset vendor fields when no load found
        form.setValue("vendorId", "");
        form.setValue("name", "");
      }
    },
    onDocumentCheckError: (error: any) => {
      // Handle document check error
      form.setValue("expense", []);
      form.setValue("loadId", "");
      form.setValue("loadAmount", 0);
      form.setValue("vendorId", "");
    },
    onDocumentNotFound: () => {
      // Handle when no document is found
      form.setValue("vendorId", "");
      form.setValue("name", "");
    },
    apiMethod: 'checkAccountBillNumberExist'
  });

  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>
        {/* Bill Number */}
        <Grid item md={4}>
          <FormControl fullWidth error={!!form.formState.errors.BillNumber}>
            <TextField
              fullWidth
              label="Bill Number"
              {...form.register('BillNumber')}
              value={billNumber || ""}
              error={!!form.formState.errors.BillNumber || !isAvailable}
              helperText={
                isLoading
                  ? "Checking availability..."
                  : form.formState.errors.BillNumber?.message ||
                  loadStatusError ||
                  (!isAvailable ? "Bill Number Already Exists" : "Bill Number is Available")
              }
              InputLabelProps={{ shrink: true }}
              InputProps={{
                readOnly: !!initialData?._id,
              }}
            />
          </FormControl>
        </Grid>

        {/* Vendor Name */}
        <Grid item md={6}>
          {
            !loadId ? <CustomerSelect openCustomerModal={openCustomerModal} /> : <FormControl fullWidth>
              <TextField
                fullWidth
                label="Carrier Name"
                value={form.watch("name") || ""}
                disabled
                error={!!form.formState.errors.vendorId}
                helperText={form.formState.errors.vendorId?.message}
              />
            </FormControl>
          }
        </Grid>

        <Grid item md={12}>
          <FormControl fullWidth error={!!form.formState.errors.address}>
            <TextField
              fullWidth
              label="Billing Address"
              multiline
              rows={4}
              {...form.register('address')}
              placeholder="Enter billing address"
              InputLabelProps={{ shrink: true }}
            />
            {form.formState.errors.address && (
              <FormHelperText>{form?.formState?.errors?.address?.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HeaderSection;
