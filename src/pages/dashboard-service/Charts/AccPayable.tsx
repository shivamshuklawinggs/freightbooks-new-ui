import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Stack, Button, Grid } from '@mui/material';
import { paths } from '@/utils/paths';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { formatCurrency } from '@/utils';
import { fetchAllAccountsPayableStats } from '@/redux/Slice/DashboardSlice';
import FilterDate from '../components/FilterDate';
import { getIcon } from '@/components/common/icons/getIcon';

interface LegendItem {
  color: string;
  amount: string;
  label: string;
}

interface PayableData {
  name: string;
  value: number;
  color: string;
}

const AccPayable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, } = useAppSelector((state) => state.dashboard);
  const dateFilter = useAppSelector((state) => state.dashboard.dashboard.dateFilters["AccPayable"]);
  
  useEffect(() => {
    // Fetch accounts payable data
    dispatch(fetchAllAccountsPayableStats({ fromDate: dateFilter.fromDate!, toDate: dateFilter.toDate! }));
  }, [dispatch,dateFilter]);
  
  // Get accounts payable data from Redux
  const accountsPayable = dashboard.AccountsPayable || {
    currentMonth: 0,
    twoToSixMonths: 0,
    greaterThanSixMonths: 0,
    totalAmount: 0
  };
  
  // Create legend data from Redux data
  const legendData: LegendItem[] = [
    {
      color: '#4CAF50',
      amount: formatCurrency(accountsPayable.currentMonth),
      label: 'Current'
    },
    {
      color: '#FF9800',
      amount: formatCurrency(accountsPayable.twoToSixMonths),
      label: '2-6 Months'
    },
    {
      color: '#F44336',
      amount: formatCurrency(accountsPayable.greaterThanSixMonths),
      label: '6+ Months'
    }
  ];
  
  // Create pie chart data
  const payablesData: PayableData[] = [
    { name: 'Current', value: accountsPayable.currentMonth, color: '#4CAF50' },
    { name: '2-6 Months', value: accountsPayable.twoToSixMonths, color: '#FF9800' },
    { name: '6+ Months', value: accountsPayable.greaterThanSixMonths, color: '#F44336' }
  ].filter(item => item.value > 0);

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography variant="h6" noWrap>
          ACCOUNTS PAYABLE
        </Typography>
       <FilterDate type="AccPayable"/>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Total A/P amount
      </Typography>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {formatCurrency(accountsPayable.totalAmount)}
      </Typography>

      <Box sx={{ flex: 1, mt: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {legendData.map((item: LegendItem, index: number) => (
                <Stack 
                  key={index} 
                  direction="row" 
                  spacing={1} 
                  alignItems="center"
                >
                  {getIcon("GoDotFill", { color: item.color })}
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {item.amount}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: item.color }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={payablesData.length > 0 ? payablesData : [{ name: 'No Data', value: 1, color: '#e0e0e0' }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    cornerRadius={5}
                  >
                    {payablesData.map((entry: PayableData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Button
        component={Link}
        to={paths.accountspayable}
        endIcon={getIcon("arrowForward", { fontSize: "small" })}
        sx={{ 
          mt: 2,
          textTransform: 'none',
          justifyContent: 'flex-start',
          pl: 0
        }}
      >
        View accounts payable
      </Button>
    </Paper>
  );
};

export default AccPayable;
