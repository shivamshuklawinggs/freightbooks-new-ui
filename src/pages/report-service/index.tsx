import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, ListItemIcon } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { allowedreports } from '@/types';
import {reports} from './constant'
import ProfitAndLossByMonth from './ProfitAndLossByMonth';
import TrialBalanceReport from './TrialBalanceReport';
import GeneralLedgerReport from './GeneralLedgerReport';
import AccountsReceiveable from './AccountsReceiveable';
import AccountsRecieveableDetail from './AccountsRecieveableDetail';
import AccountsPayable from './AccountsPayable';
import AccountsPayableDetail from './AccountsPayableDetail';
import ProfitAndLoss from './ProfitAndLoss';
import BalanceSheet from './BalanceSheet';

const ReportIndex = () => {
    const favoriteReports = reports.filter(r => r.favorite);
    const otherReports = reports.filter(r => !r.favorite);
     const {type}=useParams<{type:allowedreports}>()
    if(type==="profit-and-loss"){
        return <ProfitAndLoss/>
    }
   else if(type==="profit-and-loss-month"){
        return <ProfitAndLossByMonth/>
    }
    else if(type==="balance-sheet"){
        return <BalanceSheet/>
    }
    else if(type==="AccountsReceiveable"  ){
        return <AccountsReceiveable />
    }else if(type==="AccountsPayable"){
        return <AccountsPayable />
    }
    else if(type==="AccountsPayableDetail"  ){
        return <AccountsPayableDetail />
    }else if(type==="AccountsRecieveableDetail"){
        return <AccountsRecieveableDetail/>
    }
    else if(type==="TrialBalanceReport"  ){
        return <TrialBalanceReport />
    }else if(type==="GeneralLedgerReport"  ){
        return <GeneralLedgerReport />
    }
   
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Reports
            </Typography>

            <Typography variant="h6" gutterBottom sx={{mt: 4}}>
                Favorites
            </Typography>
            <Paper>
                <List>
                    {favoriteReports.map((report, index) => (
                        <React.Fragment key={report.name}>
                            <ListItem  color='primary' component={Link} to={`/reports/${report.path}`}>
                                <ListItemText primary={report.name}   /> 
                                <ListItemIcon>
                                    <StarIcon color="success" />
                                </ListItemIcon>
                            </ListItem>
                            {index < favoriteReports.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{mt: 4}}>
                Business overview
            </Typography>
            <Paper>
                <List>
                    {otherReports.map((report, index) => (
                        <React.Fragment key={report.name}>
                            <ListItem  component={Link} to={report.path}>
                                <ListItemText primary={report.name} />
                            </ListItem>
                            {index < otherReports.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default withPermission("view",["accounting"])(ReportIndex);