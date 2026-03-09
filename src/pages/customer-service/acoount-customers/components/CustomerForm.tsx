import React, { useState, useEffect } from 'react';
import { Button, Grid, Divider, Typography, Box, CircularProgress, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import apiService from '@/service/apiService';
import schema, { defaultCustomerData } from '../Schema/CustomerSchema';
import { ICustomer } from '@/types';
import PaymentTermForm from '@/pages/payment-terms-service/components/PaymentTermForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchPaymentTerms } from '@/redux/api';
import DocumentUpload from './FormCompnents/Documents';
import { toast } from 'react-toastify';
import AccountsInfo from './FormCompnents/AccountsInfo';
import CompanySection from './FormCompnents/CompanySection';
import { ContactPage } from '@mui/icons-material';
import BillingAddress from './FormCompnents/BillingAddress';
import ShippingAddress from './FormCompnents/ShippingAddress';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import ErrorHandlerAlert from '@/components/common/ErrorHandlerAlert';
import { getIcon } from '@/components/common/icons/getIcon';

interface CustomerFormProps {
  submitButtonText?: string;
  open: boolean | ICustomer;
  onClose?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  submitButtonText = 'Submit',
  open,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const form = useForm<ICustomer>({
    resolver: yupResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: defaultCustomerData as ICustomer,
  });
  const id = typeof open === 'object' && (open as ICustomer)?._id;

  const { data: customer, isFetching } = useQuery({
    queryKey: ['accountsCustomer', id],
    queryFn: async () => {
      if (!id) return defaultCustomerData as ICustomer;
      const response = await apiService.getAccountsCustomer(id as string);
      return response.data || defaultCustomerData;
    },
    enabled: !!open,
  });
  useEffect(() => {
    if (customer) {
      form.reset(customer);
    }
  }, [customer, form]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (id) {
        return apiService.updateAccountsCustomer(id, formData);
      }
      return apiService.createAccountsCustomer(formData);
    },
    onSuccess: () => {
      toast.success(id ? 'Customer updated successfully' : 'Customer created successfully');
      queryClient.refetchQueries({ queryKey: ['accountsCustomers'] });
      queryClient.refetchQueries({ queryKey: ['accountsCustomerInvoice'] });
      onClose?.();
    },
    onError: (error: any) => {
      console.warn('Error saving customer:', error);
      toast.error(error.message || 'Failed to save customer');
    },
  });

  const handleSubmit = async (data: ICustomer) => {
    const { documents, deleteFiles, ...CustomerData } = data;
    const formData = new FormData();
    formData.append('CustomerData', JSON.stringify(CustomerData));
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
      <DialogActions>
        <Button onClick={onClose}>
          {getIcon('CloseIcon')}
        </Button>
      </DialogActions>
      <FormProvider {...form}>
          <ErrorHandlerAlert error={mutation.error}/>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogTitle>
            {id ? 'Update Customer' : 'Create New Customer'}
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

export default CustomerForm;