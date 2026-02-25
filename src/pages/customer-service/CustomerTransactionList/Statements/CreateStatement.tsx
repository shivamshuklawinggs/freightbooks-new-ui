import React, { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Box, Button, Stack, Link, Chip, } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiService from '@/service/apiService';
import { addressformat, formatCurrency } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { paths } from '@/utils/paths';
import { IStatements } from '@/types';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CloseIcon from '@mui/icons-material/Close';
import CustomDatePicker from '@/components/common/CommonDatePicker';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateStatementModal: React.FC<Props> = ({ open, onClose }) => {
  const { id } = useParams<{ id: string }>();

  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({ startDate: undefined, endDate: undefined });

  const hasRange = Boolean(dateFilter.startDate || dateFilter.endDate);

  const {
    data: invoiceData,
    refetch,
    isFetching,
  } = useQuery<IStatements, Error>({
    queryKey: ['getStatementsByCustomerId', id, dateFilter.startDate, dateFilter.endDate],
    queryFn: async () => {
      const params: { startDate?: Date; endDate?: Date } = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      const response = await apiService.generateStatementsByCustomerId(id!, params);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const {
    mutate: createStatementMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async () => {
      if (!invoiceData || !invoiceData.data?.length) {
        toast.error('No data found');
        throw new Error('No invoice data to send');
      }
      const res = await apiService.createStatements({
        data: invoiceData.data,
        customerId: id!,
        account: invoiceData.customer?.account ?? false,
        totalBalance: invoiceData.customer?.totalBalance ?? 0,
        totalRecievedAmount: invoiceData.customer?.totalRecievedAmount ?? 0,
        totalBalanceDue: invoiceData.customer?.totalBalanceDue ?? 0,
      },{
        startDate:dateFilter.startDate,
        endDate:dateFilter.endDate,
        customerId:id!
      });
      return res;
    },
    onSuccess: (res) => toast.success(res?.message || 'Statement sent successfully'),
    onError: (err: any) => toast.error(err?.message || 'Failed to create statement'),
  });

  const formattedRange = useMemo(() => {
    if (!hasRange) return '';
    if(dateFilter.startDate && dateFilter.endDate){
      return `${formatDate(dateFilter.startDate)} - ${formatDate(dateFilter.endDate)}`;
    }
    if(dateFilter.startDate){
      return `${formatDate(dateFilter.startDate)} - ${formatDate(new Date())}`;
    }
    if(dateFilter.endDate){
      return `${formatDate(new Date())} - ${formatDate(dateFilter.endDate)}`;
    }
    return '';
  }, [dateFilter, hasRange]);

  const handleClearFilter = () => {
    setDateFilter({ startDate: undefined, endDate: undefined });
  };
  const handleDateChange=(field:"startDate" |"endDate")=> (e: any) => {
    const value = e.target.value || undefined;
    setDateFilter((prev) => ({ ...prev, [field]: value }))
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{invoiceData?.customer?.company || 'Customer Statement'}</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={3} mb={2}>
          {/* Billing Info */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Billing Address</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Typography>{invoiceData?.customer?.company}</Typography>
              <Typography variant="body2">
                {addressformat({ billingAddress: invoiceData?.customer?.billingAddress || { address: '', city: '', state: '', zipCode: '', country: '' } })}
              </Typography>
            </Paper>
          </Box>

          {/* Balance & Date Filter */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Balance Due</Typography>
            <Typography variant="h5" color="error">
              {formatCurrency(invoiceData?.customer?.totalBalanceDue ?? 0)}
            </Typography>

              <Stack direction="row" spacing={1} mt={2} alignItems="center" flexWrap="wrap">
                
                <CustomDatePicker
                  label="Start"
                  value={dateFilter.startDate}
                  onChange={handleDateChange("startDate")}
                  name='startDate'
                  size='small'
                />
               <CustomDatePicker
                  label="End"
                  value={dateFilter.endDate}
                  onChange={handleDateChange("endDate")}
                  name='endDate'
                  size='small'
                />
                {
                  hasRange && (
                    <Button variant="outlined" size="small" onClick={() => refetch()} disabled={!hasRange || isFetching}>
                      Apply
                    </Button>
                  )
                }
                {hasRange && (
                  <Chip
                    label={formattedRange}
                    onDelete={handleClearFilter}
                    deleteIcon={<CloseIcon fontSize="small" />}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Stack>
      
          </Box>
        </Stack>

        {/* Invoice Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Open Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Balance Due</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!invoiceData?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {isFetching ? 'Loading...' : 'No records found'}
                  </TableCell>
                </TableRow>
              ) : (
                invoiceData.data.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell>
                      <Link href={`${paths.base64imageviewer}/${inv._id}/invoice`} target="_blank" underline="hover">
                        Invoice #{inv.invoiceNumber}: Due {formatDate(inv.dueDate)}
                      </Link>
                    </TableCell>
                    <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(inv.recievedAmount)}</TableCell>
                    <TableCell>{formatCurrency(inv.balanceDue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {/* <Button variant="outlined">Print / Preview</Button>
        <Button variant="outlined" color="error">Delete</Button> */}
        <Button
          variant="contained"
          onClick={() => createStatementMutation()}
          disabled={isCreating}
        >
          {isCreating ? <LoadingSpinner size={16} /> : 'Send'}
        </Button>
        {createError && (
          <Typography color="error" variant="caption" sx={{ ml: 2 }}>
            {createError.message}
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateStatementModal;
