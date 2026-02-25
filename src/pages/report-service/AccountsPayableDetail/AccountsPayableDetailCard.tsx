import React from 'react'
import { allowedreports, IAccountsPayableDetail } from '@/types'
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
  IconButton
} from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { Reporttitle ,bucketLabels} from "../constant";
import { useNavigate, useParams } from 'react-router-dom'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dateUtils';
import { useAppSelector } from '@/redux/store';
import { paths } from '@/utils/paths';
const AccountsPayableDetailCard: React.FC<{ reportData: IAccountsPayableDetail }> = ({ reportData }) => {
     const navigate=useNavigate()
  const filters = useAppSelector((state) => state.report);
  const [expandedBuckets, setExpandedBuckets] = React.useState<Record<string, boolean>>({})
   const {type="AccountsPayableDetail"}=useParams<{type:allowedreports}>()
  const toggleBucket = (bucket: string) => {
    setExpandedBuckets((prev) => ({
      ...prev,
      [bucket]: !prev[bucket]
    }))
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {Reporttitle[type]}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
         {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
        </Typography>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 700, width: 40, py: 2 }}></TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Transaction Type</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Num</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Vendor Display Name</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Past Due</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right', py: 2 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right', py: 2 }}>Open Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.data.map((group) => (
              <React.Fragment key={group.bucket}>
                {/* Bucket Header Row */}
                <TableRow
                  sx={{
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  onClick={() => toggleBucket(group.bucket)}
                >
                  <TableCell>
                    <IconButton size="small">
                      {expandedBuckets[group.bucket] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell colSpan={8} sx={{ fontWeight: 600 }}>
                     {bucketLabels[group.bucket]} ({group.invoices.length})
                  </TableCell>
                </TableRow>

                {/* Invoice Rows */}
                {group.invoices.map((invoice,index:number) => (
                  <TableRow
                    key={invoice._id}
                    sx={{
                      display: expandedBuckets[group.bucket] || index===0 ? 'table-row' : 'none',
                      '&:hover': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell></TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell sx={{cursor:"pointer"}} onClick={()=>navigate(`${paths.editbill}/${invoice._id}`)}>
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                        {invoice.transactionType}
                      </Typography>
                    </TableCell>
                    <TableCell>{invoice.num || "-"}</TableCell>
                    <TableCell sx={{cursor:"pointer"}} onClick={()=>navigate(`${paths.editbill}/${invoice._id}`)}>{invoice.vendorDisplayName}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{invoice.daysPastDue}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(invoice.openBalance)}</TableCell>
                  </TableRow>
                ))}

                {/* Subtotal Row */}
                <TableRow sx={{ backgroundColor: '#f9f9f9', fontWeight: 600 }}>
                  <TableCell></TableCell>
                  <TableCell colSpan={6} sx={{ fontWeight: 600 }}>
                    Total for {bucketLabels[group.bucket]}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(group.totalAmount)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(group.totalOpenBalance)}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Grand Total Row */}
            <TableRow sx={{ backgroundColor: '#e8e8e8', fontWeight: 700 }}>
              <TableCell></TableCell>
              <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                TOTAL
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(reportData.totalAmountWithTax)}
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(reportData.totalDueAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {formatDate(new Date())}
        </Typography>
      </Box>
    </Box>
  )
}

export default AccountsPayableDetailCard