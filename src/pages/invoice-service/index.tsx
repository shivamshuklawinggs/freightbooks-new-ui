import React, { useState } from 'react';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import {
  Modal,
  Box,
  Typography,
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
  Tooltip,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
      <Box sx={{ minHeight: '100vh' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Invoices</Typography>
              <Typography variant="body2" color="text.secondary">Manage customer invoices</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <HasPermission
                action="create"
                resource={["accounting"]}
                component={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={getIcon("plus")}
                    onClick={() => { setEditingInvoice(initialInvoiseData); setShowInvoiceModal(true); }}
                    sx={{ borderRadius: 2 }}
                  >
                    Create New
                  </Button>
                }
              />
              <HasPermission
                action="import"
                resource={["accounting"]}
                component={<FileUploadButton onFileSelect={handleImportInvoice} loading={invoiceImportMutation.isPending} />}
              />
              <HasPermission
                action="export"
                resource={["accounting"]}
                component={
                  <Tooltip title="Export">
                    <span>
                      <IconButton size="small" onClick={handleExportData} disabled={exportCustomersMutation.isPending} sx={{ color: 'text.secondary' }}>
                        {exportCustomersMutation.isPending ? <LoadingSpinner size={16} /> : getIcon("fileDownload")}
                      </IconButton>
                    </span>
                  </Tooltip>
                }
              />
              <Tooltip title="Download Sample">
                <IconButton size="small" onClick={() => window.open('/download/invoices.csv', '_blank')} sx={{ color: 'text.secondary' }}>
                  {getIcon("fileDownload")}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <FileImportError allerrors={invoiceImportMutation?.error?.response?.data?.errors?.allErrors || []} message={invoiceImportMutation?.error?.response?.data?.message || "Error importing invoices"} />
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Invoice #</TableCell>
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
                    <TableCell colSpan={9} align="center">
                      <LoadingSpinner size={50} />
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(data?.data) && data?.data.length > 0 ? (
                  data.data.map((invoice) => (
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
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <VerticalMenu
                            actions={[
                              hasAccess(["accounting"], "update", user)
                                ? { label: 'Edit', icon: "edit", onClick: () => handleInvoiceClick(invoice) }
                                : null,
                              hasAccess(["accounting"], "delete", user)
                                ? { label: 'Delete', icon: "delete", onClick: () => handleDeleteInvoice(invoice._id) }
                                : null,
                              hasAccess(["accounting"], "create", user)
                                ? { label: 'Make Payment', icon: "payment", onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${invoice.customerId}?invoiceNumber=${invoice.invoiceNumber}`) }
                                : null,
                            ]}
                          />
                          <InvoiceDownloadButton invoiseId={invoice._id} invoiceType={invoice.type} />
                        </Stack>
                      </TableCell>
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
          </TableContainer>
          <Divider />
          <TablePagination
            component="div"
            count={data?.pagination?.total || 0}
            page={currentPage - 1}
            rowsPerPage={limit}
            onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
            onRowsPerPageChange={(e) => setLimit(Number(e.target.value))}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
          />
          </Paper>
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
