import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography, Box, CircularProgress, Dialog, DialogContent, DialogActions, IconButton, useTheme, alpha, Card } from '@mui/material';
import { Business, Phone, Email, LocationOn, Description, AttachFile, AccountBalance, ContactPage } from '@mui/icons-material';
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
  const theme = useTheme();
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
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header with close icon */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 3,
        py: 2.5,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            p: 1,
            borderRadius: 2,
            bgcolor: alpha('#fff', 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ContactPage sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {id ? 'Update Customer' : 'Create New Customer'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'inherit',
            '&:hover': { 
              bgcolor: alpha('#fff', 0.1),
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          {getIcon('CloseIcon')}
        </IconButton>
      </Box>
      
      <FormProvider {...form}>
        <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <ErrorHandlerAlert error={mutation.error}/>
            {isFetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                <CircularProgress size={40} thickness={4} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Company Information Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Business sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Company Information
                      </Typography>
                    </Box>
                    <CompanySection />
                  </Card>
                </Grid>

                {/* Billing Address Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Billing Address
                      </Typography>
                    </Box>
                    <BillingAddress />
                  </Card>
                </Grid>

                {/* Shipping Address Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Shipping Address
                      </Typography>
                    </Box>
                    <ShippingAddress />
                  </Card>
                </Grid>

                {/* Documents Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AttachFile sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Notes & Attachments
                      </Typography>
                    </Box>
                    <DocumentUpload />
                  </Card>
                </Grid>

                {/* Accounting Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccountBalance sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Accounting & Payments
                      </Typography>
                    </Box>
                    <AccountsInfo setOpenDialog={setOpenDialog} />
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          {/* Actions */}
          <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  onClick={onClose} 
                  color="inherit" 
                  disabled={mutation.isPending}
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: alpha(theme.palette.text.primary, 0.5),
                      bgcolor: alpha(theme.palette.action.hover, 0.04)
                    }
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={mutation.isPending}
                  fullWidth
                  startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {mutation.isPending ? "Submitting..." : submitButtonText}
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Box>
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