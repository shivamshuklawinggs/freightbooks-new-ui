import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Menu, MenuItem } from '@mui/material';
import { IitemService,ICarrierExpenseDispatcher, ICustomer, ILocationWithIds  } from '@/types';
import apiService from '@/service/apiService';
import { useQuery } from '@tanstack/react-query';
interface ItemServicesResponse {
  data: IitemService[];
  // Add other properties from the response if they exist
}
interface Load {
  _id: string;
  loadNumber: string;
  currentLocation?:string;
  loadAmount: number;
  customerId:ICustomer;
  pickupLocationId: ILocationWithIds[];
  deliveryLocationId: ILocationWithIds[];
  status: string;
  followUpDate: Date;
  followupstatus: string;
  carrierIds: ICarrierExpenseDispatcher;
}
interface LoadMenuProps {
  load: Load;
  handleLoadClick: (load: Load, service: IitemService | null, type: string) => void;
  handleMenuClose: (loadId: string) => void;
  menuAnchorEl: HTMLElement | null;
  open: boolean;
  setShowModal: (showModal: boolean) => void;
}

const LoadMenu: React.FC<LoadMenuProps> = ({
  load,
  handleLoadClick,
  handleMenuClose,
  menuAnchorEl,
  open,
  setShowModal,
}) => {
  const theme = useTheme();

const {data,}=useQuery<ItemServicesResponse>({
  queryKey:['itemServices'],
  queryFn:async()=>{
    const response=await apiService.getItemServices()
    return response.data
  },
 
})
  return (
    <Menu
      anchorEl={menuAnchorEl}
      open={open}
      onClose={() => handleMenuClose(load._id)}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 1,
          minWidth: 180,
          boxShadow: theme.shadows[3]
        }
      }}
    >
      {/*  add new service */}
      <MenuItem 
      onClick={()=>setShowModal(true)}
      sx={{
        py: 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08)
        }
      }}
      >
        Add New Service
      </MenuItem>
      {Array.isArray(data) && data?.map((item:IitemService) => (
        <MenuItem 
          key={item.label} 
          onClick={() => {
            handleLoadClick(load, item, 'expense');
            handleMenuClose(load._id);
                    }}
          sx={{
            py: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          Add {item.label} Fee
        </MenuItem>
      ))}
    </Menu>
  );
};
export default LoadMenu