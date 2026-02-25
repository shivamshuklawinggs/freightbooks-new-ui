import React from 'react';
import {
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  List,
  ListItem,
  Button,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, RemoveRedEye as ViewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { IViewLoad } from '@/types';
import { getStatusColor, formatCurrency, getCarrierSubtotal, getCarrierMarginAmount, getCustomerSubtotal, getClaimedStatus } from '@/utils';
import { renderAddress } from '@/components/common/renderAddress';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface LoadDataDisplayProps {
  data: IViewLoad[] | undefined;
  visibleColumns: string[];
  isPending: boolean;
  currentRole?: string;
  handleEdit: (id: string) => void;
  handleDeleteLoad: (id: string) => void;
  handleOpenViewLoadModal: (load: IViewLoad) => void;
  handleInvoiceClick: (type: 'customer' | 'carrier', load: IViewLoad) => void;
  openModal: (type: 'carrier' | 'pickup' | 'delivery' | 'driver', data: any[], title: string) => void;
  setAddressModalOpen: (open: boolean) => void;
  setSelectedAddresses: (addresses: { locations: any[], title: string }) => void;
  expandedAddresses: Record<string, boolean>;
  setExpandedAddresses: (addresses: Record<string, boolean>) => void;
  setAnchorEl: (anchor: HTMLElement | null) => void;
  setCurrentLoad: (load: IViewLoad | null) => void;
  anchorEl: HTMLElement | null;
  currentLoad: IViewLoad | null;
}

const LoadDataDisplay: React.FC<LoadDataDisplayProps> = ({
  data,
  visibleColumns,
  isPending,
  currentRole,
  handleEdit,
  handleDeleteLoad,
  handleOpenViewLoadModal,
  handleInvoiceClick,
  openModal,
  setAddressModalOpen,
  setSelectedAddresses,
  expandedAddresses,
  setExpandedAddresses,
  setAnchorEl,
  setCurrentLoad,
  anchorEl,
  currentLoad,

}) => {
  const modifieddata=data?.map(({loadNumber,loadAmount,...load})=>{
    return{
      loadNumber,
      loadAmount,
      customeramt:getCustomerSubtotal(loadAmount) || 0,
      MarginAmt: getCarrierMarginAmount(
        loadAmount,
        load.carrierIds?.carrierPay || 0,
      ),
      dipsatchRateAmt: getCarrierSubtotal(
        loadAmount,
        load.carrierIds?.carrier?.rate || 0,
        load.carrierIds?.carrierPay || 0
      ),
      carrierPay: load.carrierIds?.carrierPay || 0,
      ...load,
    }
   })
  const renderCell = (columnKey: string, load: IViewLoad) => {
    switch (columnKey) {
      case 'loadNumber':
        return (
          <Chip 
            label={load.loadNumber} 
            variant="outlined" 
            sx={{ backgroundColor: getStatusColor(load.status), color: '#fff' }} 
          />
        );
      case 'loadAmount':
        return formatCurrency(Number(load.loadAmount)) || '-';
      case 'MarginAmt':
        return formatCurrency(Number(load?.MarginAmt) || 0) ;
      case 'customeramt':
        return formatCurrency(Number(load?.customeramt) || 0) || '-';
      case 'dipsatchRateAmt':
        return (
            <Box display="flex" alignItems="center">
              <Typography variant="body2">
                {formatCurrency(Number(load?.dipsatchRateAmt) || 0)}
              </Typography>
              {load.carrierIds?.carrier && (
                <Button
                  color="primary"
                  onClick={() => openModal('carrier', [load.carrierIds], 'Carriers')}
                  sx={{ ml: 1, p: 0, minWidth: 'auto', textTransform: 'none' }}
                >
                  View
                </Button>
              )}
            </Box>
          )   
      case 'carrierPay':
         return formatCurrency(Number(load?.carrierPay) || 0) || '-';
      case 'status':
        return (
          <Chip
            label={load.status}
            variant="outlined"
            sx={{
              backgroundColor: getStatusColor(load.status),
              color: '#fff',
            }}
          />
        );
      case 'invoice':
        return (
          <Box position="relative">
            <Button
              sx={{ height: "10px" }}
              variant="outlined"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
                setCurrentLoad(load);
              }}
            >
              {load.invoice || load.carrierinvoices ? 'Edit' : 'Create'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && currentLoad?._id === load._id}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem sx={{ fontSize: "0.8rem" }} onClick={() => {
                handleInvoiceClick('customer', load);
                setAnchorEl(null);
              }}>
                {load.invoice ? 'Edit' : 'Create'} Customer Invoice
              </MenuItem>
              <Divider component="hr" sx={{ my: 1, color: "red" }} />
              <MenuItem sx={{ fontSize: "0.8rem" }} onClick={() => {
                handleInvoiceClick('carrier', load);
                setAnchorEl(null);
              }}>
                {load.carrierinvoices ? 'Edit' : 'Create'} Carrier Invoice
              </MenuItem>
            </Menu>
          </Box>
        );
      case 'customer':
        return load.customerId?.company || '-';
      case 'picks':
        return (
          <Box sx={{ height: 60 }}>
            {renderAddress(load.pickupLocationId, load._id, 'pickup', setAddressModalOpen, setSelectedAddresses, expandedAddresses, setExpandedAddresses)}
          </Box>
        );
      case 'currentLocation':
        return load.currentLocation || 'N/A';
      case 'drops':
        return (
          <Box sx={{ height: 60 }}>
            {renderAddress(load.deliveryLocationId, load._id, 'delivery', setAddressModalOpen, setSelectedAddresses, expandedAddresses, setExpandedAddresses)}
          </Box>
        );
      case 'carrier':
        return load.carrierIds?.carrier ? (
          <ListItem disablePadding>
            <Typography variant="body2" noWrap sx={{ textOverflow: 'ellipsis', maxWidth: '100px' }}>
              {load.carrierIds.carrier.company || 'N/A'}
            </Typography>
          </ListItem>
        ) : 'N/A';
      case 'driver':
        return load.carrierIds?.assignDrivers ? (
          (() => {
            const allDrivers = load.carrierIds.assignDrivers || [];
            if (allDrivers.length === 0) {
              return 'N/A';
            } else if (allDrivers.length === 1) {
              return allDrivers[0].driverName || 'N/A';
            } else {
              return (
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" noWrap sx={{ maxWidth: allDrivers[0].driverName.length * 7 + 'px' }}>
                    {allDrivers[0].driverName || 'N/A'}
                  </Typography>
                  <Button
                    color="primary"
                    onClick={() => {
                      openModal('driver', allDrivers, 'Drivers');
                    }}
                    sx={{ ml: 1, p: 0, minWidth: 'auto', textTransform: 'none' }}
                  >
                    View All ({allDrivers.length})
                  </Button>
                </Box>
              );
            }
          })()
        ) : 'N/A';
      case 'equipment':
        return (
          <Typography variant="body2" noWrap>
            {load.equipmentType || 'N/A'}
          </Typography>
        );
      case 'temperature':
        return (
          <Typography variant="body2" noWrap>
            {load.temperature || 'N/A'}
          </Typography>
        );
      case 'powerUnit':
        return load.carrierIds?.powerunit ? (
          <List dense disablePadding>
            <ListItem disablePadding>
              {load.carrierIds.powerunit || 'N/A'}
            </ListItem>
          </List>
        ) : 'N/A';
      case 'trailer':
        return load.carrierIds?.trailer ? (
          <List dense disablePadding>
            <ListItem disablePadding>
              {load.carrierIds.trailer || 'N/A'}
            </ListItem>
          </List>
        ) : 'N/A';
      case 'createdBy':
        return load.createdUser?.name || '-';
      default:
        return '-';
    }
  };
  return (
    <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1} align="center">
                <LoadingSpinner size={50} />
              </TableCell>
            </TableRow>
          ) : Array.isArray(modifieddata) && modifieddata.length > 0 ? (modifieddata.map((load) => (
              <TableRow key={load._id} hover sx={{
                backgroundColor: getClaimedStatus(load.status)?.color
              }}>
                {visibleColumns.map(columnKey => (
                  <TableCell key={columnKey}>
                    {renderCell(columnKey, load)}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteLoad(load._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(load._id)}
                      disabled={currentRole?.includes("dispatcher")}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenViewLoadModal(load)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1} align="center">
                <Typography variant="body1">No Records Found</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
  );
};

export default LoadDataDisplay;
