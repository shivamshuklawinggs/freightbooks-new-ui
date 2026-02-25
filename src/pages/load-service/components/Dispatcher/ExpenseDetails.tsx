import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Typography, Button,
  MenuItem, Paper, Stack, InputAdornment, FormControl, InputLabel, Select, FormHelperText, CircularProgress
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { ICarrierExpenseDispatcher, IitemService, IExpenseLoadItem, ILocationWithIds, paidtype } from '@/types';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import DocumentUpload from './DocumentUpload';
import { ExpenseSchema } from './Schema/ExpenseSchema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preventInvalidNumberInput } from '@/utils';
import CustomDatePicker from '@/components/common/CommonDatePicker';


interface LumperProps {
  load: {
    _id: string;
    loadNumber: string;
    pickupLocationId: ILocationWithIds[];
    deliveryLocationId?: ILocationWithIds[];
    customerId: string;
    carrierIds: ICarrierExpenseDispatcher;
  };
  service: IitemService
  OnSuccess: () => void;
}


const LumperFee: React.FC<LumperProps> = ({ load, service, OnSuccess }) => {
  const [pickupLocations, setPickupLocations] = useState<ILocationWithIds[]>([]);
  const currentRole = useSelector((state: RootState) => state.user.user?.role)
  const queryClient = useQueryClient();

  const form = useForm<IExpenseLoadItem>({
    resolver: yupResolver(ExpenseSchema) as any,
    defaultValues: {
      loadId: load._id,
      rate: 0,
      date: new Date(),
      notes: '',
      location: '',
      paidby: '' ,
      paidbytype: '' as paidtype,
      receipt: [],
      deleteFiles: []
    },
  });

  const watchLocation = form.watch('location');

  const { data: existingExpense, isLoading: isLoadingExpense } = useQuery<IExpenseLoadItem | null>({
    queryKey: ['expense', load._id, service._id, watchLocation],
    queryFn: async () => {
      if (!watchLocation) return null;
      try {
        const response = await apiService.ExpenseService.searchExpense({loadid: load._id, service: service._id as string, location: watchLocation,});
        return response.data || null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!watchLocation,
  });

  const isEditable = currentRole?.includes('dispatcher') && !existingExpense ?false : true;

  const updateExpenseMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.ExpenseService.createOrUpdateExpense({
      loadid: load._id,
      service: service._id as string,
      location: watchLocation,
    }, formData),
    onSuccess: () => {
      toast.success(`${service?.label} expense ${existingExpense ? 'updated' : 'added'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['expense', load._id, service._id, watchLocation] });
      OnSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to ${existingExpense ? 'update' : 'add'} expense`);
    }
  });

  useEffect(() => {
    const pickupLocs = (load.pickupLocationId || []).map((loc: ILocationWithIds) => ({ ...loc, type: 'pickup' as const }));
    const deliveryLocs = (load.deliveryLocationId || []).map((loc: ILocationWithIds) => ({ ...loc, type: 'delivery' as const }));
    const allLocations = [...pickupLocs, ...deliveryLocs];
    setPickupLocations(allLocations);
  }, [load]);

  useEffect(() => {
    if (existingExpense) {
      form.reset({
        ...form.getValues(),
        rate: existingExpense.rate || 0,
        date: new Date(existingExpense.date),
        notes: existingExpense.notes || '',
        paidby: existingExpense.paidby || '',
        paidbytype: existingExpense.paidbytype || '',
        receipt: existingExpense.receipt || [],
        deleteFiles: existingExpense.deleteFiles || [],
      });
    } else if (watchLocation) {
      form.reset({
        ...form.getValues(),
        loadId: load._id,
        rate: 0,
        date:new Date(),
        notes: '',
        paidby: '',
        paidbytype: ''   as paidtype,
        receipt: [],
        deleteFiles: []
      });
    }
  }, [existingExpense, watchLocation, form, load._id]);


  const onSubmit = async (data: IExpenseLoadItem) => {
    const formData = new FormData();
    const { receipt, deleteFiles, ...expenseData } = data;
    const expensePayload = {
      ...expenseData,
      loadId: load._id,
      service: service._id || '',
      positive: false,
    };

    formData.append('expenseData', JSON.stringify(expensePayload));

    receipt.forEach((file: any) => {
      if (file.file instanceof File) {
        formData.append('receipt', file.file);
      }
    });

    if (deleteFiles?.length > 0) {
      formData.append('deletefiles', JSON.stringify(deleteFiles.map((file: any) => file.filename)));
    }

    updateExpenseMutation.mutate(formData);
  };
  // Render
  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 500, px: 3, mt: 8 }}>
      <Typography variant="h6" gutterBottom>
        {existingExpense ? 'Update' : 'Add'} {service?.label} Expense
      </Typography>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {isLoadingExpense ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <Box>
                  <TextField
                    label="Load ID"
                    fullWidth
                    size='small'
                    id="outlined-basic"
                    value={`LO-${load.loadNumber}`}
                    variant="outlined"
                    sx={{ bgcolor: '#f8f8f8' }}
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                <Box>
                  <Controller
                    name="location"
                    control={form.control}
                    rules={{ required: 'Location is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth margin="normal" error={!!form.formState.errors.location}>
                        <InputLabel id="location-label">Location</InputLabel>
                        <Select
                          {...field}
                          labelId="location-label"
                          label="Location"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          size="small"
                        >
                          {pickupLocations.map((location) => (
                            <MenuItem key={location._id} value={location._id}>
                              {location.type === 'pickup' ? '🔼 Pickup: ' :
                                location.type === 'delivery' ? '🔽 Delivery: ' :
                                  '🔄 Transit: '}{location.address}, {location.city}, {location.state}
                            </MenuItem>
                          ))}
                        </Select>
                        {form.formState.errors.location && (
                          <FormHelperText>{form.formState.errors.location.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>

                <Box>
                  <FormControl fullWidth margin="normal" error={!!form.formState.errors.paidbytype}>
                    <InputLabel id="paidby-label">Paid By</InputLabel>
                    <Controller
                      name="paidbytype"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          size="small"
                          labelId="paidby-label"
                          label="Paid By"
                          error={!!form.formState.errors.paidbytype}
                          onChange={(e) => {
                            const val = e.target.value as paidtype;
                            field.onChange(val);
                            if (val === paidtype.customer) {
                              form.setValue('paidby', load.customerId);
                              return;
                            }
                            if (val ===paidtype.vendor) {
                              form.setValue('paidby', load.carrierIds?.carrier?._id || '');
                              return;
                            }
                            form.setValue('paidby', '');
                          }}
                        >
                          {[paidtype.customer,paidtype.vendor,paidtype.other].map((option:paidtype) => (
                            <MenuItem key={option} sx={{ textTransform: 'capitalize' }} value={option}>
                              {option===paidtype.customer ? "Customer":option===paidtype.vendor ? "Carrier":option===paidtype.other ? "Other":"Select"}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText error>
                      {form.formState.errors.paidbytype?.message}
                    </FormHelperText>
                  </FormControl>
                </Box>

                {form.watch('paidbytype') === "vendor" && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Select Carrier
                    </Typography>
                    <Controller
                      name="paidby"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            label="Select Carrier"
                            fullWidth
                            size='small'
                            sx={{ textTransform: "capitalize" }}
                          >
                            {load.carrierIds?.carrier && (
                              <MenuItem key={load.carrierIds.carrier._id} value={load.carrierIds.carrier._id}>
                                {load.carrierIds.carrier.company}
                              </MenuItem>
                            )}
                          </Select>
                        )}
                    />
                  </Box>
                )}
                {form.watch('paidbytype') === "other" && (
                  <Box>
                     <Controller
                    name="paidby"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        placeholder="Paid By"
                        error={!!form.formState.errors.paidby}
                        helperText={form.formState.errors.paidby?.message}
                        variant="outlined"
                      
                      />
                    )}
                  />
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Amount ($)
                  </Typography>
                  <Controller
                    name="rate"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        onKeyDown={preventInvalidNumberInput}
                        placeholder="0.00"
                        error={!!form.formState.errors.rate}
                        helperText={form.formState.errors.rate?.message}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">USD</InputAdornment>
                        }}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Date
                  </Typography>
                    <Controller
                      name="date"
                      control={form.control}
                      render={({ field }) => (
                        <CustomDatePicker
                          value={field.value}
                          name='date'
                          onChange={(newValue) => field.onChange(newValue)}
                          fullWidth= {true}
                          error= {!!form.formState.errors.date}
                          helperText={form.formState.errors.date?.message}
                         
                        />
                      )}
                    />
               
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes (Optional)
                  </Typography>
                  <Controller
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        size='small'
                        rows={4}
                        placeholder="Add details about the expense"
                        variant="outlined"
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Receipt
                  </Typography>
                  <DocumentUpload />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button variant="outlined" onClick={() => {
                    OnSuccess();
                    form.reset();
                  }} disabled={updateExpenseMutation.status === 'pending' }>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary" disabled={updateExpenseMutation.isPending || isEditable || !form.watch("location") || !service?._id || !load?._id }>
                    {updateExpenseMutation.status === 'pending' ? 'Saving...' : existingExpense ? 'Update Expense' : 'Add Expense'}
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </form>
      </FormProvider>
    </Box>
  );
};
export default LumperFee

