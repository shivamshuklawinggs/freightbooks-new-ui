import { FC, useEffect, useState } from 'react';

import {
  Grid, Button, Typography, TextField, Paper, MenuItem, Select, FormHelperText, InputLabel, FormControl, Autocomplete,
  Box, CircularProgress
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { getLocationByName, getStatusColor } from '@/utils';
import useDebounce from '@/hooks/useDebounce';
import { StatusUpdateSchema } from './Schema/StatusUpdateSchema';
import { useVendorRating } from '@/hooks/useVendorRating';
import VendorRatingDisplay from '@/components/VendorRating/VendorRatingDisplay';
import VendorRatingForm from '@/components/VendorRating/VendorRatingForm';
import { useQueryClient } from '@tanstack/react-query';
import { LoadStatus as LoadStatusEnum } from '@/types';
import { LoadStatus } from '@/data/Loads';

interface FollowUpProps {
  data: {
    _id: string;
    loadNumber: string;
    status?: string;
    notes?: string;
    currentLocation?: string;
    carrierId: string; // Carrier ID for vendor rating
  };
  OnSuccess?: () => Promise<void>;
}

// Combined form type for status update with optional rating
interface StatusUpdateFormData {
  status: string;
  notes?: string;
  currentLocation?: string | null;
  rating: {
    communication?: number; // 1-5 stars
    Behavior?: number; // 1-5 stars
    Performance?: number; // 1-5 stars
  };
}

const FollowUp: FC<FollowUpProps> = ({ data, OnSuccess = async () => { } }) => {
  const [locationList, setLocationList] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const methods = useForm<StatusUpdateFormData>({
    resolver: yupResolver(StatusUpdateSchema),
    defaultValues: {
      status: data.status || '',
      notes: data.notes || '',
      currentLocation: data?.currentLocation || '',
      rating: {
        communication: 0,
        Behavior: 0,
        Performance: 0,
      },
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = methods;
  const debouncedSearchTerm = useDebounce(watch('currentLocation') || '', 500);
  const loadid = data._id;
  const qc = useQueryClient()
  // Fetch vendor rating
  const { data: vendorRatingData, isLoading: isLoadingRating } = useVendorRating({
    carrierId: data.carrierId,
    enabled: !!data._id,
  });

  const selectedStatus = watch('status');

  const onSubmit = async (formData: any) => {
    try {
      await apiService.updateLoadStatus(loadid, formData);
      toast.success('Status updated successfully!');
      // Trigger vendor rating update if status is Cancelled or Delivered
      const alloweLoadstatus = [LoadStatusEnum.CANCELLED, LoadStatusEnum.DELIVERED]

      if (alloweLoadstatus.includes(formData.status)) {
        if (formData.rating && data.carrierId) {
          try {
            // Convert form data to metrics format
            await apiService.updateVendorRating(loadid, data.carrierId, {
              Performance: formData.rating.Performance, // Store original star ratings
              communication: formData.rating.communication,
              Behavior: formData.rating.Behavior,
            });
            qc.invalidateQueries({ queryKey: ['vendorRating'] });
            toast.info('Vendor rating saved successfully');
          } catch (ratingError) {
            console.error('Failed to update vendor rating:', ratingError);
            toast.warning('Status updated but rating save failed');
          }
        } else if (formData.rating && !data.carrierId) {
          toast.warning('Cannot save rating: Carrier information missing');
        }
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update status');
    } finally {
      await OnSuccess();
    }
  };

  const handleLocationSearch = async () => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
      setIsSearching(true);
      try {
        const response = await getLocationByName(debouncedSearchTerm);
        setLocationList(response);
      } catch (error) {
        console.warn('Error fetching location list:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setLocationList([]);
    }
  };

  const handleLocationSelect = (location: string | null) => {
    if (location) {
      setValue('currentLocation', location);
      // Clear the location list after selection
      setLocationList([]);
    }
  };
  useEffect(() => {
    handleLocationSearch();
  }, [debouncedSearchTerm]);
  // call getLoadRating and update rating data 
  useEffect(() => {
    apiService.getLoadRating(loadid).then((res) => {

     res?.data && setValue('rating', {
      Performance: res?.data?.Performance || 0,
      communication: res?.data?.communication || 0,
      Behavior: res?.data?.Behavior || 0,
     });
    });
  }, [loadid]);

  return (
    <Grid 
      container 
      component={Paper} 
      elevation={3} 
      sx={{ 
        maxWidth: 550, 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        mt: 4,
        position: 'relative'
      }}
    >
      {/* Header with gradient background */}
      <Grid item xs={12} sx={{ 
        // bgcolor: 'primary.main', 
        // py: 2, 
        // px: 3,
        // borderRadius: 1,
        // background: 'linear-gradient(45deg, primary.light, primary.light)',
        // boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        // mb: 2,
        mt: 4,
      }}>
        {/* <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Update Status
        </Typography> */}
      </Grid>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', padding: '0 24px 24px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Load ID"
                fullWidth
                id="outlined-basic"
                value={`LO-${data.loadNumber}`}
                variant="outlined"
                disabled
                InputProps={{
                  sx: { bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="status-label">Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="status-label"
                      label="Status"
                      sx={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                        }
                      }}
                    >
                      {LoadStatus.map((status) => {
                        // Define color based on status
                        
                        return (
                          <MenuItem key={status.id} value={status.name} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 10, 
                                height: 10, 
                                borderRadius: '50%', 
                                bgcolor: getStatusColor(status.name),
                                mr: 1,
                                display: 'inline-block'
                              }} 
                            />
                            {status.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.status?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={locationList}
                value={watch('currentLocation') || null}
                onChange={(_, newValue) => handleLocationSelect(newValue)}
                onInputChange={(_, newInputValue) => setValue("currentLocation", newInputValue)}
                loading={isSearching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    {...register('currentLocation')}
                    label="Current Location (Optional)"
                    fullWidth
                    variant="outlined"
                    error={!!errors.currentLocation}
                    helperText={errors.currentLocation?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Notes (Optional)
              </Typography>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Add details about the load status"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(0,0,0,0.01)',
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {(selectedStatus === 'Cancelled' || selectedStatus === 'Delivered') && (
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.02)', 
                  borderRadius: 1,
                  border: '1px dashed rgba(0,0,0,0.1)',
                  mb: 2
                }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 2 }}>
                    Rate Carrier Performance
                  </Typography>
                  <VendorRatingForm />
                </Box>
              </Grid>
            )}
            
            {/* Display Vendor Rating if available */}
            {!isLoadingRating && vendorRatingData?.data && (
              <Grid item xs={12}>
                <VendorRatingDisplay overallScore={vendorRatingData.data.overallScore} />
              </Grid>
            )}

            <Grid item xs={12}>
              <Grid container justifyContent="flex-end">
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  Save Status
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Grid>
  );
};

export default FollowUp;