import React from 'react'
import { Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Link } from '@mui/material'
import { formatCurrency } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import InvoiceAmount from './invoiceAmount';
import { paths } from '@/utils/paths';
import { useFormContext } from 'react-hook-form';
import {UpdateRecievedPamentSchemaType} from "@/pages/carrier-service/BillRecieptes/schema/UpdateRecievedPamentSchema"

interface OutStandingTransactionsProps {
   isLoading: boolean;
}

const OutStandingTransactions: React.FC<OutStandingTransactionsProps> = ({ 
    isLoading
}) => {
    
    const { watch } = useFormContext<UpdateRecievedPamentSchemaType>();
    const customerInvoices = watch('customerInvoices') || [];
     
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
                                    <Typography
                                    >
                                       <Link href={paths.base64imageviewer+"/"+invoice?._id+"/invoice"} target="_blank"># {invoice?.invoiceNumber}{' '}
                                       </Link>
                                        <span>{formatDate(invoice?.dueDate  || null)}</span>
                                    </Typography>
                                </TableCell>
                                <TableCell>{formatDate(invoice?.dueDate || null)}</TableCell>
                                <TableCell>{formatCurrency(invoice?.totalAmountWithTax || 0)}</TableCell>
                                <TableCell>{formatCurrency(invoice?.dueAmount || 0)}</TableCell>
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
        
        </>
    )
}

export default OutStandingTransactions