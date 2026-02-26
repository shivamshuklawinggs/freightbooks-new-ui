import React, { useState } from 'react';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import { Modal, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Chip, } from '@mui/material';
import CustomerInvoiseForm from './CustomerInvoiseForm';
import { IInvoice, InvoiceResponse } from '@/types';
import { RootState } from '@/redux/store';
import { useQuery, useMutation } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { initialInvoiseData } from './genearateInvoiceSchema';
import VerticalMenu from '@/components/VerticalMenu';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { formatDate } from '@/utils/dateUtils';
import { getInvoiceStatus } from '@/utils';
import { getIcon } from '@/components/common/icons/getIcon';

interface LoadResponse {
  data: InvoiceResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
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

const GetInvoices: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceResponse | typeof initialInvoiseData>(initialInvoiseData);

  const user = useSelector((state: RootState) => state.user)

  const fetchLoads = async (): Promise<LoadResponse> => {
    try {

      const response: LoadResponse = await apiService.getAccountEstimates({
        page: currentPage,
        limit: limit,
        type:"customer",
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
  const { data, isPending, refetch } = useQuery<LoadResponse>({
    queryKey: ['load-invoices', currentPage, limit,],
    queryFn: fetchLoads,
  })

  const invoiceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingInvoice?._id) {
        return apiService.updateEstimateInvoice(editingInvoice._id, data, "customer");
      }
      return apiService.generateEstimateInvoice(data, "customer");
    },
    onSuccess: (response: any) => {
      refetch();
      toast.success(response?.message || `Invoice ${editingInvoice?._id ? 'updated' : 'created'} successfully`);
      setShowInvoiceModal(false);
      setEditingInvoice(initialInvoiseData);
    },
    onError: (error: any) => {
      toast.error(`Failed to ${editingInvoice?._id ? 'update' : 'create'} invoice`);
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (loadId: string) => apiService.deleteEstimateInvoice(loadId),
    onSuccess: () => {
      toast.success('Load deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete load');
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: (id: string) => apiService.convertEstimateToInvoice(id),
    onSuccess: (response: any) => {
      toast.success(response?.message || 'Estimate converted to invoice successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to convert estimate to invoice');
    },
  });

  const handleCreateInvoice = async (data: any): Promise<void> => {
    invoiceMutation.mutate(data);
  };

  const handleDeleteLoad = async (loadId: string): Promise<void> => {
    const confirmDelete = window.confirm("Are you sure you want to delete this load?");
    if (confirmDelete) {
      deleteMutation.mutate(loadId);
    }
  }
  const handleInvoiceClick = (
    invoice?: InvoiceResponse
  ) => {
    const data = invoice || initialInvoiseData;
    setEditingInvoice(data);
    setShowInvoiceModal(true);
  };
  const handleConvertEstimateToInvoice = async (id: string) => {
    convertToInvoiceMutation.mutate(id);
  }
  return (
    <>
      <Box sx={{ minHeight: '100vh' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Estimates</Typography>
              <Typography variant="body2" color="text.secondary">Manage customer estimates and quotes</Typography>
            </Box>
            <HasPermission action="create" resource={["accounting"]} component={
              <Button variant="contained" size="small" startIcon={getIcon("plus")} onClick={() => handleInvoiceClick(undefined)} sx={{ borderRadius: 2 }}>
                Create New
              </Button>
            }/>
          </Box>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Estimate #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Invoice Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Received Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <LoadingSpinner size={50} />
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(data?.data) && data?.data.length > 0 ? (
                  data?.data.map((invoice) => (
                    <TableRow key={invoice._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1.25 }}>{invoice.invoiceNumber}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>{invoice.customer?.company || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Chip size="small" {...getInvoiceStatus(invoice.dueAmount || 0, invoice.dueDate, "invoice")} />
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>{invoice?.totalAmountWithTax?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>{invoice?.recievedAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell sx={{ py: 1.25 }}>{invoice?.dueAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                                              
                                              <VerticalMenu actions={[
                                                hasAccess(["accounting"],"update",user) ? {
                                                  label: "Edit",
                                                  icon: "edit",
                                                  onClick: () => handleInvoiceClick(invoice)
                                                }:null,
                                                hasAccess(["accounting"],"delete",user) ? {
                                                  label: "Delete",
                                                  icon:"delete",
                                                  onClick: () => handleDeleteLoad(invoice._id)
                                                }:null,
                                                hasAccess(["accounting"],"update",user) ? {
                                                  label: "Convert to Invoice",
                                                  icon:"convert",
                                                  onClick: () => handleConvertEstimateToInvoice(invoice._id)
                                                }:null
                                              ]} />
                                            </TableCell>
                      {/* <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteLoad(invoice._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <InvoiceDownloadButton invoiseId={invoice._id} invoiceType={invoice.type} />
                          <IconButton
                            color="primary"
                            onClick={() => handleInvoiceClick(invoice)}
                            disabled={currentRole?.includes("dispatcher")}
                          >
                            <EditIcon />
                          </IconButton>
                        
                        </Stack>
                      </TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">No records found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={data?.pagination?.total || 0}
              page={currentPage - 1}
              rowsPerPage={limit}
              onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
              onRowsPerPageChange={(e) => setLimit(Number(e.target.value))}
              sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
            />
          </TableContainer>
          </Paper>
      </Box>
      <Modal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setEditingInvoice(initialInvoiseData);
        }}

        aria-labelledby="invoice-modal-title"
        aria-describedby="invoice-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="invoice-modal-title" variant="h6" component="h2">
            {editingInvoice?._id ? 'Edit  Estimate' : 'Create  Estimate'}
          </Typography>
          <CustomerInvoiseForm
            initialData={editingInvoice as IInvoice}
            onSubmit={handleCreateInvoice as (data: FormData) => Promise<void>}
            loading={invoiceMutation.isPending}
          />
        </Box>
      </Modal>
    </>
  );
};

export default withPermission("view",["accounting"])(GetInvoices);
