import React, { useEffect } from 'react';
import { useFormContext, useFieldArray, Controller, useWatch } from 'react-hook-form';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Button, Typography, Box,
  Dialog, Paper, Chip, Tooltip, Alert, Collapse,
  DialogActions
} from '@mui/material';
import { 
  AddCircleOutline, 
  DeleteOutline, 
  List as ListIcon,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Info
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { IJournalEntry } from './Schema/JournalEntrySchema';
import { IChartAccount } from '@/types';
import FormSelect from '@/components/ui/FormSelect';
import { SelectOption } from '@/components/ui/FormSelect';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import ChartAccountForm from '../chart-accounts-service/ChartAccountForm';
import { useTheme, alpha } from '@mui/material/styles';
import { getIcon } from '@/components/common/icons/getIcon';

const JournalEntryTable: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const theme = useTheme();
  const { control, formState: { errors }, setValue, trigger } = useFormContext<IJournalEntry>();
  const { fields, append, remove } = useFieldArray({ control, name: 'entries' });
  const [nameOptions, setNameOptions] = React.useState<any[]>([]);
  const [showChartModal, setShowChartModal] = React.useState(false);
  const [showBalanceInfo, setShowBalanceInfo] = React.useState(false);

  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ['chartOfAccounts'],
    queryFn: () => apiService.getChartAccounts().then(res => res.data),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiService.getCustomers().then(res => res.data || []),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiService.getAllVendorsAndCarriers().then(res => res.data || []),
  });

  useEffect(() => {

    setNameOptions([
      ...customers.map((c: any) => ({ id: c._id, label: c.company || c.company, type: 'customer' })),
      ...vendors.map((v: any) => ({ id: v._id, label: v.company || v.company, type: 'vendor' }))
    ]);
  }, [customers, vendors]);

  const entries = useWatch({ control, name: 'entries' });
  const totalDebit = entries?.reduce((sum: number, entry: any) => sum + (Number(entry.debit) || 0), 0);
  const totalCredit = entries?.reduce((sum: number, entry: any) => sum + (Number(entry.credit) || 0), 0);
  const totalBalanceError = Object.values(errors).find(item => item.type === "balance") || null;

  // 🔑 UseEffect to react on account changes
  useEffect(() => {
    entries?.forEach((entry, index) => {
      const account = chartOfAccounts.find((a: IChartAccount) => a._id === entry.account);
      const masterType = account?.accountTypeData?.masterType;
      const nameId=entry.nameId;
      if (masterType === "customer" && entry.nameModel !== "Customer") {
        setValue(`entries.${index}.nameModel`, "Customer");
        // cehck nameid is exist in namecustomers if not then  set empty value 
         const isExist=nameOptions.filter((item)=>item.type==="customer").find((c: any) => c._id === nameId);
         if(!isExist){
          setValue(`entries.${index}.nameId`, null);
          trigger(`entries.${index}.nameId`);
         }
        trigger(`entries.${index}.nameModel`);
      } else if (masterType === "vendor" && entry.nameModel !== "Carrier") {
        setValue(`entries.${index}.nameModel`, "Carrier");
        // cehck nameid is exist in namecustomers if not then  set empty value 
        const isExist=nameOptions.filter((item)=>item.type==="vendor").find((c: any) => c._id === nameId);
        if(!isExist){
         setValue(`entries.${index}.nameId`, null);
         trigger(`entries.${index}.nameId`);
        }
        trigger(`entries.${index}.nameModel`);
      } else if (masterType === "other") {
        if (entry.nameId) {
          setValue(`entries.${index}.nameId`, null);
          trigger(`entries.${index}.nameId`);
        }
        if (entry.nameModel !== null) {
          setValue(`entries.${index}.nameModel`, null);
        }
        trigger([`entries.${index}.nameId`, `entries.${index}.nameModel`]);
      }
    });
  }, [entries, setValue,trigger]);
  const Accountmatertype=(account:string)=>{
    return chartOfAccounts.find((a: IChartAccount) => a._id === account)?.accountTypeData?.masterType;
  }
 const handleChangeCredit=(index:number,value:string)=>{
  const convertedvalue=Number(value);
  setValue(`entries.${index}.credit`,convertedvalue);
  setValue(`entries.${index}.debit`,0);
  triggerBalanceCheck();
 }
 const handleChangeDebit=(index:number,value:string)=>{
  const convertedvalue=Number(value);
  setValue(`entries.${index}.debit`,convertedvalue);
  setValue(`entries.${index}.credit`,0);
  triggerBalanceCheck();
 }

 const triggerBalanceCheck = () => {
  setTimeout(() => {
    const currentEntries = useWatch({ control, name: 'entries' });
    if (!currentEntries || currentEntries.length === 0) return;
    
    const currentTotalDebit = currentEntries.reduce((sum: number, entry: any) => sum + (Number(entry.debit) || 0), 0);
    const currentTotalCredit = currentEntries.reduce((sum: number, entry: any) => sum + (Number(entry.credit) || 0), 0);
    
    if (currentTotalDebit !== currentTotalCredit) {
      const difference = Math.abs(currentTotalDebit - currentTotalCredit);
      const isDebitHigher = currentTotalDebit > currentTotalCredit;
      
      // Find the last non-empty entry to add the balancing amount
      const lastValidIndex = currentEntries.findIndex((entry: any, idx: number) => 
        idx === currentEntries.length - 1 && (entry.account || entry.description)
      );
      
      if (lastValidIndex === -1) {
        // If no valid entry found, add to the last entry
        const targetIndex = currentEntries.length - 1;
        if (isDebitHigher) {
          setValue(`entries.${targetIndex}.credit`, difference);
          setValue(`entries.${targetIndex}.debit`, 0);
        } else {
          setValue(`entries.${targetIndex}.debit`, difference);
          setValue(`entries.${targetIndex}.credit`, 0);
        }
      }
    }
  }, 100);
 };

  return (
    <>
      {/* Table Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance sx={{ fontSize: 24, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Entry Lines
            </Typography>
            <Tooltip title="Learn about journal entry lines">
              <IconButton size="small" onClick={() => setShowBalanceInfo(!showBalanceInfo)}>
                <Info sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Chip 
            label={`${fields.length} line${fields.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Collapse in={showBalanceInfo}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Every journal entry must have balanced debits and credits. The total debits must equal the total credits for the entry to be valid.
            </Typography>
          </Alert>
        </Collapse>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: 1220 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                width: 56, 
                fontWeight: 600, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                #
              </TableCell>
              <TableCell sx={{ 
                width: 320, 
                fontWeight: 600, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                ACCOUNT
              </TableCell>
              <TableCell sx={{ 
                width: 180, 
                fontWeight: 600, 
                align: 'right',
                bgcolor: alpha(theme.palette.success.main, 0.04),
                color: theme.palette.success.main,
                borderBottom: `2px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  <TrendingUp sx={{ fontSize: 16 }} />
                  DEBITS
                </Box>
              </TableCell>
              <TableCell sx={{ 
                width: 180, 
                fontWeight: 600, 
                align: 'right',
                bgcolor: alpha(theme.palette.error.main, 0.04),
                color: theme.palette.error.main,
                borderBottom: `2px solid ${alpha(theme.palette.error.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  <TrendingDown sx={{ fontSize: 16 }} />
                  CREDITS
                </Box>
              </TableCell>
              <TableCell sx={{ 
                width: 280, 
                fontWeight: 600, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                DESCRIPTION
              </TableCell>
              <TableCell sx={{ 
                width: 320, 
                fontWeight: 600, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                NAME
              </TableCell>
              <TableCell sx={{ 
                width: 64, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow
                key={field.id}
                hover
                sx={{
                  '&:nth-of-type(odd)': { 
                    bgcolor: alpha(theme.palette.action.hover, 0.3) 
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  },
                  '& td': { 
                    py: 1.5, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TableCell>
                  <Chip 
                    label={index + 1}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Controller
                    name={`entries.${index}.account`}
                    control={control}
                    render={({ field: controllerField }) => {
                      const accountOptions: SelectOption[] = chartOfAccounts.map((account: IChartAccount) => ({
                        value: account._id,
                        label: account.name
                      }));
                      
                      return (
                        <FormSelect
                          value={accountOptions.find(option => option.value === controllerField.value) || null}
                          onChange={(option) => controllerField.onChange(option?.value || '')}
                          options={accountOptions}
                          placeholder="Select account"
                          error={errors.entries?.[index]?.account?.message || ''}
                          helperText={errors.entries?.[index]?.account?.message}
                          addNewLabel="+ Create New Chart Account"
                          showModal={showChartModal}
                          setShowModal={setShowChartModal}
                        />
                      );
                    }}
                  />
                </TableCell>

                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Controller
                    name={`entries.${index}.debit`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => handleChangeDebit(index, e.target.value)}
                        fullWidth
                        type="number"
                        variant="outlined"
                        size="small"
                        placeholder="0.00"
                        inputProps={{ 
                          inputMode: 'decimal', 
                          style: { textAlign: 'right' },
                          step: '0.01'
                        }}
                        error={!!errors.entries?.[index]?.debit}
                        helperText={errors.entries?.[index]?.debit?.message}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: alpha(theme.palette.success.main, 0.02),
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.04)
                            },
                            '&.Mui-focused': {
                              bgcolor: 'background.paper',
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.2)}`
                            }
                          }
                        }}
                      />
                    )}
                  />
                </TableCell>

                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Controller
                    name={`entries.${index}.credit`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => handleChangeCredit(index, e.target.value)}
                        fullWidth
                        type="number"
                        variant="outlined"
                        size="small"
                        placeholder="0.00"
                        inputProps={{ 
                          inputMode: 'decimal', 
                          style: { textAlign: 'right' },
                          step: '0.01'
                        }}
                        error={!!errors.entries?.[index]?.credit}
                        helperText={errors.entries?.[index]?.credit?.message}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: alpha(theme.palette.error.main, 0.02),
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.04)
                            },
                            '&.Mui-focused': {
                              bgcolor: 'background.paper',
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.error.main, 0.2)}`
                            }
                          }
                        }}
                      />
                    )}
                  />
                </TableCell>

                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Controller
                    name={`entries.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter description"
                        error={!!errors.entries?.[index]?.description}
                        helperText={errors.entries?.[index]?.description?.message}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.04)
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                          }
                        }}
                      />
                    )}
                  />
                </TableCell>

                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Controller
                    name={`entries.${index}.nameId`}
                    control={control}
                    render={({ field }) => {
                      const filteredOptions = nameOptions.filter((opt) => opt.type === (Accountmatertype(entries?.[index]?.account as string)));
                      const nameSelectOptions: SelectOption[] = filteredOptions.map((option) => ({
                        value: option.id,
                        label: `${option.label}(${option.type})`
                      }));
                      
                      return (
                        <FormSelect
                          value={nameSelectOptions.find(option => option.value === field.value) || null}
                          onChange={(option) => {
                            field.onChange(option?.value || '');
                            trigger(`entries.${index}.nameId`);
                          }}
                          options={nameSelectOptions}
                          placeholder="Select name"
                          isDisabled={chartOfAccounts.find((a: IChartAccount) => a._id === entries?.[index]?.account)?.accountTypeData?.masterType === "other"}
                          error={errors.entries?.[index]?.nameId?.message || ''}
                          helperText={errors.entries?.[index]?.nameId?.message}
                        />
                      );
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Tooltip title="Remove line">
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => remove(index)}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        }
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>

        {/* Table Footer */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderTop: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              size="medium"
              variant="outlined"
              startIcon={<AddCircleOutline />}
              onClick={() =>
                append({ account: '', debit: 0, credit: 0, description: '', nameId: '', nameModel: null })
              }
              sx={{ borderRadius: 2 }}
            >
              Add Line
            </Button>
            <Button
              size="medium"
              variant="text"
              startIcon={<ListIcon />}
              onClick={() => navigate(`/accounting${paths.JournalEntryList}`)}
              sx={{ borderRadius: 2 }}
            >
              View All Entries
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'right', minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Total Debit
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.success.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 0.5
                }}
              >
                <TrendingUp sx={{ fontSize: 18 }} />
                ${totalDebit?.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Total Credit
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 0.5
                }}
              >
                <TrendingDown sx={{ fontSize: 18 }} />
                ${totalCredit?.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Balance Error Alert */}
      {totalBalanceError && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {totalBalanceError?.message}
        </Alert>
      )}

      {/* Balance Status Indicator */}
      {totalDebit !== totalCredit && (
        <Alert 
          severity="warning" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2">
            Debits and credits must balance. Current difference: <strong>${Math.abs((totalDebit || 0) - (totalCredit || 0)).toFixed(2)}</strong>
          </Typography>
        </Alert>
      )}
      {/* Chart Account Modal */}
      <Dialog 
        open={showChartModal} 
        onClose={() => setShowChartModal(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogActions>
          <IconButton onClick={() => setShowChartModal(false)} size="small">
            {getIcon('CloseIcon')}
          </IconButton>
        </DialogActions>
        <ChartAccountForm
          initial={undefined}
          onSuccess={() => {
            setShowChartModal(false);
            qc.invalidateQueries({ queryKey: ['chartOfAccounts'] });
          }}
        />
      </Dialog>
    </>
  );
};

export default JournalEntryTable;
