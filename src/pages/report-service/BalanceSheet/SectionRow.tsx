import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import React, { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { capitalizeFirstLetter } from "@/utils";
import { BalanceSheetIassets } from "./BalanceSheetCard";
import { paths } from "@/utils/paths";
import { useNavigate } from "react-router-dom";



const SectionRow: React.FC<{ section: BalanceSheetIassets, name: string }> = ({ section, name }) => {
    const navigate=useNavigate()
    const [open, setOpen] = useState(true);

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
                <TableCell sx={{ py: 1.5, pl: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton aria-label="expand row" size="small" sx={{ color: 'primary.main' }}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{section.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        ${section?.endingBalance?.toFixed(2)}
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
                                            <TableCell onClick={()=>navigate(`${paths.AccountRegister}/${item._id}`)}  component="th" scope="row" sx={{ pl: 8, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                {capitalizeFirstLetter(item.name)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                                                ${item.endingBalance.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'background.paper' }}>
                                        <TableCell sx={{ fontWeight: 600, pl: 8, py: 1.5, borderTop: '2px solid', borderColor: 'divider' }}>
                                            Total For {section.name}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, py: 1.5, borderTop: '2px solid', borderColor: 'divider' }}>
                                            ${section?.endingBalance?.toFixed(2)}
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
export default SectionRow;