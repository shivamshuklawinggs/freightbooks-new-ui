import React, { useState } from 'react';
import {
  Box, Button, Container, Typography, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, Alert, CircularProgress
} from '@mui/material';
import { PageHeader, DataTable } from '@/components/ui';
import {
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { IJournalEntry } from './Schema/JournalEntrySchema';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils';
import { paths } from '@/utils/paths';
import { getIcon } from '@/components/common/icons/getIcon';

// Extended interface to include database fields
interface IJournalEntryWithId extends IJournalEntry {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  totalDebit: number;
  totalCredit: number;
}

interface JournalEntryListProps {
  onEdit?: (entry: IJournalEntryWithId) => void;
}

const JournalEntryList: React.FC<JournalEntryListProps> = ({ onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const limit = 10;

  const { data: journalEntriesData, isLoading, error } = useQuery({
    queryKey: ['journalEntries', page, limit],
    queryFn: () => apiService.getJournalEntries({ page, limit }).then(res => res),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteJournalEntry(id),
    onSuccess: () => {
      toast.success('Journal entry deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete journal entry');
    },
  });

  const handleEdit = (entry: IJournalEntryWithId) => {
    if (onEdit) {
      onEdit(entry);
    } else {
      navigate(`/accounting${paths.JournalEntry}/${entry._id}`);
    }
  };

  const handleDelete = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteMutation.mutate(entryToDelete);
    }
  };

 


  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">
          Failed to load journal entries. Please try again.
        </Alert>
      </Container>
    );
  }
  const journalEntries = journalEntriesData?.data || [];
  const totalPages = journalEntriesData?.totalPages || 0

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeader
        title="Journal Entries"
        subtitle="View, edit, and manage your journal entries"
        actions={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate(`/accounting${paths.JournalEntry}`)} sx={{ borderRadius: 2 }}>
            New Journal Entry
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: 'journalNo', label: 'Journal No' },
          { key: 'date', label: 'Date' },
          { key: 'memo', label: 'Memo' },
          { key: 'totalDebit', label: 'Total Debit' },
          { key: 'totalCredit', label: 'Total Credit' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={journalEntries}
        isLoading={false}
        emptyMessage="No journal entries found"
        renderRow={(entry: IJournalEntryWithId) => (
          <TableRow key={entry._id} hover>
            <TableCell>{entry.journalNumber}</TableCell>
            <TableCell>{entry.journalDate ? format(new Date(entry.journalDate), 'MMM dd, yyyy') : ''}</TableCell>
            <TableCell>
              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{entry.memo || '-'}</Typography>
            </TableCell>
            <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
            <TableCell>{formatCurrency(entry.totalCredit)}</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(entry)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(entry._id)} title="Delete" color="error"><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </TableCell>
          </TableRow>
        )}
      />

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogActions>
          <IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
            {getIcon('CloseIcon')}
          </IconButton>
        </DialogActions>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this journal entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JournalEntryList;
