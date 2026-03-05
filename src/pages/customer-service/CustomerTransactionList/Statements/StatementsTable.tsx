import React, { RefObject, useState, useMemo } from 'react';
import { Typography, TableContainer, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Button, Checkbox, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import { formatCurrency, handlePrint } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { useParams } from 'react-router-dom';
import { IStatementsReponse } from '@/types';
import VerticalMenu from '@/components/VerticalMenu';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getIcon } from '@/components/common/icons/getIcon';

const StatementsTable: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<{
    open: boolean;
    statement?: IStatementsReponse;
  }>({ open: false, statement: undefined });

  const { data: invoiceData, isLoading: isLoadingInvoice ,isFetching} = useQuery<IStatementsReponse[], Error>({
    queryKey: ['getStatementsByCustomerId', id],
    queryFn: async () => {
        const response = await apiService.getStatementsByCustomerId(id as string)
        return response.data
    },
    enabled: !!id,
});
  const deleteStatementMutation = useMutation({
    mutationFn: (statementId: string) => apiService.deleteStatement(statementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getStatementsByCustomerId', id] });
      toast.success('Statement deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete statement');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((sid) => apiService.deleteStatement(sid))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getStatementsByCustomerId', id] });
      setSelectedIds(new Set());
      toast.success('Selected statements deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete selected statements');
    },
  });

  const allIds = useMemo(
    () => (Array.isArray(invoiceData) ? invoiceData.map((s) => s._id as string) : []),
    [invoiceData]
  );
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleSelectOne = (statementId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(statementId)) next.delete(statementId);
      else next.add(statementId);
      return next;
    });
  };

  const handlePrintStatement = (statement: IStatementsReponse) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="padding: 20px;">
        <h2>Statement Details</h2>
        <p><strong>Date:</strong> ${formatDate(statement.createdAt)}</p>
        <p><strong>Customer:</strong> ${statement.customer.company}</p>
        <p><strong>Open Amount:</strong> ${formatCurrency(statement.totalBalance)}</p>
        <p><strong>Paid Amount:</strong> ${formatCurrency(statement.totalRecievedAmount)}</p>
        <p><strong>Balance Due:</strong> ${formatCurrency(statement.totalBalanceDue)}</p>
      </div>
    `;
    handlePrint({ current: printContent } as RefObject<HTMLDivElement>, 'Statement');
  };

  const confirmDeleteSingle = (statement: IStatementsReponse) => {
    setConfirmSingleDelete({ open: true, statement });
  };

  const executeSingleDelete = () => {
    if (confirmSingleDelete.statement?._id) {
      deleteStatementMutation.mutate(confirmSingleDelete.statement._id);
    }
    setConfirmSingleDelete({ open: false, statement: undefined });
  };

  const executeBulkDelete = () => {
    if (selectedIds.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
    setConfirmBulkDeleteOpen(false);
  };

  return (
    <Paper>
      <Box p={2}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6">Statements</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={getIcon('delete')}
              disabled={selectedIds.size === 0 || bulkDeleteMutation.isPending}
              onClick={() => setConfirmBulkDeleteOpen(true)}
            >
              {bulkDeleteMutation.isPending ? <CircularProgress size={16} /> : `Delete Selected (${selectedIds.size})`}
            </Button>
          </Stack>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={toggleSelectAll}
                    inputProps={{ 'aria-label': 'select all statements' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Customer
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Open Amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Paid Amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Balance Due
                  </Typography>
                </TableCell>
                <TableCell className="no-print">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingInvoice || isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : Array.isArray(invoiceData) && invoiceData.length > 0 ? (
                invoiceData.map((invoice) => {
                  const invoiceId = invoice._id as string;
                  const isSelected = selectedIds.has(invoiceId);
                  return (
                    <TableRow key={invoiceId}  selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleSelectOne(invoiceId)}
                          inputProps={{ 'aria-label': `select statement ${invoiceId}` }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>{invoice.customer.company}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalBalance)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalRecievedAmount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalBalanceDue)}</TableCell>
                      <TableCell>
                     
                        <VerticalMenu
                          actions={[
                            {
                              label: 'Print',
                              icon: 'Print',
                              onClick: () => handlePrintStatement(invoice),
                            },
                            {
                              label: 'Delete',
                              icon:"delete",
                              onClick: () => confirmDeleteSingle(invoice),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">No statements found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Confirm single delete */}
      <Dialog
        open={confirmSingleDelete.open}
        onClose={() => setConfirmSingleDelete({ open: false, statement: undefined })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the statement dated{' '}
          {confirmSingleDelete.statement
            ? formatDate(confirmSingleDelete.statement.createdAt)
            : ''}
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSingleDelete({ open: false, statement: undefined })}>
            Cancel
          </Button>
          <Button
            onClick={executeSingleDelete}
            variant="contained"
            disabled={deleteStatementMutation.isPending}
          >
            {deleteStatementMutation.isPending ? <CircularProgress size={16} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm bulk delete */}
      <Dialog open={confirmBulkDeleteOpen} onClose={() => setConfirmBulkDeleteOpen(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the {selectedIds.size} selected statement
          {selectedIds.size > 1 ? 's' : ''}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBulkDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={executeBulkDelete}
            variant="contained"
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? <CircularProgress size={16} /> : 'Delete Selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default StatementsTable;
