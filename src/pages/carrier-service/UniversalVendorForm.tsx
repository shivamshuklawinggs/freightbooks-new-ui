
import { ICarrier, ICustomerTransactionDetails } from '@/types'
import { Dialog } from '@mui/material';
import CarrierModal from './CarrierModal';

const UniversalVendorForm = ({data,onClose,open}:{data:ICustomerTransactionDetails,onClose:()=>void,open:boolean}) => {
     return (
       <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
         <CarrierModal open={data as ICarrier} onClose={onClose} isCarrier={data.isCarrier || false}/>
       </Dialog>
     )
}

export default UniversalVendorForm