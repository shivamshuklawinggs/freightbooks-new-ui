import apiService from '@/service/apiService';
import { IExpenseDispatcher, IFile, IitemService, paidtype } from '@/types';
import {Box, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, IconButton, Tooltip,Card,  Stack, Chip, Divider } from '@mui/material';
import React, { useMemo } from 'react';
import { formatCurrency} from '@/utils';
import {   Close as CloseIcon, } from "@mui/icons-material";
import CheckIn from './CheckIn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/utils/dateUtils';
import moment from 'moment';
import { DATE_TIME_FORMAT } from '@/config/constant';
interface IItemservicewithid extends IitemService {
  _id: string;
}

interface IExpenseBelowProps {
  loadid: string,
  OnSuccess: () => void
}

interface IExpenseResponse {
  data: {
    expenses: IExpenseDispatcher[],
    total: number;
    expensesTotalByService:Record<string, number>
  },
  success: boolean,
  statusCode: number
}

interface IExpenseByService {
  [serviceId: string]: {
    amount: number;
    receipt?: IFile [];
    date?: string;
    notes?: string;
    paidby?: string;
    paidbytype?: paidtype
    _id: string;
  }
}

const ExpenseBelow: React.FC<IExpenseBelowProps> = ({ loadid }) => {
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery<IItemservicewithid[]>({ 
    queryKey: ['services'], 
    queryFn: async () => {
      const response = await apiService.getItemServices();
      return response.data;
    } 
  });

  const { data: expenseData } = useQuery<IExpenseResponse>({ 
    queryKey: ['expenses', loadid], 
    queryFn: () => apiService.ExpenseService.getExpensesByLoadId(loadid), 
    enabled: !!loadid 
  });

  const { AllExpenses, totalAmount, expensesByLocation } = useMemo(() => {
    if (!expenseData) return { AllExpenses: [], totalAmount: 0, expensesByLocation: new Map() };

    const expenseMap = new Map<string, IExpenseByService>();
    expenseData.data.expenses.forEach(expense => {
      const locationId = expense.location._id as string;
      const serviceExpenses: IExpenseByService = {};
      if (Array.isArray(expense.expenses)) {
        expense.expenses.forEach((item) => {
          if (item.service) {
            serviceExpenses[item.service] = {
              amount: item.rate || 0,
              receipt: item.receipt as any || [],
              date: item.date ? formatDate(item.date) : undefined,
              notes: item.notes,
              paidby: item.paidby,
              paidbytype: item.paidbytype,
              _id: item._id
            };
          }
        });
      }
      expenseMap.set(locationId, serviceExpenses);
    });

    return {
      AllExpenses: expenseData.data.expenses,
      totalAmount: expenseData.data.total,
      expensesByLocation: expenseMap
    };
  }, [expenseData]);

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => apiService.ExpenseService.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', loadid] });
    },
    onError: (error: any) => {
      console.warn('Error deleting expense:', error);
    },
  });

  const handleDelete = async (expenseId: string) => {
    if (!expenseId) return;
    deleteExpenseMutation.mutate(expenseId);
  };

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1,
        mb: 2
      }}>
        <Box component="span" sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1,
        }}>
          Expense Details
        </Box>
      
        </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: 'background.paper',
              '& th': { 
                borderBottom: '2px solid',
                borderColor: 'primary.light'
              }
            }}>
              <TableCell width="22%">
                <Typography fontWeight="bold" sx={{ 
                textAlign: 'center',
                p: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(0, 0, 0, 0.04)'
                }}>
                  Location
                </Typography>
              </TableCell>
              {services.map((service) => (
                <TableCell key={service._id} width={`${Math.max(10, 50 / services.length)}%`}>
                  <Typography fontWeight="bold" sx={{ 
                    color: 'primary.main',
                    textAlign: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }}>
                    {service.label}
                  </Typography>
                </TableCell>
              ))}
              <TableCell width="10%">
                <Typography fontWeight="bold" sx={{ textAlign: 'center' }}>
                  Check In
                </Typography>
              </TableCell>
              <TableCell width="10%">
                <Typography fontWeight="bold" sx={{ textAlign: 'center' }}>
                  Check Out
                </Typography>
              </TableCell>
              <TableCell width="10%">
                <Typography fontWeight="bold" sx={{ textAlign: 'center' }}>
                  File
                </Typography>
              </TableCell>
              <TableCell width="8%">
                <Typography fontWeight="bold" sx={{ textAlign: 'center' }}>
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {AllExpenses.length > 0 ? (
              AllExpenses.map((expense) => {
                const locationExpenses = expensesByLocation.get(expense.location._id as string) || {};

                return (
                  <TableRow
                    key={expense._id}
                    hover
                    sx={{
                      backgroundColor: expense?.location?.type === 'pickup'
                        ? 'rgba(144, 202, 249, 0.08)'
                        : 'rgba(129, 199, 132, 0.08)',
                      '&:hover': {
                        backgroundColor: expense?.location?.type === 'pickup'
                          ? 'rgba(144, 202, 249, 0.15)'
                          : 'rgba(129, 199, 132, 0.15)'
                      },
                      transition: 'background-color 0.2s ease',
                      borderLeft: '4px solid',
                      borderColor: expense?.location?.type === 'pickup'
                        ? 'primary.main'
                        : 'success.main'
                    }}
                  >
                    {/* Location - First and most prominent */}
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color={expense?.location?.type === 'pickup' ? 'primary' : 'success.main'}
                          sx={{ mb: 0.5 }}
                        >
                          {expense?.location?.type === 'pickup' ? 'ORIGIN' : 'DESTINATION'}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {expense?.location?.address || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {expense?.location?.city}{expense?.location?.city && expense?.location?.state ? ', ' : ''}
                          {expense?.location?.state} {expense?.location?.zipcode}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color={expense?.location?.type === 'pickup' ? 'primary' : 'success.main'}
                          sx={{ mb: 0.5 }}
                        >
                          {expense?.location?.type === 'pickup' ? 'Pickup Date' : 'Delivery Date'}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {moment(expense.location.combinedDateTime).format(DATE_TIME_FORMAT) || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Service Amounts - One column per service */}
                    {services.map(service => {
                      const expensesArray = locationExpenses[service._id]
                      // expenricnce array is object so we need to get the length of object
                      return (
                        <TableCell key={service._id} width={`${Math.max(10, 50 / services.length)}%`}>
                          <Card elevation={0} sx={{ 
                            p: 1.5, 
                            borderRadius: 1, 
                            height: '11rem',
                            position: 'relative',
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              boxShadow: 1,
                              borderColor: 'primary.light'
                            }
                          }}>
                            {expensesArray ? (
                              <>
                                {/* Delete Button in top right corner */}
                                <IconButton 
                                   
                                  color="error"
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    right: 0,
                                    p: 0.5,
                                    m: 0.5,
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,1)'
                                    }
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this expense?')) {
                                      handleDelete(expensesArray._id);
                                    }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                                <Stack direction="row" spacing={1}>
                                  {/* Amount */}
                                  <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5, color: 'primary.main' }}>
                                    {formatCurrency(expensesArray.amount)}
                                  </Typography>
                               
                                </Stack>
                                <Stack direction="column" spacing={1}>
                              
                                {/* Notes */}
                                <Box sx={{   display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mt: 0.5,
                                    pt: 0.5,
                                    // borderTop: '3px solid',
                                    borderColor: 'divider'}}>
                                
                                    <Tooltip title={expensesArray.notes} placement="top">
                                      <Typography variant="caption" sx={{ mr: 0.5, color: 'text.secondary' }}>
                                        <Box component="span" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Note:</Box> {
                                         expensesArray?.notes ? expensesArray?.notes?.length > 20 
                                            ? `${expensesArray?.notes?.substring(0, 20)}...` 
                                            : expensesArray?.notes
                                            : "N/A"
                                        }
                                      </Typography>
                                    </Tooltip>
                                  
                                </Box>
                                {/* paidby type */}
                                {expensesArray?.paidbytype && (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mt: 0.5,
                                    pt: 0.5,
                                    borderTop: '3px solid',
                                    borderColor: 'divider'
                                  }}>
                                    <Typography variant="caption" sx={{ mr: 0.5, color: 'text.secondary' }}>
                                      <Box component="span" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Paid By:</Box> {expensesArray.paidbytype}
                                    </Typography>
                                  </Box>
                                )}
                                {/* Receipt */}
                              
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mt: 0.5,
                                    pt: 0.5,
                                    borderTop: '3px solid',
                                    borderColor: 'divider'
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '60%' }}>
                                      <Typography variant="caption" sx={{ mr: 0.5, color: 'text.secondary' }}>
                                        Receipt:
                                      </Typography>
                                      {expensesArray?.receipt && expensesArray.receipt.length > 0 ?<>
                                       {
                                        expensesArray.receipt.map((receipt: any, index: number) => (
                                          <Tooltip title={receipt.originalname} key={index}>
                                            <Typography variant="caption" noWrap sx={{ ml: 0.5, maxWidth: '100px' }}>
                                              {receipt.originalname}
                                            </Typography>
                                          </Tooltip>
                                        ))
                                       }
                                      </> : "N/A"}
                                     
                                    </Box>
                                   
                                  </Box>
                                
                              </Stack>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>N/A</Typography>
                            )}
                          </Card>
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                       
                        <Chip 
                          label={expense.location?.checkin?moment(expense.location?.checkin).format(DATE_TIME_FORMAT):"N/A"}
                          color={expense.location?.checkin?"primary":"default"} 
                           
                          variant="outlined"
                          sx={{ fontWeight: 'medium' }}
                        />
                      
                    </TableCell>
                    <TableCell align="center">
                        <Chip 
                          label={expense.location?.checkout?moment(expense.location?.checkout).format(DATE_TIME_FORMAT):"N/A"} 
                          color={expense.location?.checkout?"primary":"default"} 
                          variant="outlined"
                          sx={{ fontWeight: 'medium' }}
                        />
                    
                    </TableCell>
                    <TableCell align="center">
                    <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mt: 0.5,
                                    pt: 0.5,
                                    borderTop: '3px solid',
                                    borderColor: 'divider'
                                  }}>
                                   
                                    <Box sx={{display:"flex",gap:"2px",alignItems:"center"}}>
                                      {expense.location?.files && expense.location.files.length > 0 ? (
                                        <>
                                          <Typography variant="caption" color="textSecondary">
                                            ({expense.location?.files?.length} {expense.location?.files?.length === 1 ? 'file' : 'files'})
                                          </Typography>
                                        </>
                                      ) : null}
                                    </Box>
                                  </Box>
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="center">
                   {/* Check IN and Check OUT date pickers */}
                   <CheckIn expense={expense} loadid={loadid} fetchExpenses={() => queryClient.invalidateQueries({ queryKey: ['expenses', loadid] })} />
                </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={services.length + 5} align="center">
                  <Typography variant="body1">No expenses found</Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Subtotal row */}
            {AllExpenses.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={services.length + 5}>
                    <Divider />
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>
                    <Typography fontWeight="bold">Subtotal</Typography>
                  </TableCell>
                  {services?.map((service) => {
                    // Calculate total for each service
                    const serviceTotal = expenseData?.data?.expensesTotalByService?.[service?._id] || 0;

                    return (
                      <TableCell key={`total-${service?._id}`}>
                        <Typography fontWeight="bold">
                          {formatCurrency(serviceTotal)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell colSpan={4}>
                    <Typography fontWeight="bold" align="right">
                      Total: {formatCurrency(totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default ExpenseBelow;