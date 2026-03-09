
import { ICarrier, ICustomerTransactionDetails } from '@/types'
import { Dialog, DialogActions, Button } from '@mui/material';
import CarrierModal from './CarrierModal';
import { getIcon } from '@/components/common/icons/getIcon';

const UniversalVendorForm = ({data,onClose,open}:{data:ICustomerTransactionDetails,onClose:()=>void,open:boolean}) => {
     return (
       <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogActions>
          <Button onClick={onClose}>
            {getIcon('CloseIcon')}
          </Button>
        </DialogActions>
         <CarrierModal open={data as ICarrier} onClose={onClose} isCarrier={data.isCarrier || false}/>
       </Dialog>
     )
}

export default UniversalVendorForm