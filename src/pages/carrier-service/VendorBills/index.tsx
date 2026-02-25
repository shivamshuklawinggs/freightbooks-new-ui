import React, { useState, useEffect } from 'react';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import { Modal, Box, Typography, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, TablePagination, Chip, } from '@mui/material';
import {  Download } from '@mui/icons-material';
import CustomerInvoiseForm from './CustomerInvoiseForm';
import InvoiceDownloadButton from './components/InvoiceDownloadButton';
import { IVendorBill, VendorInvoiceResponse } from '@/types';
import { RootState } from '@/redux/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { initialInvoiseData } from './genearateInvoiceSchema';
import VerticalMenu from '@/components/VerticalMenu';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import FileUploadButton from '@/components/common/FileUploadButton';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { downloadCSV, getInvoiceStatus } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '@/components/common/icons/getIcon';
interface LoadResponse {
  data: VendorInvoiceResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface MutationResponse {
  message: string;
  data: any;
}

interface InvoiceData {
  _id?: string;
  [key: string]: any;
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

const VendorBills: React.FC = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<VendorInvoiceResponse | typeof initialInvoiseData | null>(initialInvoiseData);
  const [openErrorAlert, setOpenErrorAlert] = useState(true);

  const currentUser = useSelector((state: RootState) => state.user)
  const fetchLoads = async (): Promise<LoadResponse> => {
    try {

      const response: LoadResponse = await apiService.getAccountBills({
        page: currentPage,
        limit: limit,
      });
      return response;
    } catch (error) {
      console.warn('Error fetching loads:', error);
      throw error;
    }
  };
  const { data, isPending, refetch } = useQuery<LoadResponse>({
    queryKey: ['other-invoices', currentPage, limit,],
    queryFn: fetchLoads,
  })

  const { mutate: createInvoiceMutation, isPending: isLoading } = useMutation<MutationResponse, Error, InvoiceData>({
    mutationFn: async (data) => {
      if (editingInvoice?._id) {
        return await apiService.updateAccountBill(editingInvoice._id, data);
      }
      return await apiService.generateAccountBill(data);
    },
    onSuccess: (response) => {
      refetch();
      toast.success(response?.message || `Invoice ${editingInvoice?._id ? 'updated' : 'created'} successfully`);
      setShowInvoiceModal(false);
      setEditingInvoice(initialInvoiseData);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to ${editingInvoice?._id ? 'update' : 'create'} invoice`);
    }
  });
  const BillImportMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('file', data.file);
      return apiService.importBill(formData);
    },
    onSuccess: (response: any) => {
      refetch();
      toast.success(response?.message || `Bill imported successfully`);
    },
    onError: (error: any) => {
      const allerrors = error?.response?.data?.errors?.allErrors
      if (!allerrors) {
        toast.error(error.message);
      }
    },
  });
  const allerrors = BillImportMutation?.error?.response?.data?.errors?.allErrors
  const deleteMutation = useMutation({
    mutationFn: (loadId: string) => apiService.deleteAccountBill(loadId),
    onSuccess: () => {
      toast.success('Load deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete load');
    },
  });
  const exportCustomersMutation = useMutation({
    mutationFn: () => apiService.exortBill(),
    onSuccess: (data) => {
      downloadCSV(data.data);
      toast.success('Invoices exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export Invoices');
    },
  });
  const handleExportData = async () => {
    exportCustomersMutation.mutate();
  }
  const handleDeleteLoad = async (loadId: string): Promise<void> => {
    const confirmDelete = window.confirm("Are you sure you want to delete this load?");
    if (confirmDelete) {
      deleteMutation.mutate(loadId);
    }
  }
  const handleInvoiceClick = (invoice: VendorInvoiceResponse) => {
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };


  const handleImportInvoice = (file: File) => {
    BillImportMutation.mutate({ file });
  };

  useEffect(() => {
    if (Array.isArray(allerrors) && allerrors.length > 0) {
      setOpenErrorAlert(true);
    }
  }, [allerrors]);

  return (
    <>
      <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
        <Container maxWidth={false}>
          {Array.isArray(allerrors) && allerrors.length > 0 && (
            <Collapse in={openErrorAlert}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpenErrorAlert(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                <AlertTitle>{BillImportMutation?.error?.response?.data?.message}</AlertTitle>
                <Typography variant="body2">
                  {allerrors.join(', ')}
                </Typography>
              </Alert>
            </Collapse>
          )}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5"></Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <HasPermission action="create" resource={["accounting"]} component={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={getIcon("plus")}
                  onClick={() => {
                    setEditingInvoice(initialInvoiseData);
                    setShowInvoiceModal(true);
                  }}
                >
                  Create New
                </Button>
              } />
              {/* add import  data via fileupload  */}
              <HasPermission action="import" resource={["accounting"]} component={<FileUploadButton
                onFileSelect={handleImportInvoice}
                loading={BillImportMutation.isPending}
              />} />
              <HasPermission action="export" resource={["accounting"]} component={<Button
                variant="contained"
                onClick={handleExportData}
                disabled={exportCustomersMutation.isPending}
                startIcon={exportCustomersMutation.isPending ? <LoadingSpinner size={20} /> : getIcon("fileExport")}
              >
              </Button>} />
              {/* add example csv file download button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/download/Bill.csv', '_blank');
                }}
              >
                Sample
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell> */}
                  <TableCell sx={{ fontWeight: 'bold' }}>Bill #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bill Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recieved Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
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
                    <TableRow key={invoice._id} hover>
                      {/* <TableCell>{invoice.id}</TableCell> */}
                      <TableCell>{invoice.BillNumber}</TableCell>
                      <TableCell>{invoice.carrier?.company || "N/A"} </TableCell>
                      <TableCell>
                        <Chip {...getInvoiceStatus(invoice.dueAmount || 0, invoice.dueDate,"bill")} />
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.invoiceDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell>
                        {invoice?.totalAmountWithTax?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {invoice?.recievedAmount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {invoice?.dueAmount?.toFixed(2) || '0.00'}
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <VerticalMenu actions={[
                            hasAccess(["accounting"], "update", currentUser) ? {
                              label: "Edit",
                              icon: "edit",
                              onClick: () => handleInvoiceClick(invoice)
                            } : null,
                            hasAccess(["accounting"], "delete", currentUser) ? {
                              label: "Delete",
                              icon:"delete",
                              onClick: () => handleDeleteLoad(invoice._id),
                            } : null,
                            hasAccess(["accounting"], "create", currentUser) ? {
                              label: "Make Payment",
                              icon: "payment",
                              onClick: () => navigate(`/accounting/purchase/accounts/recievedbill/${invoice.vendorId}?BillNumber=${invoice.BillNumber}`),
                            } : null,

                          ]} />
                          <InvoiceDownloadButton invoiseId={invoice._id} />


                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1">No Records Found</Typography>
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

            />
          </TableContainer>

        </Container>
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
            {editingInvoice?._id ? 'Edit Bill' : 'Create Bill'}
          </Typography>
          <CustomerInvoiseForm
            initialData={editingInvoice as IVendorBill}
            onSubmit={createInvoiceMutation as any}
            loading={isLoading}
          />
        </Box>
      </Modal>
    </>
  );
};

export default withPermission("view", ["accounting"])(VendorBills);
