import React, {  useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Grid, Typography, Divider, Box, IconButton, CircularProgress, useTheme, alpha, Card } from '@mui/material';
import { Business, Phone, Email, LocationOn, Description, AttachFile, Shield, LocalShipping, Contacts } from '@mui/icons-material';
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
  const theme = useTheme();
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
    <Dialog 
      open={open as boolean} 
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
            <LocalShipping sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {(open as ICarrier)?._id ? 'Update Carrier' : 'Create New Carrier'}
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
        <Box component="form" onSubmit={
           (e)=>{
            e.stopPropagation();
            form.handleSubmit(internalSubmit)(e);
           }
          }>
          <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
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
                  <CompanySection localUsdot={localUsdot} setLocalUsdot={setLocalUsdot} />
                </Card>
              </Grid>
              {/* End Company Information Section */}
              {/* Entity Details Section */}
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
                      Entity Details
                    </Typography>
                  </Box>
                  <CommonData/>
                </Card>
              </Grid>
              {/* End Entity Details Section */}
              {/* Additional Information Section */}
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
                    <Description sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Additional Information
                    </Typography>
                  </Box>
                  <AdditionalInfo  />
                </Card>
              </Grid>
              {/* End Additional Information Section */}
               {/* Contact List Section */}
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
                  </Card>
                </Grid>
                {/* End Contact List Section */}  
              {/* Power Units Section */}
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
                    <LocalShipping sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Power Units
                    </Typography>
                  </Box>
                  <PowerUnits  />
                </Card>
              </Grid>
              {/* Insurance Form Section */}
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
                    <Shield sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Insurance Information
                    </Typography>
                  </Box>
                  <InsuranceForm open={open} />
                </Card>
              </Grid>
              {/* End Insurance Form Section */}
              {/* Document Upload Section */}
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
                      Documents
                    </Typography>
                  </Box>
                  <DocumentUpload />
                </Card>
              </Grid>
              {/* End Document Upload Section */}
            </Grid>
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
                  color="primary" 
                  type="submit" 
                  disabled={mutation.isPending}
                  fullWidth
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
                  {mutation.isPending ? (
                    <CircularProgress size={20} thickness={4} />
                  ) : (
                    (open as ICarrier)?._id ? 'Update' : 'Create'
                  )}
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
};

export default withPermission("create",["carriers"])(CarrierForm);
