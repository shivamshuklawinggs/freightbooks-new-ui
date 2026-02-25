import * as yup from 'yup';

// Form validation schema
export const RecievedPamentSchema = yup.object().shape({
  customer: yup.string().required("Vendor is required").label("Vendor"),
  amount: yup.number()
    .min(0.01, 'Amount must be greater than 0')
    .required('Amount is required'),
  paymentDate: yup.date().required('Payment date is required'),
  postingDate:yup.date().label("Posting Date").required('Please select the posting date'),
  paymentMethod: yup.string().required('Payment method is required'),
  referenceNo: yup.string().optional().label("Reference No"),
  depositTo: yup.string().required('Paid From is required'),
  invoicePayments: yup.array().of(
    yup.object().shape({
      invoiceId: yup.string().required('Bill ID is required'),
      amount: yup.number().min(0.01, 'Amount must be greater than 0').required('Amount is required'),
    })
  ),
})
.test("bill-payment-amount", "Amount mismatch", function (value) {
  const { createError } = this;
  const totalAppliedAmount = value.invoicePayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalAmount = Number(value.amount);
  const balance=totalAmount-totalAppliedAmount
  if (balance<0 ) { // Using a tolerance for float comparison
    return createError({
      path: "amount",
      message: `Applied amount ($${totalAppliedAmount.toFixed(2)}) must greater then equal received amount ($${totalAmount.toFixed(2)}).`
    });
  }
  return true
});