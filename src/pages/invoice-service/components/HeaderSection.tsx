import { FC } from "react";
import { Grid, TextField, FormControl, FormHelperText } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { IInvoice } from "@/types";
import { PaymentMethods } from "@/types/enum";
import { useLoadStatusCheck } from "@/hooks/useLoadStatusCheck";
import CustomerSelect from "./CustomerSelect";

interface HeaderSectionProps {
  initialData: IInvoice | null;
  openCustomerModal: () => void;
}

const HeaderSection: FC<HeaderSectionProps> = ({ initialData, openCustomerModal }) => {
  const form = useFormContext<IInvoice>();
  const loadId = form.watch("loadId")
  const invoiceNumber = useWatch({ control: form.control, name: "invoiceNumber" });

  const { isAvailable, isLoading, loadStatusError } = useLoadStatusCheck({
    documentNumber: invoiceNumber,
    documentType: 'invoice',
    initialData,
    onDocumentCheckSuccess: (response: any) => {
      // Handle successful document check
      if (!response?.load) {
        // Reset customer fields when no load found
        form.setValue("name", "");
        form.setValue("address", "");
        form.setValue("email", form.watch("email") || "");
        form.setValue("customer", undefined);
        form.setValue("customerId", "");
        form.setValue("paymentOptions", PaymentMethods.NA);
        form.setValue("terms", "");
      }
    },
    onDocumentCheckError: () => {
      // Handle document check error
    },
    onDocumentNotFound: () => {
      // Handle when no document is found
      form.setValue("name", "");
      form.setValue("address", "");
      form.setValue("email", form.watch("email") || "");
      form.setValue("customer", undefined);
      form.setValue("customerId", "");
      form.setValue("paymentOptions", PaymentMethods.NA);
      form.setValue("terms", "");
    },
    apiMethod: 'checkAccountInvoiceNumberExist'
  });

 
  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>
        {/* Invoice Number */}
        <Grid item md={4}>
          <FormControl fullWidth error={!!form.formState.errors.invoiceNumber}>
            <TextField
              fullWidth
              label="Invoice Number"
              {...form.register("invoiceNumber")}
              value={invoiceNumber || ""}
              error={!!form.formState.errors.invoiceNumber || !isAvailable}
              helperText={
                isLoading
                  ? "Checking availability..."
                  : form.formState.errors.invoiceNumber?.message ||
                  loadStatusError ||
                  (!isAvailable ? "Invoice Number Already Exists" : "Invoice Number is Available")
              }
              InputLabelProps={{ shrink: true }}
              InputProps={{
                readOnly: !!initialData?._id,
              }}
            />
          </FormControl>
        </Grid>

        {/* Customer Name */}
        <Grid item md={6}>
          {
            !loadId ? <CustomerSelect openCustomerModal={openCustomerModal} /> : <FormControl fullWidth>
              <TextField
                fullWidth
                label="Customer Name"
                value={form.watch("name") || ""}
                disabled
                error={!!form.formState.errors.customerId}
                helperText={form.formState.errors.customerId?.message}
              />
            </FormControl>
          }

        </Grid>

        {/* Billing Address */}
        <Grid item md={12}>
          <FormControl fullWidth error={!!form.formState.errors.address}>
            <TextField
              fullWidth
              label="Billing Address"
              multiline
              rows={4}
              {...form.register("address")}
              placeholder="Enter billing address"
              InputLabelProps={{ shrink: true }}
            />
            {form.formState.errors.address && (
              <FormHelperText>{form.formState.errors.address?.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HeaderSection;
