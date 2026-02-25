import  { FC } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { allowedreports, IAccountsPayableReportData } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Reporttitle } from "../constant";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from "@/utils";
import { paths } from "@/utils/paths";

interface AccountsPayableCardProps {
  reportData: IAccountsPayableReportData;
  type?:allowedreports
}

const AccountsPayableCard: FC<AccountsPayableCardProps> = ({ reportData }) => {
   const navigate=useNavigate()
  const filters = useSelector((state: RootState) => state.report);
     const {type="AccountsPayable"}=useParams<{type:allowedreports}>()
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {Reporttitle[type]}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
         {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
        </Typography>
      </Paper>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Customer</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#e8f5e9' }}>
                Current
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#fff9c4' }}>
                1 - 30
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#ffe0b2' }}>
                31 - 60
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#ffccbc' }}>
                61 - 90
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#ffcdd2' }}>
                91 and over
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, backgroundColor: '#e3f2fd' }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData?.data?.length > 0 ? (
              reportData?.data.map((item) => (
                <TableRow 
                  key={item._id}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 500, cursor: 'pointer' }} onClick={()=>navigate(`${paths.vendortransactionlist}/${item.customer._id}`)}>{item?.customer?.name}</TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    ${item.currentDueAmount?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    ${item.due_0_30?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    ${item.due_31_60?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    ${item.due_61_90?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    ${item.due_90_plus?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 600 }}>
                    ${item.totalDueAmount?.toFixed(2) || "0.00"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No records found
                </TableCell>
              </TableRow>
            )}

            {/* Total row */}
            <TableRow sx={{ backgroundColor: '#1976d2', borderTop: '3px solid #0d47a1' }}>
              <TableCell sx={{ fontWeight: 700, color: 'white', py: 2, fontSize: '1.05rem' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2 }}>
                ${reportData?.totalData?.currentDueAmount?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2 }}>
                ${reportData?.totalData?.due_0_30?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2 }}>
                ${reportData?.totalData?.due_31_60?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2 }}>
                ${reportData?.totalData?.due_61_90?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2 }}>
                ${reportData?.totalData?.due_90_plus?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 2, fontSize: '1.05rem' }}>
                {formatCurrency(reportData?.totalData?.totalDueAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountsPayableCard;
