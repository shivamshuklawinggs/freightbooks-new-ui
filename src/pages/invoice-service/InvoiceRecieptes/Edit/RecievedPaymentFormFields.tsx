import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Grid, Select, MenuItem, FormControl, InputLabel, FormHelperText, Tooltip, Dialog } from '@mui/material';
import { PaymentMethodsOptions } from '@/types/enum';
import SearchInvoice from './SearchInvoice';
import { useCreditLeft } from './hooks/useCreditLeft';
import useDepositToOptions from '@/hooks/DepositToOptions';
import ChartAccountForm from '@/pages/chart-accounts-service/ChartAccountForm';
import { useQueryClient } from '@tanstack/react-query';
import { UpdateRecievedPamentSchemaType } from '../schema/UpdateRecievedPamentSchema';
import { getFullName } from '@/utils';
import CustomDatePicker from '@/components/common/CommonDatePicker';

interface RecievedPaymentFormFieldsProps {
    isLoading: boolean;
}

const RecievedPaymentFormFields: React.FC<RecievedPaymentFormFieldsProps> = ({  isLoading }) => {
    const QueryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const { DepositToOptions } = useDepositToOptions(["Bank","Credit Card"]);
    const { control, formState: { errors }, setValue, watch } = useFormContext<UpdateRecievedPamentSchemaType>();
    const creditLeft = useCreditLeft();
   
    const watchCustomer = watch("customerId");

    const handleAmountChange = (value: string) => {
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            const amount = parseFloat(value) || 0;
            setValue("amount", amount, { shouldValidate: true });
        }
    };
 const handleDatePickerChange = (field: 'paymentDate' | 'postingDate') => (e: any) => {
    const value = e.target.value || null;
    setValue(field, value, { shouldValidate: true });
  };
   useEffect(() => {
        if (watch("customer")) {
                setValue("paymentMethod",watch("customer.paymentMethod") || "");
        }
    }, [watchCustomer, setValue]);
 useEffect(()=>{
         if(!watch('postingDate')){
            setValue("postingDate",watch('paymentDate'))
          }
    },[watch('paymentDate')])
    return (
        <>
            <Grid item xs={12} md={6}>
                <TextField label="Customer"value={getFullName(watch("customer") as Record<string,any>)} disabled fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
                <Tooltip title="Enter invoice number to filter invoices" placement="top">
                    <SearchInvoice isLoading={isLoading} />
                </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
                <Controller
                    name="paymentDate"
                    control={control}
                    render={({ field }) => (
                         <CustomDatePicker
                            label="Payment Date"
                            name='paymentDate'
                            value={field.value}
                            onChange={handleDatePickerChange("paymentDate")}
                              fullWidth={true}
                                    error={!!errors.paymentDate}
                                    helperText={errors.paymentDate?.message}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                            <Controller
                                name="postingDate"
                                control={control}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        label="Posting Date"
                                        name='postingDate'
                                        value={field.value}
                                        onChange={handleDatePickerChange("postingDate")}
                                        fullWidth={true}
                                        error={!!errors.postingDate}
                                        helperText={errors.postingDate?.message}
                                    />
                                )}
                            />
                        </Grid>
            <Grid item xs={12} md={6}>
                <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.paymentMethod}>
                            <InputLabel>Payment Method</InputLabel>
                            <Select {...field} label="Payment Method">
                                {PaymentMethodsOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <Controller
                    name="referenceNo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            disabled={isLoading}
                            label="Reference Number"
                            fullWidth
                            error={!!errors.referenceNo}
                            helperText={errors.referenceNo?.message}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.depositTo}>
                    <InputLabel id="depositTo">Received In</InputLabel>
                    <Controller
                        name="depositTo"
                        control={control}
                        render={({ field }) => (
                            <Select
                                id="depositTo"
                                {...field}
                                disabled={isLoading}
                                label="Paid From"
                                fullWidth
                                error={!!errors.depositTo}
                            >
                                <MenuItem value="" onClick={() => setOpen(true)}>Create New Chart Account</MenuItem>
                                {DepositToOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText>{errors.depositTo?.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="Amount Recieved"
                    value={watch("amount")}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    type="text"
                    fullWidth
                    size="small"
                    disabled={isLoading}
                    inputProps={{
                        inputMode: 'decimal',
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="Unsettled Amount"
                    value={creditLeft}
                    type="text"
                    fullWidth
                    size="small"
                    disabled
                    inputProps={{
                        inputMode: 'decimal',
                    }}
                />
            </Grid>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <ChartAccountForm
                    initial={undefined}
                    onSuccess={() => {
                        setOpen(false);
                        QueryClient.invalidateQueries({ queryKey: ['depositToOptions'] });
                    }}
                />
            </Dialog>
        </>
    )
}

export default RecievedPaymentFormFields;