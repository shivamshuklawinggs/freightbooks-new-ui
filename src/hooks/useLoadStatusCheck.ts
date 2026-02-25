import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import apiService from '@/service/apiService';

interface UseLoadStatusCheckProps {
  documentNumber: string;
  documentType: 'invoice' | 'estimate' | 'bill';
  initialData?: any;
  onDocumentCheckSuccess?: (response: any) => void;
  onDocumentCheckError?: (error: any) => void;
  onDocumentNotFound?: () => void;
  apiMethod: 'checkAccountInvoiceNumberExist' | 'checkAccountBillNumberExist';
}

interface LoadStatusCheckResult {
  isAvailable: boolean;
  isLoading: boolean;
  loadStatusError?: string;
  checkDocumentNumber: () => Promise<void>;
}

export const useLoadStatusCheck = ({
  documentNumber,
  documentType,
  initialData,
  onDocumentCheckSuccess,
  onDocumentCheckError,
  onDocumentNotFound,
  apiMethod
}: UseLoadStatusCheckProps): LoadStatusCheckResult => {
  const form = useFormContext();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatusError, setLoadStatusError] = useState<string>();

  const resetFormFields = useCallback(() => {
    if (documentType === 'bill') {
      form.setValue("expense", []);
      form.setValue("loadId", "");
      form.setValue("loadAmount", 0);
      form.setValue("vendorId", "");
    } else {
      form.setValue("name", "");
      form.setValue("address", "");
      form.setValue("email", form.watch("email") || "");
      form.setValue("customer", undefined);
      form.setValue("customerId", "");
      form.setValue("paymentOptions", "NA");
      form.setValue("terms", "");
      form.setValue("expense", []);
      form.setValue("loadId", undefined);
      form.setValue("loadAmount", 0);
      form.setValue("deletedfiles", []);
    }
  }, [form, documentType]);

  const checkDocumentNumber = useCallback(async () => {
    if (!documentNumber?.trim()) return;

    try {
      setIsLoading(true);
      setLoadStatusError(undefined);
      form.clearErrors(documentType === 'bill' ? 'BillNumber' : 'invoiceNumber');

      const response = await apiService[apiMethod](documentNumber, form.watch("type"));

      // Check if load exists and status is not delivered
      if (response?.load) {
        const loadData = response.load;
        // Load is delivered, proceed with normal flow
        if (documentType === 'bill') {
          const carrierData = loadData?.carrierIds?.carrier;
          form.setValue("loadId", loadData?._id || "");
          form.setValue("loadAmount", loadData?.loadAmount);
          form.setValue("deletedfiles", []);
          form.setValue("vendorId", carrierData?._id || "");
        } else {
          form.setValue("loadId", loadData?._id);
          form.setValue("loadAmount", loadData?.loadAmount || 0);
          form.setValue("deletedfiles", []);
          form.setValue("name", loadData?.customerId?.company || "");
          form.setValue("address", loadData?.customerId?.address || "");
          form.setValue("email", loadData?.customerId?.email || form.watch("email") || "");
          form.setValue("customer", loadData?.customerId || undefined);
          form.setValue("customerId", loadData?.customerId?._id || "");
          
          if (!initialData?._id) {
            form.setValue("paymentOptions", loadData?.customerId?.paymentMethod);
            form.setValue("terms", loadData?.customerId?.paymentTerms);
          }
        }
      } else {
        // No load found
        onDocumentNotFound?.();
        resetFormFields();
      }

      // Handle expenses
      if (response?.expenses?.length > 0 && !initialData?._id && !form.watch("expense")?.length) {
        form.setValue("expense", response.expenses);
      }
      if (response?.expenses?.length == 0 && !initialData?._id && !form.watch("expense")?.length) {
        form.setValue("expense", []);
      }

      setIsAvailable(true);
      onDocumentCheckSuccess?.(response);

    } catch (error:any) {
      const errorMessage =error?.message  || "Something IS Wrong"
      form.setError(documentType === 'bill' ? 'BillNumber' : 'invoiceNumber', {
        type: 'manual',
        message: errorMessage
      });
      setIsAvailable(false);
      resetFormFields();
      onDocumentCheckError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [documentNumber, documentType, initialData, apiMethod, form, onDocumentCheckSuccess, onDocumentCheckError, onDocumentNotFound, resetFormFields]);

  // Auto-check when document number changes (only for new documents)
  useEffect(() => {
    if (!initialData?._id && documentNumber?.trim()) {
      const timeoutId = setTimeout(() => {
        checkDocumentNumber();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [documentNumber]);

  // Set availability when editing
  useEffect(() => {
    if (initialData?._id) {
      setIsAvailable(true);
      setLoadStatusError(undefined);
    }
  }, [initialData?._id]);

  return {
    isAvailable,
    isLoading,
    loadStatusError,
    checkDocumentNumber
  };
};
