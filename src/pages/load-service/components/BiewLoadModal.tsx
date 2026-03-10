import { 
  Typography, 
  Button, 
  List, 
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import React, { useState } from 'react';
import { formatCurrency } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { getIcon } from '@/components/common/icons/getIcon';
// Define the props for the modal component
interface BiewLoadModalProps {
  open: boolean;
  onClose: () => void;
  type: 'carrier' | 'pickup' | 'delivery' | 'driver' | 'pickupdates' | 'deliverydates' | null;
  title: string;
  data: any[];
}

// Define the modal component that will be used in ViewLoad
const BiewLoadModal: React.FC<BiewLoadModalProps> = ({ open, type, title, data, onClose }) => {

  // Render content based on the type of data
  const renderContent = () => {
    if (!type) return null;
    
    switch (type) {
      case 'carrier':
        return (
          <List>
            {data.map((carrierItem: any, index: number) => {
              const carrier = typeof carrierItem.carrier === 'object' ? carrierItem.carrier : {};
              const carrierPay = carrierItem.carrierPay || 0;
              
              return (
                <React.Fragment key={`carrier-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={carrier.phone || 'Unknown Carrier'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            Margin Amount: {formatCurrency(carrierPay)} 
                          </Typography>
                       
                        </>
                      }
                    />
                  </ListItem>
                  {index < data.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        );
        
      case 'pickup':
      case 'delivery':
        return (
          <List>
            {data.map((loc: any, index: number) => (
              <React.Fragment key={`location-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={`Address ${index + 1}`}
                    secondary={
                      <>
                        <Typography variant="body2" component="div">
                          {loc.address || ''}, {loc.city || ''}, {loc.state || ''}
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                         {type === 'pickup' ? 'Pickup Date' : 'Drop Date'}: {formatDate(loc.date) || 'Not specified'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < data.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        );
        
      case 'driver':
        return (
          <List>
            {data.map((driver: any, index: number) => (
              <React.Fragment key={`driver-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={`Driver ${index + 1}`}
                    secondary={
                      <>
                        <Typography variant="body2" component="div">
                          Name: {driver.driverName || 'Unknown'}
                        </Typography>
                        {driver.driverPhone && (
                          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                            Phone: {driver.driverPhone}
                          </Typography>
                        )}
                        {driver.driverEmail && (
                          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                            Email: {driver.driverEmail}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < data.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        );
        
      default:
        return <Typography>No data available</Typography>;
    }
  };
  // Return the Dialog component with the content
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogActions>
        <IconButton onClick={onClose} size="small">
          {getIcon('CloseIcon')}
        </IconButton>
      </DialogActions>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Export the modal component
export { BiewLoadModal };

// Create a custom hook to expose the modal functions
export const useBiewLoadModal = () => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    type: 'carrier' | 'pickup' | 'delivery' | 'driver' | 'pickupdates' | 'deliverydates' | null;
    title: string;
    data: any[];
  }>({
    open: false,
    type: null,
    title: '',
    data: []
  });
  
  const openModal = (type: 'carrier' | 'pickup' | 'delivery' | 'driver', data: any[], title: string): void => {
    setModalState({
      open: true,
      type,
      title,
      data
    });
  };

  const closeModal = (): void => {
    setModalState(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Convenience functions for different modal types
  const openCarrierModal = (carriers: any[]): void => {
    openModal('carrier', carriers, 'Carriers');
  };

  const openPickupModal = (pickups: any[]): void => {
    openModal('pickup', pickups, 'Pickup Locations');
  };

  const openDeliveryModal = (deliveries: any[]): void => {
    openModal('delivery', deliveries, 'Delivery Locations');
  };

  const openDriverModal = (carriers: any[]): void => {
    // Extract all drivers from all carriers
    const allDrivers = carriers.flatMap(carrier => carrier.assignDrivers || []);
    openModal('driver', allDrivers, 'Drivers');
  };
  
  // Return the modal state and functions
  return {
    modalState,
    openModal,
    closeModal,
    openCarrierModal,
    openPickupModal,
    openDeliveryModal,
    openDriverModal
  };
}

export default BiewLoadModal