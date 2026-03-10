import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText, DialogTitle, Dialog, DialogContent, Card, CardContent, Stack, IconButton, Tooltip, Alert, DialogActions } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IProductService } from '@/types';
import { ProductServiceData } from '@/data/ProductServiceData';
import apiService from '@/service/apiService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ProductServiceSchema } from './Schema/ProductServiceSchema';
import { CategoryType, } from '@/data/ProductServiceData';
import { useChartOfAccount } from '@/hooks/useChartOfAccount';
import FormSelect from '@/components/ui/FormSelect';
import ChartAccountForm from '../chart-accounts-service/ChartAccountForm';
import { Info as InfoIcon, Inventory as InventoryIcon, AccountBalance as AccountIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { ControlledNumericInput } from '@/components/ui/NumericInput';
import { getIcon } from '@/components/common/icons/getIcon';
const ProductServiceForm: React.FC<{ showModal: boolean, handleModalClose: () => void, editingItem: IProductService | null }> = ({ showModal, handleModalClose, editingItem }) => {
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
  const onSubmit = async (data: IProductService) => {

    // Add your form submission logic here
    try {
      if (editingItem) {
        await apiService.updateProductServiceData(editingItem._id, data)
        toast.success("Product Service Updated Successfully")
      } else {

        await apiService.createProductServiceData(data)
        toast.success("Product Service Added Successfully")
      }

      queryClient.refetchQueries({ queryKey: ["productService"] })
      handleModalClose();
    } catch (error: any) {
      console.warn(error)
      toast.error(error.message || "Failed to add product service")
    }
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
    <Dialog open={showModal} onClose={handleModalClose} maxWidth="lg" fullWidth>
      <DialogActions>
        <IconButton onClick={handleModalClose} size="small">
          {getIcon('CloseIcon')}
        </IconButton>
      </DialogActions>
      <DialogTitle sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {editingItem ? 'Edit' : 'Add New'} Product/Service

      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information Section */}
          <Card sx={{ m: 3, mb: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Basic Information</Typography>
              </Stack>

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
                        InputProps={{
                          startAdornment: <InventoryIcon sx={{ mr: 1, color: 'action.active' }} />
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
                        <Select {...field} label="Category">
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
                        InputProps={{
                          startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 2, color: 'action.active' }} />
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Account Details Section */}
          <Card sx={{ mx: 3, mb: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <AccountIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Account Details</Typography>
                <Tooltip title="Configure the accounts for tracking income, expenses, and inventory">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

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
                {
                  watch("category") === "inventory" && (
                    <>
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Inventory Management:</strong> Configure stock levels and tracking for this product.
                          </Typography>
                        </Alert>
                      </Grid>

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
                              InputProps={{
                                startAdornment: <InventoryIcon sx={{ mr: 1, color: 'action.active' }} />
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
                          InputProps={{
                            startAdornment: <InventoryIcon sx={{ mr: 1, color: 'action.active' }} />
                          }}
                          helperText="Automatically calculated"
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
                              InputProps={{
                                startAdornment: <InventoryIcon sx={{ mr: 1, color: 'action.active' }} />
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        {/* <Controller
                    name="ProductRate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='number'
                        label="Unit Price"
                        placeholder="0.00"
                        error={!!errors.ProductRate}
                        helperText={errors.ProductRate?.message || "Default selling price per unit"}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>$</Typography>
                        }}
                      />
                    )}
                  /> */}
                        <ControlledNumericInput
                          name="ProductRate"
                          control={control}
                          label="Value"
                          fullWidth
                          decimalScale={2}
                          allowNegative={false}
                          thousandSeparator={false}
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>$</Typography>
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={12}>
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
                    </>
                  )
                }
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleModalClose}
                size="large"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                size="large"
                startIcon={editingItem ? null : <InventoryIcon />}
              >
                {editingItem ? 'Update Product/Service' : 'Create Product/Service'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <Dialog open={showChartModal} onClose={() => setShowChartModal(false)} maxWidth="md" fullWidth>
        <DialogActions>
          <IconButton onClick={() => setShowChartModal(false)} size="small">
            {getIcon('CloseIcon')}
          </IconButton>
        </DialogActions>
        <ChartAccountForm
          initial={undefined}
          onSuccess={handleChartAccountSuccess}
        />
      </Dialog>
    </Dialog>
  );
};

export default ProductServiceForm;
