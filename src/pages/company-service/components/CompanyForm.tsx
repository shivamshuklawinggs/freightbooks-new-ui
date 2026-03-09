import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Button, FormControl, RadioGroup, FormControlLabel, Radio, FormLabel, Grid, Avatar } from '@mui/material';
import { ICompany } from '@/types';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { CompanySchema } from '../Schema/CompanySchema';
import { maxinputAllow } from '@/utils';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"; // ✅ free build
import { getFilePreview } from '@/utils/getFilePreview';
import { COMPANY_LOGO_UPLOAD_URL } from '@/config';
import { getIcon } from '@/components/common/icons/getIcon';
// import SignatureDrawer from '@/components/SignatureDrawer';
interface CompanyFormProps { open: boolean; onClose: () => void; initialData?: Partial<ICompany>; title: string; }
const CompanyForm: React.FC<CompanyFormProps> = ({ open, onClose, initialData, title, }) => {
    // const [drawerOpen, setDrawerOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset, watch,
    control,
    formState: { errors }
  } = useForm<ICompany>({
    resolver: yupResolver(CompanySchema) as any,
    defaultValues: {
      label: initialData?.label || '',
      description: initialData?.description || '',
      type: initialData?.type || 'OTHER',
      color: initialData?.color || '#FF0000',
      logo: initialData?.logo || null,
      termsandconditions: initialData?.termsandconditions || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      prefix: initialData?.prefix || '',
      mcNumber: initialData?.mcNumber || '',
      usdot: initialData?.usdot || '',
      signature: initialData?.signature || '',
      
    }
  });

  const mutation = useMutation({
    mutationFn: (data: ICompany) => {
      const formData = new FormData();
      formData.append('label', data.label);
      formData.append('description', data.description || "");
      formData.append('type', data.type);
      formData.append('color', data.color);
      formData.append('prefix', data.prefix);
      formData.append('mcNumber', data.mcNumber);
      formData.append('usdot', data.usdot);
    
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      formData.append('termsandconditions', data.termsandconditions);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('address', data.address);
      // ✅ include signature (Base64)
      if (data.signature) formData.append('signature', data.signature);

      if (initialData?._id) {
        return apiService.updateCompany(initialData._id, formData);
      }
      return apiService.createCompany(formData);
    },
    onSuccess: async (response) => {
      toast.success(initialData?._id ? 'Company updated successfully' : response.message);
      await queryClient.invalidateQueries({ queryKey: ['company'] });
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      onClose();
      reset({
        label: response.data.label,
        description: response.data.description,
        type: response.data.type,
        color: response.data.color,
        logo: response.data?.logo,
        termsandconditions: response.data?.termsandconditions,
        phone: response.data?.phone,
        email: response.data?.email,
        address: response.data?.address,
        prefix: response.data?.address,
        mcNumber: response.data?.mcNumber,
        usdot: response.data?.usdot,
      });
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    }
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        label: '',
        description: '',
        type: 'OTHER',
        color: '#FF0000',
        logo: null,
        termsandconditions: '',
        phone: '',
        email: '',
        address: '',
        prefix: '',
        mcNumber: '',
        usdot: '',
      });
    }
  }, [initialData, reset]);
  const onSubmit = (data: ICompany) => {
    mutation.mutate(data);
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  console.error("errors", errors)
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogActions>
        <Button onClick={handleClose}>
          {getIcon('CloseIcon')}
        </Button>
      </DialogActions>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Grid container spacing={2} direction={"row"}>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('label')}
                  label="Name"
                  error={!!errors.label}
                  helperText={errors.label?.message}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('prefix')}
                  label="Abbreviation/Prefix"
                  error={!!errors.prefix}
                  helperText={errors.prefix?.message}
                  required
                  fullWidth
                />
              </Grid>
              {
                watch("type")!=="OTHER" &&  <>
                 <Grid item xs={12} md={6}>
                <TextField
                  {...register('mcNumber')}
                  label="MC-Number"
                  error={!!errors.mcNumber}
                  helperText={errors.mcNumber?.message}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('usdot')}
                  label="USDOT Number"
                  error={!!errors.usdot}
                  helperText={errors.usdot?.message}
                  required
                  fullWidth
                />
              </Grid>
                </>
              
              }
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('email')}
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  required
                  fullWidth
                />
              </Grid>
              {/* phone */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone"
                      onChange={(e) => {
                        maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                        field.onChange(e);
                      }}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      size='small'
                    />
                  )}
                />
              </Grid>
              {/* address */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('address')}
                  value={watch('address')}
                  label="Address"
                  multiline
                  rows={2}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.logo}>
                  <FormLabel>Company Logo</FormLabel>
                  <Controller
                    name="logo"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Avatar
                          src={getFilePreview(field.value as any, COMPANY_LOGO_UPLOAD_URL) as string}
                          sx={{ width: 56, height: 56 }}
                        />
                        <Button variant="contained" component="label">
                          Upload File
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                          />
                        </Button>
                      </Box>
                    )}
                  />
                  {errors.logo && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.logo.message}</p>}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={12}>
                <Controller
                  name="termsandconditions"
                  control={control}
                  render={({ field }) => (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={field.value || ""}
                      onChange={(_, editor) => {
                        const data = editor.getData();
                        field.onChange(data);
                      }}
                      onBlur={() => field.onBlur()}
                    />
                  )}
                />
                {errors.termsandconditions && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.termsandconditions.message}</p>}
              </Grid>

              <Grid item xs={12} md={12}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <RadioGroup
                        row
                        {...field}
                        sx={{ gap: 2 }}
                      >
                        <FormControlLabel value="BROKER" control={<Radio />} label="Broker" />
                        <FormControlLabel value="DISPATCH" control={<Radio />} label="Dispatch" />
                        <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.color}>
                      <FormLabel>Company Color</FormLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        {/* <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            border: '2px solid #ddd',
                            backgroundColor: field.value,
                          }}
                        /> */}
                        {/* <TextField
                          {...field}
                          type="color"
                          sx={{ width: 150 }}
                          error={!!errors.color}
                          helperText={errors.color?.message}
                        /> */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
                          ].map((color) => (
                            <Box
                              key={color}
                              onClick={() => field.onChange(color)}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: field.value === color ? '2px solid #000' : '1px solid #ddd',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.2)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </FormControl>
                  )}
                />
              </Grid>
                 {/* ✅ Signature Field */}
              {/* <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Signature</FormLabel>
                  <Controller
                    name="signature"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        {field.value ? (
                          <img
                            src={field.value}
                            alt="Signature"
                            style={{ width: '150px', height: '60px', border: '1px solid #ddd', objectFit: 'contain' }}
                          />
                        ) : (
                          <Box sx={{
                            width: 150, height: 60, border: '1px dashed #aaa',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <span style={{ color: '#777', fontSize: '0.8rem' }}>No Signature</span>
                          </Box>
                        )}
                        <Button variant="contained" onClick={() => setDrawerOpen(true)}>
                          {field.value ? 'Edit Signature' : 'Add Signature'}
                        </Button>
                      </Box>
                    )}
                  />
                </FormControl>
              </Grid> */}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
       {/* ✅ Signature Drawer */}
      {/* <SignatureDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
          defaultSignature={watch("signature")} // 👈 preloads existing signature

        onSave={(dataUrl) => {
          setValue('signature', dataUrl);
          setDrawerOpen(false);
        }}
      /> */}
    </Dialog>
  );
};

export default CompanyForm;
