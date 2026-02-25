import React from 'react'
import CustomerInvoiceForm from '@/pages/carrier-service/VendorBills/CustomerInvoiseForm'
import apiService from '@/service/apiService'
import { toast } from 'react-toastify'
import { Box, Modal, Typography } from '@mui/material'
import { initialInvoiseData as initialLoadInvoiceData } from '@/pages/carrier-service/VendorBills/genearateInvoiceSchema';
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};
interface IState {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}
const BillSection:React.FC<IState> = ({showModal,setShowModal}) => {
    const handleCreateInvoice = async (data: any): Promise<void> => {
      try {
        const  response = await apiService.generateAccountBill(data);
        toast.success(response?.message || `Invoice created successfully`);
      } catch (error: any) {
        toast.error(`Failed to create invoice`);
        toast.error(error.message);
      }
    };

    return <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
  
      aria-labelledby="invoice-modal-title"
      aria-describedby="invoice-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="invoice-modal-title" variant="h6" component="h2">
          Create Bill
        </Typography>
        <CustomerInvoiceForm onSubmit={handleCreateInvoice} initialData={initialLoadInvoiceData} loading={false} />
      </Box>
    </Modal>
}

export default BillSection