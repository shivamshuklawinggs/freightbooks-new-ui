import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Stack, Button, Grid } from '@mui/material';
import { paths } from '@/utils/paths';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { formatCurrency } from '@/utils';
import { fetchAllExpenseStats } from '@/redux/Slice/DashboardSlice';
import FilterDate from '../components/FilterDate';
import { getIcon } from '@/components/common/icons/getIcon';
interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

const ExpenSes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, } = useAppSelector((state) => state.dashboard);
    const dateFilter = useAppSelector((state) => state.dashboard.dashboard.dateFilters["Expenses"]);
  useEffect(() => {
    // Fetch expense data
    dispatch(fetchAllExpenseStats({ fromDate: dateFilter.fromDate!, toDate: dateFilter.toDate! }));
  }, [dispatch,dateFilter]);
  
  // Get expense data from Redux
  const expenseData = dashboard.expenseData || [];
  const expenseTotal = dashboard.expenseTotal || 0;
  
  // Transform expense data for pie chart with colors
  const colors = ['#3F51B5', '#FF8A80', '#FF9800', '#FFEB3B', '#4CAF50', '#9C27B0', '#00BCD4'];
  const updatedExpensesData: ExpenseData[] = expenseData.slice(0, 6).map((expense, index) => ({
    name: expense.name,
    value: expense.totalAmount,
    color: colors[index % colors.length]
  }));

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
          EXPENSES
        </Typography>
        <FilterDate type="Expenses"/>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Total expenses
      </Typography>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {formatCurrency(expenseTotal)}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <Typography 
          component="span" 
          sx={{ 
            color: 'success.main',
            fontWeight: 500
          }}
        >
          {updatedExpensesData.length} Categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          tracked
        </Typography>
      </Stack>

      <Box 
        sx={{ 
          flex: 1,
          borderRight: 1,
          borderColor: 'divider',
          pr: 2
        }}
      >
        <Grid container>
          <Grid item xs={5}>
            <Box sx={{ height: 110 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={updatedExpensesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                  >
                    {updatedExpensesData.map((entry: ExpenseData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={7}>
            <Box 
              sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {updatedExpensesData.map((item: ExpenseData, index: number) => (
                <Stack 
                  key={index} 
                  direction="row" 
                  spacing={0.5} 
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.color
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.name}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Button
          component={Link}
          to={paths.expenses}
          endIcon={getIcon("arrowForward", { fontSize: "small" })}
          
          sx={{ 
            mt: 2,
            textTransform: 'none',
            justifyContent: 'flex-start',
            pl: 0
          }}
        >
          View all spending
        </Button>
      </Box>
    </Paper>
  );
};

export default ExpenSes;