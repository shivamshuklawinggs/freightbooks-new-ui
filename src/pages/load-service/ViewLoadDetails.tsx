import React from 'react';
import { Box, Typography, Grid, Paper, Chip, Divider, Stack, Dialog, DialogContent, DialogTitle, DialogActions, Button, Avatar, } from '@mui/material';
import { IViewLoad,ILocationWithIds } from '@/types';
import { getFilePreview, getFileType } from '@/utils/getFilePreview';
import { LOAD_UPLOAD_URL } from '@/config';
import { FileDownload as FileDownloadIcon, InsertDriveFile } from "@mui/icons-material";
import {  handleFileDownload } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
const LabelValue: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({ label, value }) => (
  <>
    <Typography variant="body2" fontWeight="bold" color="text.secondary">{label}</Typography>
    <Typography variant="body2" color="text.primary">{value}</Typography>
  </>
);

const LocationCard: React.FC<{ location: ILocationWithIds }> = ({ location }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <LabelValue label="Address" value={location?.address} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <LabelValue label="City/State" value={`${location?.city}, ${location?.state} ${location?.zipcode}`} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <LabelValue label="Date/Time" value={`${formatDate(location?.date)} at ${location?.time}`} />
      </Grid>
    </Grid>
    {Array.isArray(location?.requirements) && location?.requirements.length > 0 && (
  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
    {location?.requirements.map((req, idx) => (
      <Chip key={idx} label={req} size="small" color="primary" variant="outlined" />
    ))}
  </Stack>
)}

    {location?.notes && (
      <Typography mt={1} variant="body2" color="text.secondary"><strong>Notes:</strong> {location?.notes}</Typography>
    )}
  </Paper>
);

const ViewLoadDetails: React.FC<{ load:IViewLoad , closeModal: () => void }> = ({ load, closeModal }) => {
  return (
    <Dialog open={!!load} onClose={closeModal} fullWidth maxWidth="lg" transitionDuration={{ enter: 500, exit: 500 }}>
        <DialogTitle>Load Details</DialogTitle>
      <DialogContent>
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>Load #{load?.loadNumber}</Typography>
            <Typography variant="subtitle2">Created: {load?.createdAt ? formatDate(load?.createdAt) : 'N/A'}</Typography>
          </Box>
          <Chip label={load?.status} color="primary" sx={{ fontWeight: 'bold' }} />
        </Box>

        {/* Load Information & Carrier Assignment */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>Load Information</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}><LabelValue label="Commodity" value={load?.commodity} /></Grid>
                <Grid item xs={6}><LabelValue label="Equipment" value={`${load?.equipmentType} - ${load?.equipmentLength}'`} /></Grid>
                <Grid item xs={6}><LabelValue label="Load Size" value={load?.loadSize} /></Grid>
                <Grid item xs={6}><LabelValue label="Weight" value={load?.weight ? `${load?.weight} lbs` : 'N/A'} /></Grid>
                {load?.temperature && (
                  <Grid item xs={6}><LabelValue label="Temperature" value={`${load?.temperature}°${load?.temperatureUnit}`} /></Grid>
                )}
                <Grid item xs={6}><LabelValue label="Declared Value" value={load?.declaredValue ? `$${load?.declaredValue.toLocaleString()}` : 'N/A'} /></Grid>
              </Grid>
              {/* customer Information */}
              <Typography sx={{mt:2}} variant="h6" color="primary" gutterBottom>Customer Information</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}><LabelValue label="Customer" value={load?.customerId?.company} /></Grid>
                <Grid item xs={6}><LabelValue label="Customer Phone" value={load?.customerId?.phone} /></Grid>
                <Grid item xs={6}><LabelValue label="Customer Email" value={load?.customerId?.email} /></Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fff3e0', borderColor: '#ffe0b2' }}>
              <Typography variant="h6" color="primary" gutterBottom>Carrier Details</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}><LabelValue label="Carrier" value={load?.carrierIds?.carrier?.company} /></Grid>
                <Grid item xs={6}>
                  <LabelValue
                    label="USDOT"
                    value={load?.carrierIds?.carrier?.usdot || 'N/A'}
                  />
                </Grid>
                <Grid item xs={6}><LabelValue label="MC" value={load?.carrierIds?.carrier?.mcNumber || 'N/A'} /></Grid>
                <Grid item xs={6}><LabelValue label="Power Unit" value={load?.carrierIds?.powerunit} /></Grid>
                <Grid item xs={6}><LabelValue label="Trailer" value={load?.carrierIds?.trailer} /></Grid>
                <Grid item xs={6}><LabelValue label="Dispatch Rate" value={`$${load?.carrierIds?.carrierPay.toLocaleString()}`} /></Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Assigned Drivers</Typography>
              {load?.carrierIds?.assignDrivers.map((driver, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5, mt: 1, backgroundColor: '#fff' }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}><LabelValue label="Name" value={driver?.driverName || 'N/A'} /></Grid>
                    <Grid item xs={6}><LabelValue label="Phone" value={driver?.driverPhone || 'N/A'} /></Grid>
                  </Grid>
                </Paper>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Pickup & Delivery Locations */}
        <Box mt={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">Locations</Typography>

            <Typography variant="subtitle1" mt={2}>Pickup Locations</Typography>
            {load?.pickupLocationId?.map((location, i) => (
              <LocationCard key={i} location={location || {}} />
            ))}

            <Typography variant="subtitle1" mt={3}>Delivery Locations</Typography>
            {load?.deliveryLocationId?.map((location, i) => (
              <LocationCard key={i} location={location || {}} />
            ))}
          </Paper>
        </Box>

        {/* Notes */}
        {load?.notes && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" color="primary">Additional Notes</Typography>
            <Typography variant="body2" mt={1}>{load?.notes}</Typography>
          </Paper>
        )}
        {/* load files */}
        {load?.files?.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" color="primary">Documents</Typography>
            <Grid container spacing={2}>
              {load?.files.map((file, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  {getFileType(file as any).startsWith('image') ? (
                        <Avatar variant="square" src={getFilePreview(file as any,LOAD_UPLOAD_URL) || undefined} />
                      ) : (
                        <Avatar>
                          <InsertDriveFile />
                        </Avatar>
                      )}
                     <FileDownloadIcon fontSize='small' color='primary' onClick={() => handleFileDownload(file,LOAD_UPLOAD_URL)} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Paper>
    </Box>
    </DialogContent>
    <DialogActions>
    <Button onClick={closeModal}>Close</Button>
    </DialogActions>
    </Dialog>

  );
};

export default ViewLoadDetails;
