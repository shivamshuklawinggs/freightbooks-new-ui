import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import {
  Modal,
  Box,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  Button,
  TableRow,
  TableCell,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Drawer,
  IconButton,

} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,

} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { resetLoad } from '@/redux/Slice/EditloadSlice';
import { setVisibleColumns, toggleColumn } from '@/redux/Slice/ColumnFilterSlice';
import { getClaimedStatus } from '@/utils';
import { COLUMN_OPTIONS, LOAD_STATUSES } from '@/data/Loads';
import { ILocationWithIds, IViewLoad } from '@/types';
import { RootState } from '@/redux/store';
import { BiewLoadModal } from './components/BiewLoadModal';
import { paths } from '@/utils/paths';
import { AddressModal } from '@/components/common/renderAddress';
import ViewLoadDetails from './ViewLoadDetails';
import { useQuery, useMutation } from '@tanstack/react-query';
import FilterBox from '@/components/FilterBox';
import renderCell from './renderCell';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';
import { useGenerateRateConfirmationPDF } from "@/hooks/useGenerateRateConfirmationPDF";
import { DataTable, ColumnDef, PageHeader } from '@/components/ui';
import { getIcon } from '@/components/common/icons/getIcon';
interface LoadResponse {
  data: IViewLoad[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

const ViewLoad: React.FC = () => {
  const { generatePDF, isLoading: isGeneratingPdf, } = useGenerateRateConfirmationPDF({ type:"editload",  })
  // Pagination and tab states
  const [activeTab, setActiveTab] = useState<string>('allLoad');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filter states
  const [search, setSearch] = useState('');

  const [startPickupDate, setStartPickupDate] = useState<Date | null>(null);
  const [endPickupDate, setEndPickupDate] = useState<Date | null>(null);


  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentLoad, setCurrentLoad] = useState<IViewLoad | null>(null);
  // State for address modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<{ locations: ILocationWithIds[], title: string }>({
    locations: [],
    title: ''
  });
  const [expandedAddresses, setExpandedAddresses] = useState<Record<string, boolean>>({});
  // Modal state for all array data types
  const [modalState, setModalState] = useState<{
    open: boolean;
    type: 'carrier' | 'pickup' | 'delivery' | 'driver' | 'pickupdates' | 'deliverydates' | null;
    title: string;
    data: any[];
  }>({
    open: false,
    type: null,
    title: '',
    data: []
  });
  const [viewLoadModal, setViewLoadModal] = useState<IViewLoad | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user)
  const visibleColumns = useSelector((state: RootState) => state.columnFilter.visibleColumns);
  useEffect(() => {
    const initialColumns = COLUMN_OPTIONS.map((col) => (col.key))
    visibleColumns?.length == 0 && dispatch(setVisibleColumns(initialColumns))
  }, [])

  const fetchLoads = async (): Promise<LoadResponse> => {
    try {
      const status = activeTab === 'allLoad' ? '' : activeTab;
      const response: LoadResponse = await apiService.getLoads({
        page: currentPage,
        limit,
        status,
        search,
        StartPickupDate:startPickupDate,
        EndPickupDate:endPickupDate,
      });
      return response;
    } catch (error) {
      console.warn('Error fetching loads:', error);
      throw error;
    }
  };
  const { data, isPending, refetch } = useQuery<LoadResponse>({
    queryKey: ['loads', activeTab, currentPage, limit, search,
      startPickupDate, endPickupDate],
    queryFn: fetchLoads,
  })

  const deleteLoadMutation = useMutation({
    mutationFn: (loadId: string) => apiService.LoadActivate(loadId),
    onSuccess: (data) => {
      if(data.icon==="success"){
        toast.success(data.message || 'Load updated successfully');
      }
      else{
        toast.error(data.message || 'Load updated successfully');
      }
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate load');
    },
  });
  const deleteLoadDataMutation = useMutation({
    mutationFn: (loadId: string) => apiService.deleteLoad(loadId),
    onSuccess: (data) => {
      toast.success(data.message || 'Load deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete load');
    },
  });



  const handleCloseViewLoadModal = () => {
    setViewLoadModal(null);
  }
  const handleOpenViewLoadModal = (loadId: IViewLoad) => {
    setViewLoadModal(loadId);
  }
  const handleEdit = (loadId: string): void => {
    dispatch(resetLoad());
    navigate(`${paths.editload}/${loadId}`);
  };

  const handleCreateLoad = (): void => {
    navigate(paths.createload);
  };
  const handleCloseModal = (): void => {
    setShowInvoiceModal(false);
    setEditingInvoice(null);
  };

 

  const handleColumnToggle = (key: string): void => {
    dispatch(toggleColumn(key));
  };

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = (): void => {
    setColumnMenuAnchor(null);
  };

  // Modal handling functions
  const openModal = (type: 'carrier' | 'pickup' | 'delivery' | 'driver', data: any[], title: string): void => {
    setModalState({
      open: true,
      type,
      title,
      data
    });
  };

  const closeModal = (): void => {
    setModalState(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleToggleActivate = async (loadId: string,isActive: boolean): Promise<void> => {
    const confirmDelete = window.confirm(`Are You sure you want to Deactivate  this load?
      After Deactivate this load will not Activate`);
    if (confirmDelete) {
      deleteLoadMutation.mutate(loadId);
    }
  }
  const handleToggleDelete = async (loadId: string,isActive: boolean): Promise<void> => {
    const confirmDelete = window.confirm(`Are You sure you want to Delete this load?`);
    if (confirmDelete) {
      deleteLoadDataMutation.mutate(loadId);
    }
  }
  const tableColumns: ColumnDef[] = [
    ...COLUMN_OPTIONS.filter((col) => visibleColumns.includes(col.key)).map((col) => ({
      key: col.key,
      label: col.label,
    })),
    { key: 'actions', label: 'Actions', align: 'center' as const },
  ];

  return (
    <>
      <Box sx={{ minHeight: '100vh' }}>
        <PageHeader
          title="Loads"
          subtitle="Manage your freight loads"
          actions={
            <>
              <Tooltip title="Filter">
                <IconButton
                  size="small"
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ color: 'text.secondary', mr: 1 }}
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter by column">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewColumnIcon />}
                  onClick={handleColumnMenuOpen}
                  sx={{ borderRadius: 2 }}
                >
                  Columns
                </Button>
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
                {COLUMN_OPTIONS.filter((col) => !['pickDate', 'dropDate'].includes(col.key)).map((col) => (
                  <MenuItem key={col.key} dense onClick={() => handleColumnToggle(col.key)} sx={{ gap: 1 }}>
                    <Checkbox size="small" checked={visibleColumns.includes(col.key)} sx={{ p: 0 }} />
                    <Typography variant="body2">{col.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
              <HasPermission
                action="create"
                resource={["loads"]}
                component={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={getIcon("plus")}
                    onClick={handleCreateLoad}
                    sx={{ borderRadius: 2 }}
                  >
                    Create New Load
                  </Button>
                }
              />
            </>
          }
        />

       

        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: 320 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Filter Loads</Typography>
            <FilterBox
              search={search}
              setSearch={setSearch}
              startPickupDate={startPickupDate}
              setStartPickupDate={setStartPickupDate}
              endPickupDate={endPickupDate}
              setEndPickupDate={setEndPickupDate}
            />
          </Box>
        </Drawer>

        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            overflow: 'hidden', 
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => { setActiveTab(newValue); setCurrentPage(1); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
                px: 3
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {LOAD_STATUSES.map((status) => (
              <Tab key={status.key} label={status.label} value={status.key} />
            ))}
          </Tabs>
        </Paper>

          <DataTable
            columns={tableColumns}
            data={Array.isArray(data?.data) ? data.data : []}
            isLoading={isPending}
            total={data?.pagination?.total ?? 0}
            page={currentPage - 1}
            rowsPerPage={limit}
            onPageChange={(newPage) => setCurrentPage(newPage + 1)}
            onRowsPerPageChange={(rows) => setLimit(rows)}
          renderRow={(load: IViewLoad) => (
            <TableRow
              key={load._id}
              hover
              sx={{
                '&:last-child td': { border: 0 },
                borderLeft: getClaimedStatus(load.status)?.color
                  ? `4px solid ${getClaimedStatus(load.status)?.color}`
                  : undefined,
                position: 'relative',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid transparent'
                  }
                },
             
                '&:hover::before': {
                  opacity: 1
                }
              }}
            >
              {COLUMN_OPTIONS.map((col) =>
                visibleColumns.includes(col.key) ? (
                  <TableCell key={col.key} sx={{ py: 1.25 }}>
                    {renderCell({
                      column: col.key,
                      load,
                      setAddressModalOpen,
                      setSelectedAddresses,
                      openModal,
                      expandedAddresses,
                      setExpandedAddresses,
                      anchorEl,
                      setAnchorEl,
                      setCurrentLoad,
                      currentLoad,
                    })}
                  </TableCell>
                ) : null
              )}
              <TableCell align="center" sx={{ py: 0.5 }}>
                <VerticalMenu
                  actions={[
                    hasAccess(["loads"], "update", currentUser)
                      ? { label: 'Edit', icon: "edit", onClick: () => handleEdit(load._id) }
                      : null,
                    hasAccess(["loads"], "update", currentUser) && load.isActive
                      ? { label: 'Deactivate', icon: "cancel", disabled: deleteLoadMutation.isPending, onClick: () => handleToggleActivate(load._id, load.isActive) }
                      : null,
                    hasAccess(["loads"], "view", currentUser)
                      ? { label: 'View', icon: "visibility", onClick: () => handleOpenViewLoadModal(load) }
                      : null,
                    hasAccess(["loads"], "view", currentUser)
                      ? { label: 'Generate Rate Confirmation PDF', icon: "visibility", onClick: () => generatePDF(load._id), loading: isGeneratingPdf }
                      : null,
                    hasAccess(["loads"], "delete", currentUser)
                      ? { label: 'Delete', icon: "delete", onClick: () => handleToggleDelete(load._id, load.isActive), loading: deleteLoadDataMutation.isPending }
                      : null,
                  ]}
                />
              </TableCell>
            </TableRow>
          )}
        />
      <Modal
        open={showInvoiceModal}
        onClose={handleCloseModal}
        aria-labelledby="invoice-modal-title"
        aria-describedby="invoice-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="invoice-modal-title" variant="h6" component="h2">
            {editingInvoice?._id ? 'Edit Invoice' : 'Create Invoice'}
          </Typography>
          {/* <InvoiceForm
            initialData={editingInvoice}
            onSubmit={handleCreateInvoice}
            invoiceType={invoiceType}
          /> */}
        </Box>
      </Modal>
      {/* Unified Data Modal for all array data types using the BiewLoadModal component */}
      <BiewLoadModal
        open={modalState.open}
        type={modalState.type}
        title={modalState.title}
        data={modalState.data}
        onClose={closeModal}
      />
      {
        viewLoadModal && <ViewLoadDetails load={viewLoadModal} closeModal={handleCloseViewLoadModal} />
      }

      <AddressModal addressModalOpen={addressModalOpen} selectedAddresses={selectedAddresses} setAddressModalOpen={setAddressModalOpen} />
      
      </Box>
    </>
  );
};

export default withPermission("view",["loads"])(ViewLoad);
