import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Paper, Typography, Box, Alert, } from '@mui/material';
import { Send } from '@mui/icons-material';
import apiService from '@/service/apiService';
import { initialinvoiceData } from '@/redux/InitialData/invoice';
import { toast } from 'react-toastify';
import TotalsSection from './components/TotalsSection';
import AttachmentsSection from './components/AttachmentsSection';
import HeaderSection from './components/HeaderSection';
import CustomerSection from './components/CustomerSection';
import NotesSection from './components/NotesSection';
import { generateInvoiceSchema } from './genearateInvoiceSchema';
import { IFile, IVendorBill } from '@/types';
import ItemsTable from './components/ItemsTable';
import TaxForm from '@/pages/tax-service/TaxForm';
import ProductServiceForm from '@/pages/product-service/ProductServiceForm';
import PaymentTermForm from '@/pages/payment-terms-service/components/PaymentTermForm';
import useDueDateCalculator from '@/utils/DueDateCalulate';
import VendorForm from '@/pages/carrier-service/VendorForm';
import { useVendorData } from '../utils/useVendorData';
import { useQuery } from '@tanstack/react-query';

interface CustomerInvoiceFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData:IVendorBill | null;
  loading: boolean;

}

const CustomerInvoiceForm: React.FC<CustomerInvoiceFormProps> = ({ onSubmit, initialData,loading }) => {
   const [showTaxModal,setShowTaxModal] = React.useState(false)
   const [showProductServiceModal,setShowProductServiceModal] = React.useState(false)
   const [paymentTermModal,setPaymentTermModal] = React.useState(false)
   const [showCustomerModal,setShowCustomerModal] = React.useState(false)
   const [isSubmit,setIsSubmit] = React.useState(false)
  const form = useForm<IVendorBill>({
    resolver: yupResolver(generateInvoiceSchema) as any,
    defaultValues: initialData || initialinvoiceData,
  });
   const { handleSubmit, watch, setValue, formState: { errors },reset } = form;

  /** Fetch tax options */
  // const { data: taxOptions, isLoading: isTaxOptionsLoading } = useQuery({
  //   queryKey: ['taxOptions'],
  //   queryFn: async () => {
  //     const response = await apiService.getPurchaseTax();
  //     return response.data;
  //   },
  // });

  /** Fetch product service options */
  const { data: productServiceOptions, isLoading: isProductServiceOptionsLoading } = useQuery({
    queryKey: ['productServiceData'],
    queryFn: async () => {
      const response = await apiService.getProductServiceData();
      return response.data;
    },
  });

  // useEffect(() => {
  //   if (taxOptions) {
  //     setValue("taxArray", taxOptions);
  //   }
  // }, [taxOptions]);

  useEffect(() => {
    if (productServiceOptions) {
      setValue("productServiceArray", productServiceOptions);
    }
  }, [productServiceOptions]);

  /** Handle form submission */
  const handleFormSubmit = async (data: any,saveAndSend?:boolean) => {
    setIsSubmit(true)
    try {
      const formData = new FormData();
 
      const invoiceData = {
        ...data,
        files:undefined,
        discountPercent:watch("discountPercent") || 0,
        actionType: saveAndSend  // extra flag for backend
      };
      if(data.files.length >0){
        data.files.forEach((file: IFile) => {
          if(file.file && file.file instanceof File){
            formData.append('files', file.file as File);
          }
        });
      }
      formData.append('invoiceData', JSON.stringify(invoiceData));
      await onSubmit(formData);
    } catch (error: any) {
      console.warn('Submission error:', error);
      toast.error(error.message);
    }finally{
      setIsSubmit(false)
    }
  };
  useEffect(() => {
  
    if(initialData){
       reset({
        ...initialData,
        email:initialData.email || ""
       });
    }
  }, [initialData]);



  useVendorData({vendorId:form.watch("vendorId"),form:form, _id:form.watch("_id") as string})
  useDueDateCalculator(setValue as any,watch as any);
  return (
    <>
    <Paper elevation={3} sx={{ p: 3 }}>
      <FormProvider {...form}>
      <form >
       
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <HeaderSection initialData={initialData} openCustomerModal={()=>setShowCustomerModal(true)} />
            </Grid>
            <Grid item xs={6}> 
              <CustomerSection openPaymentTermModal={()=>setPaymentTermModal(true)}   />
            </Grid>
            <ItemsTable handleTaxModalShow={()=>setShowTaxModal(true)} handleProductServiceModalShow={()=>setShowProductServiceModal(true)}  />
            <Grid item xs={6}>
              <NotesSection />
            </Grid>
            <Grid item xs={6}>
              <TotalsSection handleTaxModalShow={()=>setShowTaxModal(true)}/>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              <AttachmentsSection
                initialData={initialData} 
              />
            </Grid>
            {
              // Error message show in alert
              Object.entries(errors).filter(([key, value]) =>!["carrierData","customerdata","carrierid","loadid","loadAmount","customerid"].includes(key)).map(([key, value]) => (
                <Alert key={key} severity="error">
                  {value?.message}
                </Alert>
              ))
            }
            <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Send only */}
        <Button
        onClick={handleSubmit((data) => handleFormSubmit(data, false))}
        disabled={loading || isSubmit || isProductServiceOptionsLoading}
        variant="contained"
        startIcon={<Send />}
      >
        {loading || isSubmit ? `...Saving` : `Save`}
      </Button>

      {/* Save and Send */}
      <Button
        onClick={handleSubmit((data) => handleFormSubmit(data, true))}
        disabled={loading || isSubmit || isProductServiceOptionsLoading}
        variant="contained"
        color="success"
        startIcon={<Send />}
      >
        {loading || isSubmit ? `...Saving` : `Save & Send`}
      </Button>
           </Box>
            </Grid>
          </Grid>
      
      </form>
      </FormProvider>
    </Paper>
       <TaxForm showModal={showTaxModal} handleModalClose={()=>setShowTaxModal(false)} editingItem={null} />
       <ProductServiceForm showModal={showProductServiceModal} handleModalClose={()=>setShowProductServiceModal(false)} editingItem={null} />
       <PaymentTermForm open={paymentTermModal} onClose={()=>setPaymentTermModal(false)} title="Create Payment Term" />
        <VendorForm  submitButtonText="Create Vendor" open={showCustomerModal} onClose={()=>setShowCustomerModal(false)} />
    </>
  );
};

export default CustomerInvoiceForm;
