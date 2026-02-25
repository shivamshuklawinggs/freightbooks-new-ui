import React, { useState, useEffect } from 'react';
import { Button, Grid, Divider, Typography, Box, CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import apiService from '@/service/apiService';
import schema, { defaultCustomerData } from './Schema/CustomerSchema';
import { ICarrier } from '@/types';
import PaymentTermForm from '@/pages/payment-terms-service/components/PaymentTermForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchPaymentTerms } from '@/redux/api';
import DocumentUpload from './components/FormCompnents/Documents';
import { toast } from 'react-toastify';
import AccountsInfo from './components/FormCompnents/AccountsInfo';
import CompanySection from './components/FormCompnents/CompanySection';
import { ContactPage } from '@mui/icons-material';
import BillingAddress from './components/FormCompnents/BillingAddress';
import ShippingAddress from './components/FormCompnents/ShippingAddress';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

interface VendorFormProps {
  submitButtonText?: string;
  open: boolean | ICarrier;
  onClose?: () => void;
}

const VendorForm: React.FC<VendorFormProps> = ({
  submitButtonText = 'Submit',
  open,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const form = useForm<ICarrier>({
    resolver: yupResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: defaultCustomerData as ICarrier,
  });
  const id = typeof open === 'object' && (open as ICarrier)?._id;

  const { data: vendorData, isFetching } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return defaultCustomerData as ICarrier;
      const response = await apiService.getVendor(id as string);
      return response.data || defaultCustomerData;
    },
    enabled: !!open,
  });

  useEffect(() => {
    if (vendorData) {
      form.reset(vendorData);
    }
  }, [vendorData, form]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (id) {
        return apiService.updateVendor(id, formData);
      }
      return apiService.createVendor(formData);
    },
    onSuccess: () => {
      toast.success(id ? 'Vendor updated successfully' : 'Vendor created successfully');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['accountsCustomerBills'] });
      onClose?.();
    },
    onError: (error: any) => {
      console.warn('Error saving vendor:', error);
      toast.error(error.message || 'Failed to save vendor');
    },
  });

  const handleSubmit = async (data: ICarrier) => {
    const { documents, deleteFiles, ...CustomerData } = data;
    const formData = new FormData();
    formData.append('carrierData', JSON.stringify(CustomerData));
    documents.forEach((document: any) => {
      if (document.file && document.file instanceof File) {
        formData.append('documents', document.file);
      }
    });
    if (deleteFiles && deleteFiles.length > 0) {
      formData.append("deletedfiles", JSON.stringify(deleteFiles.map((file) => file)));
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogTitle>
            {id ? 'Update Vendor' : 'Create New Vendor'}
          </DialogTitle>

          <DialogContent>
            {isFetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <ContactPage /> Name & Contact
                  </Typography>
                  <CompanySection />
                </Grid>

                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Billing Address
                  </Typography>
                  <BillingAddress />
                </Grid>
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Shipping Address
                  </Typography>
                  <ShippingAddress />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Notes And Attachments
                  </Typography>
                  <DocumentUpload />
                </Grid>

                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Accounting Payments
                  </Typography>
                  <AccountsInfo setOpenDialog={setOpenDialog} />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {mutation.isPending ? "Submitting..." : submitButtonText}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>

      <PaymentTermForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        initialData={undefined}
        title={'Add New Payment Term'}
        onSuccess={() => dispatch(fetchPaymentTerms({ page: 1, limit: 100 }))}
      />
    </Dialog>
  );
};

export default VendorForm;