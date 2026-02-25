import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
    Box,
    TextField,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Tooltip,
    Dialog,
    IconButton,
} from '@mui/material';

import { PaymentMethodsOptions } from '@/types/enum';

import { IPaymentRecived, ICustomerInvoicesPaymentDetails, ICarrier } from '@/types';
import { Close } from '@mui/icons-material';
import SearchInvoice from './SearchInvoice';
import useDepositToOptions from '@/hooks/DepositToOptions';
import ChartAccountForm from '@/pages/chart-accounts-service/ChartAccountForm';
import { useQueryClient } from '@tanstack/react-query';
import CustomDatePicker from '@/components/common/CommonDatePicker';

interface RecievedPaymentFormFieldsProps {
    invoiceData: ICarrier[];
    isLoading: boolean;
    handleCustomerChange: (customerId: string) => void;
    customerInvoices: ICustomerInvoicesPaymentDetails[];
}

const RecievedPaymentFormFields: React.FC<RecievedPaymentFormFieldsProps> = ({ invoiceData, isLoading, handleCustomerChange, customerInvoices }) => {
    const QueryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const { DepositToOptions } = useDepositToOptions(["Bank", "Credit Card"]);
    const { control, formState: { errors }, setValue, watch } = useFormContext<IPaymentRecived>();

    const watchCustomer = watch("customer");

    const handleAmountChange = (value: string) => {
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            const amount = parseFloat(value) || 0;
            setValue('amount', amount, { shouldValidate: true });

            if (amount === 0) {
                setValue('invoicePayments', []);
                return;
            }

            const totalDueAmount = customerInvoices.reduce((sum, invoice) => sum + invoice.dueAmount, 0);
            const cappedAmount = Math.min(amount, totalDueAmount);

            let remainingAmount = cappedAmount;
            const newInvoicePayments = customerInvoices.map(invoice => {
                if (remainingAmount <= 0) {
                    return { invoiceId: invoice._id, amount: 0, totalBalanceDue: invoice.dueAmount };
                }

                const proportionalAmount = totalDueAmount > 0 ? (invoice.dueAmount / totalDueAmount) * cappedAmount : 0;
                const invoiceAmount = Math.min(proportionalAmount, invoice.dueAmount, remainingAmount);
                remainingAmount -= invoiceAmount;

                return {
                    invoiceId: invoice._id,
                    amount: parseFloat(invoiceAmount.toFixed(2)),
                    totalBalanceDue: invoice.dueAmount
                };
            }).filter(p => p.amount > 0);

            setValue('invoicePayments', newInvoicePayments, { shouldValidate: true });
        }
    };

    useEffect(() => {
        if (watchCustomer) {
            const selectedCustomer = invoiceData?.find(
                (item: ICarrier) => item?._id === watchCustomer
            );
            if (selectedCustomer) {
                setValue("paymentMethod", selectedCustomer?.paymentMethod || "");
            }
        }
    }, [watchCustomer, invoiceData, setValue]);
 useEffect(()=>{
         if(!watch('postingDate')){
            setValue("postingDate",watch('paymentDate'))
          }
    },[watch('paymentDate')])
    return (
        <>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.customer}>
                    <InputLabel id="customer-label">Vendor</InputLabel>
                    <Controller
                        name="customer"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                disabled={isLoading}
                                labelId="customer-label"
                                label="Vendor"
                                value={field.value || ""}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    handleCustomerChange(e.target.value as string);
                                }}
                                displayEmpty
                                renderValue={(selected) => {
                                    const selectedCustomer = invoiceData?.find(
                                        (item: ICarrier) => item?._id === selected
                                    );
                                    return (
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            {selectedCustomer?.company || selectedCustomer?.company || ""}
                                            {selected && (
                                                <IconButton
                                                    size="small"
                                                    onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown open
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent dropdown open
                                                        handleCustomerChange('');
                                                    }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    );
                                }}
                            >
                                <MenuItem disabled value="">
                                    <em>Select Vendor</em>
                                </MenuItem>
                                {invoiceData?.map((method: ICarrier) => (
                                    <MenuItem key={method._id as string} value={method._id as string}>
                                        {method?.company || method?.company}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText>{errors.customer?.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <Tooltip title="Enter bill number to filter bills" placement="top">
                    <Controller
                        name="searchInvoice"
                        control={control}
                        render={({ field }) => (
                            <SearchInvoice
                                isLoading={isLoading}
                            />
                        )}
                    />
                </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
                <Controller
                    name="paymentDate"
                    control={control}
                    render={({ field }) => (
                        <CustomDatePicker
                            helperText={errors.paymentDate?.message}
                            label="Payment Date"
                            name='paymentDate'
                            error={!!errors.paymentDate}
                            value={field.value}
                            onChange={(date) => field.onChange(date)}

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
                            onChange={date => field.onChange(date)}
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
                    <InputLabel id="depositTo">Paid From</InputLabel>
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
                <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Amount Paid"
                            value={field.value}
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
                    )}
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