import React from 'react';
import { Box, Typography, Grid, Paper, Link } from '@mui/material';
import { truncateText } from '@/utils';
import { ICustomerTransactionDetails } from '@/types';
import { Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';

const BasicDetalis: React.FC<{ data?: ICustomerTransactionDetails }> = ({data}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        minWidth: 200,
        border: '1px solid',
        borderColor: 'grey.400',
        borderRadius: 1,
      }}
    >
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {data?.company || 'N/A'}
        </Typography>
        {data?.phone && (
          <Link href={`tel:${data.phone}`}>
            <PhoneIcon fontSize="small" />
          </Link>
        )}
        {data?.email && (
          <Link href={`mailto:${data.email}`}>
            <EmailIcon fontSize="small" />
          </Link>
        )}
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Company
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2">
              {data?.company}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Billing Address
          </Typography>
          {data?.billingAddress ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2">
                 {truncateText(data?.billingAddress?.address || '')}{" "}
                               {`${data?.billingAddress?.city || ''}, ${data?.billingAddress?.state || ''} ${data?.billingAddress?.zipCode || ''}`}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              N/A
            </Typography>
          )}
        </Grid>

        <Grid item xs={3}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Payment Method
          </Typography>
         <Typography variant="body2" color="textSecondary">
                     {data?.paymentMethod || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            NOTES
          </Typography>
         <Typography variant="body2" color="textSecondary">
                     {data?.notes || 'N/A'}
                   </Typography>
        </Grid>

      </Grid>
    </Paper>
  );
};

export default BasicDetalis;