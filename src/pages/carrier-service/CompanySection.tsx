
import {
  TextField,
  Grid,
  InputAdornment,

} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

import { ICarrier } from '@/types';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useUSDOTForCarrier } from '@/hooks/useGetUsDotData';
import { Search as FaSearch } from '@mui/icons-material';
const CompanySection = ({ localUsdot, setLocalUsdot }: any) => {
  const form = useFormContext<ICarrier>();
  const { loading: usdotLoading, error: usdotError, handleSubmit: searchUSDOT } = useUSDOTForCarrier(form.setValue);
  const handleUSDOTSearch = () => {
    searchUSDOT(form.watch('usdot'));
    setLocalUsdot(form.watch('usdot'));
  };
  return (
    <Grid container spacing={2}>
      {/* USDOT Field */}
      <Grid item xs={12} md={2}>
        <Controller
          name="usdot"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size='small'
              label="USDOT"
              error={!!form.formState.errors.usdot || !!usdotError}
              helperText={form.formState.errors.usdot?.message || usdotError?.message}
              disabled={usdotLoading}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {usdotLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <FaSearch
                        sx={{cursor:"pointer",color:"primary.main"}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUSDOTSearch();
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>
      {/* Other Fields */}
      <Grid item xs={12} md={2}>
        <Controller
          name="mcNumber"
          control={form.control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="MC Number" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.mcNumber} helperText={form.formState.errors.mcNumber?.message} size='small' />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="company"
          control={form.control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Company Name" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.company} helperText={form.formState.errors.company?.message} size='small' />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <TextField size='small' {...field} fullWidth type="email" label="Contact Email" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
            )}
          />
        </Grid>
      <Grid item xs={6}>
        <Controller
          name="address"
          control={form.control}
          render={({ field }) => (
            <TextField {...field} fullWidth multiline rows={2} label="Address" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.address} helperText={form.formState.errors.address?.message} size='small' />
          )}
        />
      </Grid>
   
      <Grid item xs={12} md={3}>
        <Controller
          name="state"
          control={form.control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="State" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.state} helperText={form.formState.errors.state?.message} size='small' />
          )}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <Controller
          name="phone"
          control={form.control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Phone" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.phone} helperText={form.formState.errors.phone?.message} size='small' />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default CompanySection