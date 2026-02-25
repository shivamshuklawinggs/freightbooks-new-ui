import {Controller, useFormContext } from "react-hook-form";
import { UpdateRecievedPamentSchemaType } from "../../schema/UpdateRecievedPamentSchema";
import useCreditLeft from "../hooks/useCreditLeft";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";

interface InvoiceAmountProps {
    invoice: any;
    isLoading: boolean;
    index: number;
  }
const InvoiceAmount: React.FC<InvoiceAmountProps> = ({ invoice, isLoading, index }) => {
  const { setValue, watch, getValues,control } = useFormContext<UpdateRecievedPamentSchemaType>();
  const invoicePayments = watch("invoicePayments")?.map((item)=>({
    invoiceId: item.invoiceId as string , amount: item.amount as number
  })) || [];
  const nonRecievedPayments = watch('nonRecievedPayments')?.map((item)=>({
    invoiceId: item.invoiceId as string , amount: item.amount as number
  })) || [];
  const creditLeft = useCreditLeft();
  const handleInvoiceAmountChange = (value: string) => {
    if (value !== "" && Number(creditLeft) <= 0) {
        toast.error("Credit limit is not enough")
      return;
    }
  
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const amount = parseFloat(value) || 0;
  
      // Get invoice total
      const totalAmount = invoice.totalAmountWithTax;
  
      // Get already received + non-received payments
      const recievedPayments = getValues("recievedPayments") || [];
      const nonRecievedPaymentsForInvoice =
        nonRecievedPayments?.filter(p => p.invoiceId === invoice.invoiceId) || [];
  
      const totalReceived =
        recievedPayments
          .filter((p,ind) => p.invoiceId === invoice.invoiceId && ind!==index )
          .reduce((sum, p) => sum + (p.amount || 0), 0) +
         invoicePayments?.filter((p)=>p.invoiceId===invoice.invoiceId).reduce((sum,p)=>sum+(p.amount||0),0) || 0
        nonRecievedPaymentsForInvoice.reduce((sum, p) => sum + (p.amount || 0), 0);
      // Calculate balance due
      const balanceDue = Math.max(totalAmount - totalReceived, 0);
      // Auto-adjust entered amount if it exceeds balance due
      const adjustedAmount = Math.min(amount, balanceDue);
      const allPayments = getValues("recievedPayments") || [];
      if (index >= 0 && index < allPayments.length) {
        const updatedPayments = [...allPayments];
        updatedPayments[index] = { ...updatedPayments[index], amount: adjustedAmount };
        setValue("recievedPayments", updatedPayments, { shouldValidate: true });
      }
    }
  };
  
  return (
    <Controller
    name={`recievedPayments.${index}.amount`}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        type="text"
        size="small"
        fullWidth
        inputProps={{
            inputMode: 'decimal',
        }}
        value={field.value ?? ""}
        onChange={(e) => {
        //   field.onChange(e); // updates RHF
          handleInvoiceAmountChange(e.target.value); // run validation logic
        }}
      />
    )}
  />
  );
};
export default InvoiceAmount