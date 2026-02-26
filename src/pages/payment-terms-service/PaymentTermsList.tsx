import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Box, Typography, TablePagination } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import PaymentTermForm from './components/PaymentTermForm';
import { IPaymentTerm } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchPaymentTerms } from '@/redux/api';
import { useDispatch, } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
const PaymentTermsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<IPaymentTerm | null>(null);
  const[State,setState] = useState({
    page:1,
    limit:10,
    search:"",
    sort:"asc",
    sortby:"name",
    total:0,
    data:[]
  })
  const {data,isLoading} = useQuery({
    queryKey: ['paymenterms', { page: State.page, limit: State.limit }],
    queryFn: async() => apiService.getPaymentTerms({ page: State.page, limit: State.limit }),
  });

 

  const handleOpenDialog = (term?: IPaymentTerm) => {
    if (term) {
      setSelectedTerm(term);
    } else {
      setSelectedTerm(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTerm(null);
  };

  return (
<Box sx={{ minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Payment Terms</Typography>
          <Typography variant="body2" color="text.secondary">Configure invoice payment terms</Typography>
        </Box>
        <HasPermission action="create" resource={["accounting"]} component={
          <Button variant="contained" size="small" onClick={() => handleOpenDialog()} sx={{ borderRadius: 2 }}>
            Add New Payment Term
          </Button>
        }/>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <LoadingSpinner size={36} />
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.filter((term: IPaymentTerm) => term._id !== "").map((term: IPaymentTerm) => (
                  <TableRow key={term._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.25 }}>{term.name}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{term.description}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{term.days}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <HasPermission action="update" resource={["accounting"]} component={
                        <IconButton size="small" onClick={() => handleOpenDialog(term)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }/>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={State.page - 1}
          onPageChange={(_, newPage) => setState({ ...State, page: newPage + 1 })}
          rowsPerPage={State.limit}
          onRowsPerPageChange={(event) => setState({ ...State, limit: parseInt(event.target.value, 10) })}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
        />
      </Paper>

      <PaymentTermForm
        open={openDialog}
        onClose={handleCloseDialog}
        initialData={selectedTerm || undefined}
        title={selectedTerm ? 'Edit Payment Term' : 'Add New Payment Term'}
        onSuccess={() => dispatch(fetchPaymentTerms({page:1,limit:100}))}
      />
    </Box>
  );
};

export default withPermission("view",["accounting"])(PaymentTermsList);