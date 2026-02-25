import React from 'react'
import {  IPaymentTerm } from '@/types'
import {Typography, TableCell, Stack, Box, Rating } from '@mui/material'
import {  formatCurrency, truncateText, getFullName } from '@/utils';

import { IAccountsCustomerView } from '@/types';
import getStatusBadge from './getStatusBadge';
import { renderDefaultCellValue } from '@/utils/renderDefaultCellValue';
import { NavigateFunction } from 'react-router-dom';
interface renderCellProps {
    column: string;
    customer: Omit<IAccountsCustomerView, 'paymentTerms'> & {
        paymentTerms: IPaymentTerm;
    };
    navigate: NavigateFunction;
}


const renderCell = ({ column, customer,navigate }: renderCellProps) => {
    const columnRenderers: Record<string, () => React.ReactNode> = {
        name: () => (
            <Typography variant="subtitle1">{getFullName(customer)}</Typography>
        ),
        company: () => (
            <Typography variant="subtitle1">{customer.company}</Typography>
        ),
        displayCustomerName: () => (
            <Typography variant="body2">{customer.displayCustomerName ||customer?.company || "N/A"}</Typography>
        ),
        email: () => (
            <Typography variant="body2">{customer.email || "N/A"}</Typography>
        ),
        phone: () => (
            <Typography variant="body2">{customer.phone || "N/A"}</Typography>
        ),
        mobileNo: () => (
            <Typography variant="body2">{customer.mobileNo || "N/A"}</Typography>
        ),
        billingAddress: () => (
            <Stack spacing={1}>
                <Typography variant="body2" title={customer.billingAddress.address}>{truncateText(customer.billingAddress.address)}</Typography>
                <Typography variant="body2">{`${customer.billingAddress.city}, ${customer.billingAddress.state} ${customer.billingAddress.zipCode}`}</Typography>
            </Stack>
        ),
        shippingAddress: () => (
            <Stack spacing={1}>
                <Typography variant="body2" title={customer.shippingAddress.address}>{truncateText(customer.shippingAddress.address)}</Typography>
                <Typography variant="body2">{`${customer.shippingAddress.city}, ${customer.shippingAddress.state} ${customer.shippingAddress.zipCode}`}</Typography>
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
                      <Rating precision={0.1}  value={customer?.ratingScore || 0.0} readOnly />
                      <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 'medium' }}>
                        View Details
                      </Typography>
                    </Box>
        ),
        fax: () => (
            <Typography variant="body2">{customer.fax || "N/A"}</Typography>
        ),
        other: () => (
            <Typography variant="body2">{customer.other || "N/A"}</Typography>
        ),
        website: () => (
            <Typography variant="body2">{customer.website || "N/A"}</Typography>
        ),
        nameToPrintOnCheck: () => (
            <Typography variant="body2">{customer.nameToPrintOnCheck || "N/A"}</Typography>
        ),
        isSubCustomer: () => (
            <Typography variant="body2">{customer.isSubCustomer?"Yes":"No"}</Typography>
        ),
        parentCustomer: () => (
            <Typography variant="body2">{customer?.parentCustomer?.displayCustomerName || "N/A"}</Typography>
        ),
        notes: () => (
            <Typography variant="body2">{customer.notes || "N/A"}</Typography>
        ),
        default:()=>renderDefaultCellValue(customer[column as keyof IAccountsCustomerView])


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