
import { ILocationWithIds } from '@/types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useTheme } from '@mui/material/styles';
import { formatDate } from '@/utils/dateUtils';
// Address Modal Component
// Address Modal Component
const AddressModal:React.FC<{addressModalOpen:any,setAddressModalOpen:any,selectedAddresses:any,}> = ({addressModalOpen,selectedAddresses,setAddressModalOpen}) => {
    const theme = useTheme();
    // Function to close address modal
const closeAddressModal = () => {
  setAddressModalOpen(false);
};
  return (
    <Dialog
      open={addressModalOpen}
      onClose={closeAddressModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        py: 2
      }}>
        <Typography variant="h6" fontWeight="500">{selectedAddresses.title}</Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <List sx={{ py: 0 }}>
          {selectedAddresses.locations.map((loc:ILocationWithIds, index:number) => (
            <ListItem 
              key={`${loc._id}-${index}`} 
              divider={index < selectedAddresses.locations.length - 1}
              sx={{ py: 1.5 }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="500">
                    Origin {index + 1}
                  </Typography>
                }
                secondary={
                  <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Address:</strong> {`${loc.address}-${loc.city}, ${loc.state}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Check In Date:</strong> {loc.checkin ?formatDate(loc.checkin)  : 'Not Checked In'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Check Out Date:</strong> {loc.checkout ?formatDate(loc.checkout)  : 'Not Checked Out'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>{selectedAddresses.type === 'pickup' ? 'Pickup' : 'Delivery'} Date & Time:</strong> {loc.date ?formatDate(loc.date) + ' ' + loc.time : 'Not Picked Up'}
                  </Typography>
                  {loc.endTime && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      <strong>{selectedAddresses.type === 'pickup' ? 'Pickup' : 'Delivery'} End Date & Time:</strong> {loc.date ? formatDate(loc.date)  + ' ' + loc.endTime : 'Not Picked Up'}
                    </Typography>
                  )}
                  </>
                  
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={closeAddressModal} 
          variant="contained"
          size="medium"
          sx={{ 
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const renderAddress = (locations: ILocationWithIds[] | undefined, loadId: string, type: string,setAddressModalOpen:any,setSelectedAddresses:any,expandedAddresses:any, setExpandedAddresses:any) => {
   

    // Function to toggle address expansion
// const toggleAddressExpansion = (addressKey: string) => {
//   setExpandedAddresses((prev:any) => ({
//     ...prev,
//     [addressKey]: !prev[addressKey]
//   }));
// };
// Function to open address modal
const openAddressModal = (locations: ILocationWithIds[], type: string) => {
  setSelectedAddresses({
    locations,
    title: type === 'pickup' ? 'Origin Addresses' : 'Destination Addresses',
    type: type  
  });
  setAddressModalOpen(true);
};


  if (!locations || locations.length === 0) return '-';
  
  // If there's only one address, show it with Read More option
  // if (locations.length === 1) {
  //   const loc = locations[0];
  //   const addressKey = `${loadId}-${type}-0`;
  //   const isExpanded = expandedAddresses[addressKey] || false;
  //   const fullAddress = `${loc.address}-${loc.city}, ${loc.state}`;
  //   const displayAddress = isExpanded 
  //     ? fullAddress 
  //     : `${fullAddress.substring(0, 30)}${fullAddress.length > 30 ? '...' : ''}`;
    
  //   return (
  //     <Box key={`${loc._id}-0`} sx={{ maxWidth: 500 }}>
  //       <Typography 
  //         variant="body2" 
  //         sx={{ 
  //           display: 'inline',
  //           color: theme.palette.text.primary,
  //           wordBreak: 'break-word'
  //         }}
  //       >
  //         {displayAddress}
  //       </Typography>
  //       {fullAddress.length > 30 && (
  //         <Button 
             
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             toggleAddressExpansion(addressKey);
  //           }}
  //           sx={{ 
  //             ml: 1, 
  //             p: 0, 
  //           //   minWidth: 'auto', 
  //             textTransform: 'none',
  //             fontSize: '0.75rem',
  //             fontWeight: 500,
  //             '&:hover': {
  //               backgroundColor: 'transparent',
  //               textDecoration: 'underline'
  //             }
  //           }}
  //         >
  //           {isExpanded ? 'Show Less' : 'Read More'}
  //         </Button>
  //       )}
  //     </Box>
  //   );
  // }
  
  // If there are multiple addresses, show the first one and a View All button
  // const firstLoc = locations[0];
  // const firstAddress = `${firstLoc.address}-${firstLoc.city}, ${firstLoc.state}`;
  // const shortAddress = `${firstAddress.substring(0, 30)}${firstAddress.length > 30 ? '...' : ''}`;
  
  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* <Typography 
          variant="subtitle1" 
          sx={{ 
            color: theme.palette.text.primary,
            // wordBreak: 'break-word',
            maxWidth: "100%"
          }}
        >
          {shortAddress}
        </Typography> */}
        <Button
          
          color="primary"
          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => {
            e.stopPropagation();
            openAddressModal(locations, type);
          }}
          sx={{ 
            ml: 1, 
            p: 0, 
            minHeight: 22,
            minWidth: 'auto', 
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          View({locations.length})
        </Button>
      </Box>
    </Box>
  );
};

export  {renderAddress,AddressModal}
