import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import apiService from "@/service/apiService";
import { IChartAccount, Transaction } from "@/types";
import { formatCurrency } from "@/utils";
import { formatDate } from "@/utils/dateUtils";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { paths } from "@/utils/paths";
import { withPermission } from "@/hooks/ProtectedRoute/authUtils";

/** ✅ Backend response type */
type AccountRegisterResponse = {
  data: Transaction[];
  totals: {
    journal?: number;
    payments?: number;
    invoices?: number;
    bills?: number;
    salesTax?: number;
    purchaseTax?: number;
    salesDiscount?: number;
    purchaseDiscount?: number;
    grandTotal: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    skip?: number;
    need?: number;
  };
};

const AccountRegister: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  // ✅ pagination states
  const [page, setPage] = useState(1); // backend expects 1-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: accounts = [] } = useQuery<IChartAccount[]>({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      const response = await apiService.getChartAccounts();
      return response.data || [];
    },
  });
  const { data: endingBalanceData = {endingBalanceNumeric: 0,endingBalance: "",symbol: ""} } = useQuery<{endingBalanceNumeric: number,endingBalance: string,symbol: string}>({
    queryKey: ["endingBalanceData"],
    queryFn: async () => {
      const response = await apiService.getChartAccountEndingBalance(id);
      return response.data || {
        endingBalanceNumeric: 0,
        endingBalance:"",
        symbol: "Dr"
      }
    },
  });


  const {
    data: accountRegister,
    isLoading: isLoadingStats,
    isFetching,
  } = useQuery<AccountRegisterResponse | null>({
    queryKey: ["accountRegister", id, rowsPerPage, page],
    queryFn: async () => {
      if (!id) return null;

      const response = await apiService.getChartAccountstats(
        id,
        page,
        rowsPerPage
      );
      // ✅ IMPORTANT: backend returns { data, totals, meta }
      return response.data;
    },
    enabled: !!id,
    placeholderData: (previousData) => previousData, // ✅ smoother pagination (replaces keepPreviousData)
  });

  const transactions = useMemo(
    () => accountRegister?.data || [],
    [accountRegister?.data]
  );

  const totalCount = useMemo(
    () => accountRegister?.totals?.grandTotal || 0,
    [accountRegister?.totals]
  );

  const handleEdit = (transaction: Transaction) => {
    try {
      if (transaction.type === "JournalEntry") {
        navigate(`/accounting${paths.JournalEntry}/${transaction._id}`);
      } else if (transaction.type === "i-p") {
        navigate(`${paths.recievedpayment}/${transaction._id}`);
      } else if (transaction.type === "i-b") {
        navigate(`${paths.recievedbill}/${transaction._id}`);
      } else if (
        transaction.type === "Invoice" ||
        transaction.type === "s-tax" ||
        transaction.type === "s-discount"
      ) {
        navigate(`${paths.editinvoice}/${transaction._id}`);
      } else if (
        transaction.type === "Bill" ||
        transaction.type === "p-tax" ||
        transaction.type === "p-discount"
      ) {
        navigate(`${paths.editbill}/${transaction._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTransactionType = (transaction: Transaction) => {
    if (!transaction?.refrencetype) return null;

    return (
      <Box
        sx={{
          "& .ref-no": {
            fontWeight: 600,
            fontSize: "0.875rem",
            lineHeight: 1.3,
          },
          "& .ref-type": {
            fontSize: "0.75rem",
            color: "text.secondary",
            lineHeight: 1.2,
          },
        }}
        dangerouslySetInnerHTML={{
          __html: transaction.refrencetype,
        }}
      />
    );
  };

  const getTransactionMemo = (transaction: Transaction) => {
    return transaction?.customer?.name;
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // reset to first page
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={id}
              onChange={(e) =>
                navigate(`${paths.AccountRegister}/${e.target.value}`)
              }
              displayEmpty
            >
              {accounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ✅ show totals small info */}
          {!!id && (
            <Typography variant="body2" color="text.secondary">
              Total Transactions: <b>{totalCount}</b>
              {isFetching ? " (loading...)" : ""}
            </Typography>
          )}
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary">
            ENDING BALANCE
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            {/* If backend sends endingBalance put here */}
            {formatCurrency(endingBalanceData?.endingBalanceNumeric ?? 0)}
            {endingBalanceData?.symbol ?? ""}
          </Typography>
        </Box>
      </Box>

      {/* Table Section */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {/* Table Toolbar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        ></Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>Date</TableCell>
                <TableCell>REF No. TYPE</TableCell>
                <TableCell>PAYEE ACCOUNT</TableCell>
                <TableCell>MEMO</TableCell>
                <TableCell align="right">DEBIT</TableCell>
                <TableCell align="right">CREDIT</TableCell>
                <TableCell align="right">BALANCE</TableCell>
                <TableCell align="right">Edit</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loader */}
              {isLoadingStats ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Transactions */}
                  {transactions.map((transaction: Transaction, index: number) => (
                    <TableRow key={`${transaction._id}-${index}`}>
                      <TableCell>
                        {transaction?.postingDate
                          ? formatDate(transaction?.postingDate)
                          : "N/A"}
                      </TableCell>

                      <TableCell>
                        <Chip label={getTransactionType(transaction)} size="medium" />
                      </TableCell>

                      <TableCell>{transaction?.customer?.name || "N/A"}</TableCell>

                      <TableCell>{getTransactionMemo(transaction)}</TableCell>

                      <TableCell align="right">
                        {formatCurrency(transaction.debit)}
                      </TableCell>

                      <TableCell align="right">
                        {formatCurrency(transaction.credit)}
                      </TableCell>

                      <TableCell align="right">
                        {transaction?.balanceDue ?? "—"}
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          title="Edit"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Empty State */}
                  {!transactions.length && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No transactions found for this account
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ✅ Pagination controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <TablePagination
            component="div"
            count={totalCount} // ✅ FIXED: use totals.grandTotal
            page={page - 1} // TablePagination is 0-based
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default withPermission("view", ["accounting"])(AccountRegister);
