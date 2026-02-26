import React, { useState, useEffect, useRef } from 'react';
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
import { Add as IoIosAdd,  Settings, Print, } from '@mui/icons-material';
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
import { getIcon } from '@/components/common/icons/getIcon';

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
    <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5">Customers</Typography>
          </Box>
          <Box>
            <HasPermission action="create" resource={["customers"]} component={<Button
              variant="contained"
              color="primary"
              startIcon={<IoIosAdd />}
              onClick={handleAddNew}
            >
              Add New Customer
            </Button>} />
          </Box>
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
            <Box display="flex" flexDirection="row" sx={{ justifyContent: "flex-end" }} mb={3}>
              <Button
                variant="outlined"
                onClick={handleColumnMenuOpen}
              >
                <Settings />
              </Button>
              <Button
                variant="outlined"
                onClick={handlePrint}
              >
                <Print />
              </Button>
              <HasPermission action="export" resource={["customers"]} component={<Button
                variant="outlined"
                onClick={handleExportData}
                disabled={exportCustomersMutation.isPending}
              >
                {exportCustomersMutation.isPending ? <CircularProgress size={24} /> :getIcon("fileExport")}
              </Button>} />
              <Menu
                anchorEl={columnMenuAnchor}
                open={Boolean(columnMenuAnchor)}
                onClose={handleColumnMenuClose}
              >
                {CustomerColumns.map((col) => (
                  <MenuItem key={col.key}>
                    <Checkbox
                      checked={visibleColumns.includes(col.key)}
                      onChange={() => handleColumnToggle(col.key)}
                    />
                    {col.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <TableContainer >
              <Box ref={printRef}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                      {CustomerColumns.map((col) =>
                        visibleColumns.includes(col.key) ? (
                          <TableCell sx={{
                            height: 60,
                            width: col.label.length * 10 + "px",
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }} key={col.key}>{col.label}</TableCell>
                        ) : null
                      )}
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          Error loading customers
                        </TableCell>
                      </TableRow>
                    ) : customers?.length > 0 ? (
                      customers?.filter((item: ICustomer) => item._id !== "").map((customer: ICustomer,) => (
                        <TableRow key={customer._id}>
                          {CustomerColumns.filter((col) => col.key !== 'invoice').map((col, i) =>
                            visibleColumns.includes(col.key) ? (
                              <TableCell key={col.key}
                                onClick={() =>
                                  col.key !== 'rating' && navigate(
                                    paths.customertransactionlist + "/" +
                                    customer._id,
                                    {
                                      state: {
                                        page: currentPage,
                                        limit,
                                      },
                                    }
                                  )}
                                sx={{
                                  height: 60,
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap'
                                }}>
                                {renderCell({
                                  column: col.key,
                                  customer: customer as any,
                                  navigate: navigate
                                })}
                              </TableCell>
                            ) : null
                          )}
                          <TableCell sx={{
                            height: 60,
                            width: "100px",
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            <Box display="flex" justifyContent="center" gap={1}>
                              <VerticalMenu actions={[
                                hasAccess(["customers"], "update", currentUser) ?
                                  {
                                    label: 'Edit',
                                    icon:"edit",
                                    onClick: () => {
                                      handleEditClick(customer);
                                    },
                                  } : null,
                                hasAccess(["customers"], "delete", currentUser) ?
                                  {
                                    label: 'Delete',
                                    icon:"delete",
                                    onClick: () => {
                                      handleDeleteCustomer(customer._id || '');
                                    },
                                  } : null,
                                hasAccess(["accounting"], "create", currentUser) ? {
                                  label: "Make Payment",
                                  icon: "payment",
                                  onClick: () => navigate(`/accounting/sales/accounts/recievedpayment/${customer._id}`),
                                } : null,
                                hasAccess(['customers'], "create", currentUser) ?
                                  {
                                    label: 'Report Customer',
                                    icon: "reports",
                                    onClick: () => {
                                      navigate(`${paths.customers}/report/${customer._id}`)
                                    },
                                  } : null,
                              ]} />

                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          No customers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
            </TableContainer>
          </Grid>
        </Grid>
      </Container>

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
