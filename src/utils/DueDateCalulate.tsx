import { useEffect } from 'react';
import moment, { Moment } from 'moment';
import apiService from '@/service/apiService';
import { IPaymentTerm } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { addDays } from './dateUtils';

interface FormValues {
  terms: string;
  invoiceDate: Moment;
  dueDate: Moment;
  postingDate: Moment;
}

/**
 * ✅ useDueDateCalculator Hook
 * Automatically calculates the due date based on invoice date and payment terms.
 */
export const useDueDateCalculator = (
  setValue: UseFormReturn<FormValues>['setValue'],
  watch: UseFormReturn<FormValues>['watch']
) => {
  const terms = watch('terms');
  const invoiceDate = watch('invoiceDate');
  const PostingDate = watch('postingDate');

  useEffect(() => {
    const updateDueDate = async () => {
      let noOfDays = 0;
      try {
        
        if (terms) {
          const response = await apiService.getPaymentTermById(terms);
          const paymentTerm: IPaymentTerm = response.data;
          noOfDays = paymentTerm.days || 0;
        }
      } catch (err) {
        noOfDays = 0;
      } finally {
        if (invoiceDate) {
          if(!PostingDate && moment(invoiceDate).isValid()){
            setValue("postingDate", moment(invoiceDate));
          }
          // Add days to invoice date using moment
          const newDueDate =addDays(invoiceDate,noOfDays)

          
          // Set the new due date as a Moment instance
          setValue('dueDate', moment(newDueDate));
        }
      }
    };

    updateDueDate();
  }, [terms, invoiceDate, setValue]);
};

export default useDueDateCalculator;
