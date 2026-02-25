import React from 'react'
import { ICustomer, IPaymentTerm } from '@/types'
import {  Typography,  TableCell, Stack, Box, Rating } from '@mui/material'
import { truncateText,formatCurrency } from '@/utils';

import getStatusBadge from './getStatusBadge';
import { renderDefaultCellValue } from '@/utils/renderDefaultCellValue';
import { NavigateFunction } from 'react-router-dom';
interface renderCellProps {
    column: string;
    customer: Omit<ICustomer, 'paymentTerms'> & {
        paymentTerms: IPaymentTerm;
    };
    navigate: NavigateFunction;
}


const renderCell = ({ column, customer,navigate }: renderCellProps) => {
    const columnRenderers: Record<string, () => React.ReactNode> = {

        company: () => (
            <Typography variant="subtitle1">{customer.company}</Typography>
        ),

        email: () => (
            <Typography variant="body2">{customer.email}</Typography>
        ),
        phone: () => (
            <Typography variant="body2">{customer.phone}</Typography>
        ),
        alternatphone: () => (
            <Typography variant="body2">{customer.alternatphone}</Typography>
        ),
        address: () => (
            <Stack spacing={1}>
                <Typography variant="body2" >{truncateText(customer.address || '')}</Typography>
            </Stack>
        ),
        id: () => (
            <Typography variant="body2">{customer.id}</Typography>
        ),

        paymentTerms: () => (
            <Typography variant="body2">
                {typeof customer?.paymentTerms === 'object' ? `${customer?.paymentTerms?.name} (${customer?.paymentTerms?.days} days)` || "N/A" : 'N/A'}
            </Typography>
        ),
        paymentMethod: () => (
            <Typography variant="body2">
                {typeof customer?.paymentMethod === 'string' ? customer?.paymentMethod || "N/A" : 'N/A'}
            </Typography>
        ),
        dueAmount: () => formatCurrency(customer.dueAmount || 0),
        status: () => (
            getStatusBadge(customer.status || 'inactive')
        ),
        rating: () => (
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/customers/rating/${customer._id}`)}>  
                      <Rating   precision={0.1}  value={customer?.ratingScore || 0.0} readOnly />
                      <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 'medium' }}>
                        View Details
                      </Typography>
                    </Box>
        ),
        default:()=>renderDefaultCellValue(customer[column as keyof ICustomer])


    }
    // Get the renderer for the column, fallback to default
    const renderer = columnRenderers[column] || columnRenderers.default;
    const result = renderer();

    return (
        <TableCell key={column}>
            {React.isValidElement(result) || typeof result === 'string' || typeof result === 'number'
                ? result
                : 'Invalid content'}
        </TableCell>
    );
};

export default renderCell