import React from 'react'
import { Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Link, Chip } from '@mui/material'
import { ICustomerInvoicesPaymentDetails } from '@/types';
import { formatCurrency, invoiceStatusColor } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { paths } from '@/utils/paths';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { useParams } from 'react-router-dom';
import VerticalMenu from '@/components/VerticalMenu';
import { toast } from 'react-toastify';
const Estimates: React.FC = () => {
    const queryClient = useQueryClient()
    const { id } = useParams()
  
    const { data: invoiceData } = useQuery({
        queryKey: ['getEstimatesByCustomerId', id],
        queryFn: async () => {
            const response = await apiService.getEstimatesByCustomerId(id as string)
            return response;
        },
        enabled: !!id,
    });

    const convertEstimateToInvoiceMutation = useMutation({
        mutationFn: (id: string) => apiService.convertEstimateToInvoice(id),
        onSuccess: (response) => {
            toast.success(response?.message || 'Estimate converted to invoice successfully');
            queryClient.invalidateQueries({ queryKey: ['getEstimatesByCustomerId'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to convert estimate to invoice');
        }
    });

    const handleConvertEstimateToInvoice = (id: string) => {
        convertEstimateToInvoiceMutation.mutate(id);
    }
    return (
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
                                Amount
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h6" fontWeight="bold">
                                Status
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="h6" fontWeight="bold">
                                Actions
                            </Typography>
                        </TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoiceData?.data?.data?.map((invoice: ICustomerInvoicesPaymentDetails, index: number) => (
                        <TableRow key={invoice._id}>
                            <TableCell>
                                <Typography
                                >
                                    <Link href={paths.base64estimateviewer +"/"+ invoice._id} target="_blank"># {invoice.invoiceNumber}{' '}
                                    </Link>
                                    <span>{formatDate(invoice.dueDate)}</span>
                                </Typography>
                            </TableCell>
                            <TableCell>{formatCurrency(invoice.totalAmountWithTax)}</TableCell>
                            <TableCell><Chip label={invoice.status} variant="outlined" sx={{ backgroundColor: invoiceStatusColor(invoice.status), color: '#fff' }} /></TableCell>
                            <TableCell>
                              
                                <VerticalMenu actions={[
                                    // {
                                    //     label: "Edit",
                                    //     icon: <EditIcon />,
                                    //     onClick: () => handleEdit(invoice._id)
                                    // },
                                    {
                                        label: "Convert to Invoice",
                                        icon: "delete",
                                        onClick: () => handleConvertEstimateToInvoice(invoice._id)
                                    }
                                ]} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default Estimates