/**
 * @author Shivam Shukla
 * @description Carrier Modal Component
 * @version 1.0.0
 * @createdAt 10/06/2025
 * @lastModifiedBy Shivam Shukla
 * @lastModifiedDate 10/06/2025
 */
import React, {  useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Divider, } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { ICarrier } from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import carrierFormSchema from '@/pages/carrier-service/Schema/carrierFormSchema';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import DocumentUpload from './DocumentUploadField';
import InsuranceForm from './InsuranceForm';
import CommonData from '@/components/common/commonData';
import CompanySection from './CompanySection';
import AdditionalInfo from './AdditionalInfo';
import PowerUnits from './PowerUnits';
import { useMutation } from '@tanstack/react-query';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import UpdateContactList from './CarrierContactList/UpdateContactList';
import ContactList from './CarrierContactList/Index';
import { getIcon } from '@/components/common/icons/getIcon';

interface CarrierFormProps {
  open: boolean | ICarrier;
  onClose: () => void;
  onUpdate?: () => void;
  isCarrier?:boolean
}

const CarrierForm: React.FC<CarrierFormProps> = ({
  open,
  onClose,
  onUpdate,
}) => {
  const [localUsdot, setLocalUsdot] = React.useState('');
  const form = useForm<ICarrier>({
    mode: 'onBlur',
    resolver: yupResolver(carrierFormSchema) as any,
    defaultValues: {
      usdot: '',
      mcNumber: '',
      company: '',
      address: '',
      phone: '',
      extentionNo:'',
      alternatphone: '',
      email: '',
      state: '',
      rate: 0,
      powerunit: [],
      zipCode: '',
      trailer: [],
      documents: [],
      drivers: [], // Add drivers array
      insurerCompany: '',
      agentName: '',
      agentAddress: '',
      agentEmail: '',
      agentPhoneNumber: '',
      commercialGeneralLiability: {
        issueDate: undefined,
        expiryDate: undefined,
        amount: undefined
      },
      automobileLiability: {
        issueDate: undefined,
        expiryDate: undefined,
        amount: undefined
      },
      cargoLiability: {
        issueDate: undefined,
        expiryDate: undefined,
        amount: undefined
      },
      insuranceDocuments: [],
      deleteInsuranceFiles: [],
      deleteFiles: [],
      contactPersons:[],

    },

  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (typeof open === 'object' && (open as ICarrier)?._id) {
        return apiService.updateCarrier((open as ICarrier)._id as string, formData);
      }
      return apiService.createCarrier(formData);
    },
    onSuccess: () => {
      toast.success(typeof open === 'object' && (open as ICarrier)?._id ? 'Carrier updated successfully' : 'Carrier created successfully');
      onUpdate?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save carrier');
    }
  });

  useEffect(() => {
    if (typeof open === 'object') {

      form.reset(open as ICarrier);
      setLocalUsdot(open?.usdot);
    }
  }, [open]);
  const internalSubmit = async (data: ICarrier) => {
    let formData = new FormData();
    let { documents, deleteFiles, insuranceDocuments, deleteInsuranceFiles, ...CarrierData } = data
    formData.append('carrierData', JSON.stringify(CarrierData));
    documents.forEach((document: any) => {

      if (document.file && document.file instanceof File) {
        formData.append('documents', document.file);
      }
    })
    deleteFiles && deleteFiles.length > 0 && formData.append("deletedfiles", JSON.stringify(deleteFiles.map((file) => file)))
    insuranceDocuments.forEach((document: any) => {
      
      if (document.file && document.file instanceof File) {
        formData.append('insuranceDocuments', document.file);
      }
    })
    deleteInsuranceFiles && deleteInsuranceFiles.length > 0 && formData.append("deletedInsuranceFiles", JSON.stringify(deleteInsuranceFiles.map((file) => file)))
    mutation.mutate(formData);
  };
  const id =typeof open === 'object' && (open as ICarrier)?._id
  return (
    <Dialog open={open as boolean} onClose={onClose} maxWidth="md" fullWidth >
      <DialogActions>
        <Button onClick={onClose}>
          {getIcon('CloseIcon')}
        </Button>
      </DialogActions>
      <FormProvider {...form}>
        <form onSubmit={
           (e)=>{
            e.stopPropagation();
            form.handleSubmit(internalSubmit)(e);
           }
          
          }>
          <DialogTitle>{(open as ICarrier)?._id ? 'Update Carrier' : 'Create New Carrier'}</DialogTitle>
          <DialogContent>
          <Grid container spacing={5}>
              {/* Company Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Company Information
                </Typography>
                <CompanySection localUsdot={localUsdot} setLocalUsdot={setLocalUsdot} />
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
                <AdditionalInfo  />
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
                  Power Units
                </Typography>
                <PowerUnits  />
              </Grid>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" color="primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : (open as ICarrier)?._id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default withPermission("create",["carriers"])(CarrierForm);
