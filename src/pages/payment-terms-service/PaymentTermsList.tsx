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
<Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Payment Terms</Typography>
        <HasPermission action="create" resource={["accounting"]} component={
           <Button
           variant="contained"
           color="primary"
           onClick={() => handleOpenDialog()}
         >
           Add New Payment Term
         </Button>
        }/>
       
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Description</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Days</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <LoadingSpinner size={50} />
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.filter((term:IPaymentTerm)=>term._id!=="").map((term:IPaymentTerm) => (
                  <TableRow key={term._id}>
                    <TableCell>{term.name}</TableCell>
                    <TableCell>{term.description}</TableCell>
                    <TableCell>{term.days}</TableCell>
                <TableCell>
                  <HasPermission action="update" resource={["accounting"]} component={
                  <IconButton onClick={() => handleOpenDialog(term)}>
                    <EditIcon />
                  </IconButton>
                }/>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={State.page - 1}
          onPageChange={(event, newPage) => setState({ ...State, page: newPage + 1 })}
          rowsPerPage={State.limit}
          onRowsPerPageChange={(event) => setState({ ...State, limit: parseInt(event.target.value, 10) })}
        />
      </TableContainer>

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