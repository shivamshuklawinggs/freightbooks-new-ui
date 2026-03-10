import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha,
  Card,
  CardContent
} from '@mui/material';
import { Business,  LocationOn, Description, AttachFile, Shield, Contacts } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import apiService from '@/service/apiService';
import schema,{defaultCustomerData} from '../Schema/CustomerSchema';
import ContactList from './FormCompnents/ContactList/Index';
import UpdateContactList from './FormCompnents/ContactList/UpdateContactList';
import { ICustomer } from '@/types';
import PaymentTermForm from '@/pages/payment-terms-service/components/PaymentTermForm';
import InsuranceForm from './FormCompnents/InsuranceForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchPaymentTerms } from '@/redux/api';
import DocumentUpload from './FormCompnents/Documents';
import CommonData from '@/components/common/commonData';
import { toast } from 'react-toastify';
import AdditionalInfo from './FormCompnents/AdditionalInfo';
import CompanySection from './FormCompnents/CompanySection';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ErrorHandlerAlert from '@/components/common/ErrorHandlerAlert';
import { getIcon } from '@/components/common/icons/getIcon';

interface CustomerFormProps {
  submitButtonText?: string;
  open:boolean | ICustomer;
  onClose?:()=>void;
    
}
const CustomerForm: React.FC<CustomerFormProps> = ({
  submitButtonText = 'Submit',
  open,
  onClose
}) => {
  const theme = useTheme();
  const dispatch=useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const form = useForm<ICustomer>({
    resolver: yupResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: defaultCustomerData as ICustomer,
  });
 const id =typeof open === 'object' && (open as ICustomer)?._id

  const { data: customer, isFetching } = useQuery({
    queryKey:['customer',id],
    queryFn:async()=>{
      if (!id) return defaultCustomerData as ICustomer;
      const data=await apiService.getCustomer(id as string)
      return data.data || defaultCustomerData
    },
    enabled: !!open
  })

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (id) {
        return apiService.updateCustomer(id, formData);
      }
      return apiService.createCustomer(formData);
    },
    onSuccess: () => {
      toast.success(id ? 'Customer updated successfully' : 'Customer created successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose?.();
    },
    onError: (error: any) => {
      console.warn('Error saving customer:', error);
      toast.error(error.message || 'Failed to save customer');
    },
  });
   useEffect(()=>{
    if (customer) {
      form.reset(customer);
    }
   },[customer])
  const handleSubmit = async (data: ICustomer) => {
    const {documents,deleteFiles,insuranceDocuments,deleteInsuranceFiles,...CustomerData}=data
    const formData=new FormData();
    formData.append('CustomerData',JSON.stringify(CustomerData));
    documents.forEach((document: any) => {
      if (document.file && document.file instanceof File) {
        formData.append('documents', document.file);
      }
    })
    if (deleteFiles && deleteFiles.length > 0) {
      formData.append("deletedfiles", JSON.stringify(deleteFiles.map((file) => file)))
    }
    insuranceDocuments?.forEach((document: any) => {
      if (document.file && document.file instanceof File) {
        formData.append('insuranceDocuments', document.file);
      }
    })
    if (deleteInsuranceFiles && deleteInsuranceFiles.length > 0) {
      formData.append("deletedInsuranceFiles", JSON.stringify(deleteInsuranceFiles.map((file) => file)))
    }
    mutation.mutate(formData);
  };
  return (
    <Dialog 
      open={!!open} 
      onClose={onClose} 
      maxWidth="lg" 
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
            <Business sx={{ fontSize: 20 }} />
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Business sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Company Information
                        </Typography>
                      </Box>
                      <CompanySection  />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Entity Details Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Entity Details
                        </Typography>
                      </Box>
                      <CommonData/>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Additional Information Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Description sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Additional Information
                        </Typography>
                      </Box>
                      <AdditionalInfo setOpenDialog={setOpenDialog} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Contact List Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Contacts sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Contact Persons
                        </Typography>
                      </Box>
                      {!id ? (
                        <ContactList
                          control={form.control}
                          setValue={form.setValue}
                          watch={form.watch}
                          errors={form.formState.errors}
                        />
                      ) : (
                        <UpdateContactList customerId={id} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Insurance Form Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Shield sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Insurance Information
                        </Typography>
                      </Box>
                      <InsuranceForm open={open} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Document Upload Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachFile sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Documents
                        </Typography>
                      </Box>
                      <DocumentUpload />
                    </CardContent>
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
        onSuccess={() => dispatch(fetchPaymentTerms({page: 1, limit: 100}))}
      />
    </Dialog>
  );
};

export default CustomerForm;