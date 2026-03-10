import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText, Dialog, DialogContent, Card, CardContent, Stack, IconButton, Tooltip, Alert, DialogActions, useTheme, alpha, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IProductService } from '@/types';
import { ProductServiceData } from '@/data/ProductServiceData';
import apiService from '@/service/apiService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ProductServiceSchema } from './Schema/ProductServiceSchema';
import { CategoryType, } from '@/data/ProductServiceData';
import { useChartOfAccount } from '@/hooks/useChartOfAccount';
import FormSelect from '@/components/ui/FormSelect';
import ChartAccountForm from '../chart-accounts-service/ChartAccountForm';
import { Info as InfoIcon, Inventory as InventoryIcon, AccountBalance as AccountIcon, Description as DescriptionIcon, Close as CloseIcon } from '@mui/icons-material';
import { ControlledNumericInput } from '@/components/ui/NumericInput';
import { getIcon } from '@/components/common/icons/getIcon';
const ProductServiceForm: React.FC<{ showModal: boolean, handleModalClose: () => void, editingItem: IProductService | null }> = ({ showModal, handleModalClose, editingItem }) => {
  const theme = useTheme();
  const queryClient = useQueryClient()
  const [showChartModal, setShowChartModal] = useState(false)
  const expenseAccount = useChartOfAccount({ type: "expense", removeMasters: ["vendor", "customer"], nor: ["DISCOUNT", "TAX"] })
  const incomeAccount = useChartOfAccount({ type: "income", removeMasters: ["vendor", "customer"], nor: ["DISCOUNT", "TAX"] })
  const inventoryAccount = useChartOfAccount({ type: "asset", removeMasters: ["vendor", "customer"], nor: ["DISCOUNT", "TAX"] })
  const { watch, control, reset, handleSubmit, formState: { errors } } = useForm<IProductService>({
    resolver: yupResolver(ProductServiceSchema) as any,
    defaultValues: {
      isUpdate: editingItem?._id ? true : false,
      name: editingItem?.name || '',
      category: editingItem?.category as CategoryType,
      description: editingItem?.description || '',
      incomeAccount: editingItem?.incomeAccount,
      reorderStock: editingItem?.reorderStock || 0,
      OpeningStock: editingItem?.OpeningStock || 0,
      currentLevel: editingItem?.currentLevel || 0,
      inventoryAccount: editingItem?.inventoryAccount,
    }
  });
  const mutation = useMutation({
    mutationFn: async (data: IProductService) => {
      if (editingItem) {
        return await apiService.updateProductServiceData(editingItem._id, data)
      } else {
        return await apiService.createProductServiceData(data)
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? "Product Service Updated Successfully" : "Product Service Added Successfully")
      queryClient.refetchQueries({ queryKey: ["productService"] })
      handleModalClose();
    },
    onError: (error: any) => {
      console.warn(error)
      toast.error(error.message || "Failed to add product service")
    }
  });
  
  const onSubmit = async (data: IProductService) => {
    mutation.mutate(data);
  };
  useEffect(() => {
    if (editingItem) {
      const data = {
        ...editingItem,
        isUpdate: true
      }
      reset(data as IProductService)
      return
    } else if (!editingItem) {
      reset({
        name: '',
        category: '' as CategoryType,
        description: '',
        incomeAccount: '',
        reorderStock: 0,
        OpeningStock: 0,
        currentLevel: 0,
        inventoryAccount: '',
        isUpdate: false
      })
      return
    }
  }, [editingItem, showModal])
  const handleChartAccountSuccess = () => {
    setShowChartModal(false)
    queryClient.invalidateQueries({ queryKey: ['chartAccounts'] })
  }
  const OpeningStocjDisable = () => {
    const isUpdate = watch("isUpdate")
    const oldOpeningStock = editingItem?.OpeningStock || 0
    const category = watch("category")
    if (isUpdate && category == "inventory" && oldOpeningStock > 0) {
      return true
    }
    if (isUpdate && category == "inventory" && oldOpeningStock == 0) {
      return false
    }
    if (!isUpdate) {
      return false
    }
    return true
  }
  const ShowCurrentLevel = () => {
    const isUpdate = watch("isUpdate")
    const oldOpeningStock = editingItem?.OpeningStock || 0
    const category = watch("category")
    if (isUpdate && category == "inventory" && oldOpeningStock > 0) {
      return editingItem?.currentLevel || 0
    }
    if (isUpdate && category == "inventory" && oldOpeningStock == 0) {
      return watch("OpeningStock")
    }
    if (!isUpdate) {
      return watch("OpeningStock")
    }
    return editingItem?.currentLevel || 0
  }
  return (
    <Dialog 
      open={showModal} 
      onClose={handleModalClose} 
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
            <InventoryIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {editingItem ? 'Edit Product/Service' : 'Add New Product/Service'}
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
      
      <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information Section */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
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
                <DescriptionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Basic Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Product/Service Name"
                        placeholder="Enter product or service name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
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
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select 
                          {...field} 
                          label="Category"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        >
                          {
                            ProductServiceData.category.map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {item.value === 'inventory' && <InventoryIcon fontSize="small" />}
                                  {item.label}
                                </Box>
                              </MenuItem>
                            ))
                          }
                        </Select>
                        <FormHelperText>{errors.category?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        placeholder="Enter product or service description"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        multiline
                        rows={3}
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
              </Grid>
            </CardContent>
          </Card>
          {/* Account Details Section */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
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
                <AccountIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Account Details
                </Typography>
                <Tooltip title="Configure the accounts for tracking income, expenses, and inventory">
                  <IconButton size="small" sx={{ color: 'action.active' }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="incomeAccount"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Income Account"
                        options={incomeAccount.chartAccountOptions}
                        value={incomeAccount.chartAccountOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value || '')}
                        placeholder="Select Income Account"
                        error={errors.incomeAccount?.message as string}
                        helperText={errors.incomeAccount?.message as string}
                        addNewLabel="+ Create New Chart Account"
                        showModal={showChartModal}
                        setShowModal={setShowChartModal}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="expenseAccount"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Expense Account"
                        options={expenseAccount.chartAccountOptions}
                        value={expenseAccount.chartAccountOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value || '')}
                        placeholder="Select Expense Account"
                        error={errors.expenseAccount?.message as string}
                        helperText={errors.expenseAccount?.message as string}
                        addNewLabel="+ Create New Chart Account"
                        showModal={showChartModal}
                        setShowModal={setShowChartModal}
                      />
                    )}
                  />
                </Grid>
          {/* Inventory Management Section */}
          {
                  watch("category") === "inventory" && (
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 3,
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
                          <InventoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Inventory Management
                          </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                          <Typography variant="body2">
                            <strong>Inventory Management:</strong> Configure stock levels and tracking for this product.
                          </Typography>
                        </Alert>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={3}>
                            <Controller
                              name="OpeningStock"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type='number'
                                  label="Opening Stock"
                                  placeholder="0"
                                  disabled={OpeningStocjDisable()}
                                  error={!!errors.OpeningStock}
                                  helperText={OpeningStocjDisable() ? "Cannot modify opening stock after initial entry" : errors.OpeningStock?.message}
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

                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Current Level"
                              value={ShowCurrentLevel()}
                              disabled={true}
                              placeholder="0"
                              helperText="Automatically calculated"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <Controller
                              name="reorderStock"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type='number'
                                  label="Reorder Level"
                                  placeholder="0"
                                  error={!!errors.reorderStock}
                                  helperText={errors.reorderStock?.message || "Alert when stock reaches this level"}
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

                          <Grid item xs={12} md={3}>
                            <ControlledNumericInput
                              name="ProductRate"
                              control={control}
                              label="Unit Price"
                              fullWidth
                              decimalScale={2}
                              allowNegative={false}
                              thousandSeparator={false}
                              placeholder="0.00"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Controller
                              name="inventoryAccount"
                              control={control}
                              render={({ field }) => (
                                <FormSelect
                                  label="Inventory Account"
                                  options={inventoryAccount.chartAccountOptions}
                                  value={inventoryAccount.chartAccountOptions.find((option) => option.value === field.value) || null}
                                  onChange={(option) => field.onChange(option?.value || '')}
                                  placeholder="Select Inventory Account"
                                  error={errors.inventoryAccount?.message as string}
                                  helperText={errors.inventoryAccount?.message as string}
                                  addNewLabel="+ Create New Chart Account"
                                  showModal={showChartModal}
                                  setShowModal={setShowChartModal}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )
                }
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleModalClose}
              disabled={mutation.isPending}
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
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : (editingItem ? null : <InventoryIcon />)}
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
              {mutation.isPending ? "Saving..." : (editingItem ? 'Update Product/Service' : 'Create Product/Service')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      {/* Chart Account Modal */}
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
            onSuccess={handleChartAccountSuccess}
          />
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default ProductServiceForm;
