import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Divider,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
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
                {/* Company Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom mb={2}>
                    Company Information
                  </Typography>
                  <CompanySection  />
                </Grid>
                {/* End Company Information Section */}
                {/* Entity Details Section */}
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Entity Details
                  </Typography>
                  <CommonData/>
                </Grid>
                {/* End Entity Details Section */}
                {/* Additional Information Section */}
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Additional Information
                  </Typography>
                  <AdditionalInfo setOpenDialog={setOpenDialog} />
                </Grid>
                {/* End Additional Information Section */}
                {/* Contact List Section */}
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Contact Persons
                  </Typography>
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
                </Grid>
                {/* End Contact List Section */}  
                {/* Insurance Form Section */}
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Insurance Information
                  </Typography>
                  <InsuranceForm open={open} />
                </Grid>
                {/* End Insurance Form Section */}
                {/* Document Upload Section */}
                <Grid item xs={12}>
                  <Divider className="custom-divider" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Documents
                  </Typography>
                  <DocumentUpload />
                </Grid>
                {/* End Document Upload Section */}
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
        onSuccess={() => dispatch(fetchPaymentTerms({page: 1, limit: 100}))}
      />
    </Dialog>
  );
};

export default CustomerForm;