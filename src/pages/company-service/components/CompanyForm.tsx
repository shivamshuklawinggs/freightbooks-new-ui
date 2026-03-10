import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, DialogContent, DialogActions, TextField, Box, Button, FormControl, RadioGroup, FormControlLabel, Radio, Grid, Avatar, Typography, useTheme, alpha, Card, IconButton, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
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
import { Business, Phone, Palette, Description, Upload, Brush } from '@mui/icons-material';
import SignatureDrawer from '@/components/SignatureDrawer';
// import SignatureDrawer from '@/components/SignatureDrawer';
interface CompanyFormProps { open: boolean; onClose: () => void; initialData?: Partial<ICompany>; title: string; }
const CompanyForm: React.FC<CompanyFormProps> = ({ open, onClose, initialData, title, }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset, watch,
    setValue,
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
    setActiveStep(0);
    onClose();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };
  console.error("errors", errors)
  
  const steps = [
    {
      label: 'Basic Information',
      icon: <Business />,
    },
    {
      label: 'Contact Details',
      icon: <Phone />,
    },
    {
      label: 'Branding',
      icon: <Palette />,
    },
    {
      label: 'Terms & Conditions',
      icon: <Description />,
    },
    {
      label: 'Signature',
      icon: <Brush />,
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
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
            <Business sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {title}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose}
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
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ px: 0, py: 0, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <Grid container>
            {/* Stepper Sidebar */}
            <Grid item xs={12} md={3} sx={{ 
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.3),
              px: 2,
              py: 3
            }}>
              <Stepper 
                activeStep={activeStep} 
                orientation="vertical"
                sx={{
                  '& .MuiStepLabel-root': {
                    cursor: 'pointer'
                  },
                  '& .MuiStepConnector-root': {
                    ml: 2
                  }
                }}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel 
                      onClick={() => handleStepClick(index)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          fontWeight: activeStep === index ? 600 : 500,
                          color: activeStep === index ? 'primary.main' : 'text.secondary'
                        },
                        '&:hover .MuiStepLabel-label': {
                          color: 'primary.main'
                        }
                      }}
                      icon={step.icon}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            
            {/* Form Content */}
            <Grid item xs={12} md={9} sx={{ px: 3, py: 3 }}>
              {activeStep === 0 && (
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Basic Information Section */}
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
                      <Business sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Basic Information
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('label')}
                          label="Company Name"
                          placeholder="Enter company name"
                          error={!!errors.label}
                          helperText={errors.label?.message}
                          required
                          fullWidth
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
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('prefix')}
                          label="Abbreviation/Prefix"
                          placeholder="Enter abbreviation"
                          error={!!errors.prefix}
                          helperText={errors.prefix?.message}
                          required
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="type"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Business sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  Company Type
                                </Typography>
                              </Box>
                              <RadioGroup
                                row
                                {...field}
                                sx={{ gap: 3 }}
                              >
                                <FormControlLabel 
                                  value="BROKER" 
                                  control={<Radio sx={{ color: 'primary.main' }} />} 
                                  label="Broker" 
                                  sx={{ 
                                    '& .MuiFormControlLabel-label': { fontWeight: 500 },
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }
                                  }}
                                />
                                <FormControlLabel 
                                  value="DISPATCH" 
                                  control={<Radio sx={{ color: 'primary.main' }} />} 
                                  label="Dispatch" 
                                  sx={{ 
                                    '& .MuiFormControlLabel-label': { fontWeight: 500 },
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }
                                  }}
                                />
                                <FormControlLabel 
                                  value="OTHER" 
                                  control={<Radio sx={{ color: 'primary.main' }} />} 
                                  label="Other" 
                                  sx={{ 
                                    '& .MuiFormControlLabel-label': { fontWeight: 500 },
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }
                                  }}
                                />
                              </RadioGroup>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      {watch("type") !== "OTHER" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              {...register('mcNumber')}
                              label="MC-Number"
                              placeholder="Enter MC number"
                              error={!!errors.mcNumber}
                              helperText={errors.mcNumber?.message}
                              required
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              {...register('usdot')}
                              label="USDOT Number"
                              placeholder="Enter USDOT number"
                              error={!!errors.usdot}
                              helperText={errors.usdot?.message}
                              required
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Card>
                </Box>
              )}
              
              {activeStep === 1 && (
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Contact Information Section */}
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
                      <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Contact Information
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          {...register('email')}
                          label="Email Address"
                          placeholder="Enter email address"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          required
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Phone Number"
                              placeholder="Enter phone number"
                              onChange={(e) => {
                                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                                field.onChange(e);
                              }}
                              error={!!errors.phone}
                              helperText={errors.phone?.message}
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
                      <Grid item xs={12}>
                        <TextField
                          {...register('address')}
                          value={watch('address')}
                          label="Address"
                          placeholder="Enter company address"
                          multiline
                          rows={2}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                          required
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Box>
              )}
              
              {activeStep === 2 && (
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Visual Branding Section */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                          },
                          height: '100%'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Upload sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Company Logo
                          </Typography>
                        </Box>
                        <FormControl fullWidth error={!!errors.logo}>
                          <Controller
                            name="logo"
                            control={control}
                            render={({ field }) => (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={getFilePreview(field.value as any, COMPANY_LOGO_UPLOAD_URL) as string}
                                  sx={{ 
                                    width: 64, 
                                    height: 64,
                                    border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                  }}
                                >
                                  <Business sx={{ fontSize: 32, color: 'text.secondary' }} />
                                </Avatar>
                                <Button 
                                  variant="outlined" 
                                  component="label"
                                  startIcon={<Upload />}
                                  sx={{
                                    borderRadius: 2,
                                    borderColor: alpha(theme.palette.primary.main, 0.5),
                                    '&:hover': {
                                      borderColor: theme.palette.primary.main,
                                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                                    }
                                  }}
                                >
                                  Upload Logo
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
                          {errors.logo && (
                            <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1, ml: 1 }}>
                              {errors.logo.message}
                            </Typography>
                          )}
                        </FormControl>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                          },
                          height: '100%'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Palette sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Company Color
                          </Typography>
                        </Box>
                        <FormControl fullWidth error={!!errors.color}>
                          <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      border: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
                                      backgroundColor: field.value,
                                      boxShadow: `0 2px 8px ${alpha(field.value, 0.3)}`
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                    {field.value}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {[
                                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
                                    '#FF6B9D', '#C44569', '#2ECC71', '#3498DB', '#9B59B6'
                                  ].map((color) => (
                                    <Box
                                      key={color}
                                      onClick={() => field.onChange(color)}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        cursor: 'pointer',
                                        border: field.value === color ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          transform: 'scale(1.15)',
                                          boxShadow: `0 2px 8px ${alpha(color, 0.5)}`
                                        },
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                          />
                          {errors.color && (
                            <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                              {errors.color.message}
                            </Typography>
                          )}
                        </FormControl>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {activeStep === 3 && (
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Terms & Conditions Section */}
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
                      <Description sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Terms & Conditions
                      </Typography>
                    </Box>
                    <Controller
                      name="termsandconditions"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{
                          '& .ck-editor__editable': {
                            minHeight: 250,
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            '&:focus': {
                              borderColor: theme.palette.primary.main
                            }
                          }
                        }}>
                          <CKEditor
                            editor={ClassicEditor as any}
                            data={field.value || ""}
                            onChange={(_, editor) => {
                              const data = editor.getData();
                              field.onChange(data);
                            }}
                            onBlur={() => field.onBlur()}
                            config={{
                              toolbar: [
                                'heading', '|',
                                'bold', 'italic', 'underline', '|',
                                'bulletedList', 'numberedList', '|',
                                'link', '|',
                                'undo', 'redo'
                              ],
                              placeholder: 'Enter terms and conditions...'
                            }}
                          />
                        </Box>
                      )}
                    />
                    {errors.termsandconditions && (
                      <Typography sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                        {errors.termsandconditions.message}
                      </Typography>
                    )}
                  </Card>
                </Box>
              )}
              
              {activeStep === 4 && (
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Signature Section */}
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 3,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Brush sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Digital Signature
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                        Add your digital signature to authenticate the company information and terms.
                      </Typography>
                      
                      <FormControl fullWidth>
                        <Controller
                          name="signature"
                          control={control}
                          render={({ field }) => (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              {field.value ? (
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={field.value}
                                    alt="Signature"
                                    style={{ 
                                      width: '300px', 
                                      height: '120px', 
                                      border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                                      objectFit: 'contain',
                                      borderRadius: 2,
                                      backgroundColor: 'white',
                                      boxShadow: theme.shadows[2]
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Box sx={{
                                  width: 300, 
                                  height: 120, 
                                  border: `2px dashed ${alpha(theme.palette.divider, 0.4)}`,
                                  borderRadius: 2,
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                                  flexDirection: 'column',
                                  gap: 1
                                }}>
                                  <Brush sx={{ fontSize: 32, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    No Signature Added
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Click below to add signature
                                  </Typography>
                                </Box>
                              )}
                              <Button 
                                variant="contained" 
                                startIcon={<Brush />}
                                onClick={() => setDrawerOpen(true)}
                                size="large"
                                sx={{
                                  px: 4,
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
                                {field.value ? 'Edit Signature' : 'Add Signature'}
                              </Button>
                            </Box>
                          )}
                        />
                      </FormControl>
                    </Box>
                  </Card>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Button 
                onClick={handleClose} 
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
            <Grid item xs={12} md={3}>
              <Button 
                onClick={handleBack}
                disabled={activeStep === 0 || mutation.isPending}
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
                Back
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                onClick={handleNext}
                disabled={activeStep === steps.length - 1 || mutation.isPending}
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                Next
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={mutation.isPending || activeStep !== steps.length - 1} 
                color="primary"
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
                  'Save Company'
                )}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Box>
      
      {/* Signature Drawer */}
      <SignatureDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        defaultSignature={watch("signature")}
        onSave={(dataUrl) => {
          setValue('signature', dataUrl);
          setDrawerOpen(false);
        }}
      />
    </Dialog>
  );
};

export default CompanyForm;
