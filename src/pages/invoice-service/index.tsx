import React, { useState } from 'react';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import {
  Modal,
  Box,
  Typography,
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TablePagination,
  Chip,
} from '@mui/material';
import CustomerInvoiseForm from './CustomerInvoiseForm';
import InvoiceDownloadButton from './components/InvoiceDownloadButton';
import { IInvoice, InvoiceResponse } from '@/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { initialInvoiseData } from './genearateInvoiceSchema';
import VerticalMenu from '@/components/VerticalMenu';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import FileUploadButton from '@/components/common/FileUploadButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { downloadCSV, getInvoiceStatus } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { FileImportError } from '@/components/common/FileImportError';
import { useNavigate } from 'react-router-dom';
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
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceResponse | typeof initialInvoiseData | null>(initialInvoiseData);

  const fetchInvoices = async (): Promise<LoadResponse> => {
    try {
      const response: LoadResponse = await apiService.getAccountInvoices({
        page: currentPage,
        limit: limit,
      });
      return response;
    } catch (error) {
      console.warn('Error fetching Invoices:', error);
      throw error;
    }
  };

  const { data, isPending, refetch } = useQuery<LoadResponse>({
    queryKey: ['load-invoices', currentPage, limit],
    queryFn: fetchInvoices,
  });

  const invoiceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingInvoice?._id) {
        return apiService.updateAccountInvoice(editingInvoice._id, data);
      }
      return apiService.generateAccountInvoice(data);
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
  const invoiceImportMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('file', data.file);
      return apiService.importInvoice(formData);
    },
    onSuccess: (response: any) => {
      refetch();
      toast.success(response?.message || `Invoice imported successfully`);
    },
    onError: (error: any) => {
      const allerrors = error?.response?.data?.errors?.allErrors
      if (!allerrors) {
        toast.error(error.message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (InvoicesId: string) => apiService.deleteAccountInvoice(InvoicesId),
    onSuccess: () => {
      toast.success('Invoices deleted successfully');
      refetch();
    },
    onError: (error: any) => {

      toast.error(error.message || 'Failed to delete Invoices');
    },
  });
  const exportCustomersMutation = useMutation({
    mutationFn: () => apiService.exportInvoice(),
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

  const handleCreateInvoice = async (data: any): Promise<void> => {
    invoiceMutation.mutate(data);
  };
  const handleDeleteInvoice = async (InvoiceId: string): Promise<void> => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Invoice?");
    if (confirmDelete) {
      deleteMutation.mutate(InvoiceId);
    }
  };

  const handleInvoiceClick = (invoice: InvoiceResponse) => {
    if (!invoice) return;
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleImportInvoice = (file: File) => {
    invoiceImportMutation.mutate({ file });
  };

  return (
    <>
      <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
        <Container maxWidth={false}>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5"></Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <HasPermission action="create" resource={["accounting"]} component={<Button
                variant="contained"
                color="primary"
                startIcon={getIcon("plus")}
                onClick={() => {
                  setEditingInvoice(initialInvoiseData);
                  setShowInvoiceModal(true);
                }}
              >
                Create New
              </Button>} />
              {/* add import  data via fileupload  */}
              <HasPermission action="import" resource={["accounting"]} component={<FileUploadButton
                onFileSelect={handleImportInvoice}
                loading={invoiceImportMutation.isPending}
              />} />
              <HasPermission action="export" resource={["accounting"]} component={<Button
                variant="contained"
                onClick={handleExportData}
                disabled={exportCustomersMutation.isPending}
                startIcon={exportCustomersMutation.isPending ? <LoadingSpinner size={20} /> : getIcon("fileDownload")}
              >
              </Button>} />
              {/* add example csv file download button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={getIcon("fileDownload")}
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/download/invoices.csv', '_blank');
                }}
              >
                Sample
              </Button>

            </Box>
          </Box>
          <FileImportError allerrors={invoiceImportMutation?.error?.response?.data?.errors?.allErrors || []} message={invoiceImportMutation?.error?.response?.data?.message || "Error importing vendors"} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell> */}
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice Date</TableCell>
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
                    <TableCell colSpan={9} align="center">
                      <LoadingSpinner size={50} />
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(data?.data) && data?.data.length > 0 ? (
                  data.data.map((invoice) => (
                    <TableRow key={invoice._id} hover>
                      {/* <TableCell>{invoice.id}</TableCell> */}
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer?.company || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip {...getInvoiceStatus(invoice.dueAmount || 0, invoice.dueDate,"invoice")} />
                        
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{invoice?.totalAmountWithTax?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{invoice?.recievedAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{invoice?.dueAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">

                          <VerticalMenu
                            actions={[
                              hasAccess(["accounting"], "update", user) ? {
                                label: "Edit",
                                icon:"edit",
                                onClick: () => handleInvoiceClick(invoice),
                              } : null,
                              hasAccess(["accounting"], "delete", user) ? {
                                label: "Delete",
                                icon: "delete",
                                onClick: () => handleDeleteInvoice(invoice._id),
                              } : null,
                              hasAccess(["accounting"], "create", user) ? {
                                label: "Make Payment",
                                icon: "payment",
                                onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${invoice.customerId}?invoiceNumber=${invoice.invoiceNumber}`),
                              } : null,
                            ]}
                          />
                          <InvoiceDownloadButton invoiseId={invoice._id} invoiceType={invoice.type} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
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

      {/* Invoice Modal */}
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
            {editingInvoice?._id ? 'Edit Invoice' : 'Create Invoice'}
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

export default withPermission("view", ["accounting"])(GetInvoices);
