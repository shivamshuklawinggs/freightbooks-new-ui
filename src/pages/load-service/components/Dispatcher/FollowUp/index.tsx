import React, { useState,useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  CircularProgress,
  Paper,
  FormControl,
  FormHelperText,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { defaultFollowUpValues, FollowUpSchema, FollowUpFormData, FollowUpStatus, PaymentStatus } from '../Schema/FollowUpSchema';
import NotesSection from './NotesSection';
import {  IitemService, ICarrierViewLoad, ILocationWithIds, paidtype } from '@/types';
import { useQuery, useMutation } from '@tanstack/react-query';

import CustomDatePicker from '@/components/common/CommonDatePicker';



interface ServiceListItem {
  loadId: string;
  status: FollowUpStatus;
  followupDate: Date;
  paymentStatus: PaymentStatus;
  _id: string;
  amount: string;
  date: Date;
  notes: string;
  location: string;
  paidby: string;
  service: IitemService;
  paidbytype?: paidtype;
}

interface FollowUpProps {
  OnSuccess?: () => Promise<void>;
  load: {
    _id: string;
    pickupLocationId: ILocationWithIds[];
    deliveryLocationId: ILocationWithIds[];
    carrierIds: ICarrierViewLoad;
  };
}

const FollowUp: React.FC<FollowUpProps> = ({
  load,
  OnSuccess = async () => { }
}) => {
  const [pickupLocations, setPickupLocations] = useState<ILocationWithIds[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FollowUpFormData>({
    // @ts-ignore - Yup schema type compatibility issue
    resolver: yupResolver(FollowUpSchema),
    defaultValues: defaultFollowUpValues,
  });

  const watchLocation = watch('location');
  const watchService = watch('service');

  const { data: serviceList = [] } = useQuery<ServiceListItem[]>({
    queryKey: ['expenses', load._id, watchLocation],
    queryFn: async () => {
      if (!watchLocation) return [];
      const response = await apiService.ExpenseService.getExpenseServiceListByLoadAndLocation(load._id, watchLocation);
      return response.data || [];
    },
    enabled: !!watchLocation,
  });

  const { data: selectedExpense } = useQuery<ServiceListItem | null>({
    queryKey: ['expense', load._id, watchLocation, watchService],
    queryFn: async () => {
      if (!watchLocation || !watchService) return null;
      const response = await apiService.ExpenseService.getSpecificExpense(load._id, watchService, watchLocation);
      return response.data || null;
    },
    enabled: !!watchLocation && !!watchService,
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: (data: FollowUpFormData) => {
      if (!selectedExpense) throw new Error('No expense selected');
      return apiService.ExpenseService.updateExpenseFollowUp(selectedExpense._id, {
        status: data.status,
        followupDate: data.followupDate,
        paymentStatus: data.paymentStatus,
      });
    },
    onSuccess: async () => {
      await OnSuccess();
      toast.success('Follow-up updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update follow-up');
    }
  });

  const handleFollowUpSubmit = (data: FollowUpFormData) => {
    updateFollowUpMutation.mutate(data);
  };

  useEffect(() => {
    const allLocations = [
      ...load.pickupLocationId.map(loc => ({ ...loc, type: 'pickup' as const })),
      ...load.deliveryLocationId.map(loc => ({ ...loc, type: 'delivery' as const }))
    ];
    setPickupLocations(allLocations);
  }, [load.pickupLocationId, load.deliveryLocationId]);

  useEffect(() => {
    if (watchLocation) {
      reset({
        location: watchLocation,
        service: "",
        status: FollowUpStatus.PENDING,
        followupDate: new Date(),
        paymentStatus: "" as PaymentStatus,
      });
    }
  }, [watchLocation, serviceList, reset]);

  useEffect(() => {
    if (selectedExpense) {
      setValue("status", selectedExpense.status || FollowUpStatus.PENDING);
      setValue("paymentStatus", selectedExpense.paymentStatus || "" as PaymentStatus);
      setValue("followupDate", selectedExpense.followupDate ? new Date(selectedExpense.followupDate) : new Date());
      
    } else {
      setValue("status", FollowUpStatus.PENDING);
      setValue("paymentStatus", "" as PaymentStatus);
      setValue("followupDate", new Date());
    }
  }, [selectedExpense, setValue]);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.name === "location"){
      setValue("location",e.target.value);
      setValue('service',"");
      setValue('paymentStatus',"" as PaymentStatus);
      setValue('followupDate',new Date());
      setValue("status",FollowUpStatus.PENDING);
      return 
    }
    if(e.target.name === "service"){
      setValue("service",e.target.value);
      setValue('paymentStatus',"" as PaymentStatus);
      setValue('followupDate',new Date());
      setValue("status",FollowUpStatus.PENDING);
      return 
    }
    if(e.target.name === "status"){
      setValue("status",e.target.value as FollowUpStatus);
      return 
    }
    if(e.target.name === "paymentStatus"){
      setValue("paymentStatus",e.target.value as PaymentStatus);
      return
    }
    if(e.target.name === "followupDate"){
      setValue("followupDate",new Date(e.target.value));
      return
    }
  };
  // erros 

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 500, px: 3, mt: 8 }}>
      {/* Header */}
      <Typography variant="h5" className="custom-offcanvas-title" sx={{ fontWeight: 'bold' ,mt:2 }}>
        Follow Up
      </Typography>
      <form onSubmit={handleSubmit(handleFollowUpSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, }}>
          <Select
            value={watch('status')}
            name="status"
            fullWidth
            onChange={(e)=>{
              handlechange(e as React.ChangeEvent<HTMLInputElement>)
            }}
          >
            {Object.values(FollowUpStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.location}>
                <InputLabel>Location</InputLabel>
                <Select {...field} onChange={(e)=>{
                  handlechange(e as React.ChangeEvent<HTMLInputElement>);
                }} label="Location">
                  {pickupLocations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.type === 'pickup' ? '🔼 ' : '🔽 '}
                      {`${loc.address}, ${loc.city}, ${loc.state}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.location && (
                  <FormHelperText>{errors.location.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.service}>
                <InputLabel>Service</InputLabel>
                <Select {...field}
                 onChange={(e)=>{
                  handlechange(e as React.ChangeEvent<HTMLInputElement>);
                 }} label="Service">
                  {serviceList.map((item) => (
                    <MenuItem key={item.service._id} value={item.service._id}>
                      {item.service.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.service && (
                  <FormHelperText>{errors.service.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          {selectedExpense && (
            <>
              <TextField
                fullWidth
                label="Amount"
                size='small'
                type="number"
                placeholder="0.00"
                variant="outlined"
                sx={{color:"disabled"}}
                value={selectedExpense?.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                  readOnly: true,
                }}
              />
              <FormControl >
                <InputLabel id="paidby-label" shrink>
                  Paid By
                </InputLabel>
                <Select
                  value={selectedExpense?.paidbytype}
                  disabled={true}
                  label="Paid By"
                >
                  {Object.values(paidtype).map((option) => (
                    <MenuItem key={option} sx={{textTransform:'capitalize'}} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedExpense?.paidbytype === paidtype.vendor && (
                <FormControl>
                </FormControl>
              )}
              {selectedExpense?.paidbytype === paidtype.other && (
                <TextField
                  value={selectedExpense?.paidby}
                  disabled={true}
                  label="Other"
                  sx={{ textTransform: "capitalize" }}
                />
              )}
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onChange={(e)=>{
                      handlechange(e as React.ChangeEvent<HTMLInputElement>);
                    }}
                    label="Payment Status"
                    error={!!errors.paymentStatus}
                  >
                    {Object.values(PaymentStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="followupDate"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                  {...field}
                  onChange={(e)=>{
                    setValue("followupDate",new Date(e.target.value));
                  }}
                  label="Follow-up Date"
                  />
                )}
              />
            </>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={updateFollowUpMutation.isPending}
            sx={{ mt: 2 }}
          >
            {updateFollowUpMutation.isPending ? <CircularProgress size={24} /> : 'Follow Up'}
          </Button>
        </Box>
      </form>
      <NotesSection
        id={load._id}
        OnSuccess={OnSuccess}
      />
    </Box>
  );
};

export default FollowUp;