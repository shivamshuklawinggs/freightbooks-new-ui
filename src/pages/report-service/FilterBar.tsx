import { Grid, Paper, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import React  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setReportPeriod, setFromDate, setToDate } from '@/store/reports';
import { useNavigate, useParams } from 'react-router-dom';
import { allowedreports } from '@/types';
import { reports } from "./constant";
import CustomDatePicker from "@/components/common/CommonDatePicker";
interface FilterBarProps {
    onApplyFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onApplyFilters }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { reportPeriod, fromDate, toDate } = useSelector((state: RootState) => state.report);
    const { type } = useParams<{ type: allowedreports }>()
    const handleApply = () => {
        onApplyFilters();
    };
   
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            {type === "TrialBalanceReport" ? (
                // Trial Balance Report specific filters
                <Grid container spacing={2} alignItems="center">
                    {/* From Date */}
                    <Grid item xs={12} sm={6} md={4.5}>
                        <CustomDatePicker
                            label="As of Date"
                            value={fromDate}
                            name="fromDate"
                            onChange={(e) => {
                                dispatch(setFromDate(new Date(e.target.value) || undefined))
                            }}
                        />
                    </Grid>
                    {/* Accounting method */}
                    <Grid item xs={12} sm={6} md={4.5}>
                        <FormControl fullWidth>
                            <InputLabel>Accounting method</InputLabel>
                            <Select value={type} label="Accounting method" onChange={(e) => { navigate(`/reports/${e.target.value}`) }}>
                                <MenuItem value="" disabled selected>Method</MenuItem>
                                {reports.map((report) => (
                                    <MenuItem key={report.path} value={report.path}>
                                        {report.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Run Report */}
                    <Grid item xs={12} sm={6} md={3} container alignItems="center" spacing={1}>
                        
                            <Button onClick={handleApply} variant="contained">Run Report</Button>
                        
                    </Grid>
                </Grid>
            ) : (
                // Other reports filters
                <Grid container spacing={2} alignItems="center">
                    {/* Report period */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth>
                            <InputLabel>Report period</InputLabel>
                            <Select value={reportPeriod} label="Report period" onChange={(e) => dispatch(setReportPeriod(e.target.value))}>
                                <MenuItem value="this_year_to_date">This year to date</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* From Date */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <CustomDatePicker
                            label="From"
                            value={fromDate}
                            name="fromDate"
                            onChange={(e) => {
                                dispatch(setFromDate(new Date(e.target.value) || undefined))
                            }}
                            disabled={reportPeriod !== 'custom'}
                        />
                    </Grid>
                    {/* To Date */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <CustomDatePicker
                            label="To"
                            value={toDate}
                            name="toDate"
                            onChange={(e) => {
                                dispatch(setToDate(new Date(e.target.value) || undefined))
                            }}
                            disabled={reportPeriod !== 'custom'}
                        />
                    </Grid>
                    {/* Accounting method */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth>
                            <InputLabel>Accounting method</InputLabel>
                            <Select value={type} label="Accounting method" onChange={(e) => { navigate(`/reports/${e.target.value}`) }}>
                                <MenuItem value="" disabled selected>Method</MenuItem>
                                {reports.map((report) => (
                                    <MenuItem key={report.path} value={report.path}>
                                        {report.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Run Report */}
                    <Grid item xs={12} md={2.4} container alignItems="center" spacing={1}>
                        <Grid item>
                            <Button onClick={handleApply} variant="contained">Run Report</Button>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default FilterBar;
