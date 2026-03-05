import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable } from '@/components/ui';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import { Modal, Box, Typography, Button, TableRow, TableCell, Stack, Chip, Tooltip, IconButton } from '@mui/material';
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
import { Alert, AlertTitle, Collapse } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh' }}>
          {Array.isArray(allerrors) && allerrors.length > 0 && (
            <Collapse in={openErrorAlert}>
              <Alert
                severity="error"
                action={
                  <IconButton aria-label="close" color="inherit" size="small" onClick={() => setOpenErrorAlert(false)}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <AlertTitle>{BillImportMutation?.error?.response?.data?.message}</AlertTitle>
                <Typography variant="body2">{allerrors.join(', ')}</Typography>
              </Alert>
            </Collapse>
          )}
          <PageHeader
            title="Vendor Bills"
            subtitle="Manage vendor bills and payments"
            actions={
              <>
                <HasPermission action="create" resource={["accounting"]} component={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={getIcon("plus")}
                    onClick={() => { setEditingInvoice(initialInvoiseData); setShowInvoiceModal(true); }}
                    sx={{ borderRadius: 2 }}
                  >
                    Create New
                  </Button>
                } />
                <HasPermission action="import" resource={["accounting"]} component={
                  <FileUploadButton onFileSelect={handleImportInvoice} loading={BillImportMutation.isPending} />
                } />
                <HasPermission action="export" resource={["accounting"]} component={
                  <Tooltip title="Export">
                    <span>
                      <IconButton size="small" onClick={handleExportData} disabled={exportCustomersMutation.isPending} sx={{ color: 'text.secondary' }}>
                        {exportCustomersMutation.isPending ? <LoadingSpinner size={16} /> : getIcon("fileExport")}
                      </IconButton>
                    </span>
                  </Tooltip>
                } />
                <Tooltip title="Download Sample">
                  <IconButton size="small" onClick={() => window.open('/download/Bill.csv', '_blank')} sx={{ color: 'text.secondary' }}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            }
          />
          <DataTable
            columns={[
              { key: 'billNumber', label: 'Bill #' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'status', label: 'Status' },
              { key: 'billDate', label: 'Bill Date' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'totalAmount', label: 'Total Amount' },
              { key: 'receivedAmount', label: 'Received Amount' },
              { key: 'dueAmount', label: 'Due Amount' },
              { key: 'actions', label: 'Actions', align: 'center' },
            ]}
            data={Array.isArray(data?.data) ? data.data : []}
            isLoading={isPending}
            total={data?.pagination?.total ?? 0}
            page={currentPage - 1}
            rowsPerPage={limit}
            onPageChange={(newPage) => setCurrentPage(newPage + 1)}
            onRowsPerPageChange={(rows) => setLimit(rows)}
            renderRow={(invoice) => (
              <TableRow key={invoice._id} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ py: 1.25 }}>{invoice.BillNumber}</TableCell>
                <TableCell sx={{ py: 1.25 }}>{invoice.carrier?.company || 'N/A'}</TableCell>
                <TableCell sx={{ py: 1.25 }}>
                  <Chip size="small" {...getInvoiceStatus(invoice.dueAmount || 0, invoice.dueDate, 'bill')} />
                </TableCell>
                <TableCell sx={{ py: 1.25 }}>{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell sx={{ py: 1.25 }}>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell sx={{ py: 1.25 }}>{invoice?.totalAmountWithTax?.toFixed(2) || '0.00'}</TableCell>
                <TableCell sx={{ py: 1.25 }}>{invoice?.recievedAmount?.toFixed(2) || '0.00'}</TableCell>
                <TableCell sx={{ py: 1.25 }}>{invoice?.dueAmount?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <VerticalMenu actions={[
                      hasAccess(['accounting'], 'update', currentUser) ? { label: 'Edit', icon: 'edit', onClick: () => handleInvoiceClick(invoice) } : null,
                      hasAccess(['accounting'], 'delete', currentUser) ? { label: 'Delete', icon: 'delete', onClick: () => handleDeleteLoad(invoice._id) } : null,
                      hasAccess(['accounting'], 'create', currentUser) ? { label: 'Make Payment', icon: 'payment', onClick: () => navigate(`/accounting/purchase/accounts/recievedbill/${invoice.vendorId}?BillNumber=${invoice.BillNumber}`) } : null,
                    ]} />
                    <InvoiceDownloadButton invoiseId={invoice._id} />
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          />
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
