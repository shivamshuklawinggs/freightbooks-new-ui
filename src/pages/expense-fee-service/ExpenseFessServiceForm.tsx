import  { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ItemSecviceSchema } from './Schema/ItemSecviceSchema';
import { Dialog, DialogActions, DialogContent,Box, FormControl, FormHelperText, MenuItem, Select, TextField,Button,CircularProgress ,InputLabel, IconButton, Typography, useTheme, alpha, Card, Grid } from '@mui/material';
import { IitemService, IProductService } from '@/types';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { HasPermission } from '@/hooks/ProtectedRoute/authUtils';
import { getIcon } from '@/components/common/icons/getIcon';
import { Description, Category, Settings } from '@mui/icons-material';

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
    const theme = useTheme();
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
        <Dialog 
            open={showModal} 
            onClose={handleModalClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: theme.shadows[8],
                    overflow: 'hidden'
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
                        <Settings sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {editingItem ? 'Edit Item Service' : 'Add New Item Service'}
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
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ px: 3, py: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Label Field */}
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
                                    Service Label
                                </Typography>
                            </Box>
                            <TextField
                                label="Enter service label"
                                fullWidth
                                variant="outlined"
                                size="medium"
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
                        </Card>

                        {/* Service Type Field */}
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
                                <Category sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Service Input Type
                                </Typography>
                            </Box>
                            <FormControl fullWidth error={!!errors.value}>
                                <InputLabel id="service-value-type-label" sx={{ fontWeight: 500 }}>
                                    Select input type
                                </InputLabel>
                                <Select
                                    labelId="service-value-type-label"
                                    label="Select input type"
                                    defaultValue={editingItem?.value}
                                    {...register('value')}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}
                                >
                                    <MenuItem value="string">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>📝</Typography>
                                            <Typography>String</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="number">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>🔢</Typography>
                                            <Typography>Integer</Typography>
                                        </Box>
                                    </MenuItem>
                                </Select>
                                {errors.value && <FormHelperText sx={{ mt: 1 }}>{errors.value.message}</FormHelperText>}
                            </FormControl>
                        </Card>

                        {/* Product/Service Field */}
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
                                <Settings sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Product/Service
                                </Typography>
                            </Box>
                            <FormControl fullWidth error={!!errors.productservice}>
                                <InputLabel id={`productservice-label`} sx={{ fontWeight: 500 }}>
                                    Select product or service
                                </InputLabel>
                                <Select
                                    labelId={`productservice-label`}
                                    label="Select product or service"
                                    defaultValue={editingItem?.productservice}
                                    {...register('productservice')}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}
                                >
                                    {(productServiceData || [])?.map((service:IProductService) => (
                                    <MenuItem key={service._id} value={service._id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>📦</Typography>
                                            <Typography>{service.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                    ))}
                                </Select>
                                {errors.productservice && <FormHelperText sx={{ mt: 1 }}>{errors.productservice.message}</FormHelperText>}
                            </FormControl>
                        </Card>
                    </Box>
                </DialogContent>
                
                {/* Actions */}
                <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button 
                                onClick={handleModalClose} 
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
                        <Grid item xs={6}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={mutation.isPending} 
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
                                    editingItem ? 'Update' : 'Create'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </form>
        </Dialog>
        }/>
    )
}

export default ExpenseFessServiceForm