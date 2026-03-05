import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import { allowedreports, ReportData } from "@/types";
import SectionRow from "./SectionRow";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { Reporttitle } from "../constant";
import { formatDate } from "@/utils/dateUtils";
import { findReportByTypeId } from "../utils/FindBYTypeidReport";
import { ProfitAndLossTypeIds } from "@/types/enum";
import { formatCurrency } from "@/utils";

interface ProfitAndLossProps {
    reportData: ReportData;
}

const ProfitAndLossCard: FC<ProfitAndLossProps> = ({ reportData }) => {
    const theme=useTheme()
    const filters = useSelector((state: RootState) => state.report);
    const { type = "profit-and-loss" } = useParams<{ type: allowedreports }>()
    // sections
    const incomeSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.income, reportData) : undefined;
    const COGSSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.costOfGoodsSold, reportData) : undefined;
    const expenseSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.expense, reportData) : undefined;
    const otherIncomeSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.otherIncome, reportData) : undefined;
    const otherExpenseSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.otherExpense, reportData) : undefined;
    // totals
    const grossProfit =reportData?.totals?.grossProfit || 0
    const totalCOGS =reportData?.totals?.COGS || 0
    const totalExpense =reportData?.totals?.Expenses || 0
    const totalIncome =reportData?.totals?.Income || 0
    const totalOtherIncome =reportData?.totals?.OtherIncome || 0
    const totalOtherExpense =reportData?.totals?.OtherExpense || 0
    const totalNetOperatingIncome =reportData?.totals?.netOperatingIncome || 0
    const totalNetOtherIncome =reportData?.totals?.netOtherIncome || 0
    const totalNetProfit =reportData?.totals?.netProfit || 0
    

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
            <Paper elevation={2} sx={{ p: 4, mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`, color: 'white' }}>
                <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                    {Reporttitle[type]}
                </Typography>
                <Typography variant="subtitle1" align="center" sx={{ opacity: 0.95 }}>
                    {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
                </Typography>
            </Paper>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table aria-label="profit and loss table">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.paper' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}></TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incomeSection && <SectionRow section={incomeSection} name="Income" total={totalIncome} />}
                        {COGSSection && <SectionRow section={COGSSection} name="Cost of Goods Sold" total={totalCOGS} />}
                        <TableRow sx={{ bgcolor: 'rgba(37,99,235,0.12)', borderTop: '2px solid', borderColor: 'info.main', borderBottom: '2px solid' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2 }}>Gross Profit</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2, color: grossProfit >= 0 ? 'success.main' : 'error.main' }}>
                                {
                                    formatCurrency(grossProfit)
                                }
                            </TableCell>
                        </TableRow>
                        {expenseSection && <SectionRow section={expenseSection} name="Expenses" total={totalExpense} />}
                        <TableRow sx={{ bgcolor: 'rgba(245,158,11,0.12)', borderTop: '2px solid', borderColor: 'warning.main', borderBottom: '2px solid' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2 }}>Net Operating Income</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2, color: totalNetOperatingIncome >= 0 ? 'success.main' : 'error.main' }}>
                              {
                                formatCurrency(totalNetOperatingIncome)
                              }
                            </TableCell>
                        </TableRow>
                        {otherIncomeSection && <SectionRow section={otherIncomeSection} name="Other Income" total={totalOtherIncome} />}
                        {otherExpenseSection && <SectionRow section={otherExpenseSection} name="Other Expenses" total={totalOtherExpense} />}
                        <TableRow sx={{ bgcolor: 'rgba(124,58,237,0.12)', borderTop: '2px solid', borderColor: 'secondary.main', borderBottom: '2px solid' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2 }}>Net Other Income</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem', py: 2, color: totalNetOtherIncome >= 0 ? 'success.main' : 'error.main' }}>
                                {
                                    formatCurrency(totalNetOtherIncome)
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: totalNetProfit >= 0 ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)', borderTop: '3px solid', borderColor: totalNetProfit >= 0 ? 'success.main' : 'error.main', borderBottom: '3px solid' }}>
                            <TableCell sx={{ fontWeight: 800, fontSize: '1.15rem', py: 2.5 }}>Net Income</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.15rem', py: 2.5, color: totalNetProfit >= 0 ? 'success.main' : 'error.main' }}>
                                {
                                    formatCurrency(totalNetProfit)
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            
        </Box>
    )
}

export default ProfitAndLossCard;