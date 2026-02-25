import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import LoadInvoices from '@/pages/estimate-service/LoadInvoices/CustomerInvoiseForm'
import apiService from '@/service/apiService'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { Box, Modal } from '@mui/material'
import { initialInvoiseData as initialLoadInvoiceData } from '@/pages/invoice-service/genearateInvoiceSchema';
import { useQueryClient } from '@tanstack/react-query'
interface IState {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}
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

const InvoiseSection: React.FC<IState> = ({ showModal, setShowModal }) => {
  const queryClient = useQueryClient()
  const { id } = useParams();
  const company = useSelector((state: RootState) => state.user.currentCompanyDetails)
  const handleCreateInvoice = async (data: any): Promise<void> => {
    try {
      const response = await apiService.generateEstimateInvoice(data,  company?.type=="OTHER" ? "other" : "customer");
      toast.success(response?.message || `Invoice created successfully`);
      queryClient.refetchQueries({ queryKey: ['getEstimatesByCustomerId',] })
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
      {<LoadInvoices onSubmit={handleCreateInvoice} initialData={initialData} loading={false} />}
    </Box>
  </Modal>
}

export default InvoiseSection