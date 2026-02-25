import { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  InputAdornment,

} from '@mui/material';
import { useFormContext,Controller } from 'react-hook-form';

import { ICustomer } from '@/types';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useGetUsDotDataForCustomer } from '@/hooks/useGetUsDotData';
import { Search as FaSearch} from '@mui/icons-material';
const CompanySection = () => {
  const form = useFormContext<ICustomer>();
  const usdot = form.watch('usdot');
  const [localUsdot, setLocalUsdot] = useState<string>(usdot || '');
  const { loading: usdotLoading, error: usdotError, handleSubmit: handleCustomerSubmit } = useGetUsDotDataForCustomer(form.setValue);
  useEffect(() => {
    setLocalUsdot(usdot || '');
  }, [usdot]);
  return (
   <Grid container spacing={1}>
     {/* Company  */}
     <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="USDOT Number"
                error={!!form.formState.errors.usdot}
                size='small'
                helperText={usdotError?.message ? usdotError?.message : form.formState.errors.usdot?.message }
                disabled={form.formState.isSubmitting || usdotLoading}
                value={localUsdot}
                onChange={(e) => {
                  setLocalUsdot(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* search icon */}
                      {
                        usdotLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <FaSearch style={{ cursor: 'pointer' }} onClick={(e) => {
                            e.stopPropagation();
                            handleCustomerSubmit(localUsdot);
                          }} />
                        )
                      }

                    </InputAdornment>
                  ),
                }}
              />

            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name="mcNumber"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="MC Number"
                    error={!!form.formState.errors.mcNumber}
                    helperText={form.formState.errors.mcNumber?.message}
                    InputProps={{ readOnly: usdotLoading }}
                    size='small'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="company"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company"
                    InputProps={{ readOnly: usdotLoading }}
                    error={!!form.formState.errors.company}
                    helperText={form.formState.errors.company?.message}
                    size='small'
                  />
                )}
              />
            </Grid>
            {/* email */}
            <Grid item xs={12} md={4}>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    error={!!form.formState.errors.email}
                    helperText={form.formState.errors.email?.message}
                    size='small'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                    inputProps={{
                      maxLength: 15,
                      readOnly: usdotLoading,
                    }}
                    error={!!form.formState.errors.phone}
                    helperText={form.formState.errors.phone?.message}
                    size='small'
                  />
                )}
              />
            </Grid>
               {/* Address */}
               <Grid item xs={12} md={5}>
              <Controller
                name="address"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Address"
                    InputProps={{ readOnly: usdotLoading }}
                    error={!!form.formState.errors.address}
                    helperText={form.formState.errors.address?.message}
                    size='small'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="state"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="State"
                    error={!!form.formState.errors.state}
                    helperText={form.formState.errors.state?.message}
                    size='small'
                  />
                )}
              />
            </Grid>
   </Grid>
  )
}

export default CompanySection