import AddCustomer from './load-customers/components/AddCustomer'
import AddAccCustomer from './acoount-customers/components/AddCustomer'
import { ICustomer, ICustomerTransactionDetails } from '@/types'
import { Dialog } from '@mui/material';

const UniversalCustomerForm = ({data,onClose,open}:{data:ICustomerTransactionDetails,onClose:()=>void,open:boolean}) => {
  if(data.hasOwnProperty("isAccountCustomer") && data.isAccountCustomer){
     return (
       <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
         <AddAccCustomer open={data as ICustomer} onClose={onClose}/>
       </Dialog>
     )
   }
   else if(data.hasOwnProperty("isAccountCustomer") && !data.isAccountCustomer){
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <AddCustomer open={data as ICustomer} onClose={onClose} />
      </Dialog>
    )
   }
}

export default UniversalCustomerForm