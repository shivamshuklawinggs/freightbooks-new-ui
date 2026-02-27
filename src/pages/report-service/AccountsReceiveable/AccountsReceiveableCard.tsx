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
import { allowedreports, IAccountsReceiveableReportData } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Reporttitle } from "../constant";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from "@/utils";
import { paths } from "@/utils/paths";

interface AccountsReceiveableCardProps {
  reportData: IAccountsReceiveableReportData;
}

const AccountsReceiveableCard: FC<AccountsReceiveableCardProps> = ({ reportData }) => {
  const navigate=useNavigate()
  const filters = useSelector((state: RootState) => state.report);
     const {type="AccountsReceiveable"}=useParams<{type:allowedreports}>()
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
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>Customer</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(22,163,74,0.12)' }}>
                Current
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(245,158,11,0.12)' }}>
                1 - 30
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(234,88,12,0.12)' }}>
                31 - 60
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(239,68,68,0.12)' }}>
                61 - 90
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(220,38,38,0.15)' }}>
                91 and over
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2, bgcolor: 'rgba(37,99,235,0.12)' }}>
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
                    '&:hover': { backgroundColor: 'action.hover' },
                    transition: 'background-color 0.2s'
                  }}
                  
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 500, cursor: 'pointer' }}  onClick={()=>navigate(`${paths.customertransactionlist}/${item.customer._id}`)}>{item?.customer?.name}</TableCell>
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
            <TableRow sx={{ bgcolor: 'primary.dark', borderTop: '3px solid', borderColor: 'primary.main' }}>
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

export default AccountsReceiveableCard;
