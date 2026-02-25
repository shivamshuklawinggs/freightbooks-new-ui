import React from 'react';
import { allowedreports, ITrialBalanceReport } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { Reporttitle } from "../constant";
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '@/utils/dateUtils';
import { useAppSelector } from '@/redux/store';
import { formatCurrency } from '@/utils';
import { paths } from '@/utils/paths';

const TrialBalanceReport: React.FC<{ reportData: ITrialBalanceReport }> = ({ reportData }) => {
  const navigate=useNavigate()
  const { type = "TrialBalanceReport" } = useParams<{ type: allowedreports }>();
  const filters = useAppSelector((state) => state.report);
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {Reporttitle[type]}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
          As of {formatDate(filters.fromDate)}
        </Typography>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}></TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Debit</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData?.result) &&
              reportData.result.map((group) => (
                <TableRow key={group._id} sx={{ backgroundColor: '#f9f9f9' }}>
                  <TableCell sx={{ fontWeight: 600 ,cursor:"pointer"}} onClick={()=>navigate(`${paths.AccountRegister}/${group._id}`)}>{group.name || '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(group?.totalDebits || 0)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(group?.totalCredits || 0)}
                  </TableCell>
                </TableRow>
              ))}

            {/* Grand Total Row */}
            <TableRow sx={{ backgroundColor: '#e8e8e8', fontWeight: 700 }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(reportData?.totals?.totalDebits || 0)}
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(reportData?.totals?.totalCredits || 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

     
    </Box>
  );
};

export default TrialBalanceReport;
