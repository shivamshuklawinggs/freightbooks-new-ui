import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Box, 
  Button, 
  Card, 
  Container, 
  Typography,
  Paper,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
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
  const theme = useTheme();
  const steps = ['Journal Details', 'Entry Lines', 'Memo & Attachments'];

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link color="inherit" href="/accounting" sx={{ textDecoration: 'none' }}>
              Accounting
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
              Journal Entry
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                    Journal Entry
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Create and manage journal entries with debit/credit lines
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {methods.watch('journalNumber') ? `#${methods.watch('journalNumber')}` : 'Draft'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {methods.watch('journalDate') ? new Date(methods.watch('journalDate')).toLocaleDateString() : 'No date'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Stepper */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Stepper activeStep={0} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconProps={{
                      sx: {
                        '& .MuiStepIcon-root': {
                          fontSize: 28,
                        },
                        '& .MuiStepIcon-text': {
                          fontSize: 12,
                          fontWeight: 600,
                        },
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Main Card */}
          <Card 
            elevation={0}
            sx={{ 
              p: 0, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {/* Journal Details Section */}
            <Box 
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DescriptionIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Journal Details
                </Typography>
              </Box>
              <JournalEntryHeader />
            </Box>

            {/* Entry Lines Section */}
            <Box sx={{ p: 3 }}>
              <JournalEntryTable />
            </Box>

            {/* Memo & Attachments Section */}
            <Box 
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AttachFileIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Memo & Attachments
                </Typography>
              </Box>
              <JournalEntryFooter />
            </Box>

            {/* Action Buttons */}
            <Box 
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Debit: <strong>${methods.watch('entries')?.reduce((sum: number, entry: any) => sum + (Number(entry.debit) || 0), 0).toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Credit: <strong>${methods.watch('entries')?.reduce((sum: number, entry: any) => sum + (Number(entry.credit) || 0), 0).toFixed(2)}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => methods.reset()}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  type="submit"
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Save Journal Entry
                </Button>
              </Box>
            </Box>
          </Card>
        </form>
      </Container>
    </FormProvider>
  );
};

export default withPermission("view",["accounting"])(JournalEntryPage);
