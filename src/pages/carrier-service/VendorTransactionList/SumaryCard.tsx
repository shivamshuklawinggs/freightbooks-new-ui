import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { formatCurrency } from '@/utils';
import { ICustomerTransactionDetails } from '@/types';

const SummaryCard: React.FC<{ data?: ICustomerTransactionDetails }> = ({data}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        minWidth: 200,
        border: '1px solid',
        borderColor: 'grey.400',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        SUMMARY
      </Typography>

      {/* Open Balance */}
      <Box display="flex" alignItems="center" mt={2} mb={2}>
        <Box
          sx={{
            width: 4,
            height: 40,
            bgcolor: 'warning.main',
            borderRadius: 1,
            mr: 1.5,
          }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {formatCurrency(data?.OpenBalance || 0).toLocaleString()}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Open balance
          </Typography>
        </Box>
      </Box>

      {/* Overdue Payment */}
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 4,
            height: 40,
            bgcolor: 'error.main',
            borderRadius: 1,
            mr: 1.5,
          }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {formatCurrency(data?.totalDueAmount || 0).toLocaleString()}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Overdue payment
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SummaryCard;
