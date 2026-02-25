import  { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ItemSecviceSchema } from './Schema/ItemSecviceSchema';
import { Dialog, DialogActions, DialogContent, DialogTitle,Box, FormControl, FormHelperText, MenuItem, Select, TextField,Button,CircularProgress ,InputLabel} from '@mui/material';
import { IitemService, IProductService } from '@/types';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { HasPermission } from '@/hooks/ProtectedRoute/authUtils';

type FormInputs = {
  label: string;
  value: 'string' | 'number';
  productservice: string;
};
interface ExpenseFessServiceFormProps {
    showModal: boolean;
    handleModalClose: () => void;
    editingItem: IitemService | null;
   
}
const ExpenseFessServiceForm = ({ showModal, handleModalClose, editingItem }: ExpenseFessServiceFormProps) => {
    const queryClient=useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInputs>({
        resolver: yupResolver(ItemSecviceSchema) as any,
        defaultValues: {
          label: '',
          value: 'string',
          productservice: '',
        },
      });

    const mutation = useMutation({
        mutationFn: (data: FormInputs) => {
            if (editingItem?._id) {
                return apiService.updateItemService(editingItem._id, data);
            } else {
                return apiService.createItemService(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['itemServices'] });
            toast.success(editingItem ? 'Item Service updated successfully' : 'Item Service created successfully');
            handleModalClose();
            reset();
        },
        onError: (error: any) => {
            console.warn('Error:', error);
            toast.error(error.message || 'An error occurred');
        }
    });

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        mutation.mutate(data);
    };

    useEffect(() => {
        if (editingItem) {
            setValue('label', editingItem.label);
            setValue('value', editingItem.value as 'string' | 'number');
            setValue('productservice', editingItem.productservice);
        }else if(!editingItem){
            reset(
                {
                    label: '',
                    value: 'string',
                    productservice: '',
                }
            );
        }
    }, [editingItem, setValue, reset]);
  const {data:productServiceData} = useQuery({
    queryKey: ['productService'],
    queryFn: async() => {
        const response = await apiService.getProductServiceData();
        return response.data;
    },
  });

    return (
        <HasPermission action="create" resource={["expense_service"]} component={
        <Dialog open={showModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editingItem ? 'Edit' : 'Add New'} Item Service</DialogTitle>
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

                        <FormControl fullWidth error={!!errors.value}>
                            <InputLabel id="service-value-type-label">Service Input Type</InputLabel>
                            <Select
                                labelId="service-value-type-label"
                                label="Service Input Type"
                                defaultValue={editingItem?.value}
                                {...register('value')}
                            >
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="number">Integer</MenuItem>
                            </Select>
                            {errors.value && <FormHelperText>{errors.value.message}</FormHelperText>}
                        </FormControl>
                          <FormControl fullWidth error={!!errors.productservice}>
                        <InputLabel id={`productservice-label`}>Product/Service</InputLabel>
                        <Select
                            labelId={`productservice-label`}
                            label="Product/Service"
                            defaultValue={editingItem?.productservice}
                            {...register('productservice')}
                            variant="outlined"
                        >
                            {(productServiceData || [])?.map((service:IProductService) => (
                            <MenuItem key={service._id} value={service._id}>
                                {service.name}
                            </MenuItem>
                            ))}
                        </Select>
                        {errors.productservice && <FormHelperText>{errors.productservice.message}</FormHelperText>}
                        </FormControl>

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
        }/>
    )
}

export default ExpenseFessServiceForm