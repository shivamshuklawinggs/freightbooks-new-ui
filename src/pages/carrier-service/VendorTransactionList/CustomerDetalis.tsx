import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { truncateText } from '@/utils';
import { Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { ICustomerTransactionDetails } from '@/types';

const CustomerDetalis: React.FC<{ data: ICustomerTransactionDetails }> = ({ data }) => {


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
      {/* Header with Name + Contact */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {data?.company && (
          <Typography variant="h5" fontWeight="bold">
            {data.company}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Company */}
        {data?.company && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Company
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {data.company}
              </Typography>
            </Box>
          </Grid>
        )}
        {/* Phone */}
        {data?.phone && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Phone
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <PhoneIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {data.phone}
              </Typography>
            </Box>
          </Grid>
        )}
        {/* Email */}
        {data?.email && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Email
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <EmailIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {data.email}
              </Typography>
            </Box>
          </Grid>
        )}
        {/* Billing Address */}
        {data?.billingAddress && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Billing Address
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {truncateText(data.billingAddress.address || '')}{" "}
                {`${data.billingAddress.city || ''}, ${data.billingAddress.state || ''} ${data.billingAddress.zipCode || ''}`}
              </Typography>
            </Box>
          </Grid>
        )}
       {/*  payment method */}
        {data?.paymentMethod && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Payment Method
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {data.paymentMethod}
              </Typography>
            </Box>
          </Grid>
        )}
        {
          data.paymentTerms && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Payment Terms
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  {data.paymentTerms}
                </Typography>
              </Box>
            </Grid>
          )
        }

        {/* Notes */}
        {data?.notes && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              NOTES
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {data.notes}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default CustomerDetalis;
