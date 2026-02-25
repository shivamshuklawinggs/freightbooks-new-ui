import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Typography, Grid } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { formatCurrency } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import {  recievedPaymentparmaSearchProps } from '@/types';
import useDebounce from '@/hooks/useDebounce';
import RecievedPaymentFormFields from './RecievedPaymentFormFields';
import OutStandingTransactions from './OutStandingTransactions';
import FilterData from './FilterData';
import { UpdateRecievedPamentSchema, UpdateRecievedPamentSchemaType } from '../schema/UpdateRecievedPamentSchema';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import UpdateRecievepayment from './updateRecievepayment';
import { todayDate } from '@/config/constant';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';

const RecievedPayment = () => {
  const { id: customerId = "" } = useParams<{ id: string }>();
  const formProps = useForm<UpdateRecievedPamentSchemaType>({
    resolver: yupResolver(UpdateRecievedPamentSchema) as any,
    mode: 'onChange',
    defaultValues: {
      paymentDate: new Date(),
      invoicePayments: [],
      nonRecievedPayments: [],
      recievedPayments: [],
      deletedPayments: [],
      depositTo: "",
      customer: undefined,
      paymentMethod: '',
      amount: 0,
      referenceNo: '',
      searchInvoice: '',
      fromDate: null,
      toDate: null,
      overdueOnly: '',
       postingDate:new Date(),
    },
  });

  const { handleSubmit, reset, watch, setValue, trigger,formState:{errors} } = formProps;
  const watchedFields = watch();
  const searchInvoiceDebounced = useDebounce(watchedFields.searchInvoice, 500);

  const paramSearch: recievedPaymentparmaSearchProps = {
    invoiceNumber: searchInvoiceDebounced || "",
  fromDate:formatDate(watchedFields.fromDate || null),
    toDate: formatDate(watchedFields.toDate || null),
    overdueOnly: watchedFields.overdueOnly || "",
    customerId: customerId || ""
  };

  const {
    isLoading: isLoadingRecivedPayment,
    refetch
  } = useQuery({
    queryKey: ['getrecivedPayment', customerId, Object.values(paramSearch)],
    queryFn: async () => {
      const recivedPaymentData = await apiService.getrecivedPayment(customerId!, { ...paramSearch, type: "invoice" });
        if (recivedPaymentData) {
      setValue('customerInvoices', recivedPaymentData.data);
      setValue('recievedPayments', recivedPaymentData?.recievedPayments || []);
      setValue('nonRecievedPayments', recivedPaymentData?.nonRecievedPayments || []);
      // trigger(["recievedPayments","nonRecievedPayments","customerInvoices"])
      setValue('customerBalance', recivedPaymentData.totalBalance || 0);
      setValue('recievedAmount', recivedPaymentData.totalRecievedAmount || 0);
      setValue('amount', recivedPaymentData.amount || 0);
      setValue('paymentDate', recivedPaymentData.paymentDate || todayDate);
      setValue('paymentMethod', recivedPaymentData.paymentMethod || "");
      setValue('referenceNo', recivedPaymentData.referenceNo || "");
      setValue('depositTo', recivedPaymentData.depositTo || "");
      setValue('customer', recivedPaymentData.customer || {});
      setValue('credits', recivedPaymentData.credits || 0);
    }
      return recivedPaymentData;
    },
    enabled: !!customerId,
  });



  const { mutateAsync: updateInvoicePayments, isPending: isPendingUpdateInvoicePayments } = useMutation({
    mutationFn: async (payload: UpdateRecievedPamentSchemaType) => {
      const response = await apiService.updateRecivedPayment(customerId!, payload, "invoice");
      reset({"customerId": customerId});
      refetch();
      return response;
    },
  
    onError: (error: any) => {
      toast.error(error.message || "Failed to update invoice payment");
    }
  });

  const onSubmit = async (data: UpdateRecievedPamentSchemaType) => {
    try {
      await updateInvoicePayments(data);
  
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating the payment.");
    }finally{
      refetch();
    }
  };

  const handleClear = () => {
    reset();
    refetch();
  };

  useEffect(() => {
    if (customerId) {
      setValue("customerId", customerId);
    }
  }, [customerId, setValue]);

  useEffect(() => {
    trigger('amount');
  }, [watchedFields.invoicePayments, watchedFields.recievedPayments, trigger]);
console.error("errors",errors)
  return (
    <FormProvider {...formProps}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {/* Receive Payment */}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(watchedFields.customerBalance || 0)}
            </Typography>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <RecievedPaymentFormFields
                isLoading={isLoadingRecivedPayment}
              />
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Outstanding Invoices
                </Typography>
                <FilterData
                  isLoading={isLoadingRecivedPayment || isPendingUpdateInvoicePayments}
                />
                <OutStandingTransactions
                  isLoading={isLoadingRecivedPayment || isPendingUpdateInvoicePayments}
                />
                <UpdateRecievepayment
                  isLoading={isLoadingRecivedPayment || isPendingUpdateInvoicePayments}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isPendingUpdateInvoicePayments}
                  >
                    {isPendingUpdateInvoicePayments ? "Submitting..." : "Submit"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
     
    </FormProvider>
  );
};

export default withPermission("update",["accounting"])(RecievedPayment);