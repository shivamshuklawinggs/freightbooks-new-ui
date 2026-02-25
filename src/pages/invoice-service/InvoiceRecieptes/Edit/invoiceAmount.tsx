import React from 'react';
import { TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { UpdateRecievedPamentSchemaType } from '@/pages/invoice-service/InvoiceRecieptes/schema/UpdateRecievedPamentSchema';

interface InvoiceAmountProps {
  invoice: any;
  index: number;
  isLoading: boolean;
}

const InvoiceAmount: React.FC<InvoiceAmountProps> = ({
  invoice,
  isLoading,
}) => {
  const { setValue, watch, getValues } = useFormContext<UpdateRecievedPamentSchemaType>();
  const invoicePayments = watch('invoicePayments') || [];
  const currentPayment = invoicePayments.find(p => p.invoiceId === invoice._id);
  const localAmount = currentPayment?.amount?.toString() || '';

  const handleInvoiceAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const amount = parseFloat(value) || 0;
   // Get already received + non-received payments
   const recievedPayments = getValues("recievedPayments") || [];
   const nonRecievedPaymentsForInvoice =
     watch("nonRecievedPayments")?.filter(p => p.invoiceId === invoice._id) || [];
   
   const totalReceived =
     recievedPayments
       .filter((p,ind) => p.invoiceId === invoice._id)
       .reduce((sum, p) => sum + (p.amount || 0), 0) +
     nonRecievedPaymentsForInvoice.reduce((sum, p) => sum + (p.amount || 0), 0);
   // Calculate balance due
   const balanceDue = Math.max(invoice.totalAmountWithTax - totalReceived, 0);
   // Auto-adjust entered amount if it exceeds balance due
   const adjustedAmount = Math.min(amount, balanceDue);

      const allPayments = getValues('invoicePayments') || [];
      let updatedPayments = [...allPayments];
      const existingIndex = updatedPayments.findIndex(p => p.invoiceId === invoice._id);

      if (adjustedAmount > 0) {
        const newPayment = { 
          invoiceId: invoice._id, 
          amount: adjustedAmount, 
          totalAmountWithTax: invoice.totalAmountWithTax
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