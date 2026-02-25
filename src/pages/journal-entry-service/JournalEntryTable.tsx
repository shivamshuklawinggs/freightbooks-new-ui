import React, { useEffect } from 'react';
import { useFormContext, useFieldArray, Controller, useWatch } from 'react-hook-form';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Button, Typography, Box,
  Dialog
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, List as ListIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { IJournalEntry } from './Schema/JournalEntrySchema';
import { IChartAccount } from '@/types';
import FormSelect from '@/components/ui/FormSelect';
import { SelectOption } from '@/components/ui/FormSelect';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import ChartAccountForm from '../chart-accounts-service/ChartAccountForm';

const JournalEntryTable: React.FC = () => {
  const navigate=useNavigate()
  const qc=useQueryClient()
  const { control, formState: { errors }, setValue, trigger } = useFormContext<IJournalEntry>();
  const { fields, append, remove } = useFieldArray({ control, name: 'entries' });
  const [nameOptions, setNameOptions] = React.useState<any[]>([]);

  const [showChartModal, setShowChartModal] = React.useState(false);

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
    <TableContainer
      sx={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Lines
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add debit/credit lines. Totals must balance.
        </Typography>
      </Box>
      <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: 1220 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 56, fontWeight: 700, bgcolor: 'background.paper' }}>#</TableCell>
            <TableCell sx={{ width: 320, fontWeight: 700, bgcolor: 'background.paper' }}>ACCOUNT</TableCell>
            <TableCell sx={{ width: 180, fontWeight: 700, bgcolor: 'background.paper' }} align="right">DEBITS</TableCell>
            <TableCell sx={{ width: 180, fontWeight: 700, bgcolor: 'background.paper' }} align="right">CREDITS</TableCell>
            <TableCell sx={{ width: 280, fontWeight: 700, bgcolor: 'background.paper' }}>DESCRIPTION</TableCell>
            <TableCell sx={{ width: 320, fontWeight: 700, bgcolor: 'background.paper' }}>NAME</TableCell>
            <TableCell sx={{ width: 64, bgcolor: 'background.paper' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow
              key={field.id}
              hover
              sx={{
                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                '& td': { py: 1 },
              }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Controller
                  name={`entries.${index}.account`}
                  control={control}
                  render={({ field: controllerField }) => {
                    
                    const accountOptions: SelectOption[] = chartOfAccounts.map((account: IChartAccount) => ({
                      value: account._id,
                      label: account.name
                    }))
                    
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
                      inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                      error={!!errors.entries?.[index]?.debit}
                      helperText={errors.entries?.[index]?.debit?.message}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
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
                      inputProps={{ inputMode: 'decimal', style: { textAlign: 'right' } }}
                      error={!!errors.entries?.[index]?.credit}
                      helperText={errors.entries?.[index]?.credit?.message}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
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
                      error={!!errors.entries?.[index]?.description}
                      helperText={errors.entries?.[index]?.description?.message}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
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
                <IconButton color="error" onClick={() => remove(index)}><DeleteOutline /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexWrap: 'wrap',
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddCircleOutline />}
          onClick={() =>
            append({ account: '', debit: 0, credit: 0, description: '', nameId: '', nameModel: null })
          }
        >
          Add line
        </Button>
        <Button
          size="small"
          variant="text"
          startIcon={<ListIcon />}
          onClick={() =>navigate(`/accounting${paths.JournalEntryList}`)}
        >
          View All Entries
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Total Debit</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>${totalDebit?.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Total Credit</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>${totalCredit?.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Box>

      {totalBalanceError && (
        <Typography color="error" align="right" sx={{ mt: 1 }}>
          {totalBalanceError?.message}
        </Typography>
      )}
    </TableContainer>
       <Dialog open={showChartModal} onClose={() => {
        setShowChartModal(false)

       }} maxWidth="md" fullWidth>
          <ChartAccountForm
            initial={undefined}
            onSuccess={()=>{
              setShowChartModal(false)
              qc.invalidateQueries({ queryKey: ['chartOfAccounts'] })
            }}
          />
        </Dialog>
    </>
  );
};

export default JournalEntryTable;
