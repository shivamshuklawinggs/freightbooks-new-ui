import { useFormContext } from 'react-hook-form';
import { Grid } from '@mui/material';
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import { ICarrier, ICustomer } from '@/types';

const CommonData = () => {
  const form = useFormContext<ICustomer | ICarrier>();
  return (
   <Grid container spacing={1}>
    {form.watch("entity_type") && (
                 <Grid item xs={12} md={4}>
                   <Controller
                     name="entity_type"
                     control={form.control}
                     render={({ field }) => (
                       <TextField {...field} inputProps={{
                         readOnly: true,
                       }} fullWidth label="Entity Type" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.entity_type} helperText={form.formState.errors.entity_type?.message} size='small' />
                     )}
                   />
                 </Grid>
               )}
                  {/* show carrier carrier_operation it is an array of strings */}
                  {(() => {
                 const carrierOps = form.watch("carrier_operation");
                 return carrierOps && carrierOps.length > 0 && (
                   <Grid item xs={12} md={4}>
                     <TextField
                       value={carrierOps.join(', ')}
                       inputProps={{
                         readOnly: true,
                       }}
                       fullWidth
                       label="Carrier Operation"
                       InputLabelProps={{ shrink: true }}
                       error={!!form.formState.errors.carrier_operation}
                       helperText={form.formState.errors.carrier_operation?.message}
                       size='small'
                     />
                   </Grid>
                 );
               })()}
                {
                 form.watch("operating_status") && (
                   <Grid item xs={12} md={4}>
                     <Controller
                       name="operating_status"
                       control={form.control}
                       render={({ field }) => (
                         <TextField {...field} inputProps={{
                           readOnly: true,
                         }} fullWidth label="Operating Status" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.entity_type} helperText={form.formState.errors.entity_type?.message} size='small' />
                       )}
                     />
                   </Grid>
                 )}
               {
                 form.watch("dba_name") && (
                   <Grid item xs={12} md={6}>
                     <Controller
                       name="dba_name"
                       control={form.control}
                       render={({ field }) => (
                         <TextField {...field} inputProps={{
                           readOnly: true,
                         }} fullWidth label="DBA Name" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.entity_type} helperText={form.formState.errors.entity_type?.message} size='small' />
                       )}
                     />
                   </Grid>
                 )
               }
              
               {
                 form.watch("mailing_address") && (
                   <Grid item xs={12} md={6}>
                     <Controller
                       name="mailing_address"
                       control={form.control}
                       render={({ field }) => (
                         <TextField {...field} inputProps={{
                           readOnly: true,
                         }} multiline rows={2} fullWidth label="Mailing Address" InputLabelProps={{ shrink: true }} error={!!form.formState.errors.entity_type} helperText={form.formState.errors.entity_type?.message} size='small' />
                       )}
                     />
                   </Grid>
                 )}
            
               {/* out of service date */}
               {
                 form.watch("out_of_service_date") && (
                   <Grid item xs={12} md={6}>
                     <Controller
                       name="out_of_service_date"
                       control={form.control}
                       render={({ field }) => (
                         <TextField
                           {...field}
                           fullWidth
                           label="Out of Service Date"
                           error={!!form.formState.errors.out_of_service_date}
                           helperText={form.formState.errors.out_of_service_date?.message}
                         />
                       )}
                     />
                   </Grid>
                 )
               }
               </Grid>
  )
}

export default CommonData