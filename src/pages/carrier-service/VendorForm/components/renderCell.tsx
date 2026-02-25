import React from 'react'
import { ICarrier } from '@/types'
import {  Typography,  TableCell, Stack, Box, Rating } from '@mui/material'
import { truncateText,getFullName } from '@/utils';
import getStatusBadge from './getStatusBadge';
import { renderDefaultCellValue } from '@/utils/renderDefaultCellValue';
import { NavigateFunction } from 'react-router-dom';
interface renderCellProps {
    column: string;
    vendor: ICarrier;
    navigate: NavigateFunction;
}


const renderCell = ({ column, vendor,navigate }: renderCellProps) => {
    const columnRenderers: Record<string, () => React.ReactNode> = {
        name: () => (
            <Typography variant="subtitle1">{getFullName(vendor)}</Typography>
        ),
        company: () => (
            <Typography variant="subtitle1">{vendor?.company || vendor?.company || "N/A"}</Typography>
        ),
        displayCustomerName: () => (
            <Typography variant="body2">{vendor?.displayCustomerName || vendor?.company || "N/A"}</Typography>
        ),
        email: () => (
            <Typography variant="body2">{vendor.email || "N/A"}</Typography>
        ),
        phone: () => (
            <Typography variant="body2">{vendor.phone || "N/A"}</Typography>
        ),
        mobileNo: () => (
            <Typography variant="body2">{vendor.mobileNo || "N/A"}</Typography>
        ),
        billingAddress: () => (
            <Stack spacing={1}>
                <Typography variant="body2" title={vendor?.billingAddress?.address}>{truncateText(vendor?.billingAddress?.address || '')}</Typography>
                <Typography variant="body2">{`${vendor?.billingAddress?.city}, ${vendor?.billingAddress?.state} ${vendor?.billingAddress?.zipCode}`}</Typography>
            </Stack>
        ),
        shippingAddress: () => (
            <Stack spacing={1}>
                <Typography variant="body2" title={vendor?.shippingAddress?.address}>{truncateText(vendor?.shippingAddress?.address || '')}</Typography>
                <Typography variant="body2">{`${vendor?.shippingAddress?.city}, ${vendor?.shippingAddress?.state} ${vendor?.shippingAddress?.zipCode}`}</Typography>
            </Stack>
        ),
   
        paymentMethod: () => (
            <Typography variant="body2">
                {typeof vendor?.paymentMethod === 'string' ? vendor?.paymentMethod || "N/A" : 'N/A'}
            </Typography>
        ),
        status: () => (
            getStatusBadge(vendor.status || 'inactive')
        ),
        rating: () => (
           <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/carriers/rating/${vendor._id}`)}>  
                      <Rating precision={0.1} value={vendor?.rating?.overallScore || 0.0} readOnly />
                      <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 'medium' }}>
                        View Details
                      </Typography>
                    </Box>
        ),
        fax: () => (
            <Typography variant="body2">{vendor.fax || "N/A"}</Typography>
        ), 
        id: () => (
            <Typography variant="body2">{vendor.id}</Typography>
        ),
        other: () => (
            <Typography variant="body2">{vendor.other || "N/A"}</Typography>
        ),
        website: () => (
            <Typography variant="body2">{vendor.website || "N/A"}</Typography>
        ),
        nameToPrintOnCheck: () => (
            <Typography variant="body2">{vendor.nameToPrintOnCheck || "N/A"}</Typography>
        ),
     
        notes: () => (
            <Typography variant="body2">{vendor.notes || "N/A"}</Typography>
        ),
        paymentTerms: () => (
            <Typography variant="body2">{vendor.paymenttermsdata?.name || "N/A"}</Typography>
        ),
      
        // documents: () => (
        //     <Typography variant="body2">{customer.documents}</Typography>
        // ),
       default:()=>renderDefaultCellValue(vendor[column as keyof ICarrier])
          

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