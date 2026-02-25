import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { IGeneralLedgerReport } from '@/types';
import { formatCurrency} from '@/utils'
import { formatDate } from '@/utils/dateUtils';

import { useAppSelector } from '@/redux/store';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';


const DatewiseGeneralLedgerReport: React.FC<{ reportData: IGeneralLedgerReport }> = ({ reportData }) => {
  const navigate=useNavigate()
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const filters = useAppSelector((state) => state.report);
  // Expand first payment of each account by default
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    reportData.result.forEach((acc) => {
      if (acc.payments && acc.payments.length > 0) {
        initialExpanded[acc._id] = true;
      }
    });
    setExpandedAccounts(initialExpanded);
  }, [reportData.result]);

  const toggleAccount = (id: string) => {
    setExpandedAccounts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1300px', mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
        General Ledger Report
      </Typography>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f2f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Debit</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData?.result?.length > 0 && reportData?.result?.map((account, accIdx) => (
              <React.Fragment key={account._id}>
                {/* Account Header */}
                <TableRow
                  sx={{
                    backgroundColor: '#f9f9f9',
                    '&:hover': { backgroundColor: '#f1f1f1' },
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleAccount(account._id)}
                      sx={{ mr: 1 }}
                    >
                      {expandedAccounts[account._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    <Typography onClick={()=>navigate(`${paths.AccountRegister}/${account._id}`)} variant="subtitle2" sx={{ fontWeight: 600,cursor:"pointer" }} >
                      {account.name}
                    </Typography>
                  </TableCell>
                  <TableCell />
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(account?.totalDebits || 0)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(account?.totalCredits || 0)}
                  </TableCell>
                </TableRow>

                {/* Payments Detail */}
                
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={expandedAccounts[account._id]} timeout="auto" unmountOnExit>
                      <Table size="small">
                        <TableBody>
                          {account?.payments?.length > 0 && account?.payments?.map((payment, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f7f7f7',
                                '&:hover': { backgroundColor: '#e6f2ff' },
                              }}
                            >
                              <TableCell sx={{ pl: 6 }}>{formatDate(payment._id)}</TableCell>
                              <TableCell />
                              <TableCell sx={{ textAlign: 'right', fontWeight: 500 }}>
                                {formatCurrency(payment.debit)}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', fontWeight: 500 }}>
                                {formatCurrency(payment.credit)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Grand Total */}
            <TableRow
              sx={{
                backgroundColor: '#dbe5f1',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              <TableCell>TOTAL</TableCell>
              <TableCell />
              <TableCell sx={{ textAlign: 'right' }}>
                {formatCurrency(reportData?.totals?.totalDebits || 0)}
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                {formatCurrency(reportData?.totals?.totalCredits || 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
                    {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
          
        </Typography>
      </Box>
    </Box>
  );
};

export default DatewiseGeneralLedgerReport;
