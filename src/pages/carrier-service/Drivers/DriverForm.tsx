import React, { useEffect } from 'react';
import { Grid, TextField, Button, Box, FormControlLabel, Switch, Dialog, DialogContent, DialogActions, Typography, IconButton, CircularProgress, useTheme, alpha, Card, Avatar } from '@mui/material';
import { Person, Upload, ToggleOn } from '@mui/icons-material';
import { useForm, Controller,FormProvider } from 'react-hook-form';
import { IDriver } from '@/types';
import CustomDatePicker from '@/components/common/CommonDatePicker';
import UploadFile from '../UploadFile';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { DriverSchema } from './DriverSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { maxinputAllow, preventInvalidPhone } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { todayDate } from '@/config/constant';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { getIcon } from '@/components/common/icons/getIcon';

interface DriverFormProps {
  carrier: string;
  driver?: IDriver;
  onCancel: () => void;
  onUpdate: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ carrier, driver, onCancel,onUpdate }) => {
  const theme = useTheme();
  const methods = useForm<IDriver>({
    resolver: yupResolver(DriverSchema) as any,
    defaultValues: {
      driverName: '',
      driverPhone: '',
      driverCDL: '',
      driverCDLExpiration: undefined,
      isActive: true,
      file: undefined,
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const mutation = useMutation({
    mutationFn: (data: IDriver) => {
      const payload = { carrierId: carrier, ...data };
      if (driver?._id) {
        return apiService.updateDriver(driver._id, payload);
      } else {
        return apiService.createDriver(payload);
      }
    },
    onSuccess: (response) => {
      if (driver?._id) {
        reset(response.data);
        toast.success('Driver updated successfully');
      } else {
        reset();
        onUpdate();
        toast.success('Driver added successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save driver');
    },
  });

  useEffect(() => {
    if (driver) {
      reset({
        driverName: driver.driverName,
        driverPhone: driver.driverPhone,
        driverCDL: driver.driverCDL,
        driverCDLExpiration: driver.driverCDLExpiration,
        isActive: driver.isActive,
        file: driver.file,
      });
   
     
    } else {
      reset();
    }
  }, [driver, reset]);

  const onSubmit = async (data: IDriver) => {
    mutation.mutate(data);
  };

  return (
    <Dialog 
      open={true} 
      maxWidth="md" 
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
            <Person sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {driver?._id ? 'Update Driver' : 'Add New Driver'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onCancel}
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
      
      <FormProvider {...methods}>
        <Box component="form" onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}>
          <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              {/* Driver Information Section */}
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
                    <Person sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Driver Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="driverName"
                        control={control}
                        rules={{ required: 'Driver name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Driver Name"
                            placeholder="Enter driver name"
                            error={!!errors.driverName}
                            helperText={errors.driverName?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out'
                              },
                              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="driverPhone"
                        control={control}
                        rules={{ required: 'Phone number is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Driver Phone"
                            placeholder="Enter phone number"
                            onChange={(e) => {
                              maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                              field.onChange(e);
                            }}
                            onKeyDown={(e) => preventInvalidPhone(e as any)}
                            error={!!errors.driverPhone}
                            helperText={errors.driverPhone?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="driverCDL"
                        control={control}
                        rules={{ required: 'CDL number is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="CDL Number"
                            placeholder="Enter CDL number"
                            error={!!errors.driverCDL}
                            helperText={errors.driverCDL?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="driverCDLExpiration"
                        control={control}
                        rules={{ required: 'Expiration date is required' }}
                        render={({ field }) => (
                          <CustomDatePicker
                            className="form-control"
                            name={field.name}
                            value={field.value}
                            label='Expiry Date'
                            onChange={(e: any) => field.onChange(e)}
                            required
                            minDate={todayDate}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

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
                    <Upload sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Documents
                    </Typography>
                  </Box>
                  <UploadFile/>
                </Card>
              </Grid>

              {/* Status Section */}
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
                    <ToggleOn sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Status
                    </Typography>
                  </Box>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.5),
                                },
                              }}
                            />
                          }
                          label={watch("isActive")? 'Active' : 'Inactive'}
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontWeight: 500,
                              color: watch("isActive") ? 'success.main' : 'text.secondary'
                            }
                          }}
                        />
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: watch("isActive") ? 'success.main' : 'grey.500',
                            fontSize: '0.875rem'
                          }}
                        >
                          {watch("isActive") ? '✓' : '✗'}
                        </Avatar>
                      </Box>
                    )}
                  />
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          
          {/* Actions */}
          <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  onClick={onCancel} 
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
                  type="submit" 
                  variant="contained" 
                  color="primary" 
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
                    driver?._id ? 'Update Driver' : 'Add Driver'
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

export default withPermission("create",["carriers"])(DriverForm);
