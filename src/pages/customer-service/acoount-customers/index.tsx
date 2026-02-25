import React, { useState, useEffect, useCallback, useMemo, useRef, RefObject, } from 'react';
import { Button, Container, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Stack, alpha, TablePagination, Menu, MenuItem, Checkbox, Grid, } from '@mui/material';
import AddAccountsCustomer from './components/AddCustomer';
import AddCustomer from '@/pages/customer-service/load-customers/components/AddCustomer';
import { ICustomer, IAccountsCustomerView, IPaymentTerm, CustomerStatus, } from '@/types';
import theme from '@/data/theme';
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
    <Box
      className="view-load"
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header + Actions */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Customers
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <HasPermission action="create" resource={['accounting']} component={<Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              aria-label="Add new customer"
            >
              Add Customer
            </Button>} />
          </Stack>
        </Stack>
        
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

        {/* Export / Settings Row */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleColumnMenuOpen}
            aria-label="Column visibility settings"
          >
            Columns
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() =>
              handlePrint(printRef as RefObject<HTMLDivElement>, 'Customers')
            }
            aria-label="Print customer list"
          >
            Print
          </Button>
          <HasPermission action="import" resource={['accounting']} component={<FileUploadButton
            onFileSelect={handleImportInvoice}
            loading={invoiceImportMutation.isPending}
          />} />
          <Button
            variant="outlined"
            startIcon={getIcon("fileExport")}
            onClick={handleExportData}
            aria-label="Export customers"
          >
            Export
          </Button>
          {/* add example csv file download button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={(e) => {
              e.preventDefault();
              window.open('/download/sample.csv', '_blank');
            }}
          >
            Sample
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={handleColumnMenuClose}
            PaperProps={{ elevation: 4 }}
          >
            {AccountsCustomerColumns.map((col) => (
              <MenuItem key={col.key} dense>
                <Checkbox
                  edge="start"
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => handleColumnToggle(col.key)}
                  size="small"
                  inputProps={{ 'aria-label': `toggle ${col.label}` }}
                />
                <Typography variant="body2">{col.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Stack>
        <FileImportError allerrors={invoiceImportMutation?.error?.response?.data?.errors?.allErrors || []} message={invoiceImportMutation?.error?.response?.data?.message || "Error importing vendors"} />

        {/* Table */}
        <Paper elevation={1}>
          <Box ref={printRef}>
            <TableContainer>
              <Table size="medium" aria-label="customers table">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha(
                        theme.palette.primary.main,
                        0.04
                      ),
                    }}
                  >
                    {displayedColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          height: 60,
                          // width: `${Math.max(col.label.length * 12, 100)}px`,
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                      className="no-print"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1}>
                        <Box
                          display="flex"
                          justifyContent="center"
                          py={3}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : customers.length > 0 ? (
                    customers
                      .filter((c: Omit<IAccountsCustomerView, 'paymentTerms'> & {
                        paymentTerms: IPaymentTerm;
                      }) => c._id)
                      .map((customer: Omit<IAccountsCustomerView, 'paymentTerms'> & {
                        paymentTerms: IPaymentTerm;
                      }) => (
                        <TableRow key={customer._id} hover>
                          {AccountsCustomerColumns.filter(
                            (col) => col.key !== 'invoice'
                          )
                            .filter((col) =>
                              visibleColumns.includes(col.key)
                            )
                            .map((col, i) => (
                              <TableCell
                                key={col.key}
                                onClick={() =>
                                  hasAccess(["accounting"], "view", user) && col.key !== 'rating' && navigate(
                                    paths.customertransactionlist + "/" +
                                    customer._id,
                                    {
                                      state: {
                                        page: currentPage,
                                        limit,
                                      },
                                    }
                                  )
                                }
                                sx={{
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  height: 60,
                                  // width: 100,
                                }}
                              >
                                {renderCell({
                                  column: col.key,
                                  customer,
                                  navigate
                                })}
                              </TableCell>
                            ))}
                          <TableCell
                            className="no-print"
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 1,
                              whiteSpace: 'nowrap',
                              height: 60,
                            }}
                          >
                            <Box>

                              <VerticalMenu
                                actions={[
                                  hasAccess(customer.isAccountCustomer ? ["accounting" ]: ["customers"], "update", user) ? {
                                    label: 'Edit',
                                    icon: "edit",
                                    onClick: () => {
                                      handleEditClick(customer as any);
                                    },
                                  } : null,
                                  hasAccess(customer.isAccountCustomer ? ["accounting"] : ["customers"], "delete", user) ? {
                                    label: 'Delete',
                                    icon: "delete",
                                    onClick: () => {
                                      handleDeleteCustomer(
                                        customer._id || ''
                                      );
                                    },
                                  } : null,
                                  hasAccess(["accounting"], "create", user) ? {
                                    label: "Make Payment",
                                    icon: "payment",
                                    onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${customer._id}`),
                                  } : null,
                                  hasAccess(['accounting'], "create", user) ?
                                    {
                                      label: 'Report ',
                                      icon: "reports",
                                      onClick: () => {
                                        navigate(`${paths.customers}/report/${customer._id}`)
                                      },
                                    } : null,
                                ]}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1}>
                        <Box py={4} textAlign="center">
                          <Typography variant="body2">
                            No customers found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={limit}
            page={currentPage - 1}
            onPageChange={(_, page) => setCurrentPage(page + 1)}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setCurrentPage(1);
            }}
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
      </Container>
    </Box>
  );
};

export default withPermission("view", ["accounting"])(ViewCustomers);
