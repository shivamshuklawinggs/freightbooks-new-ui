import React, { useState, useEffect, useCallback, useMemo, useRef, RefObject, } from 'react';
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Box, CircularProgress, alpha, TablePagination, Menu, MenuItem, Checkbox, Grid, Tooltip, IconButton, Divider } from '@mui/material';
import AddAccountsCustomer from './components/AddCustomer';
import AddCustomer from '@/pages/customer-service/load-customers/components/AddCustomer';
import { ICustomer, IAccountsCustomerView, IPaymentTerm, CustomerStatus, } from '@/types';
import { useTheme } from '@mui/material/styles';
import { fetchAccountsCustomers } from '@/redux/api';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { Add as AddIcon,  Settings as SettingsIcon, Print as PrintIcon, Download, } from '@mui/icons-material';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { downloadCSV, handlePrint, } from '@/utils';
import CustomerDashboard from './components/CustomerDashboard';
import { AccountsCustomerColumns } from '@/data/customer'
import { setAccountsCustomerVisibleColumns, toggleAccountsCustomerColumn, } from '@/redux/Slice/ColumnFilterSlice';
import renderCell from './components/renderCell';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import VerticalMenu from '@/components/VerticalMenu';
import useDebounce from '@/hooks/useDebounce';
import { useMutation, useQuery } from '@tanstack/react-query';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils'
import FileUploadButton from '@/components/common/FileUploadButton';
import { FileImportError } from '@/components/common/FileImportError';
import CustomerFilters, {  AccountsCustomerFiltersType }  from '@/components/AccountsCustomerFilters';
import { getIcon } from '@/components/common/icons/getIcon';

const DEFAULT_PAGE_SIZE = 10;

const ViewCustomers: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const visibleColumns = useSelector(
    (state: RootState) => state.columnFilter.accountsCustomerVisbleColmns
  );

  // Filter state
  const [filters, setFilters] = useState<AccountsCustomerFiltersType>({
    search: '',
    status: '' as CustomerStatus,
    hasOpenBalance: false,
    ratingRange: [0, 5] as [number, number],

  });

  const debouncedSearch = useDebounce(filters.search, 400);
  const [selectedCustomer, setSelectedCustomer] = useState<
    ICustomer | boolean
  >(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);

  const [columnMenuAnchor, setColumnMenuAnchor] =
    useState<null | HTMLElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Debounced search updater
  // Initialize visible columns once
  useEffect(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      const initial = AccountsCustomerColumns.slice(0, 6).map((c) => c.key);
      dispatch(setAccountsCustomerVisibleColumns(initial));
    }
  }, [dispatch, visibleColumns]);

  // Fetch customers when deps change
  const { data: customer, isLoading: loading, refetch } = useQuery({
    queryKey: ['customers', currentPage, limit, debouncedSearch, filters],
    queryFn: async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: limit,
          search: debouncedSearch,
        };

        // Add customer filters to params
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.hasOpenBalance) params.hasOpenBalance = filters.hasOpenBalance;
        if (filters.ratingRange[0] > 0) params.ratingMin = filters.ratingRange[0];
        if (filters.ratingRange[1] < 5) params.ratingMax = filters.ratingRange[1];

        const response = await apiService.getAccountsCustomers(params);
        return response;
      } catch (err) {
        console.warn(err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
  const invoiceImportMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('file', data.file);
      return apiService.importCustomers(formData);
    },
    onSuccess: (response: any) => {
      refetch();
      toast.success(response?.message || `customers imported successfully`);
    },
    onError: (error: any) => {
      const allerrors = error?.response?.data?.errors?.allErrors
      if (!allerrors) {
        toast.error(error.message);
      }
    },
  });

  const handleFiltersChange = (newFilters: AccountsCustomerFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '' as CustomerStatus,
      hasOpenBalance: false,
      ratingRange: [0, 5] as [number, number],
    });
    setCurrentPage(1);
  };

  const handleColumnToggle = useCallback(
    (key: string) => {
      dispatch(toggleAccountsCustomerColumn(key));
    },
    [dispatch]
  );

  const handleColumnMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setColumnMenuAnchor(e.currentTarget);
  };
  const handleColumnMenuClose = () => setColumnMenuAnchor(null);

  const handleEditClick = (customer: IAccountsCustomerView) => {
    setSelectedCustomer({ ...customer } as ICustomer);
  };

  const handleAddNew = () => setSelectedCustomer(true);

  const handleDeleteCustomer = useCallback(
    async (customerId: string) => {
      try {
        if (!window.confirm('Are you sure you want to delete this customer?'))
          return;
        await apiService.deleteAccountsCustomer(customerId);
        toast.success('Customer deleted successfully');
        dispatch(fetchAccountsCustomers({ page: currentPage, limit }));
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete customer');
      }
    },
    [dispatch, currentPage, limit]
  );
  const handleImportInvoice = (file: File) => {
    invoiceImportMutation.mutate({ file });
  };

  const handleExportData = useCallback(async () => {
    try {
      const resp = await apiService.exportCustomers(
        {
          limit,
          page: currentPage,
          search: filters.search,
        },
        'accounts'
      );
      await downloadCSV(resp.data);
    } catch (e: any) {
      toast.error('Export failed');
    }
  }, [currentPage, limit, filters.search]);

  // Memoized visible column definitions for table head to avoid recompute
  const displayedColumns = useMemo(
    () =>
      AccountsCustomerColumns.filter((col) =>
        visibleColumns.includes(col.key)
      ),
    [visibleColumns]
  );
  const customers = customer?.data || [];
  const total = customer?.pagination?.total || 0;
  return (
    <Box sx={{ minHeight: '100vh' }}>
        {/* Header + Actions */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2.5}
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>Customers</Typography>
            <Typography variant="body2" color="text.secondary">Manage your accounts customers</Typography>
          </Box>
          <HasPermission
            action="create"
            resource={['accounting']}
            component={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
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
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="Toggle Columns">
            <IconButton size="small" onClick={handleColumnMenuOpen} sx={{ color: 'text.secondary' }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton
              size="small"
              onClick={() => handlePrint(printRef as RefObject<HTMLDivElement>, 'Customers')}
              sx={{ color: 'text.secondary' }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <HasPermission
            action="import"
            resource={['accounting']}
            component={
              <FileUploadButton
                onFileSelect={handleImportInvoice}
                loading={invoiceImportMutation.isPending}
              />
            }
          />
          <Tooltip title="Export CSV">
            <IconButton size="small" onClick={handleExportData} sx={{ color: 'text.secondary' }}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Sample CSV">
            <IconButton
              size="small"
              onClick={() => window.open('/download/sample.csv', '_blank')}
              sx={{ color: 'text.secondary' }}
            >
              {getIcon('fileExport')}
            </IconButton>
          </Tooltip>
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
            {AccountsCustomerColumns.map((col) => (
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
        <FileImportError allerrors={invoiceImportMutation?.error?.response?.data?.errors?.allErrors || []} message={invoiceImportMutation?.error?.response?.data?.message || "Error importing vendors"} />

        {/* Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box ref={printRef}>
            <TableContainer>
              <Table size="small" aria-label="customers table">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    {displayedColumns.map((col) => (
                      <TableCell key={col.key} sx={{ fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 }}>
                        {col.label}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 700 }} className="no-print">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : customers.length > 0 ? (
                    customers
                      .filter((c: Omit<IAccountsCustomerView, 'paymentTerms'> & { paymentTerms: IPaymentTerm }) => c._id)
                      .map((customer: Omit<IAccountsCustomerView, 'paymentTerms'> & { paymentTerms: IPaymentTerm }) => (
                        <TableRow key={customer._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          {AccountsCustomerColumns
                            .filter((col) => col.key !== 'invoice')
                            .filter((col) => visibleColumns.includes(col.key))
                            .map((col) => (
                              <TableCell
                                key={col.key}
                                onClick={() =>
                                  hasAccess(["accounting"], "view", user) && col.key !== 'rating' &&
                                  navigate(paths.customertransactionlist + '/' + customer._id, { state: { page: currentPage, limit } })
                                }
                                sx={{ cursor: col.key !== 'rating' ? 'pointer' : 'default', whiteSpace: 'nowrap', py: 1.25 }}
                              >
                                {renderCell({ column: col.key, customer, navigate })}
                              </TableCell>
                            ))}
                          <TableCell align="center" className="no-print" sx={{ py: 0.5 }}>
                            <VerticalMenu
                              actions={[
                                hasAccess(customer.isAccountCustomer ? ["accounting"] : ["customers"], "update", user)
                                  ? { label: 'Edit', icon: "edit", onClick: () => handleEditClick(customer as any) }
                                  : null,
                                hasAccess(customer.isAccountCustomer ? ["accounting"] : ["customers"], "delete", user)
                                  ? { label: 'Delete', icon: "delete", onClick: () => handleDeleteCustomer(customer._id || '') }
                                  : null,
                                hasAccess(["accounting"], "create", user)
                                  ? { label: 'Make Payment', icon: "payment", onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${customer._id}`) }
                                  : null,
                                hasAccess(['accounting'], "create", user)
                                  ? { label: 'Report', icon: "reports", onClick: () => navigate(`${paths.customers}/report/${customer._id}`) }
                                  : null,
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">No customers found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
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

        {/* Add / Edit modal */}
        {typeof selectedCustomer === "object" && !selectedCustomer.isAccountCustomer ? <AddCustomer
          open={selectedCustomer}
          onClose={() => {
            dispatch(
              fetchAccountsCustomers({ page: currentPage, limit })
            );
            setSelectedCustomer(false);
          }}
        /> : <AddAccountsCustomer
          open={selectedCustomer}
          onClose={() => {
            dispatch(
              fetchAccountsCustomers({ page: currentPage, limit })
            );
            setSelectedCustomer(false);
          }}
        />}

          </Grid>
        </Grid>
    </Box>
  );
};

export default withPermission("view", ["accounting"])(ViewCustomers);
