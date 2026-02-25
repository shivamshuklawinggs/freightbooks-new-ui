import React, { useState } from 'react';
import {
  Button,
  Container,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import { Search, FilterList as FilterIcon } from '@mui/icons-material';
import {  useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { IPayment, PaymentType } from '@/types';
import apiService from '@/service/apiService';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { capitalizeFirstLetter, formatCurrency } from '@/utils';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const currentUser = useSelector((state: RootState) => state.user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const { data: paymentsResponse, isLoading, error } = useQuery({
    queryKey: ['payments', page, rowsPerPage, searchTerm, fromDate, toDate],
    queryFn: async () => {
      const params: any = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
      };
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();
      
      const response = await apiService.getAllPayments(params);
      return response || { data: [], page: 1, limit: 10, total: 0 };
    },
    enabled: !!currentUser.currentCompany,
  });

  const payments = paymentsResponse?.data || [];
  const totalCount = paymentsResponse?.total || 0;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Invoice':
        return 'primary';
      case 'Bill':
        return 'secondary';
      case 'Unsettled':
        return 'info';
      default:
        return 'default';
    }
  };

const handleView = (payment: IPayment) => {
   if(payment.PaymentType===PaymentType.invoice){
    navigate(`${paths.recievedpayment}/${payment._id}`);
   }
   if(payment.PaymentType===PaymentType.bill){
    navigate(`${paths.recievedbill}/${payment._id}`);
   }
};
const handleDelete = async (payment: IPayment) => {
   try {
       // ask irst to delete 
      const Isdeklete=confirm("Are you sure you want to delete this payment?")
      if (Isdeklete) {
       await  apiService.deleteRecivedPayment(payment._id);
        toast.success("Payment deleted successfully");
        queryClient.invalidateQueries({ queryKey: ['payments', page, rowsPerPage, searchTerm, fromDate, toDate] });
      }
   } catch (error:any) {
      toast.error(error.message || "Something went wrong");
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">Error loading payments: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={setFromDate}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={setToDate}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setFromDate(null);
                    setToDate(null);
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment: IPayment) => (
                    <TableRow key={payment._id} hover>
                      <TableCell>
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{payment.referenceNo}</TableCell>
                      <TableCell>
                        {payment.customer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.type || 'N/A'}
                          color={getTypeColor(payment.type || '')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{capitalizeFirstLetter(payment.paymentMethod)}</TableCell>
                  
                      <TableCell>
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => handleView(payment)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(payment)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box py={4}>
                        <Typography variant="body1" color="text.secondary">
                          No payments found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {payments.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentsList;