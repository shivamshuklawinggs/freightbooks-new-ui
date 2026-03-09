import AddCustomer from './load-customers/components/AddCustomer'
import AddAccCustomer from './acoount-customers/components/AddCustomer'
import { ICustomer, ICustomerTransactionDetails } from '@/types'
import { Button, Dialog, DialogActions } from '@mui/material';
import { getIcon } from '@/components/common/icons/getIcon';

const UniversalCustomerForm = ({data,onClose,open}:{data:ICustomerTransactionDetails,onClose:()=>void,open:boolean}) => {
  if(data.hasOwnProperty("isAccountCustomer") && data.isAccountCustomer){
     return (
       <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogActions>
                  <Button onClick={onClose}>
                    {getIcon('CloseIcon')}
                  </Button>
                </DialogActions>
         <AddAccCustomer open={data as ICustomer} onClose={onClose}/>
       </Dialog>
     )
   }
   else if(data.hasOwnProperty("isAccountCustomer") && !data.isAccountCustomer){
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogActions>
          <Button onClick={onClose}>
            {getIcon('CloseIcon')}
          </Button>
        </DialogActions>
        <AddCustomer open={data as ICustomer} onClose={onClose} />
      </Dialog>
    )
   }
}

export default UniversalCustomerForm