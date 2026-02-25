import React, { useMemo } from 'react'
import { Typography, TableContainer, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Link } from '@mui/material'
import { ICustomerInvoicesPaymentDetails, IPaymentRecived } from '@/types';
import { formatCurrency } from '@/utils';
import InvoiceAmount from './invoiceAmount';
import { paths } from '@/utils/paths';
import { useFormContext } from 'react-hook-form';
import { formatDate } from '@/utils/dateUtils';
interface OutStandingTransactionsProps {
   customerInvoices: ICustomerInvoicesPaymentDetails[];
   isLoading: boolean;
}

const OutStandingTransactions: React.FC<OutStandingTransactionsProps> = ({ 
    customerInvoices, 
    isLoading, 
}) => {
    const { watch } = useFormContext<IPaymentRecived>();
    const invoicePayments = watch('invoicePayments') || [];
    const amount = watch('amount') || 0;

    const totalSelectedAmount = useMemo(() => {
        return invoicePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }, [invoicePayments]);

    const amountToCredit = useMemo(() => {
        const credit = amount - totalSelectedAmount;
        return credit > 0 ? credit : 0;
    }, [amount, totalSelectedAmount]);

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6" fontWeight="bold">
                                    Descriptions
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" fontWeight="bold">
                                    Due Date
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" fontWeight="bold">
                                    Original Amount
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" fontWeight="bold">
                                    Open Balance
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" fontWeight="bold">
                                    Amount to Apply
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customerInvoices.map((invoice, index) => (
                            <TableRow key={invoice?._id}>
                                <TableCell>
                                    <Typography>
                                       <Link href={paths.base64imageviewer+"/"+invoice?._id+"/bill"} target="_blank"># {invoice.invoiceNumber}{' '}
                                       </Link>
                                        <span>{formatDate(invoice?.dueDate)}</span>
                                    </Typography>
                                </TableCell>
                                <TableCell>{formatDate(invoice?.dueDate)}</TableCell>
                                <TableCell>{formatCurrency(invoice?.totalAmountWithTax)}</TableCell>
                                <TableCell>{formatCurrency(invoice?.dueAmount)}</TableCell>
                                <TableCell>
                                    <InvoiceAmount
                                        invoice={invoice}
                                        index={index}
                                        isLoading={isLoading}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack direction="row" sx={{ mt: 2, float: 'right', gap: 2 }}>
                <Box>
                    <Typography fontWeight="bold">
                        Amount To Apply:
                    </Typography>
                    <Typography fontWeight="bold">
                        Amount To Credit:
                    </Typography>
                </Box>
                <Box>
                    <Typography fontWeight="bold">
                        {formatCurrency(totalSelectedAmount)}
                    </Typography>
                    <Typography fontWeight="bold">
                        {formatCurrency(amountToCredit)}
                    </Typography>
                </Box>
            </Stack>
        </>
    )
}

export default OutStandingTransactions;