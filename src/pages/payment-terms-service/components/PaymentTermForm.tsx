import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Button } from '@mui/material';
import { IPaymentTerm } from '@/types';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { paymentTermSchema,PaymentTermFormData } from '../Schema/paymentTermSchema';
import { HasPermission } from '@/hooks/ProtectedRoute/authUtils';


interface PaymentTermFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<IPaymentTerm>;
  title: string;
  onSuccess?: () => void;
  customerId?: string;
}

const PaymentTermForm: React.FC<PaymentTermFormProps> = ({
  open,
  onClose,
  initialData,
  title,
  onSuccess,
  customerId
}) => {
  const queryClient=useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PaymentTermFormData>({
    resolver: yupResolver(paymentTermSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      days: initialData?.days || 0,
        }
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentTermFormData) => {
      if (initialData?._id) {
        return apiService.updatePaymentTerm(initialData._id, { ...data, _id: initialData._id },customerId);
      } else {
        const { _id, ...restData } = data;
        return apiService.createPaymentTerm({ ...restData },customerId);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['paymenterms'] });
      toast.success(initialData?._id ? 'Payment term updated successfully' : 'Payment term created successfully');
      onSuccess?.();
      onClose();
      reset();
    },
    onError: (error: any) => {
      console.warn(error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    }
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }else{
        reset({
            name: '',
            description: '',
            days: 0,
        });
    }
  }, [initialData, reset]);
 console.warn(errors)
  const onSubmit = (data: PaymentTermFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <HasPermission action="create" resource={["accounting"]} component={
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={(e) => {
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              {...register('name')}
              label="Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              required
              fullWidth
            />
            <TextField
              {...register('description')}
              label="Description"
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
            />
            <TextField
              {...register('days')}
              label="Days"
              type="number"
              error={!!errors.days}
              helperText={errors.days?.message}
              required
              fullWidth
            />
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
    </Dialog>
    }/>
  );
};

export default PaymentTermForm;
