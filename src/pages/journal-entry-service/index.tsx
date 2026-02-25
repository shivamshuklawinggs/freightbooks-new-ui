import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Card, Container, Divider, Grid, Typography } from '@mui/material';
import JournalEntryHeader from './JournalEntryHeader';
import JournalEntryTable from './JournalEntryTable';
import JournalEntryFooter from './JournalEntryFooter';
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import {IJournalEntry,journalEntrySchema} from './Schema/JournalEntrySchema';
import { useParams } from 'react-router-dom';
import { todayDate } from '@/config/constant';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
const JournalEntryPage: React.FC = () => {
   const {JournalEntryId}=useParams<{JournalEntryId?:string}>()
  const methods = useForm<IJournalEntry>({
    resolver: yupResolver(journalEntrySchema),
    mode:"all",
    defaultValues: {
      journalDate: todayDate,
      entries: [
        { account: '', debit: undefined, credit: undefined, description: '', nameId: '', nameModel: null },
        { account: '', debit: undefined, credit: undefined, description: '', nameId: '', nameModel: null },
      ],
      memo: 'Test',
    },
  });
  const { data: nextJournalNumber,refetch:refetchNextJournalNumber } = useQuery({
    queryKey: ['nextJournalNumber',],
    queryFn: () => apiService.getNextJournalNumber(),
    enabled:!JournalEntryId
    
  });
  const { data: journalEntry,refetch:refetchJournalEntry } = useQuery({
    queryKey: ['journalEntry',JournalEntryId],
    queryFn: () => apiService.getJournalEntry(JournalEntryId as string),
    enabled:!!JournalEntryId
    
  });
  const onSubmit = async(data: IJournalEntry & {deleted?:string}) => {
    const formdata= new FormData()
    const {attachments,...restdata}=data
    if(!attachments){
      restdata.deleted="1"
    }
    if(attachments  instanceof File) {
      formdata.append("attachments",attachments)
    }
    formdata.append("journalEntryData",JSON.stringify(restdata))
    // API submission logic will be added here
    try {
      if(JournalEntryId){
        await apiService.updateJournalEntry(JournalEntryId,formdata);
        refetchJournalEntry()
        toast.success("Journal Entry Updated Successfully")
      }else{
        await apiService.createJournalEntry(formdata);
        methods.reset();
        refetchNextJournalNumber()
        toast.success("Journal Entry Created Successfully")
      }
      

    } catch (error:any) {
        toast.error(error.message || "Something went wrong")
    }
  };
useEffect(()=>{
!methods.watch("journalNumber") && !JournalEntryId && methods.setValue('journalNumber', nextJournalNumber?.journalNumber)
},[nextJournalNumber])
useEffect(()=>{
   if(journalEntry){
    methods.reset(journalEntry)
   }
},[journalEntry])

console.error(methods.formState.errors)
  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Journal Entry
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add accounts, debit/credit lines, memo, and attachments.
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {methods.watch('journalNumber') ? `No: ${methods.watch('journalNumber')}` : ''}
            </Typography>
          </Box>

          <Card sx={{ p: 2.5, borderRadius: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <JournalEntryHeader />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <JournalEntryTable />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <JournalEntryFooter />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    pt: 1,
                  }}
                >
                  <Button variant="text" color="inherit">Cancel</Button>
                  <Button variant="outlined" onClick={() => methods.reset()}>Clear</Button>
                  <Button type="submit" variant="contained">Save</Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </form>
      </Container>
    </FormProvider>
  );
};

export default withPermission("view",["accounting"])(JournalEntryPage);
