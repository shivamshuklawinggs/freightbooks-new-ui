import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import React, { FC } from "react";
import SectionRow from "./SectionRow";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { allowedreports, BalanceSheetData } from "@/types";
import { Reporttitle } from "../constant";
import { formatDate } from '@/utils/dateUtils';




export interface BalanceSheetIassets {
    _id: string;
    name: string;
    typeId: string;
    type: string;
    data: Array<{
        _id: string;
        name:string;
        endingBalance: number;
        totalAmount: number;
        totalCredits: number;
        totalDebits: number;
    }>;
    totalCredits: number;
    totalDebits: number;
    endingBalance: number;
    totalAmount: number;
}

interface BalanceSheetProps {
    reportData: BalanceSheetData;
}

const BalanceSheetCard: FC<BalanceSheetProps> = ({ reportData }) => {
    const filters = useSelector((state: RootState) => state.report);
     const {type="balance-sheet"}=useParams<{type:allowedreports}>()
    const renderSections = (sections: BalanceSheetIassets[] = []) => (
        <React.Fragment>
          
            {sections.map(section => (
                <SectionRow key={section._id} section={section} name={section._id} />
            ))}
        </React.Fragment>
    );

    // const getSectionsByType = (items?: BalanceSheetIassets[], typeName?: string) => {
    //     if (!items || !typeName) return [];
    //     return items.filter(i => i.type === typeName || i.name === typeName);
    // }

    const totals = reportData?.totals;
    const totalAssets = totals?.TotalAssets ?? 0;
    const totalLiabilitiesAndEquity = totals?.TotalLiabilitiesAndEquity ?? 0;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
            <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                    {Reporttitle[type]}
                </Typography>
                  <Typography variant="subtitle1" align="center" sx={{ opacity: 0.95 }}>
                    {formatDate(filters.fromDate)} - {formatDate(filters.toDate)}
                </Typography>
            </Paper>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table aria-label="balance sheet table">
                    <TableBody>
                        {/* Assets Section */}
                        <TableRow sx={{ backgroundColor: '#1976d2' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', py: 2 }}>ASSETS</TableCell>
                            <TableCell align="right" sx={{ color: 'white' }}></TableCell>
                        </TableRow>
                        {renderSections(reportData?.Assets)}
                        <TableRow sx={{ backgroundColor: '#1976d2', borderTop: '3px solid #0d47a1' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', py: 2 }}>TOTAL ASSETS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', py: 2 }}>${totalAssets.toFixed(2)}</TableCell>
                        </TableRow>

                        {/* Spacer Row */}
                        <TableRow sx={{ height: 24 }}>
                            <TableCell colSpan={2} sx={{ border: 'none', backgroundColor: '#fafafa' }}></TableCell>
                        </TableRow>

                        {/* Liabilities and Equity Section */}
                        <TableRow sx={{ backgroundColor: '#f57c00' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', py: 2 }}>LIABILITIES & EQUITY</TableCell>
                            <TableCell align="right" sx={{ color: 'white' }}></TableCell>
                        </TableRow>
                        {renderSections(reportData?.Liabilities)}
                        <TableRow sx={{ backgroundColor: '#f57c00', borderTop: '3px solid #e65100' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', py: 2 }}>TOTAL LIABILITIES & EQUITY</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', py: 2 }}>${totalLiabilitiesAndEquity.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
           
        </Box>
    )
}

export default BalanceSheetCard;