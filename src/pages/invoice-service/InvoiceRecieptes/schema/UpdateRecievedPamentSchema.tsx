import * as yup from 'yup';

// Form validation schema
export const UpdateRecievedPamentSchema = yup.object().shape({
    amount: yup.number().min(0.01, 'Amount must be greater than 0').required('Amount is required'),
    paymentDate: yup.date().required('Payment date is required'),
    postingDate:yup.date().label("Posting Date").required('Please select the posting date'),
    paymentMethod: yup.string().required('Payment method is required'),
    customerId: yup.string().required('customerId is required'),
    referenceNo: yup.string().optional().label("Reference No"),
    depositTo: yup.string().required('Paid From is required'),
    searchInvoice: yup.string().optional().label("Search Invoice"),
    fromDate: yup.date().nullable().optional().label("From Date"),
    toDate: yup.date().nullable().optional().label("To Date"),
    overdueOnly: yup.string().nullable().optional().label("Overdue Only"),
        customer: yup.object().shape({
          _id: yup.string().required('Customer ID is required'),
          paymentMethod: yup.string().optional(),
          company: yup.string().required('Customer name is required'),
       
        }).nullable().optional(),
      invoicePayments: yup.array().of(
            yup.object().shape({
                invoiceId: yup.string().required('Invoice ID is required'),
                amount: yup.number().min(0.01, 'Amount must be positive').required('Amount is required'),
                totalAmountWithTax: yup.number().optional(),
            })
        ).optional(),
        customerInvoices: yup.array().of(
            yup.object().shape({
                invoiceNumber: yup.string(),
                totalAmountWithTax: yup.number().optional(),
                "_id": yup.string(),
                "expense": yup.array().of(
                    yup.object().shape({
                        "productservice": yup.string(),
                        "description": yup.string(),
                        "qty": yup.number(),
                        "rate": yup.number(),
                        "tax": yup.mixed().nullable(),
                        "amount": yup.number(),
                        "_id": yup.string(),
                        "taxRate": yup.number(),
                        "amountWithTax": yup.number(),
                        "taxAmount": yup.number()
                    })
                ),
                type: yup.string(),
                status: yup.string(),
                invoiceDate: yup.date(),
                dueDate: yup.date(),
                totalTaxAmount: yup.number(),
                totalAmount: yup.number(),
                recievedAmount: yup.number(),
                dueAmount: yup.number(),
            })
        ).optional(),
        recievedPayments: yup.array().of(
            yup.object().shape({
                amount: yup.number().min(0.01, 'Amount must be positive').required('Amount is required'),
                invoiceId: yup.string().required('Invoice ID is required'),
                _id: yup.string().nullable().optional(),
                invoiceNumber: yup.string().optional(),
                BillNumber: yup.string().optional(),
                amountWithTax: yup.number(),
                totalAmountWithTax: yup.number(),
                totalTaxAmount: yup.number(),
                totalAmount: yup.number(),
                recievedAmount: yup.number(),
                dueAmount: yup.number(),
                recievedPaymentId: yup.string()
            })
        ).optional().default([]),
        nonRecievedPayments: yup.array().of(
            yup.object().shape({
                  _id: yup.string().optional(),
                invoiceNumber: yup.string().required('invoiceNumber is required'),
                amount: yup.number().optional(),
                invoiceId: yup.string(),
                amountWithTax: yup.number(),
                totalAmountWithTax: yup.number(),
                totalTaxAmount: yup.number(),
                totalAmount: yup.number(),
                recievedAmount: yup.number(),
                dueAmount: yup.number(),
                recievedPaymentId: yup.string()
            })
        ).optional().default([]),
        deletedPayments: yup.array().optional().default([]),
        customerBalance:yup.number().optional(),
        recievedAmount:yup.number().optional(),
        credits:yup.number().optional(),
  
})
.test("amount-validation", "Invalid Amount", (value, { createError }) => {
    const totalFromInvoice = value.invoicePayments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const totalFromRecieved = value.recievedPayments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const totalAppliedAmount = totalFromInvoice + totalFromRecieved;
    const totalAmount = Number(value.amount);
   
    if (totalAppliedAmount > totalAmount + 0.001) { // Using a tolerance for float comparison
        return createError({
            path: "amount",
            message: `Applied amount ($${totalAppliedAmount.toFixed(2)}) cannot exceed received amount ($${totalAmount.toFixed(2)}).`
        });
    }
    
    return true;
});

export type UpdateRecievedPamentSchemaType = yup.InferType<typeof UpdateRecievedPamentSchema>;