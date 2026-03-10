import React from 'react';
import { Box, Typography, Grid, Chip, Divider, Stack, Dialog, DialogContent, DialogTitle, DialogActions, Button, Avatar, IconButton } from '@mui/material';
import { IViewLoad, ILocationWithIds } from '@/types';
import { getFilePreview, getFileType } from '@/utils/getFilePreview';
import { LOAD_UPLOAD_URL } from '@/config';
import { FileDownload as FileDownloadIcon, InsertDriveFile, LocalShipping, Person, PinDrop, Description, AttachFile } from "@mui/icons-material";
import { handleFileDownload } from '@/utils';
import { formatDate } from '@/utils/dateUtils';
import { SectionCard, DetailGrid, LabelValue } from '@/components/ui';
import { getIcon } from '@/components/common/icons/getIcon';

const LocationCard: React.FC<{ location: ILocationWithIds }> = ({ location }) => (
  <Box sx={{ p: 1.5, mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
    <DetailGrid
      spacing={1}
      fields={[
        { label: 'Address', value: location?.address, xs: 12, sm: 6 },
        { label: 'City / State', value: `${location?.city}, ${location?.state} ${location?.zipcode}`, xs: 12, sm: 6 },
        { label: 'Date / Time', value: `${formatDate(location?.date)} at ${location?.time}`, xs: 12, sm: 6 },
      ]}
    />
    {Array.isArray(location?.requirements) && location.requirements.length > 0 && (
      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
        {location.requirements.map((req, idx) => (
          <Chip key={idx} label={req} size="small" color="primary" variant="outlined" />
        ))}
      </Stack>
    )}
    {location?.notes && (
      <Typography mt={1} variant="body2" color="text.secondary">
        <strong>Notes:</strong> {location.notes}
      </Typography>
    )}
  </Box>
);

const ViewLoadDetails: React.FC<{ load: IViewLoad; closeModal: () => void }> = ({ load, closeModal }) => {
  return (
    <Dialog open={!!load} onClose={closeModal} fullWidth maxWidth="lg" transitionDuration={{ enter: 300, exit: 200 }}>
      <DialogActions>
        <IconButton onClick={closeModal} size="small">
          {getIcon('CloseIcon')}
        </IconButton>
      </DialogActions>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Load #{load?.loadNumber}</Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {load?.createdAt ? formatDate(load?.createdAt) : 'N/A'}
          </Typography>
        </Box>
        <Chip label={load?.status} color="primary" size="small" sx={{ fontWeight: 700 }} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Grid container spacing={2}>

          {/* Load Information */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Load Information" icon={<LocalShipping />}>
              <DetailGrid
                fields={[
                  { label: 'Commodity', value: load?.commodity, xs: 6 },
                  { label: 'Equipment', value: `${load?.equipmentType} - ${load?.equipmentLength}'`, xs: 6 },
                  { label: 'Load Size', value: load?.loadSize, xs: 6 },
                  { label: 'Weight', value: load?.weight ? `${load?.weight} lbs` : '—', xs: 6 },
                  ...(load?.temperature ? [{ label: 'Temperature', value: `${load.temperature}°${load.temperatureUnit}`, xs: 6 as const }] : []),
                  { label: 'Declared Value', value: load?.declaredValue ? `$${load.declaredValue.toLocaleString()}` : '—', xs: 6 },
                ]}
              />
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Customer
              </Typography>
              <DetailGrid
                spacing={1}
                fields={[
                  { label: 'Company', value: load?.customerId?.company, xs: 6 },
                  { label: 'Phone', value: load?.customerId?.phone, xs: 6 },
                  { label: 'Email', value: load?.customerId?.email, xs: 12 },
                ]}
              />
            </SectionCard>
          </Grid>

          {/* Carrier Details */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Carrier & Drivers" icon={<Person />}>
              <DetailGrid
                fields={[
                  { label: 'Carrier', value: load?.carrierIds?.carrier?.company, xs: 6 },
                  { label: 'USDOT', value: load?.carrierIds?.carrier?.usdot || '—', xs: 6 },
                  { label: 'MC #', value: load?.carrierIds?.carrier?.mcNumber || '—', xs: 6 },
                  { label: 'Power Unit', value: load?.carrierIds?.powerunit, xs: 6 },
                  { label: 'Trailer', value: load?.carrierIds?.trailer, xs: 6 },
                  { label: 'Dispatch Rate', value: `$${load?.carrierIds?.carrierPay?.toLocaleString()}`, xs: 6 },
                ]}
              />
              {load?.carrierIds?.assignDrivers?.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Assigned Drivers
                  </Typography>
                  {load.carrierIds.assignDrivers.map((driver, idx) => (
                    <Box key={idx} sx={{ mt: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <LabelValue label="Name" value={driver?.driverName || '—'} />
                        </Grid>
                        <Grid item xs={6}>
                          <LabelValue label="Phone" value={driver?.driverPhone || '—'} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </>
              )}
            </SectionCard>
          </Grid>

          {/* Pickup Locations */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Pickup Locations" icon={<PinDrop />}>
              {load?.pickupLocationId?.map((location, i) => (
                <LocationCard key={i} location={location || {} as ILocationWithIds} />
              ))}
            </SectionCard>
          </Grid>

          {/* Delivery Locations */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Delivery Locations" icon={<PinDrop />}>
              {load?.deliveryLocationId?.map((location, i) => (
                <LocationCard key={i} location={location || {} as ILocationWithIds} />
              ))}
            </SectionCard>
          </Grid>

          {/* Notes */}
          {load?.notes && (
            <Grid item xs={12}>
              <SectionCard title="Additional Notes" icon={<Description />}>
                <Typography variant="body2" color="text.secondary">{load.notes}</Typography>
              </SectionCard>
            </Grid>
          )}

          {/* Documents */}
          {load?.files?.length > 0 && (
            <Grid item xs={12}>
              <SectionCard title="Documents" icon={<AttachFile />}>
                <Grid container spacing={1.5}>
                  {load.files.map((file, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => handleFileDownload(file, LOAD_UPLOAD_URL)}
                      >
                        {getFileType(file as any).startsWith('image') ? (
                          <Avatar variant="square" src={getFilePreview(file as any, LOAD_UPLOAD_URL) || undefined} sx={{ mx: 'auto', mb: 0.5 }} />
                        ) : (
                          <Avatar sx={{ mx: 'auto', mb: 0.5 }}>
                            <InsertDriveFile />
                          </Avatar>
                        )}
                        <FileDownloadIcon fontSize="small" color="primary" />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>
            </Grid>
          )}

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={closeModal} variant="outlined" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewLoadDetails;
