import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Typography,
  Grid,
} from '@mui/material';

import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { formatCurrency } from '@/utils';
import {
  IPaymentRecived,
  recievedPaymentparmaSearchProps,
  ICustomer,
} from '@/types';
import { formatDate } from '@/utils/dateUtils';
import useDebounce from '@/hooks/useDebounce';
import RecievedPaymentFormFields from './RecievedPaymentFormFields';
import OutStandingTransactions from './OutStandingTransactions';
import FilterData from './FilterData';
import { RecievedPamentSchema } from './schema/RecievedPamentSchema';
import { toast } from 'react-toastify';
import { useParams, useSearchParams } from 'react-router-dom';
import { todayDate } from '@/config/constant';
import { getAllDataOfCustomers } from '@/utils/getAllDataByApi';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';

const RecievedPayment = () => {
  const [SearchParams] = useSearchParams();
  const { customerId = '' } = useParams<{ customerId: string }>();

  const formProps = useForm<IPaymentRecived>({
    resolver: yupResolver(RecievedPamentSchema) as any,
    mode: 'onChange',
    defaultValues: {
      paymentDate: new Date(),
      invoicePayments: [],
      depositTo: "",
      customer: '',
      paymentMethod: '',
      referenceNo: '',
      amount: 0,
      searchInvoice: '',
      fromDate: null,
      toDate: null,
      overdueOnly: '',
       postingDate:new Date(),
    },
  });

  const { handleSubmit, reset, watch, setValue,formState:{errors} } = formProps;
  const watchedFields = watch();
  const searchInvoiceDebounced = useDebounce(watchedFields.searchInvoice, 500);

  const paramSearch: recievedPaymentparmaSearchProps = useMemo(() => ({
    invoiceNumber: searchInvoiceDebounced,
   fromDate:formatDate(watchedFields.fromDate || null),
    toDate: formatDate(watchedFields.toDate || null),
    overdueOnly: watchedFields.overdueOnly,
    customerId: watchedFields.customer,
  }), [searchInvoiceDebounced, watchedFields.fromDate, watchedFields.toDate, watchedFields.overdueOnly, watchedFields.customer]);

  /** 📌 Fetch all invoice customers */
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['getCustomers'],
    queryFn: async () => {
      const response = await getAllDataOfCustomers() as ICustomer[] 
      return response;
    },
  });

  /** 📌 Update Invoice Payments */
  const { mutateAsync: updateInvoicePayments, isPending: isPendingUpdate } = useMutation({
    mutationFn: async (payload: {
      invoicePayments: Array<{ invoiceId: string; amount: number }>;
      paymentDate: Date;
      paymentMethod: string;
      referenceNo: string;
      customerId: string;
      depositTo: string;
      amount: number;
      postingDate:Date
    }) => apiService.updateInvoicePayments(payload, "invoice"),
    onSuccess: () => {
      toast.success('Payment has been updated successfully!');
      getCustomerData.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating payment.');
    },
  });

  /** 📌 Get customer invoices */
  const getCustomerData = useQuery({
    queryKey: ['getInvoiceCustomersById', paramSearch],
    queryFn: async () => {
      const response = await apiService.getInvoiceCustomersById(paramSearch);
      return response;
    },
    enabled: !!paramSearch.customerId, // only fetch if customer is selected
  });

  const customerInvoices = getCustomerData.data?.data || [];
  const customerBalance = getCustomerData.data?.totalBalance || 0;

  /** 📌 Handle customer change */
  const handleCustomerChange = async (customerId: string) => {
    if (!customerId) {
      reset();
      return;
    }
    setValue('customer', customerId);
  };

  /** 📌 Submit form */
  const onSubmit = async (data: IPaymentRecived) => {
    try {
      const invoicePayments = (data.invoicePayments || [])
        .filter(invoice => invoice.amount > 0)
        .map(({ invoiceId, amount }) => ({ invoiceId, amount }));
      await updateInvoicePayments({
        invoicePayments,
        paymentDate: data.paymentDate || todayDate,
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo,
        customerId: data.customer,
        depositTo: data.depositTo,
        amount: data.amount,
        postingDate:data.postingDate
      });

      const currentCustomer = data.customer;
      const currentAmount=data.amount
      reset({
        customer:currentCustomer,
        amount:currentAmount
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create payment")
      // Error is already handled by the mutation's onError
    }
  };

  /** 📌 Clear form */
  const handleClear = () => {
    const currentCustomer = watch('customer');
    reset();
    setValue('customer', currentCustomer);
  };

  /** 📌 Set customer from route params */
  useEffect(() => {
    if (customerId) setValue('customer', customerId);
  }, [customerId, setValue]);
  /** 📌 Set customer from route params */
  useEffect(() => {
    if (customerId) setValue('customer', customerId);
  }, [customerId, setValue]);
  /** 📌 Set Invoice Number from query params */
  useEffect(() => {
    if (SearchParams.get('invoiceNumber')) setValue('searchInvoice', SearchParams.get('invoiceNumber') as string);
  }, [SearchParams]);

  /** 📌 Trigger amount value if invoice amount changed */
  useEffect(() => {
    // trigger amount validation
    formProps.trigger('amount');
  }, [watch('invoicePayments')]);
 
 console.error("error",errors)
  return (
    <FormProvider {...formProps}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Receive Payment
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(customerBalance)}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <RecievedPaymentFormFields
                invoiceData={invoiceData || []}
                isLoading={isLoadingInvoice}
                handleCustomerChange={handleCustomerChange}
                customerInvoices={customerInvoices}
              />

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Outstanding Invoices
                </Typography>

                <FilterData
                  isLoading={isLoadingInvoice || isPendingUpdate}
                />

                {customerInvoices.length > 0 && (
                  <OutStandingTransactions
                    isLoading={isLoadingInvoice || isPendingUpdate}
                    customerInvoices={customerInvoices}
                    customerBalance={customerBalance}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isPendingUpdate}
                  >
                    {isPendingUpdate ? 'Submitting...' : 'Submit'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
    </FormProvider>
  );
};

export default withPermission("create",["accounting"])(RecievedPayment);
