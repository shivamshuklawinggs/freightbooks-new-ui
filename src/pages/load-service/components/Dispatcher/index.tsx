import React, { useState, useEffect } from 'react';
import apiService from "@/service/apiService";
import { formatCurrency } from '@/utils';
import {  getClaimedStatus, getStatusColor } from '@/utils';
import { LOAD_STATUSES } from '@/data/Loads';
import ExpenseDetails from './ExpenseDetails';
import StatusUpdate from './StatusUpdate';
import ExpenseBelow from './ExpenseBelow';
import { ICarrierExpenseDispatcher, ICustomer, IitemService, ILocationWithIds } from '@/types';
import { Button, IconButton, Container, Drawer, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, useTheme, alpha, Chip, TablePagination } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UpdateIcon from '@mui/icons-material/Update';
// import EventNoteIcon from '@mui/icons-material/EventNote';
import FollowUp from './FollowUp';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {renderAddress,AddressModal} from '@/components/common/renderAddress';

import FilterBox from '@/components/FilterBox';
import LoadMenu from './LoadMenu';
import ExpenseFessServiceForm from '@/pages/expense-fee-service/ExpenseFessServiceForm';
import { useSearchParams } from 'react-router-dom';
import { HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';

interface Load {
  _id: string;
  loadNumber: string;
  currentLocation?:string;
  loadAmount: number;
  customerId:ICustomer;
  pickupLocationId: ILocationWithIds[];
  deliveryLocationId: ILocationWithIds[];
  status: string;
  followUpDate: Date;
  followupstatus: string;
  carrierIds: ICarrierExpenseDispatcher;
  notes?: string;
}
interface LoadResponse {
  data: Load[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

const Dispatcher: React.FC = () => {
  const theme = useTheme();
  const [searchparams]=useSearchParams(window.location.search)
  const loadNumber= searchparams.get('loadNumber')
  // State for address modal
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [selectedAddresses, setSelectedAddresses] = useState<{locations: ILocationWithIds[], title: string}>({
      locations: [], 
      title: ''
    });
  const [expandedAddresses, setExpandedAddresses] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('allLoad');
  const [selectedLoad, setSelectedLoad] = useState<{ load: Load; service: IitemService | null; type: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // Menu state - moved outside the render loop
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
        // State for address read more functionality
  const [isExpenseSidebarOpen, setIsExpenseSidebarOpen] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [startPickupDate, setStartPickupDate] = useState<Date | null>(null);
  const [endPickupDate, setEndPickupDate] = useState<Date | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { data, isLoading,refetch } = useQuery<LoadResponse, Error, LoadResponse>({
    queryKey: ['dispatcher', currentPage, limit, activeTab, search,
      startPickupDate, endPickupDate],
    queryFn: async () => {
      try {
        const status = activeTab === 'allLoad' ? '' : activeTab;
        const response = await apiService.getLoads({
          page: currentPage,
          limit,
          status,
          search,
        StartPickupDate:startPickupDate,
        EndPickupDate:endPickupDate,
        });
        return response;
      } catch (error) {
        console.warn(error);
        throw error;
      }
    },
  
  });

  // useffect for set loadnumber in search
  useEffect(()=>{
    if(loadNumber){
      setSearch(loadNumber)
    }
  },[loadNumber])

  const Onclose = async () => {
    refetch();
    setIsSidebarOpen(false);
    setSelectedLoad(null);
  };

  const handleLoadClick = (load: Load, service: IitemService | null, type: string) => {
    setSelectedLoad({ load, service, type });
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedLoad(null);
  };

  const renderSidebarContent = () => {
    if (!selectedLoad) return <p>No load selected</p>;

    const { load, service, type } = selectedLoad;
    switch (type) {
      case 'expense':
        return <ExpenseDetails load={{...load,customerId:load.customerId._id || '',}} service={service!} OnSuccess={Onclose} />;
      case 'status':
        return <StatusUpdate data={
          {
            _id:load._id,
            loadNumber:load.loadNumber,
            status:load.status,
            notes:load.notes,
            currentLocation:load.currentLocation,
            carrierId:load.carrierIds?.carrier?._id

          }} OnSuccess={Onclose}  />;
      case 'followup':
        return <FollowUp load={load} OnSuccess={Onclose} />;
      default:
        return <p>Invalid view</p>;
    }
  };

  const renderExpenseSidebarContent = () => {
    if (!isExpenseSidebarOpen) return <p>No load selected</p>;
    return  <ExpenseBelow loadid={isExpenseSidebarOpen} OnSuccess={Onclose} />;
  };
  const handleClick = (loadid:string) => {
    setIsExpenseSidebarOpen(loadid);
  };

  // Function to handle menu click
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, loadId: string) => {
    setMenuAnchorEl(prev => ({
      ...prev,
      [loadId]: event.currentTarget
    }));
  };
  
  // Function to handle menu close
  const handleMenuClose = (loadId: string) => {
    setMenuAnchorEl(prev => ({
      ...prev,
      [loadId]: null
    }));
  };
const columns=[
  {
    id:1,
    label:'Load Number',
    key:'loadNumber'
  },
  {
    id:2,
    label:'Load Amount',
    key:'loadAmount'
  },
  {
    id:3,
    label:'Origin',
    key:'origin'
  },
  {
    id:4,
    label:'Current Location',
    key:'currentLocation'
  },
  {
    id:5,
    label:'Destination',
    key:'destination'
  },
  {
    id:6,
    label:'Status',
    key:'status'
  },

]
  return (
    <>
      <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <FilterBox
          search={search}
          setSearch={setSearch}
          startPickupDate={startPickupDate}
          setStartPickupDate={setStartPickupDate}
          endPickupDate={endPickupDate}
          setEndPickupDate={setEndPickupDate}
          />
         
  
          <Paper elevation={0} sx={{ mb: 3, overflow: 'hidden',borderBottom: 1 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => {
                setActiveTab(newValue);
                setCurrentPage(1);
              }}
              sx={{
                 
              }}
            >
              {LOAD_STATUSES.map(status => (
                <Tab  key={status.key} value={status.key} label={status.label} 
                  // sx={{color:getStatusColor(status.key)}}
                   />
              ))}
            </Tabs>
          </Paper>
  
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                    {
                      columns.map((column)=>{
                        return(
                          <TableCell key={column.id} sx={{ height: 60,
                            width: column.label.length * 10 + "px",
                            fontWeight: 600,
                            whiteSpace: 'nowrap' }}>{column.label}</TableCell>
                        )
                      })
                    }
                    <TableCell sx={{ height: 60, fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    isLoading ? (
                      <TableRow >
                        <TableCell colSpan={7} align="center">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) :Array.isArray(data?.data) && data?.data?.length>0 ? data?.data?.map((load:Load) => {
                    const open = Boolean(menuAnchorEl[load._id]);
                    
                    return (
                      <TableRow 
                        key={load._id}
                     
                       
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.02)
                          },
                          backgroundColor:getClaimedStatus(load.status)?.color
                        }}
                      >
                        <TableCell 
                          onClick={() => handleClick(load._id)} 
                
                          sx={{ 
                            height: 60, 
                            cursor: 'pointer',
                            color: theme.palette.primary.main,
                            fontWeight: 500
                          }}
                        >
                         <Chip label={load.loadNumber} variant="outlined" sx={{ backgroundColor: getStatusColor(load.status), color: '#fff' }} />
                        </TableCell>
                        <TableCell sx={{ height: 60 }}>{formatCurrency(load.loadAmount)}</TableCell>
                        <TableCell sx={{ height: 60  }}>{renderAddress(load.pickupLocationId, load._id, 'pickup',setAddressModalOpen,setSelectedAddresses,expandedAddresses, setExpandedAddresses)}</TableCell>
                        <TableCell sx={{ height: 60 }}>{load.currentLocation || 'N/A'}</TableCell>
                        <TableCell sx={{ height: 60 }}>{renderAddress(load.deliveryLocationId, load._id, 'delivery',setAddressModalOpen,setSelectedAddresses,expandedAddresses, setExpandedAddresses)}</TableCell>
                        <TableCell sx={{ height: 60 }}>
                          <Chip label={load.status} 
                           variant="outlined"
                           sx={{
                            backgroundColor: getStatusColor(load.status),
                            color: '#fff',
                          }}
                          />
                        </TableCell>
                        <TableCell sx={{ height: 60 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <HasPermission action="update" resource={['dispatcher']}component={
                              <>
                              <Button
                              variant="contained"
                              color="primary"
                              size='small'
                              startIcon={<UpdateIcon />}
                              sx={{ 
                                textTransform: 'none', 
                                fontWeight: 'normal', 
                                borderRadius: 1.5,
                                boxShadow: 1,
                                '&:hover': {
                                  boxShadow: 2
                                },
                                minWidth: 90,
                                height: 32
                              }}
                              onClick={() => handleLoadClick(load, null, 'status')}
                            >
                              Status
                            </Button>
                             <Button
                             variant="outlined"
                             color="primary"
                             size='small'
                             // startIcon={<EventNoteIcon />}
                             sx={{ 
                               textTransform: 'none', 
                               fontWeight: 'normal',
                               borderRadius: 1.5,
                               minWidth: 90,
                               height: 32,
                               whiteSpace: 'nowrap',
                             }}
                             onClick={() => handleLoadClick(load, null, 'followup')}
                           >
                             Follow Up
                           </Button>
                           </>
                          }/>
                           
                            <IconButton 
                              sx={{ 
                                cursor: "pointer",
                                color: theme.palette.grey[700],
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  color: theme.palette.primary.main
                                },
                               
                              }} 
                              onClick={(e) => handleMenuClick(e, load._id)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <LoadMenu
                              load={load}
                              handleLoadClick={handleLoadClick}
                              handleMenuClose={handleMenuClose}
                              menuAnchorEl={menuAnchorEl[load._id]}
                              open={open}
                              setShowModal={setShowModal}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ height: 60, py: 3 }}>
                        <Typography align="center" color="text.secondary">No Records Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={data?.pagination?.total || 0}
                page={currentPage-1}
                rowsPerPage={limit}
                onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
                onRowsPerPageChange={(event) => setLimit(parseInt(event.target.value, 10))}
              />
            </TableContainer>
          </Paper>
        </Container>
      </Box>
      
      <Drawer 
        anchor="right" 
        open={isSidebarOpen} 
        onClose={handleSidebarClose}
        PaperProps={{
          sx: {
            width: 500,
            boxShadow: theme.shadows[8],
            backgroundColor: theme.palette.background.default
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          {renderSidebarContent()}
        </Box>
      </Drawer>

      <Drawer 
        anchor="bottom" 
        open={isExpenseSidebarOpen !== null} 
        onClose={()=>setIsExpenseSidebarOpen(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 3, width: '100%' }}>
          {renderExpenseSidebarContent()}
        </Box>
      </Drawer>
      <ExpenseFessServiceForm showModal={showModal} handleModalClose={()=>setShowModal(false)} editingItem={null}/>
      <AddressModal  addressModalOpen={addressModalOpen}  selectedAddresses={selectedAddresses} setAddressModalOpen={setAddressModalOpen}/>
    </>
    );
};

export default withPermission("view",["dispatcher"])(Dispatcher);
