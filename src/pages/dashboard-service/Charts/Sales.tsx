import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Stack, Button, Chip } from '@mui/material';
import { paths } from '@/utils/paths';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { formatCurrency } from '@/utils';
import { fetchAllSalesStats } from '@/redux/Slice/DashboardSlice';
import FilterDate from '../components/FilterDate';
import { Moment } from 'moment';
import { getIcon } from '@/components/common/icons/getIcon';

const Sales: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard } = useAppSelector((state) => state.dashboard);
  const dateFilter = useAppSelector((state) => state.dashboard.dashboard.dateFilters["Sales"]);
  
  useEffect(() => {
    // Fetch sales data with date filter
    dispatch(fetchAllSalesStats({ fromDate: dateFilter.fromDate!, toDate: dateFilter.toDate! }));
  }, [dispatch, dateFilter]);
  
  // Get sales data from Redux
  const salesData = dashboard.SalesData || [];
  const totalSales = dashboard.TotalSales || 0;
  
  // Process sales data for chart - group by month
  const monthlySalesData = salesData.reduce((acc: any, item) => {
    const monthKey = `${item.monthName} ${item.year}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { date: monthKey, sales: 0 };
    }
    acc[monthKey].sales += item.totalAmount;
    return acc;
  }, {});
  
  const chartData = Object.values(monthlySalesData).sort((a: any, b: any) => {
    // Sort by date
    return a.date.localeCompare(b.date);
  });

  // Format date display based on customeDate flag
  const formatDateDisplay = () => {
    if (dateFilter.customeDate && dateFilter.fromDate && dateFilter.toDate) {
      return `${(dateFilter.fromDate as Moment).format('MM/DD/YYYY')} - ${(dateFilter.toDate as Moment).format('MM/DD/YYYY')}`;
    } else if (dateFilter.fromDate) {
      return `From ${(dateFilter.fromDate as Moment).format('MM/DD/YYYY')}`;
    }
    return 'No date selected';
  };

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
        <Box>
          <Typography variant="h6">
            SALES
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={dateFilter.customeDate ? "Custom Range" : "Preset"}
              size="small"
              color={dateFilter.customeDate ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDateDisplay()}
            </Typography>
          </Box>
        </Box>
       <FilterDate type="Sales"/>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Total sales
      </Typography>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {formatCurrency(totalSales)}
      </Typography>

      <Box sx={{ flex: 1, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.length > 0 ? chartData : [{ date: 'No Data', sales: 0 }]}
            margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
          >
            <CartesianGrid horizontal={true} vertical={false} stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => value === 0 ? '$0' : `$${value}`}
              tickCount={5}
              domain={[0, 'dataMax + 500']}
              dx={-10}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Sales']}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#58b02c"
              strokeWidth={3}
              dot={{ fill: '#58b02c', r: 4 }}
              activeDot={{ fill: '#58b02c', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Button
        component={Link}
        to={paths.sales}
        endIcon={getIcon("arrowForward", { fontSize: "small" })}
        sx={{ 
          mt: 2,
          textTransform: 'none',
          justifyContent: 'flex-start',
          pl: 0
        }}
      >
        View sales report
      </Button>
    </Paper>
  )
}

export default Sales