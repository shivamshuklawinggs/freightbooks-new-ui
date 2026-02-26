import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography, CircularProgress, TablePagination, Rating, Grid, Paper, Divider } from '@mui/material';
import { Add as AddIcon} from '@mui/icons-material';
import CarrierModal from './CarrierModal';
import DriversModal from './Drivers/DriversModal'
import CarrierFilters, {CarrierFiltersType }  from '@/components/CarrierFilters';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import DocumentEditField from './DocumentEditField';
import { useTheme, alpha } from '@mui/material/styles';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import CustomerDashboard from './CustomerDashboard';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CustomerStatus, ICarrier } from '@/types';
import { hasAccess, HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';
import { paths } from '@/utils/paths';

const Carriers: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(51);
  const [showCarrierModal, setShowCarrierModal] = useState<any>(false);
  const [showDriversModal, setShowDriversModal] = useState<any>(false);
  const [showDocumentModal, setShowDocumentModal] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState<CarrierFiltersType>({
    search: '',
    status: '' as CustomerStatus,
    hasOpenBalance: false,
    ratingRange: [0, 5] as [number, number],
    hasDrivers: false,
    operatingStatus: [] as string[],
    carrierOperation: [] as string[],
  });

  // Fetch carriers using React Query
  const { data: carriersData, isLoading, error } = useQuery({
    queryKey: ['carriers', currentPage, limit, filters],
    queryFn: async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: limit,
        };

        // Add filters to params
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.hasOpenBalance) params.hasOpenBalance = filters.hasOpenBalance;
        if (filters.ratingRange[0] > 0) params.ratingMin = filters.ratingRange[0];
        if (filters.ratingRange[1] < 5) params.ratingMax = filters.ratingRange[1];
        if (filters.hasDrivers) params.hasDrivers = filters.hasDrivers;
        if (filters.operatingStatus.length > 0) params.operatingStatus = filters.operatingStatus.join(',');
        if (filters.carrierOperation.length > 0) params.carrierOperation = filters.carrierOperation.join(',');

        const response = await apiService.getCarriers(params);
        return response;
      } catch (err) {
        console.warn(err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '' as CustomerStatus,
      hasOpenBalance: false,
      ratingRange: [0, 5] as [number, number],
      hasDrivers: false,
      operatingStatus: [] as string[],
      carrierOperation: [] as string[],
    });
    setCurrentPage(1);
  };

  // Delete carrier mutation
  const deleteMutation = useMutation({
    mutationFn: async (carrierId: string) => {
      return await apiService.deleteCarrier(carrierId);
    },
    onSuccess: () => {
      toast.success('Carrier deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete carrier');
    }
  });

  const handleCloseDriverModal = (): void => {
    setShowDriversModal(false);
  };
  
  const handleOpenDriverModal = (carrierId: string): void => {
    setShowDriversModal(carrierId);
  };
  
  const handleAddCarrier = (): void => {
   setShowCarrierModal(true);
  }
  
  const handleEditCarrier = (carrierId: any): void => {
   setShowCarrierModal(carrierId);
  }
  
  const handleDeleteCarrier = async(carrierId: any): Promise<void> => {
    const confirmDelete = window.confirm("Are you sure you want to delete this carrier?");
    if (!confirmDelete) {
      return;
    }
    deleteMutation.mutate(carrierId);
  }
  
  const handleFormUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['carriers'] });
  };

  const Columns=[
    {
    name:"ID",
    width:"20%"
  },
    {
    name:"Company Name",
    width:"20%"
  },{
    name:"MC Number",
    width:"20%"
  },{
    name:"USDOT",
    width:"20%"
  },
  {
    name:"Rating",
    width:"20%"
  },
  {
    name:"Rate",
    width:"20%"
  },
  {
    name:"Contact",
    width:"20%"
  },
  {
    name:"Open Balance",
    width:"20%"
  },
  {
    name:"Drivers",
    width:"20%"
  },{
    name:"Documents",
    width:"20%"
  },
  
  {
    name:"Status",
    width:"20%"
  }
];

  const data = carriersData?.data || [];
  const pagination = carriersData?.pagination || { total: 0 };
  
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Carriers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your carrier accounts</Typography>
        </Box>
        <HasPermission
          resource={["carriers"]}
          action="create"
          component={
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddCarrier}
              sx={{ borderRadius: 2 }}
            >
              Add Carrier
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

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mt: 1.5 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    {Columns.map((column) => (
                      <TableCell key={column.name} sx={{ fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 }}>
                        {column.name}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={Columns.length + 1} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={Columns.length + 1} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="error">Failed to load carriers</Typography>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={Columns.length + 1} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">No carriers found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.filter((carrier: ICarrier) => carrier._id !== "").map((carrier: ICarrier) => (
                      <TableRow key={carrier._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1.25 }}>{carrier.id}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{carrier.company}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{carrier.mcNumber}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{carrier.usdot}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 0.5 }}
                            onClick={() => navigate(`/carriers/rating/${carrier._id}`)}
                          >
                            <Rating precision={0.1} value={carrier?.rating?.overallScore || 0} readOnly size="small" />
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                              Details
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>{carrier.rate}%</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2">{carrier.phone}</Typography>
                          <Typography variant="caption" color="text.secondary">{carrier.email}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>{carrier.dueAmount || 0}</TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ fontSize: '0.7rem', py: 0.25 }}
                            onClick={() => handleOpenDriverModal(carrier._id || '')}
                          >
                            Drivers ({carrier.totalDrivers || 0})
                          </Button>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ fontSize: '0.7rem', py: 0.25 }}
                            onClick={() => setShowDocumentModal(carrier._id || '')}
                          >
                            Docs ({carrier.documents?.length || 0})
                          </Button>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={carrier.status}
                            size="small"
                            color={carrier.status === 'active' ? 'success' : 'default'}
                            sx={{ height: 22, fontWeight: 600, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <VerticalMenu actions={[
                            hasAccess(["carriers"], "update", currentUser)
                              ? { label: 'Edit', icon: "edit", onClick: () => handleEditCarrier(carrier) }
                              : null,
                            hasAccess(["carriers"], "delete", currentUser)
                              ? { label: 'Delete', icon: "delete", onClick: () => handleDeleteCarrier(carrier._id || '') }
                              : null,
                            hasAccess(['accounting'], 'create', currentUser)
                              ? { label: 'Make Payment', icon: "payment", onClick: () => {} }
                              : null,
                            hasAccess(['carriers'], 'view', currentUser)
                              ? { label: 'Report', icon: "reportScore", onClick: () => navigate(`${paths.carriers}/report/${carrier._id}`) }
                              : null,
                          ]} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination?.total || 0}
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

      {showCarrierModal && (
        <CarrierModal
          open={showCarrierModal}
          onClose={() => setShowCarrierModal(false)}
          onUpdate={handleFormUpdate}
          isCarrier={true}
        />
      )}
      {showDriversModal && (
        <DriversModal
          open={showDriversModal}
          onClose={handleCloseDriverModal}
          carrier={showDriversModal}
          onUpdate={handleFormUpdate}
          loading={isLoading}
        />
      )}
      {showDocumentModal && (
        <DocumentEditField 
          carrierId={showDocumentModal} 
          onClose={() => setShowDocumentModal(null)} 
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['carriers'] });
            setShowDocumentModal(null);
          }}
        />
      )}
    </Box>
  );
};

export default withPermission("view",["carriers"])(Carriers);