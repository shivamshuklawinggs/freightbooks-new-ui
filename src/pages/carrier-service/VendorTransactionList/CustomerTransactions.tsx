// Updated CustomerTransactions.tsx
import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, CircularProgress, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { useParams } from 'react-router-dom';
import OutStandingTransactions from './OutStandingTransactions';
import { ICustomerTransactionDetails } from '@/types';
import BasicDetalis from './BasicDetalis';
import SumaryCard from './SumaryCard';

import TransactionActions from './TransactionActions';
import CustomerDetalis from './CustomerDetalis';

const VendorTransactions: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>('outstandingtransactions');
  const { data, isLoading } = useQuery<ICustomerTransactionDetails, Error>({
    queryKey: ['getCustomerBillDetails', id],
    queryFn: async () => {
      const response = await apiService.getCustomerBillDetails(id as string,);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 1,
          backgroundColor: 'background.paper',
        }}
      >

         <TransactionActions isCarrier={data?.isCarrier || false}  data={data!! }/>
        <Box display="flex" gap={1} mt={2} flexDirection={{ xs: 'column', md: 'row' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
           <BasicDetalis data={data} />
          </Grid>
           <Grid item xs={12} md={4}>
           <SumaryCard data={data} />
          </Grid>
        </Grid>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="Transaction List" value="outstandingtransactions" />
          <Tab label="Vendor Detalis" value="customerdetalis" />
        </Tabs>

        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          {activeTab === 'outstandingtransactions' && <OutStandingTransactions />}
          {activeTab === 'customerdetalis' && data && <CustomerDetalis data={data } />}
        </Box>
      </Paper>
    </Box>
    </>
  );
};

export default VendorTransactions;