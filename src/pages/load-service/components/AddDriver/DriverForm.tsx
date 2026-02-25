import React  from 'react';
import { Grid, TextField, Button, Box, FormControlLabel, Switch, } from '@mui/material';
import { useForm, Controller,FormProvider } from 'react-hook-form';
import { IDriver } from '@/types';
import CustomDatePicker from '@/components/common/CommonDatePicker';
import UploadFile from './UploadFile';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { yupResolver } from '@hookform/resolvers/yup';
import { maxinputAllow, preventInvalidPhone } from '@/utils';
import { DriverSchema } from '@/pages/carrier-service/Drivers/DriverSchema';
import { todayDate } from '@/config/constant';
interface DriverFormProps {
  carrier: string;
  onCancel: () => void;
  onUpdate: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ carrier, onCancel,onUpdate }) => {
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



  const onSubmit = async (data: IDriver) => {
    try {
      const payload = { carrierId: carrier, ...data };
        await apiService.createDriver(payload);
        reset();
        onUpdate()
        toast.success('Driver added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save driver');
    }
  };
console.warn("errors",errors)
  return (
    <FormProvider {...methods}>
    <form onSubmit={handleSubmit(onSubmit)}>
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
                error={!!errors.driverName}
                helperText={errors.driverName?.message}
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
                // type='number'
                 onChange={(e) => {
                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                field.onChange(e);
              }}
              onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}

                error={!!errors.driverPhone}
                helperText={errors.driverPhone?.message}
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
                error={!!errors.driverCDL}
                helperText={errors.driverCDL?.message}
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

        <UploadFile/>

        <Grid item xs={12}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={watch("isActive")? 'Active' : 'Inactive'}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="button" variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
              Add Driver
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
    </FormProvider>
  );
};

export default DriverForm;
