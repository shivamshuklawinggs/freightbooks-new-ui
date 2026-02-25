import React, {  useMemo } from 'react';
import {
  Typography, TableContainer, Box, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Chip, Divider, Card, CardContent, IconButton
} from '@mui/material';
import { formatCurrency, calculateTotalRecievedAmount } from '@/utils';
import { Receipt, AccountBalance, Payment, Delete } from '@mui/icons-material';
import { useFormContext } from 'react-hook-form';
import { useCreditLeft } from '../hooks/useCreditLeft';
import { useAmountApplied } from '../hooks/useAmountApplied';
import {UpdateRecievedPamentSchemaType} from "@/pages/invoice-service/InvoiceRecieptes/schema/UpdateRecievedPamentSchema"
import InvoiceAmount from './InvoiceAmount';



interface UpdateRecievepaymentProps {
  isLoading: boolean;
}



const UpdateRecievepayment: React.FC<UpdateRecievepaymentProps> = ({ isLoading }) => {
  const { setValue, watch } = useFormContext<UpdateRecievedPamentSchemaType>();
  const recievedPayments = watch('recievedPayments')?.map((item)=>({
    invoiceId: item.invoiceId as string , amount: item.amount as number,_id:item?._id  || undefined,totalAmountWithTax:item?.totalAmountWithTax || 0,invoiceNumber:item?.invoiceNumber || ""
  })) || [];
  const customerInvoices = watch('customerInvoices')?.map((item)=>({
    _id: item._id as string , totalAmountWithTax: item.totalAmountWithTax as number, dueAmount: item.dueAmount as number 
  })) || [];
  const nonRecievedPayments = watch('nonRecievedPayments')?.map((item)=>({
    invoiceId: item.invoiceId as string , amount: item.amount as number
  })) || [];
  const deletedPayments = watch('deletedPayments') || [];
  const creditLeft = useCreditLeft();
  const amountApplied = useAmountApplied();

  const groupedPayments = useMemo(() => {
    const groups: { [key: string]: typeof recievedPayments } = {};
    recievedPayments.forEach((payment) => {
      const invoiceId = payment.invoiceId;
      if (!groups[invoiceId]) {
        groups[invoiceId] = [];
      }
      groups[invoiceId].push(payment);
    });
    return groups;
  }, [recievedPayments]);

  const totalDueAmount = useMemo(() => {
    return (invoiceId: string,totalAmountWithTax:number=0) => {
      const totalRecievedAmount=calculateTotalRecievedAmount(recievedPayments, invoiceId, nonRecievedPayments) || 0
      return totalAmountWithTax-(totalRecievedAmount )
    }
  }, [recievedPayments, customerInvoices, nonRecievedPayments]);

  const handleDelete = (paymentToDelete: any) => {
    const updatedDeletedPayments = [...deletedPayments, paymentToDelete];
    setValue('deletedPayments', updatedDeletedPayments, { shouldValidate: true });

    const updatedRecievedPayments = recievedPayments.filter((item: any) => {
      if (item._id && paymentToDelete._id) {
        return item._id !== paymentToDelete._id;
      }
      // Fallback for items without _id (newly added)
      return (
        item.invoiceId !== paymentToDelete.invoiceId ||
        item.amount !== paymentToDelete.amount
      );
    });

    setValue('recievedPayments', updatedRecievedPayments as any, { shouldValidate: true });
  };
  return (
    <Box sx={{ p: 2 }}>
      {Object.entries(groupedPayments).map(([invoiceId, payments]) => (
        <Card
          key={invoiceId}
          sx={{
            mb: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Receipt sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Invoice #{(payments[0] as any)?.invoiceNumber || invoiceId}
                  </Typography>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency((payments[0] as any)?.totalAmountWithTax || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Total Received Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotalRecievedAmount(recievedPayments, invoiceId, nonRecievedPayments))}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Balance Due
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(totalDueAmount(invoiceId,(payments[0] as any)?.totalAmountWithTax || 0))}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Chip
                  label={`${payments.length} Payment${payments.length > 1 ? 's' : ''}`}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Stack>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#495057', py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountBalance sx={{ fontSize: 20, color: '#6c757d' }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Original Amount
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#495057', py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Payment sx={{ fontSize: 20, color: '#6c757d' }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Amount to Apply
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#495057', py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Delete sx={{ fontSize: 20, color: '#6c757d' }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Delete
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((invoice, index) => (
                      <TableRow
                        key={(invoice as any)?._id}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8f9fa'
                          },
                          borderBottom: index === payments.length - 1 ? 'none' : '1px solid #e9ecef'
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#28a745' }}>
                            {formatCurrency(Number((invoice as any)?.amount || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <InvoiceAmount
                            invoice={invoice}
                            isLoading={isLoading}
                            index={index}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <IconButton onClick={() => handleDelete(invoice)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      <Card sx={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#495057' }}>
            Payment Summary
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#6c757d' }}>
                    Amount To Apply:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#28a745' }}>
                    {formatCurrency(amountApplied || 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#6c757d' }}>
                    Amount To Credit:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#17a2b8' }}>
                    {formatCurrency(Number(creditLeft) || 0)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UpdateRecievepayment;
