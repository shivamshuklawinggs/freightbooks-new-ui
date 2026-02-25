import { paidtype } from '@/types';
import * as yup from 'yup';

export const ExpenseSchema = yup.object().shape({
    loadId: yup.string().required('Load ID is required'),
    rate: yup.string().required('Amount is required').test('is-valid-amount', 'Amount must be positive', (value) => {
      const num = parseFloat(value);
      return !isNaN(num)
    }),
    date: yup.date().required('Date is required'),
    notes: yup.string(),
    location: yup.string().required('Location is required'),
    paidby: yup.string().required('Paid By is required'),
    paidbytype: yup.string().oneOf(Object.values(paidtype), 'Invalid paid by type').required('Paid By Type is required'),
    receipt: yup.array().of(yup.mixed()).notRequired(),
    deleteFiles: yup.array().notRequired()
  });
