import React, { useState, useEffect, useCallback, useMemo, useRef, RefObject, } from 'react';
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Box, CircularProgress, alpha, TablePagination, Menu, MenuItem, Checkbox, Grid, Tooltip, IconButton, Divider } from '@mui/material';
import { CustomerStatus, ICarrier, } from '@/types';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { Add as AddIcon,  Settings as SettingsIcon, Print as PrintIcon, Download, } from '@mui/icons-material';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { downloadCSV, handlePrint } from '@/utils';
import { AccountsCustomerColumns } from '@/data/customer'
import { setVendorsVisibleColumns, toggleVendorsColumn, } from '@/redux/Slice/ColumnFilterSlice';
import renderCell from './VendorForm/components/renderCell';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import VerticalMenu from '@/components/VerticalMenu';
import useDebounce from '@/hooks/useDebounce';
import CarrierModal from './CarrierModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import FileUploadButton from '@/components/common/FileUploadButton';
import { FileImportError } from '@/components/common/FileImportError';
import CarrierFilters, { VendorFiltersType }  from '@/components/VendorFilters';
import CustomerDashboard from './CustomerDashboard';
import { getIcon } from '@/components/common/icons/getIcon';

const DEFAULT_PAGE_SIZE = 10;

const View: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState<VendorFiltersType>({
    search: '',
    status: '' as CustomerStatus,
    hasOpenBalance: false,
    ratingRange: [0, 5] as [number, number],
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const visibleColumns = useSelector(
    (state: RootState) => state.columnFilter.vendorsVisbleColmns
  );
  const [selectedCustomer, setSelectedCustomer] = useState<
    ICarrier | boolean
  >(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [columnMenuAnchor, setColumnMenuAnchor] =
    useState<null | HTMLElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: vendorsData, isLoading, refetch } = useQuery({
    queryKey: ['vendors', currentPage, limit, debouncedSearch, filters],
    queryFn: async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: limit,
          search: debouncedSearch,
        };

        // Add carrier filters to params
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.hasOpenBalance) params.hasOpenBalance = filters.hasOpenBalance;
        if (filters.ratingRange[0] > 0) params.ratingMin = filters.ratingRange[0];
        if (filters.ratingRange[1] < 5) params.ratingMax = filters.ratingRange[1];

        const response = await apiService.getVendors(params);
        return response;
      } catch (err) {
        console.warn(err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const vendors = vendorsData?.data || [];
  const total = vendorsData?.pagination?.total || 0;

  const deleteVendorMutation = useMutation({
    mutationFn: (vendorId: string) => apiService.deleteVendor(vendorId),
    onSuccess: () => {
      toast.success('Vendor deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete vendor');
    },
  });

  const exportVendorsMutation = useMutation({
    mutationFn: () => apiService.exportCarrier({ limit, page: currentPage, search: debouncedSearch }),
    onSuccess: (data) => {
      downloadCSV(data.data);
      toast.success('Vendors exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export vendors');
    },
  });
  const invoiceImportMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('file', data.file);
      return apiService.importVendors(formData);
    },
    onSuccess: (response: any) => {
      refetch();
      toast.success(response?.message || `vendors imported successfully`);
    },
    onError: (error: any) => {
      const allerrors = error?.response?.data?.errors?.allErrors
      if (!allerrors) {
        toast.error(error.message);
      }
    },
  });



  // Initialize visible columns once
  useEffect(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      const initial = AccountsCustomerColumns.slice(0, 6).map((c) => c.key);
      dispatch(setVendorsVisibleColumns(initial));
    }
  }, [dispatch, visibleColumns]);


  const handleFiltersChange = (newFilters: VendorFiltersType) => {
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
      dispatch(toggleVendorsColumn(key));
    },
    [dispatch]
  );

  const handleColumnMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setColumnMenuAnchor(e.currentTarget);
  };
  const handleColumnMenuClose = () => setColumnMenuAnchor(null);

  const handleEditClick = (customer: ICarrier) => {
    setSelectedCustomer({ ...customer } as ICarrier);
  };

  const handleAddNew = () => {
    setSelectedCustomer(true)
  };

  const handleDeleteVendor = useCallback(
    (customerId: string) => {
      if (!window.confirm('Are you sure you want to delete this customer?')) return;
      deleteVendorMutation.mutate(customerId);
    },
    [deleteVendorMutation]
  );

  const handleExportData = useCallback(() => {
    exportVendorsMutation.mutate();
  }, [exportVendorsMutation]);
  // Memoized visible column definitions for table head to avoid recompute
  const displayedColumns = useMemo(
    () =>
      AccountsCustomerColumns.filter((col) =>
        visibleColumns.includes(col.key)
      ),
    [visibleColumns]
  );

  // Handlers for pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };
  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setLimit(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };
    const handleImportInvoice = (file: File) => {
    invoiceImportMutation.mutate({ file });
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
        {/* Header + Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Vendors</Typography>
            <Typography variant="body2" color="text.secondary">Manage your vendor accounts</Typography>
          </Box>
          <HasPermission
            action="create"
            resource={["accounting"]}
            component={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{ borderRadius: 2 }}
              >
                Add Vendor
              </Button>
            }
          />
        </Box>
        
        <Grid container spacing={2}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <CarrierFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <CustomerDashboard isCarrier={false} />

            {/* Toolbar */}
            <Paper
              variant="outlined"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, px: 1.5, py: 0.75, mb: 1.5, borderRadius: 2, flexWrap: 'wrap' }}
            >
              <Tooltip title="Toggle Columns">
                <IconButton size="small" onClick={handleColumnMenuOpen} sx={{ color: 'text.secondary' }}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton size="small" onClick={() => handlePrint(printRef as RefObject<HTMLDivElement>, 'Vendors')} sx={{ color: 'text.secondary' }}>
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <HasPermission
                action="import"
                resource={["accounting"]}
                component={
                  <FileUploadButton onFileSelect={handleImportInvoice} loading={invoiceImportMutation.isPending} />
                }
              />
              <Tooltip title="Export CSV">
                <span>
                  <IconButton size="small" onClick={handleExportData} disabled={exportVendorsMutation.isPending} sx={{ color: 'text.secondary' }}>
                    {exportVendorsMutation.isPending ? <CircularProgress size={14} /> : <Download fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Download Sample">
                <IconButton size="small" onClick={() => window.open('/download/sample.csv', '_blank')} sx={{ color: 'text.secondary' }}>
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
                    <Checkbox size="small" checked={visibleColumns.includes(col.key)} sx={{ p: 0 }} />
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
              <Table size="small" aria-label="vendors table">
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : vendors.length > 0 ? (
                    vendors
                      .filter((c: ICarrier) => c._id)
                      .map((vendor: ICarrier) => (
                        <TableRow key={vendor._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          {AccountsCustomerColumns
                            .filter((col) => col.key !== 'invoice')
                            .filter((col) => visibleColumns.includes(col.key))
                            .map((col) => (
                              <TableCell
                                key={col.key}
                                onClick={() =>
                                  hasAccess(["accounting"], "view", currentUser) &&
                                  navigate(paths.vendortransactionlist + '/' + vendor._id, { state: { page: currentPage, limit } })
                                }
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', py: 1.25 }}
                              >
                                {renderCell({ column: col.key, vendor, navigate })}
                              </TableCell>
                            ))}
                          <TableCell align="center" className="no-print" sx={{ py: 0.5 }}>
                            <VerticalMenu
                              actions={[
                                hasAccess(!vendor.isCarrier ? ["accounting"] : ["carriers"], "update", currentUser)
                                  ? { label: 'Edit', icon: "edit", onClick: () => handleEditClick(vendor) }
                                  : null,
                                hasAccess(!vendor.isCarrier ? ["accounting"] : ["carriers"], "delete", currentUser)
                                  ? { label: 'Delete', icon: "delete", onClick: () => handleDeleteVendor(vendor._id || '') }
                                  : null,
                                hasAccess(["accounting"], "create", currentUser)
                                  ? { label: 'Make Payment', icon: "payment", onClick: () => navigate('/accounting/purchase/accounts/recievedbill/' + vendor._id) }
                                  : null,
                                hasAccess(['accounting'], "create", currentUser)
                                  ? { label: 'Report', icon: "reports", onClick: () => navigate(`${paths.carriers}/report/${vendor._id}`) }
                                  : null,
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={displayedColumns.length + 1} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">No vendors found</Typography>
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
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
          />
        </Paper>

        {/* Add / Edit modal */}

        <CarrierModal
          open={selectedCustomer}
          onClose={() => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            setSelectedCustomer(false);
          }}
          isCarrier={typeof  selectedCustomer ==="object"?selectedCustomer.isCarrier || false:false }
        />
          </Grid>
        </Grid>
    </Box>
  );
};
export default withPermission("view",["accounting"])(View)

