import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogActions, TextField, Box, Button, CircularProgress, IconButton, useTheme, alpha, Card, CardContent, Typography, Grid } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from "react-toastify"
import { ITaxOption } from '@/types';
import apiService from '@/service/apiService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { TaxSchema } from './Schema/TaxSchema';
import { HasPermission } from '@/hooks/ProtectedRoute/authUtils';
import ErrorHandlerAlert from '@/components/common/ErrorHandlerAlert';
import { useChartOfAccount } from '@/hooks/useChartOfAccount';
import FormSelect from '@/components/ui/FormSelect';
import ChartAccountForm from '@/pages/chart-accounts-service/ChartAccountForm';
import { ControlledNumericInput } from '@/components/ui/NumericInput';
import { getIcon } from '@/components/common/icons/getIcon';
import { AccountBalance, Percent, Description } from '@mui/icons-material';

interface TaxFormProps {
  showModal: boolean;
  handleModalClose: () => void;
  editingItem: ITaxOption | null;
}

const TaxForm: React.FC<TaxFormProps> = ({ showModal, handleModalClose, editingItem }) => {
  const theme = useTheme();
  const qc = useQueryClient()
  const [showChartModal, setShowChartModal] = useState(false)
  const { chartAccountOptions } = useChartOfAccount({ type: ['liability', 'expense'], removeMasters: ["vendor", "customer"], regularExpression: "TAX", nor: [] })
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, setValue, formState: { errors }, control } = useForm<ITaxOption>({
    resolver: yupResolver(TaxSchema) as any,
  });

  const mutation = useMutation({
    mutationFn: (data: ITaxOption) => {
      if (editingItem?._id) {
        return apiService.updateTaxOption(editingItem._id, data);
      } else {
        return apiService.createTaxOption(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxOptions'] });
      toast.success(editingItem ? 'Tax Option Updated Successfully' : 'Tax Option Created Successfully');
      handleModalClose();
      reset({ label: '', value: 0 });
    },
    onError: (error: any) => {
      console.warn('Error:', error);
      toast.error(error.message);
    }
  });

  const onSubmit: SubmitHandler<ITaxOption> = (data) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (editingItem?._id) {
      setValue('label', editingItem.label);
      setValue('value', editingItem.value);
      setValue('ChartOfAccountId', editingItem.ChartOfAccountId);
      return
    } else {
      reset({ label: '', value: 0, ChartOfAccountId: '' });
      return
    }
  }, [editingItem])
  const OnSuccess = () => {
    setShowChartModal(false)
    qc.invalidateQueries({ queryKey: ['chartAccounts'] });
  }
  return (
    <>
      <HasPermission action="create" resource={["accounting"]} component={
        <Dialog 
          open={showModal} 
          onClose={handleModalClose} 
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
                <Percent sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {editingItem ? 'Edit Tax Option' : 'Add New Tax Option'}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleModalClose}
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
          
          <Box sx={{ px: 3, py: 3 }}>
            <ErrorHandlerAlert error={mutation.error} toast={true} />
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Tax Information Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Description sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Tax Information
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Tax Label"
                            fullWidth
                            placeholder="Enter tax label"
                            {...register('label')}
                            error={!!errors.label}
                            helperText={errors.label?.message}
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
                          <ControlledNumericInput
                            name="value"
                            control={control}
                            label="Tax Rate (%)"
                            fullWidth
                            decimalScale={2}
                            allowNegative={false}
                            thousandSeparator={false}
                            placeholder="0.00"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Account Mapping Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
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
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AccountBalance sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Account Mapping
                        </Typography>
                      </Box>
                      <Controller
                        name="ChartOfAccountId"
                        control={control}
                        rules={{ required: 'Account type is required' }}
                        render={({ field, fieldState, }) => (
                          <FormSelect
                            label="Chart of Account"
                            options={chartAccountOptions}
                            value={chartAccountOptions.find((opt) => opt.value === field.value) || null}
                            onChange={(option) => field.onChange(option?.value || '')}
                            placeholder="Select Chart of Account"
                            isClearable
                            error={fieldState.error?.message}
                            addNewLabel="+ Add New Chart Account"
                            addNewModal={
                              <Dialog 
                                open={showChartModal} 
                                onClose={() => setShowChartModal(false)} 
                                maxWidth="md" 
                                fullWidth
                                PaperProps={{
                                  sx: {
                                    borderRadius: 3,
                                    boxShadow: theme.shadows[8]
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  px: 3,
                                  py: 2.5,
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText'
                                }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Create New Chart Account
                                  </Typography>
                                  <IconButton 
                                    onClick={() => setShowChartModal(false)}
                                    sx={{ 
                                      color: 'inherit',
                                      '&:hover': { 
                                        bgcolor: alpha('#fff', 0.1)
                                      }
                                    }}
                                  >
                                    {getIcon('CloseIcon')}
                                  </IconButton>
                                </Box>
                                <Box sx={{ p: 3 }}>
                                  <ChartAccountForm
                                    initial={undefined}
                                    onSuccess={OnSuccess}
                                  />
                                </Box>
                              </Dialog>
                            }
                            showModal={showChartModal}
                            setShowModal={setShowChartModal}
                            required
                          />
                        )}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button 
                  onClick={handleModalClose} 
                  color="inherit" 
                  disabled={mutation.isPending}
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    px: 3,
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
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={mutation.isPending} 
                  color="primary"
                  startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    py: 1.5,
                    px: 3,
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
                  {mutation.isPending ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Dialog>
      } />
    </>
  )
}

export default TaxForm