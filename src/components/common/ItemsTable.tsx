import React, { ChangeEvent } from 'react';
import {
  Box, Typography, IconButton, TextField, Select, MenuItem, Button,
  Grid, Paper, Stack, SelectChangeEvent, FormControl, InputLabel, FormHelperText
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import apiService from '@/service/apiService';
import { preventStringInput } from '@/utils';
import { NumericFormat } from 'react-number-format';
import { invoiceexpense, IInvoice } from '@/types';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { calculateexpenseAmount, serviceGetQuery } from '@/utils/calculateInvoiceAndBillSummary';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const columnSize = {
  service: 2,
  description: 2,
  tax: 2,
  account: 1,
  qty: 1,
  rate: 1,
  discount: 1,
  amount: 1,
  delete: 1,
};

interface ItemsTableProps {
  handleTaxModalShow: () => void;
  handleProductServiceModalShow: () => void;
  type: 'invoice' | 'bill';
}

const ItemsTable: React.FC<ItemsTableProps> = ({ handleTaxModalShow, handleProductServiceModalShow, type }) => {
  const form = useFormContext<IInvoice>();
  const { watch, setValue, formState: { errors }, control } = form;
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "expense"
  });
   const productServiceArray=watch("productServiceArray");
  const fetchItemServices = async () => {
    try {
      const response = await apiService.getProductServiceData();
      setValue("productServiceArray", response.data);
      return response.data;
    } catch (err) {
      setValue("productServiceArray", []);
      return [];
    }
  };

  useQuery({
    queryKey: ['productService'],
    queryFn: fetchItemServices,
  });

  const newExpense: invoiceexpense = {
    productservice: "", description: "", qty: 0, rate: 0, tax: "", amount: 0, readonly: false
  };

  const handleExpenseChange = (index: number, field: keyof invoiceexpense) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const value = field === 'qty' || field === 'rate' || field === 'amount'
      ? Number(e.target.value) || 0
      : e.target.value;
    if (field == "productservice" && fields[index].productservice === value) {
      toast.error("Service already exist");
      return;
    }
  
    const currentExpense = fields[index];
    if (field == "productservice" && value) {
      const isExist=productServiceArray.find((item)=>item._id==value)?.ProductRate || 0
      if(isExist){
          currentExpense["rate"]=isExist
      }
    }
    const updatedExpense = {
      ...currentExpense,
      [field]: value
    };
    update(index, updatedExpense);
  };

  const handleAddExpense = () => {
    append(newExpense);
  };

  const handleRemoveExpense = (index: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      remove(index);
    }
  };

  return (
    <Grid item xs={12}>
      <Box>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {fields.map((expense, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.light',
                  transition: 'all 0.2s ease-in-out'
                },
                ...(expense.readonly && {
                  bgcolor: 'action.selected',
                  borderColor: 'primary.main',
                })
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <React.Fragment>
                  {/* Service Field */}
                  <Grid item xs={12} md={columnSize.service} lg={columnSize.service}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`productservice-label-${index}`}>Product/Service</InputLabel>
                      <Select
                        labelId={`productservice-label-${index}`}
                        value={expense.productservice}
                        label="Product/Service"
                        onChange={handleExpenseChange(index, 'productservice')}
                        disabled={expense.readonly}
                        error={Boolean(errors?.expense?.[index]?.productservice)}
                        variant="outlined"
                      >
                        <MenuItem value="">
                          <em>Select Product/Service</em>
                        </MenuItem>
                        <MenuItem value="" onClick={handleProductServiceModalShow}>
                          <Typography color="primary" sx={{ fontWeight: 500 }}>
                            + Add New Product/Service
                          </Typography>
                        </MenuItem>
                        {(watch('productServiceArray') || [])?.map((service) => (
                          <MenuItem key={service._id} value={service._id}>
                            {service.name}
                            {service.category == "inventory" && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (Stock: {service.currentLevel})
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors?.expense?.[index]?.productservice && (
                        <FormHelperText error>
                          {errors.expense[index].productservice.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Account Field */}
                  <Grid item xs={12} md={columnSize.account} lg={columnSize.account}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Account"
                      value={serviceGetQuery(expense.productservice, form as any, type)}
                      disabled={true}
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        },
                      }}
                    />
                  </Grid>

                  {/* Quantity Field */}
                  <Grid item xs={12} md={columnSize.qty} lg={columnSize.qty}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Qty"
                      onKeyDown={preventStringInput}
                      value={expense.qty}
                      error={Boolean(errors?.expense?.[index]?.qty)}
                      helperText={errors?.expense?.[index]?.qty?.message}
                      onChange={handleExpenseChange(index, 'qty')}
                      disabled={expense.readonly}
                      variant="outlined"
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>

                  {/* Rate Field */}
                  <Grid item xs={12} md={columnSize.rate} lg={columnSize.rate}>
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      size="small"
                      label="Rate"
                      value={expense.rate}
                      error={Boolean(errors?.expense?.[index]?.rate)}
                      helperText={errors?.expense?.[index]?.rate?.message}
                      onValueChange={(values: { floatValue?: number; formattedValue: string; value: string }) => {
                        // Create a proper synthetic event that matches the expected interface
                        const syntheticEvent = {
                          target: { value: values.floatValue || 0 }
                        } as unknown as ChangeEvent<HTMLInputElement>;
                        handleExpenseChange(index, 'rate')(syntheticEvent);
                      }}
                      disabled={expense.readonly}
                      variant="outlined"
                      thousandSeparator={false}
                      decimalScale={2}
                      allowNegative={true}
                      inputProps={{ step: 0.01 }}
                    />
                  </Grid>

                  {/* Tax Field */}
                  <Grid item xs={12} md={columnSize.tax} lg={columnSize.tax}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`tax-label-${index}`}>Tax</InputLabel>
                      <Select
                        labelId={`tax-label-${index}`}
                        value={expense.tax}
                        label="Tax"
                        onChange={handleExpenseChange(index, 'tax')}
                        disabled={expense.readonly}
                        error={Boolean(errors?.expense?.[index]?.tax)}
                        variant="outlined"
                      >
                        <MenuItem value="">
                          <em>No Tax</em>
                        </MenuItem>
                        <MenuItem value="" onClick={handleTaxModalShow}>
                          <Typography color="primary" sx={{ fontWeight: 500 }}>
                            + Add New Tax
                          </Typography>
                        </MenuItem>
                        {(watch("taxArray") || [])?.map((service) => (
                          <MenuItem key={service._id} value={service._id}>
                            {`${service.label} (${service.value}%)`}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors?.expense?.[index]?.tax && (
                        <FormHelperText error>
                          {errors.expense[index].tax.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Amount Field */}
                  <Grid item xs={12} md={columnSize.amount} lg={columnSize.amount}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Amount"
                      error={Boolean(errors?.expense?.[index]?.amount)}
                      helperText={errors?.expense?.[index]?.amount?.message}
                      value={calculateexpenseAmount(expense, watch()).toFixed(2)}
                      disabled={true}
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.8)',
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                      }}
                    />
                  </Grid>

                  {/* Description Field */}
                  <Grid item xs={12} md={columnSize.description} lg={columnSize.description}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      error={Boolean(errors?.expense?.[index]?.description)}
                      helperText={errors?.expense?.[index]?.description?.message}
                      value={expense.description}
                      onChange={handleExpenseChange(index, 'description')}
                      disabled={expense.readonly}
                      variant="outlined"
                      multiline
                      maxRows={2}
                    />
                  </Grid>

                  {/* Delete Button */}
                  <Grid item xs={12} md={columnSize.delete} lg={columnSize.delete}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        color="error"
                        disabled={expense.readonly}
                        onClick={() => handleRemoveExpense(index)}
                        size="small"
                        sx={{
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </React.Fragment>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddExpense}
              size="medium"
              sx={{
                minWidth: 150,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Add Product/Service
            </Button>
          </Box>
        </Stack>
      </Box>
    </Grid>
  );
};

export default ItemsTable;
