



import { Box, Collapse, IconButton, Table, TableBody, TableCell,TableRow, Typography } from "@mui/material";
import React, { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {ReportSection} from "@/types"
import { formatCurrency } from "@/utils";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/paths";
const SectionRow: React.FC<{ section: ReportSection, name: string,total: number }> = ({ section, name,total }) => {
    const [open, setOpen] = useState(true);
    const navigate=useNavigate()
    return (
        <React.Fragment>
            <TableRow 
                sx={{ 
                    '& > *': { borderBottom: 'unset' },
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                }}
                onClick={() => setOpen(!open)}
            >
                <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton aria-label="expand row" size="small" sx={{ color: 'primary.main' }}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{name}</Typography>
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(total)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 3, bgcolor: 'background.default', borderRadius: 1, my: 1 }}>
                            <Table size="small" aria-label="details">
                                <TableBody>
                                    {section?.data?.map((item) => (
                                        <TableRow 
                                            key={item._id}
                                            sx={{ 
                                                '&:hover': { backgroundColor: 'action.hover' },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <TableCell onClick={()=>navigate(`${paths.AccountRegister}/${item._id}`)} component="th" scope="row" sx={{ pl: 6, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                {item.name}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                                                {formatCurrency(item.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'background.paper' }}>
                                        <TableCell sx={{ fontWeight: 600, pl: 6, py: 1.5, borderTop: '2px solid', borderColor: 'divider' }}>
                                            Total for {name}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, py: 1.5, borderTop: '2px solid', borderColor: 'divider' }}>
                                            {formatCurrency(total)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};
export default SectionRow