import { Box, TextField, InputAdornment, List, ListItemButton, ListItemText, Typography, Divider, CircularProgress, Fade, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState, useRef, useEffect } from 'react';
import {  useNavigate,useParams } from 'react-router-dom';
import { paths } from '@/utils/paths';
import { ICarrier } from '@/types';
import { getAllDataOfBillCustomers } from '@/utils/getAllDataByApi';
import { useQuery } from '@tanstack/react-query';

const CustomersListSidebar: React.FC = () => {
  const {id} = useParams()
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const { data: invoiceData, isLoading, isFetching } = useQuery({
    queryKey: ['getBillVendors',searchTerm],
    queryFn: async () => {
      const response = await getAllDataOfBillCustomers({search: searchTerm,limit:100}) as ICarrier[];
  
      return response;
    },
  });

  // Auto-scroll to selected item
  useEffect(() => {
    if (id && selectedItemRef.current && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const selectedItem = selectedItemRef.current;
      
      // Calculate scroll position to center the selected item
      const containerHeight = scrollContainer.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemHeight = selectedItem.offsetHeight;
      
      const scrollTo = itemTop - (containerHeight / 2) + (itemHeight / 2);
      
      scrollContainer.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [id, invoiceData]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: 'background.paper', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Vendor
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search Vendor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              },
            },
          }}
        />
        {/* <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
          onClick={() => {
            // Handle add new customer
          }}
        >
          New Vendor
        </Button> */}
      </Box>
      
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          height: 0, // Important for flex child to respect parent constraints
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : invoiceData?.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No vendors found' : 'No vendors available'}
            </Typography>
          </Box>
        ) : (
          <Fade in={!isLoading} timeout={300}>
            <List>
              {invoiceData?.map((customer:ICarrier, index:number) => (
                <React.Fragment key={customer._id}>
                  <ListItemButton 
                    ref={id === customer._id ? selectedItemRef : null}
                    onClick={() => {
                      navigate(`${paths.vendortransactionlist}/${customer._id}`)
                      
                    }}
                    sx={{
                      transition: 'all 0.2s ease-in-out',
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      minHeight: '64px',
                      ...(id === customer._id && {
                        backgroundColor: 'primary.light',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      }),
                      '&:hover': {
                        backgroundColor: id === customer._id ? 'primary.light' : 'action.hover',
                        transform: 'translateX(2px)',
                      },
                      '&:active': {
                        transform: 'translateX(1px)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={customer.company || customer.company}
                      secondary={`${customer?.company  ||  customer.company || ''} • ${customer?.email || ''}`}
                      primaryTypographyProps={{
                        fontWeight: id === customer._id ? 'bold' : 'medium',
                        noWrap: true,
                        color: id === customer._id ? 'primary.dark' : 'text.primary',
                      }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        color: id === customer._id ? 'primary.main' : 'text.secondary',
                      }}
                    />
                   
                  </ListItemButton>
                  {index < (invoiceData?.length || 0) - 1 && <Divider variant="inset" component="li" sx={{ ml: 2 }} />}
                </React.Fragment>
              ))}
            </List>
          </Fade>
        )}
        {isFetching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CustomersListSidebar;