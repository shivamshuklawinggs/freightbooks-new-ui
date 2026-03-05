import React, { useState } from 'react';
import { Button, IconButton, Box, TableRow, TableCell } from '@mui/material';
import { PageHeader, DataTable } from '@/components/ui';
import { Edit as EditIcon } from '@mui/icons-material';
import PaymentTermForm from './components/PaymentTermForm';
import { IPaymentTerm } from '@/types';
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
      <PageHeader
        title="Payment Terms"
        subtitle="Configure invoice payment terms"
        actions={
          <HasPermission action="create" resource={["accounting"]} component={
            <Button variant="contained" size="small" onClick={() => handleOpenDialog()} sx={{ borderRadius: 2 }}>Add New Payment Term</Button>
          }/>
        }
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'days', label: 'Days' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={data?.data?.filter((term: IPaymentTerm) => term._id !== "") ?? []}
        isLoading={isLoading}
        emptyMessage="No payment terms found"
        total={data?.total ?? 0}
        page={State.page - 1}
        rowsPerPage={State.limit}
        onPageChange={(newPage) => setState({ ...State, page: newPage + 1 })}
        onRowsPerPageChange={(rows) => setState({ ...State, limit: rows })}
        renderRow={(term: IPaymentTerm) => (
          <TableRow key={term._id}  sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ py: 1.25 }}>{term.name}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{term.description}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{term.days}</TableCell>
            <TableCell sx={{ py: 0.5 }}>
              <HasPermission action="update" resource={["accounting"]} component={
                <IconButton size="small" onClick={() => handleOpenDialog(term)}><EditIcon fontSize="small" /></IconButton>
              }/>
            </TableCell>
          </TableRow>
        )}
      />

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