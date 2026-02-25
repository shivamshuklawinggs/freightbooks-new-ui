import React, { useEffect } from 'react'
import LoadInvoices from '@/pages/invoice-service/CustomerInvoiseForm'
import apiService from '@/service/apiService'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { Box, Modal, Typography } from '@mui/material'
import { initialInvoiseData as initialLoadInvoiceData } from '@/pages/invoice-service/genearateInvoiceSchema';
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
const InvoiseSection:React.FC<IState> = ({showModal,setShowModal}) => {
    const { id } = useParams();
    const handleCreateInvoice = async (data: any): Promise<void> => {
      try {
        const  response = await apiService.generateAccountInvoice(data,);
        toast.success(response?.message || `Invoice created successfully`);
      } catch (error: any) {
        toast.error(`Failed to create invoice`);
        toast.error(error.message);
      }
    };
    const [initialData, setInitialData] = React.useState<any>(null)
    useEffect(() => {
      let data:any={}
        data={
          ...initialLoadInvoiceData,
          customerId:id as string
        }
      setInitialData(data)
    }, [id])
  
    return <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
  
      aria-labelledby="invoice-modal-title"
      aria-describedby="invoice-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="invoice-modal-title" variant="h6" component="h2">
          Create Invoice
        </Typography>
        {<LoadInvoices onSubmit={handleCreateInvoice} initialData={initialData} loading={false} />}
      </Box>
    </Modal>
}

export default InvoiseSection