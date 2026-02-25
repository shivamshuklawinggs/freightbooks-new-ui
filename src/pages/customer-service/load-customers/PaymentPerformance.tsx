import React from 'react';
import { Grid, Paper, Typography, Card } from '@mui/material';

export interface PaymentPerformanceProps {
  totalInvoices: number;
  isFullyPaidOnTimeCount: number;
  hasLatePaymentCount: number;
  isOverdueCount: number;
  recievedAmount: number;
  dueAmount: number;
  totalAmountWithTax: number;
  deleyedRecievedPaymentAmount: number;
}

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <Card elevation={0} sx={{ p: 2, border: '1px solid #f0f0f0', borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
  </Card>
);

const PaymentPerformance: React.FC<PaymentPerformanceProps> = ({
  totalInvoices,
  isFullyPaidOnTimeCount,
  hasLatePaymentCount,
  isOverdueCount,
  recievedAmount,
  dueAmount,
  totalAmountWithTax,
  deleyedRecievedPaymentAmount
}) => {
    const data=[
        {label:"Total Invoices",value:totalInvoices},
        {label:"Paid On Time",value:isFullyPaidOnTimeCount},
        {label:"Overdue",value:isOverdueCount},
        {label:"Late Payments",value:hasLatePaymentCount},
        {label:"Paid Amount",value:recievedAmount},
        {label:"Due Amount",value:dueAmount},
        {label:"Total Amount",value:totalAmountWithTax},
        {label:"Delayed Payment",value:deleyedRecievedPaymentAmount},
    ]
    const itemsPerRow =Math.floor(12 / 2);
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Payment Performance</Typography>
      <Grid container spacing={2}>
       {
        data.map((item,index)=>{
            return(
                <Grid item key={index}  xs={itemsPerRow}><Stat label={item.label} value={item.value ?? 0} /></Grid>
            )
        })
       }
      </Grid>
    </Paper>
  );
};

export default PaymentPerformance;
