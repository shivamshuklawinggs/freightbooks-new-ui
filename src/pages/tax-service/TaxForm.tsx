import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Button, CircularProgress, IconButton } from '@mui/material';
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

interface TaxFormProps {
  showModal: boolean;
  handleModalClose: () => void;
  editingItem: ITaxOption | null;
}

const TaxForm: React.FC<TaxFormProps> = ({ showModal, handleModalClose, editingItem }) => {
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
        <Dialog open={showModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
          <DialogActions>
            <IconButton onClick={handleModalClose} size="small">
              {getIcon('CloseIcon')}
            </IconButton>
          </DialogActions>
          <DialogTitle>{editingItem ? 'Edit' : 'Add New'} Tax Option</DialogTitle>
          <ErrorHandlerAlert error={mutation.error} toast={true} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Label"
                  fullWidth
                  {...register('label')}
                  error={!!errors.label}
                  helperText={errors.label?.message}
                />
                {/* <TextField
                  label="Value"
                  fullWidth
                  type="number"
                  {...register('value')}
                  error={!!errors.value}
                  helperText={errors.value?.message}
                /> */}
                <ControlledNumericInput
                  name="value"
                  control={control}
                  label="Value"
                  fullWidth
                  decimalScale={2}
                  allowNegative={false}
                  thousandSeparator={false}
                  placeholder="0.00"
                />
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
                        <Dialog open={showChartModal} onClose={() => setShowChartModal(false)} maxWidth="md" fullWidth>
                          <ChartAccountForm
                            initial={undefined}
                            onSuccess={OnSuccess}
                          />
                        </Dialog>
                      }
                      showModal={showChartModal}
                      setShowModal={setShowChartModal}
                      required
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModalClose} color="inherit" disabled={mutation.isPending}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending} color="primary">
                {mutation.isPending ? <CircularProgress size={24} /> : (editingItem ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      } />
    </>
  )
}

export default TaxForm