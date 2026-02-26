import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Collapse, IconButton } from "@mui/material";
import  { FC, useMemo, useState } from "react";
import { allowedreports, ReportData, ReportSection, ReportRowData } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate, useParams } from "react-router-dom";
import { Reporttitle } from "../constant";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import moment from "moment";
import { formatDate } from "@/utils/dateUtils";
import { findReportByTypeId } from "../utils/FindBYTypeidReport";
import { ProfitAndLossTypeIds } from "@/types/enum";
import { formatCurrency } from "@/utils";
import { paths } from "@/utils/paths";

interface ProfitAndLossByMonthProps {
    reportData: ReportData;
}

interface MonthYear {
    month: number;
    year: number;
    label: string;
}

const ProfitAndLossByMonthCard: FC<ProfitAndLossByMonthProps> = ({ reportData }) => {
    const navigate = useNavigate();
    const filters = useSelector((state: RootState) => state.report);
    const { type = "balance-sheet" } = useParams<{ type: allowedreports }>()
    // sections
    const incomeSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.income, reportData) : undefined;
    const COGSSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.costOfGoodsSold, reportData) : undefined;
    const expenseSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.expense, reportData) : undefined;
    const otherIncomeSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.otherIncome, reportData) : undefined;
    const otherExpenseSection = reportData.data ? findReportByTypeId(ProfitAndLossTypeIds.otherExpense, reportData) : undefined;
    // totals
    const grossProfit = reportData?.totals?.grossProfit || 0
    const totalNetOperatingIncome = reportData?.totals?.netOperatingIncome || 0
    const totalNetOtherIncome = reportData?.totals?.netOtherIncome || 0
    const totalNetProfit = reportData?.totals?.netProfit || 0
    // Extract all unique months from the data
    const months = useMemo(() => {
        const monthSet = new Set<string>();
        const sections = [incomeSection, COGSSection, expenseSection, otherIncomeSection, otherExpenseSection];
        
        // Extract months from section-level monthlyTotals
        sections.forEach(section => {
            section?.monthlyTotals?.forEach(mt => {
                monthSet.add(`${mt.year}-${mt.month}`);
            });
        });

        // Also check reportData.monthlyTotals if sections don't have data
        reportData?.monthlyTotals?.forEach(mt => {
            monthSet.add(`${mt.year}-${mt.month}`);
        });

        const monthArray: MonthYear[] = Array.from(monthSet).map(key => {
            const [year, month] = key.split('-').map(Number);
            return {
                month,
                year,
                label: moment().year(year).month(month - 1).format('MMMM YYYY')
            };
        });

        // Sort by year and month
        return monthArray.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
    }, [reportData, incomeSection, COGSSection, expenseSection, otherIncomeSection, otherExpenseSection]);

    // Helper function to get amount for a specific month
    const getMonthAmount = (row: ReportRowData, month: number, year: number): number => {
        const monthData = row.monthlyTotals?.find(mt => mt.month === month && mt.year === year);
        return monthData?.totalAmount || 0;
    };

    // Helper function to calculate section total for a month
    const getSectionMonthTotal = (section: ReportSection, month: number, year: number): number => {
        // Use section-level monthlyTotals if available
        const sectionMonthData = section?.monthlyTotals?.find(mt => mt.month === month && mt.year === year);
        if (sectionMonthData) {
            return sectionMonthData.totalAmount || 0;
        }
        // Fallback to summing row-level data
        return section?.data?.reduce((sum, row) => sum + getMonthAmount(row, month, year), 0) || 0;
    };

    // Collapsible Section Component
    const CollapsibleSection: FC<{ section: ReportSection; name: string; isSubtraction?: boolean }> = ({ section, name, isSubtraction = false }) => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <TableRow 
                    sx={{ 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                        cursor: 'pointer'
                    }}
                    onClick={() => setOpen(!open)}
                >
                    <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small" sx={{ color: 'primary.main' }}>
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                            <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                        </Box>
                    </TableCell>
                    {months.map(m => (
                        <TableCell key={`${m.year}-${m.month}`} align="right" sx={{ fontWeight: 600, py: 1.5 }}>
                            ${getSectionMonthTotal(section, m.month, m.year).toFixed(2)}
                        </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>
                        ${section?.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, backgroundColor: '#fafafa' }} colSpan={months.length + 2}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3, backgroundColor: '#ffffff', borderRadius: 1, my: 1 }}>
                                <Table size="small">
                                    <TableBody>
                                        {section?.data?.map((row) => (
                                            <TableRow 
                                                key={row._id}
                                                sx={{ 
                                                    '&:hover': { backgroundColor: 'action.hover' },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <TableCell onClick={()=>navigate(`${paths.AccountRegister}/${row._id}`)}  sx={{ pl: 6, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>{row.name}</TableCell>
                                                {months.map(m => (
                                                    <TableCell key={`${row._id}-${m.year}-${m.month}`} align="right" sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0', color: 'text.secondary' }}>
                                                        ${getMonthAmount(row, m.month, m.year).toFixed(2)}
                                                    </TableCell>
                                                ))}
                                                <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0', color: 'text.secondary' }}>${row.totalAmount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    };

    // Calculate monthly gross profit
    const getMonthlyGrossProfit = (month: number, year: number): number => {
        const income =incomeSection ? getSectionMonthTotal(incomeSection, month, year) : 0;
        const cogs =COGSSection ? getSectionMonthTotal(COGSSection, month, year) : 0;
        return income - cogs;
    };

    // Calculate monthly net operating income
    const getMonthlyNetOperatingIncome = (month: number, year: number): number => {
        const grossProfit = getMonthlyGrossProfit(month, year);
        const expense =expenseSection ? getSectionMonthTotal(expenseSection, month, year) : 0;
        return grossProfit - expense;
    };

    // Calculate monthly net other income
    const getMonthlyNetOtherIncome = (month: number, year: number): number => {
        const otherIncome =otherIncomeSection ? getSectionMonthTotal(otherIncomeSection, month, year) : 0;
        const otherExpense =otherExpenseSection ? getSectionMonthTotal(otherExpenseSection, month, year) : 0;
        return otherIncome - otherExpense;
    };

    // Calculate monthly net profit
    const getMonthlyNetProfit = (month: number, year: number): number => {
        const netOperatingIncome = getMonthlyNetOperatingIncome(month, year);
        const netOtherIncome = getMonthlyNetOtherIncome(month, year);
        return netOperatingIncome + netOtherIncome;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%', mx: 'auto' }}>
            <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                    {Reporttitle[type]}
                </Typography>
                <Typography variant="subtitle1" align="center" sx={{ opacity: 0.95 }}>
                    {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
                </Typography>
            </Paper>
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto', borderRadius: 2 }}>
                <Table aria-label="monthly profit and loss" size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            {/* <TableCell sx={{ minWidth: 200, fontWeight: 700, py: 2 }}>Account</TableCell> */}
                            {months.map(m => (
                                <TableCell key={`header-${m.year}-${m.month}`} align="right" sx={{ minWidth: 120, fontWeight: 700, py: 2 }}>
                                    {m.label}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ minWidth: 120, fontWeight: 700, py: 2 }}>
                                Total
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incomeSection && <CollapsibleSection section={incomeSection} name="Income" />}
                        {COGSSection && <CollapsibleSection section={COGSSection} name="Cost of Goods Sold" isSubtraction />}
                        
                        <TableRow sx={{ backgroundColor: '#e3f2fd', border: '1px solid #c6e2b5', borderTop: 'none', borderBottom: 'none' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Gross Profit</TableCell>
                            {months.map(m => (
                                <TableCell key={`gp-${m.year}-${m.month}`} align="right" sx={{ fontWeight: 'bold' }}>
                                    {getMonthlyGrossProfit(m.month, m.year).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(grossProfit)}
                            </TableCell>
                        </TableRow>

                        {expenseSection&& <CollapsibleSection section={expenseSection} name="Expenses" isSubtraction />}
                        
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Net Operating Income</TableCell>
                            {months.map(m => (
                                <TableCell key={`noi-${m.year}-${m.month}`} align="right" sx={{ fontWeight: 'bold' }}>
                                    {getMonthlyNetOperatingIncome(m.month, m.year).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalNetOperatingIncome)}
                            </TableCell>
                        </TableRow>

                        {otherIncomeSection && <CollapsibleSection section={otherIncomeSection} name="Other Income" />}
                        {otherExpenseSection && <CollapsibleSection section={otherExpenseSection} name="Other Expenses" isSubtraction />}
                        
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Net Other Income</TableCell>
                            {months.map(m => (
                                <TableCell key={`noti-${m.year}-${m.month}`} align="right" sx={{ fontWeight: 'bold' }}>
                                    {getMonthlyNetOtherIncome(m.month, m.year).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalNetOtherIncome)}
                            </TableCell>
                        </TableRow>

                        <TableRow sx={{ backgroundColor: '#c8e6c9' }}>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Net Income</TableCell>
                            {months.map(m => (
                                <TableCell key={`np-${m.year}-${m.month}`} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {getMonthlyNetProfit(m.month, m.year).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {formatCurrency(totalNetProfit)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
           
        </Box>
    )
}

export default ProfitAndLossByMonthCard;