import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  alpha,
  TablePagination,
  MenuItem,
  Menu,
  Checkbox,
  Grid,
} from '@mui/material';
import AddCustomer from '@/pages/customer-service/load-customers/components/AddCustomer';
import { CustomerStatus, ICustomer, } from '@/types';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Add as IoIosAdd, Settings, Print, Download as DownloadIcon } from '@mui/icons-material';
import { Tooltip, Paper, Divider, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { downloadCSV } from '@/utils';
import { CustomerColumns } from '@/data/customer'
import { setCustomerVisibleColumns, toggleCustomerColumn } from '@/redux/Slice/ColumnFilterSlice';
import CustomerDashboard from './components/CustomerDashboard';
import renderCell from './components/renderCell';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';
import apiService from '@/service/apiService';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';
import CustomerFilters, { CustomerFiltersType }  from '@/components/CustomerFilters';

const ViewCustomers: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user);
  const printRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const visibleColumns = useSelector((state: RootState) => state.columnFilter.CustomerVisbleColmns);

  // Filter state
  const [filters, setFilters] = useState<CustomerFiltersType>({
    search: '',
    status: '' as CustomerStatus,
    hasOpenBalance: false,
    ratingRange: [0, 5] as [number, number],
    operatingStatus: [] as string[],
    carrierOperation: [] as string[],
  });

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['customers', currentPage, limit, filters],
    queryFn: async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: limit,
        };

        // Add carrier filters to params
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.hasOpenBalance) params.hasOpenBalance = filters.hasOpenBalance;
        if (filters.ratingRange[0] > 0) params.ratingMin = filters.ratingRange[0];
        if (filters.ratingRange[1] < 5) params.ratingMax = filters.ratingRange[1];
        if (filters.operatingStatus.length > 0) params.operatingStatus = filters.operatingStatus.join(',');
        if (filters.carrierOperation.length > 0) params.carrierOperation = filters.carrierOperation.join(',');

        const response = await apiService.getCustomers(params);
        return response;
      } catch (err) {
        console.warn(err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) => apiService.deleteCustomer(customerId),
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });

  const exportCustomersMutation = useMutation({
    mutationFn: () => apiService.exportCustomers({ page: currentPage, limit, search: filters.search }),
    onSuccess: (data) => {
      downloadCSV(data.data);
      toast.success('Customers exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export customers');
    },
  });

  useEffect(() => {
    const initialColumns = CustomerColumns.slice(0, 6).map((col) => (col.key))
    visibleColumns?.length == 0 && dispatch(setCustomerVisibleColumns(initialColumns))
  }, [])

  const handleFiltersChange = (newFilters: CustomerFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: ''as CustomerStatus,
      hasOpenBalance: false,
      ratingRange: [0, 5] as [number, number],
      operatingStatus: [] as string[],
      carrierOperation: [] as string[],
    });
    setCurrentPage(1);
  };

  const handleColumnToggle = (key: string): void => {
    dispatch(toggleCustomerColumn(key));
  };

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = (): void => {
    setColumnMenuAnchor(null);
  };
  const handleEditClick = (customer: ICustomer): void => {

    setSelectedCustomer(customer);
  };
  const handleAddNew = (): void => {
    setSelectedCustomer(true);
  };
  const handleDeleteCustomer = async (customerId: string): Promise<void> => {

    const confirmDelete = window.confirm("Are you sure you want to delete this customer?")
    if (confirmDelete) {
      deleteCustomerMutation.mutate(customerId);
    }
  }

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'width=1024,height=768');
      if (printWindow) {
        printWindow.document.write(`
        <html>
          <head>
            <title>Print Customers</title>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                font-size: 12px;
              }
              th {
                background: #f5f5f5;
                text-align: left;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };
  const handleExportData = async () => {
    exportCustomersMutation.mutate();
  }

  const customers = customer?.data || [];
  const total = customer?.pagination?.total || 0;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your customer accounts</Typography>
        </Box>
        <HasPermission
          action="create"
          resource={["customers"]}
          component={
            <Button
              variant="contained"
              size="small"
              startIcon={<IoIosAdd />}
              onClick={handleAddNew}
              sx={{ borderRadius: 2 }}
            >
              Add Customer
            </Button>
          }
        />
      </Box>

      <Grid container spacing={2}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <CustomerFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <CustomerDashboard />

          {/* Toolbar */}
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              px: 1.5,
              py: 0.75,
              mb: 1.5,
              borderRadius: 2,
            }}
          >
            <Tooltip title="Toggle Columns">
              <IconButton size="small" onClick={handleColumnMenuOpen} sx={{ color: 'text.secondary' }}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small" onClick={handlePrint} sx={{ color: 'text.secondary' }}>
                <Print fontSize="small" />
              </IconButton>
            </Tooltip>
            <HasPermission
              action="export"
              resource={["customers"]}
              component={
                <Tooltip title="Export CSV">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleExportData}
                      disabled={exportCustomersMutation.isPending}
                      sx={{ color: 'text.secondary' }}
                    >
                      {exportCustomersMutation.isPending
                        ? <CircularProgress size={16} />
                        : <DownloadIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              }
            />
            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={handleColumnMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', letterSpacing: '0.05em' }}>
                VISIBLE COLUMNS
              </Typography>
              <Divider />
              {CustomerColumns.map((col) => (
                <MenuItem key={col.key} dense onClick={() => handleColumnToggle(col.key)} sx={{ gap: 1 }}>
                  <Checkbox
                    size="small"
                    checked={visibleColumns.includes(col.key)}
                    sx={{ p: 0 }}
                  />
                  <Typography variant="body2">{col.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Paper>

          {/* Table */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Box ref={printRef}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      {CustomerColumns.map((col) =>
                        visibleColumns.includes(col.key) ? (
                          <TableCell
                            key={col.key}
                            sx={{ fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 }}
                          >
                            {col.label}
                          </TableCell>
                        ) : null
                      )}
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="error">Failed to load customers</Typography>
                        </TableCell>
                      </TableRow>
                    ) : customers?.length > 0 ? (
                      customers.filter((item: ICustomer) => item._id !== "").map((customer: ICustomer) => (
                        <TableRow
                          key={customer._id}
                          hover
                          sx={{ '&:last-child td': { border: 0 } }}
                        >
                          {CustomerColumns.filter((col) => col.key !== 'invoice').map((col) =>
                            visibleColumns.includes(col.key) ? (
                              <TableCell
                                key={col.key}
                                onClick={() =>
                                  col.key !== 'rating' && navigate(
                                    paths.customertransactionlist + '/' + customer._id,
                                    { state: { page: currentPage, limit } }
                                  )
                                }
                                sx={{ cursor: col.key !== 'rating' ? 'pointer' : 'default', whiteSpace: 'nowrap', py: 1.25 }}
                              >
                                {renderCell({ column: col.key, customer: customer as any, navigate })}
                              </TableCell>
                            ) : null
                          )}
                          <TableCell align="center" sx={{ py: 0.5 }}>
                            <VerticalMenu actions={[
                              hasAccess(["customers"], "update", currentUser)
                                ? { label: 'Edit', icon: "edit", onClick: () => handleEditClick(customer) }
                                : null,
                              hasAccess(["customers"], "delete", currentUser)
                                ? { label: 'Delete', icon: "delete", onClick: () => handleDeleteCustomer(customer._id || '') }
                                : null,
                              hasAccess(["accounting"], "create", currentUser)
                                ? { label: 'Make Payment', icon: "payment", onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${customer._id}`) }
                                : null,
                              hasAccess(['customers'], "create", currentUser)
                                ? { label: 'Report', icon: "reports", onClick: () => navigate(`${paths.customers}/report/${customer._id}`) }
                                : null,
                            ]} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                          <Typography variant="body2" color="text.secondary">No customers found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </TableContainer>
            <Divider />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={limit}
              page={currentPage - 1}
              onPageChange={(_, page) => setCurrentPage(page + 1)}
              onRowsPerPageChange={(event) => {
                setLimit(parseInt(event.target.value, 10));
                setCurrentPage(1);
              }}
              sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
            />
          </Paper>
        </Grid>
      </Grid>

      <AddCustomer
        open={selectedCustomer}
        onClose={() => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          setSelectedCustomer(false);
        }}
      />
    </Box>
  );
};

export default withPermission("view", ["customers"])(ViewCustomers);
