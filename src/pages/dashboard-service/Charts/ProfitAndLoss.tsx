import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Paper, Typography, Box, Stack, Button } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { paths } from '@/utils/paths';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { formatCurrency } from '@/utils';
import { fetchAllProfitAndLossStats } from '@/redux/Slice/DashboardSlice';
import FilterDate from '../components/FilterDate';
import { getIcon } from '@/components/common/icons/getIcon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    borderDash?: number[];
  }[];
}

const ProfitAndLoss: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard } = useAppSelector((state) => state.dashboard);
  const dateFilter = useAppSelector((state) => state.dashboard.dashboard.dateFilters["Profit&Loss"])
  
  useEffect(() => {
    // Fetch profit and loss data with date filter
    
    dispatch(fetchAllProfitAndLossStats({ fromDate: dateFilter.fromDate!, toDate: dateFilter.toDate! }));
  }, [dispatch, dateFilter]);
  
  // Process Profit and Loss data from Redux
  const profitAndLossData = dashboard.ProfitAndLossData || [];
  const profitAndLossTotals = dashboard.ProfitAndLossTotals;
  
  // Group data by month for chart
  const monthlyData = profitAndLossData.reduce((acc: any, item) => {
    const monthKey = `${item.monthName} ${item.year}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }
    if (item.type === "income") { // Income type
      acc[monthKey].income += item.totalAmount;
    } else if (item.type === "expense") { // Expense type
      acc[monthKey].expenses += item.totalAmount;
    }
    return acc;
  }, {});
  
  const sortedMonths = Object.keys(monthlyData).sort();
  const incomeData = sortedMonths.map(month => monthlyData[month].income);
  const expensesData = sortedMonths.map(month => monthlyData[month].expenses);
 
  const data: ChartData = {
    labels: sortedMonths.length > 0 ? sortedMonths : ['No Data'],
    datasets: [
      {
        label: 'Income (Profit)',
        data: incomeData.length > 0 ? incomeData : [0],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Expenses (Loss)',
        data: expensesData.length > 0 ? expensesData : [0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      },
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Profit and Loss Chart'
      }
    }
  };

  const netProfit = profitAndLossTotals?.netProfit || 0;
  const isLoss = netProfit < 0;

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
          <Typography variant="h6">
        PROFIT AND LOSS
      </Typography>
       <FilterDate type="Profit&Loss"/>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 0,
              color: isLoss ? 'error.main' : 'text.primary'
            }}
          >
            {formatCurrency(profitAndLossTotals?.netProfit || 0)}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 0 }}
          >
            {isLoss ? 'Net Loss' : 'Net Profit'}
          </Typography>
        </Box>
       
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Line data={data} options={options} />
      </Box>

      <Button
        component={Link}
        to={paths.reportprofitandloss}
        endIcon={getIcon("arrowForward", { fontSize: "small" })}
        sx={{ 
          mt: 2,
          textTransform: 'none',
          justifyContent: 'flex-start',
          pl: 0
        }}
      >
        See profit and loss report
      </Button>
    </Paper>
  );
};

export default ProfitAndLoss;