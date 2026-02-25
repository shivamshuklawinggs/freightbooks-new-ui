import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box,  CircularProgress } from '@mui/material';
import apiService from '@/service/apiService';
import { CustomerDashboardData } from '@/types';
import StyledSummaryBar from '@/components/common/StyledSummaryBar';

const CustomerDashboard: React.FC<{isCarrier:boolean}> = ({isCarrier=false}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const response: CustomerDashboardData = await apiService.Dashboard.getVendorDashboard();
      return response.data;
    },
  });

  if (isLoading || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  return  (
    <StyledSummaryBar
  sections={[
    { label: 'Unbilled Bill', totalAmount: data?.UnbillIncome?.totalAmount || 0, count: data?.UnbillIncome?.count || 0, color: '#9457FA',percentage: data?.UnbillIncome?.percentage || 0 },
    { label: 'Overdue bills', totalAmount: data?.overdueInvoices?.totalAmount || 0, count: data?.overdueInvoices?.count || 0, color: '#FF8000',percentage: data?.overdueInvoices?.percentage || 0 },
    { label: 'Open bills and credits', totalAmount: data?.open?.totalAmount || 0, count: data?.open?.count || 0, color: 'blue',percentage: data?.open?.percentage || 0 },
    { label: 'Partial bills', totalAmount: data?.partialInvoices?.totalAmount || 0, count: data?.partialInvoices?.count || 0, color: 'blue',percentage: data?.partialInvoices?.percentage || 0 },
    { label: 'Recently paid', totalAmount: data?.recentPaidInvoices?.totalAmount || 0, count: data?.recentPaidInvoices?.count || 0, color: '#2CA01C',percentage: data?.recentPaidInvoices?.percentage || 0 },
  ]}
/>
) 
};

export default CustomerDashboard;
