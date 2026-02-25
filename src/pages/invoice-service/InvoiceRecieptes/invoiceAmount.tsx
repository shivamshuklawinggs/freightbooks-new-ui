import React from 'react';
import { TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { IPaymentRecived, ICustomerInvoicesPaymentDetails } from '@/types';

interface InvoiceAmountProps {
  invoice: ICustomerInvoicesPaymentDetails;
  index: number;
  isLoading: boolean;
}

const InvoiceAmount: React.FC<InvoiceAmountProps> = ({
  invoice,
  index,
  isLoading,
}) => {
  const { setValue, watch, getValues } = useFormContext<IPaymentRecived>();
  const invoicePayments = watch('invoicePayments') || [];
  const currentPayment = invoicePayments.find(p => p.invoiceId === invoice._id);
  const localAmount = currentPayment?.amount?.toString() || '';

  const handleInvoiceAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const amount = parseFloat(value) || 0;
      const cappedAmount = Math.min(amount, invoice.dueAmount);

      const allPayments = getValues('invoicePayments') || [];
      let updatedPayments = [...allPayments];
      const existingIndex = updatedPayments.findIndex(p => p.invoiceId === invoice._id);

      if (cappedAmount > 0) {
        const newPayment = { 
          invoiceId: invoice._id, 
          amount: cappedAmount, 
          totalBalanceDue: invoice.totalAmountWithTax - invoice.recievedAmount 
        };
        if (existingIndex !== -1) {
          updatedPayments[existingIndex] = newPayment;
        } else {
          updatedPayments.push(newPayment);
        }
      } else {
        if (existingIndex !== -1) {
          updatedPayments.splice(existingIndex, 1);
        }
      }

      setValue('invoicePayments', updatedPayments, { shouldValidate: true });

    }
  };

  return (
    <TextField
      type="text"
      size="small"
      fullWidth
      placeholder={`Max: ${invoice.dueAmount.toFixed(2)}`}
      helperText={localAmount && parseFloat(localAmount) > invoice.dueAmount ? `Amount cannot exceed ${invoice.dueAmount.toFixed(2)}` : ''}
      error={!!(localAmount && parseFloat(localAmount) > invoice.dueAmount)}
      disabled={isLoading}
      value={localAmount}
      onChange={(e) => handleInvoiceAmountChange(e.target.value)}
      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[\d.]/.test(e.key)) {
          e.preventDefault();
        }
        if (e.key === '.' && e.currentTarget.value.includes('.')) {
          e.preventDefault();
        }
      }}
    />
  );
};

export default InvoiceAmount;