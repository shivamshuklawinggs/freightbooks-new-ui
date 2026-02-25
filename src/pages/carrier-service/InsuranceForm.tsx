import React, { ChangeEvent, useEffect } from 'react';
import { useFormContext,Controller } from 'react-hook-form';
import { ICarrier } from '@/types';
import { TextField, Grid, Typography, Divider, } from '@mui/material';
import { maxinputAllow, preventInvalidPhone ,preventStringInput} from '@/utils';
import CustomDatePicker from '@/components/common/CommonDatePicker';
import InsurerDocsUploadField from './InsurerDocsUploadField';
const InsuranceForm:React.FC<{open:any}> = ({open}) => {
 const form=useFormContext<ICarrier>();
 // Watch specific fields for changes
 const commercialIssueDate = form.watch('commercialGeneralLiability.issueDate');
 const commercialExpiryDate = form.watch('commercialGeneralLiability.expiryDate');
     useEffect(() => {
        // Check if we're in edit mode (data coming from open prop)
        const isEditMode = typeof open === 'object' && (open as ICarrier)?._id
    
        // Only proceed if all commercial liability fields have values and we're not in edit mode
        if (!isEditMode) {
          // Check if other liabilities are empty
            form.setValue('automobileLiability.expiryDate', commercialExpiryDate);
          
            form.setValue('automobileLiability.issueDate', commercialIssueDate);
          
    
            form.setValue('cargoLiability.expiryDate', commercialExpiryDate);
          
            form.setValue('cargoLiability.issueDate', commercialIssueDate);
          
        }
      }, [commercialIssueDate, commercialExpiryDate, open]);
      const handleDateChange = (e:any) => {
        try{
          const value=e.target.value 
         form.setValue(e.target.name, value);
        }catch(error){
          console.warn("error",error)
        }
      };
  return (
    <Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <Controller
      name="insurerCompany"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.insurerCompany}
          helperText={form.formState.errors.insurerCompany?.message}
        fullWidth label="Insurer Company" InputLabelProps={{ shrink: true }} />
    )}
    />
  </Grid>
  <Grid item xs={12} md={6}>
    <Controller
      name="agentName"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.agentName}
          helperText={form.formState.errors.agentName?.message}
        fullWidth label="Agent Name" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>
  <Grid item xs={12} md={6}>
    <Controller
      name="agentAddress"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.agentAddress}
          helperText={form.formState.errors.agentAddress?.message}
         fullWidth label="Agent Address" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <Controller
      name="agentEmail"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.agentEmail}
          helperText={form.formState.errors.agentEmail?.message}
         fullWidth label="Agent Email" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <Controller
      name="agentPhoneNumber"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field} 
           onChange={(e)=>{
             maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
             field.onChange(e);
           }}
           error={!!form.formState.errors.agentPhoneNumber}
          helperText={form.formState.errors.agentPhoneNumber?.message}
          onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
          fullWidth label="Agent Phone Number" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>
  <Grid item xs={12} md={3}>
    <Controller
      name="agentExtentionNo"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field} 
           onChange={(e)=>{
             maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
             field.onChange(e);
           }}
           error={!!form.formState.errors.agentExtentionNo}
          helperText={form.formState.errors.agentExtentionNo?.message}
          onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
          fullWidth label="Agent Extention No" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>

  {/* Commercial General Liability */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" color='primary' sx={{ mb: 1 }}>Commercial General Liability</Typography>
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="commercialGeneralLiability.issueDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
         name="commercialGeneralLiability.issueDate"
         label="Issue Date"
         value={form.watch('commercialGeneralLiability.issueDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.commercialGeneralLiability?.issueDate}
          helperText={form.formState.errors.commercialGeneralLiability?.issueDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="commercialGeneralLiability.expiryDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
        name="commercialGeneralLiability.expiryDate"
         label="Expiry Date"
         value={form.watch('commercialGeneralLiability.expiryDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.commercialGeneralLiability?.expiryDate}
          helperText={form.formState.errors.commercialGeneralLiability?.expiryDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="commercialGeneralLiability.amount"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.commercialGeneralLiability?.amount}
          helperText={form.formState.errors.commercialGeneralLiability?.amount?.message}
          onKeyDown={preventStringInput}
          fullWidth label="Amount" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>

  {/* Automobile Liability */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" color='primary' sx={{ mb: 1 }}>Automobile Liability</Typography>
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="automobileLiability.issueDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
        name="automobileLiability.issueDate"
         label="Issue Date"
         value={form.watch('automobileLiability.issueDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.automobileLiability?.issueDate}
          helperText={form.formState.errors.automobileLiability?.issueDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="automobileLiability.expiryDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
        name="automobileLiability.expiryDate"
         label="Expiry Date"
         value={form.watch('automobileLiability.expiryDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.automobileLiability?.expiryDate}
          helperText={form.formState.errors.automobileLiability?.expiryDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="automobileLiability.amount"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' {...field}
         error={!!form.formState.errors.automobileLiability?.amount}
          helperText={form.formState.errors.automobileLiability?.amount?.message}
           onKeyDown={preventStringInput} fullWidth label="Amount" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>

  {/* Cargo Liability */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" color='primary' sx={{ mb: 1 }}>Cargo Liability</Typography>
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="cargoLiability.issueDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
        name="cargoLiability.issueDate"
         label="Issue Date"
         value={form.watch('cargoLiability.issueDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.cargoLiability?.issueDate}
          helperText={form.formState.errors.cargoLiability?.issueDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="cargoLiability.expiryDate"
      control={form.control}
      render={({ field }) => (
        <CustomDatePicker size='small'
         name="cargoLiability.expiryDate"
         label="Expiry Date"
         value={form.watch('cargoLiability.expiryDate')}
         onChange={handleDateChange}
         
         error={!!form.formState.errors.cargoLiability?.expiryDate}
          helperText={form.formState.errors.cargoLiability?.expiryDate?.message}
         />
      )}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Controller
      name="cargoLiability.amount"
      control={form.control}
      render={({ field }) => (
        <TextField size='small' 
        {...field}
         error={!!form.formState.errors.cargoLiability?.amount}
          helperText={form.formState.errors.cargoLiability?.amount?.message}
           onKeyDown={preventStringInput} fullWidth label="Amount" InputLabelProps={{ shrink: true }} />
      )}
    />
  </Grid>
  <Divider className="custom-divider" sx={{my:2}} />
  <Grid item xs={12}>
    <Typography variant="h6" color='primary'>Insurer Documents</Typography>
  </Grid>
  <Grid item xs={12} md={12}>
    <InsurerDocsUploadField />
  </Grid>
  </Grid>
  )
}

export default InsuranceForm