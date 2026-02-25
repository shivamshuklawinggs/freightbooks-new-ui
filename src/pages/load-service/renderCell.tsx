import React from 'react'
import { ILocationWithIds, IViewLoad } from '@/types'
import { Chip, Box, Typography, Button, TableCell } from '@mui/material'
import { getStatusColor } from '@/utils';
import { renderAddress } from '@/components/common/renderAddress';
import { renderDefaultCellValue } from '@/utils/renderDefaultCellValue';
import moment from 'moment';
interface renderCellProps {
    column: string;
    load: IViewLoad;
    setAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedAddresses: React.Dispatch<React.SetStateAction<{ locations: ILocationWithIds[], title: string }>>;
    openModal: (type: 'carrier' | 'pickup' | 'delivery' | 'driver', data: any[], title: string) => void;
    expandedAddresses: Record<string, boolean>;
    setExpandedAddresses: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    anchorEl: any;
    setAnchorEl: React.Dispatch<React.SetStateAction<any>>;
    setCurrentLoad: React.Dispatch<React.SetStateAction<IViewLoad | null>>;
    currentLoad: IViewLoad | null;
}
const renderCell = ({ column, load, setAddressModalOpen, setSelectedAddresses, openModal, expandedAddresses, setExpandedAddresses, anchorEl, setAnchorEl, setCurrentLoad, currentLoad }: renderCellProps) => {
    const columnRenderers: Record<string, () => React.ReactNode> = {
        loadNumber:()=> (
            <Chip
                label={load.loadNumber}
                variant="outlined"
                sx={{ backgroundColor: getStatusColor(load.status), color: '#fff' }}
            />
        ),
        status: () => (
            <Chip
                label={load.status}
                variant="outlined"
                sx={{ backgroundColor: getStatusColor(load.status), color: '#fff' }}
            />
        ),

        customer: () => load.customerId?.company || '-',

        picks: () => renderAddress(load.pickupLocationId, load._id, 'pickup', setAddressModalOpen, setSelectedAddresses, expandedAddresses, setExpandedAddresses),

        drops: () => renderAddress(load.deliveryLocationId, load._id, 'delivery', setAddressModalOpen, setSelectedAddresses, expandedAddresses, setExpandedAddresses),

        driver: () => {
            const allDrivers = load.carrierIds?.assignDrivers || [];
            if (allDrivers.length === 0) return 'N/A';
            if (allDrivers.length === 1) return allDrivers[0]?.driverName || 'N/A';
            return (
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" noWrap sx={{ maxWidth: (allDrivers[0]?.driverName?.length || 0) * 7 + 'px' }}>
                        {allDrivers[0]?.driverName || 'N/A'}
                    </Typography>
                    <Button
                        color="primary"
                        onClick={() => openModal('driver', allDrivers, 'Drivers')}
                        sx={{ ml: 1, p: 0, minWidth: 'auto', textTransform: 'none' }}
                    >
                        View All ({allDrivers.length})
                    </Button>
                </Box>
            )
        },


        trailer: () => load.carrierIds?.trailer || 'N/A',
        powerUnit: () => load.carrierIds?.powerunit || 'N/A',

        temperature: () => load.temperature || 'N/A',
        pickDate: () => load.pickupLocationId?.[0]?.date ? moment(load.pickupLocationId?.[0]?.date).format('DD-MM-YYYY') : 'N/A',
        dropDate: () => load.deliveryLocationId?.[0]?.date ? moment(load.deliveryLocationId?.[0]?.date).format('DD-MM-YYYY') : 'N/A',
        currentLocation: () => load.currentLocation || 'N/A',
        createdBy: () => load?.createdUser?.name || '-',
        carrier: () => load.carrierIds?.carrier?.company || 'N/A',

        equipment: () => load.equipmentType || 'N/A',
        "carrierPay": () => load?.carrierIds?.carrierPay || 'N/A',
        "carrierTotal": () => load?.carrierIds?.carrierTotal || 'N/A',
        "margin": () => load?.carrierIds?.margin || 'N/A',
        "dipsatchRateAmt": () => load?.carrierIds?.dipsatchRateAmt || 'N/A',
        default: () => renderDefaultCellValue(load[column as keyof IViewLoad]),
    }
    // Get the renderer for the column, fallback to default
    const renderer = columnRenderers[column] || columnRenderers.default;
    const result = renderer();
    return (
        <TableCell key={column} >
            {React.isValidElement(result) || typeof result === 'string' || typeof result === 'number'
                ? result
                : 'Invalid content'}
        </TableCell>
    );
};

export default renderCell