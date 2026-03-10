import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Grid, Typography, Box, Select, MenuItem, InputLabel, FormControl, Card, TextField, Stack, Paper, Divider, SelectChangeEvent, Chip, Dialog, DialogTitle, DialogActions, DialogContent, IconButton } from "@mui/material";
import { setCarrier, setTrailer, setPowerunit, AddAssignDriver, setDispatchRate, AssignDriversToCarrier, removeAssignDriver } from "@/redux/Slice/loadSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { ICarrier, IDriver } from "@/types";
import CarrierOnSelect from "@/components/common/CarrierOnSelect";
import apiService from "@/service/apiService";
import DriverForm from "@/pages/carrier-service/Drivers/DriverForm";
import PowerUnitForm from "@/pages/load-service/components/PowerUnitForm";
import TrailerForm from "@/pages/load-service/components/TrailerForm";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCarrierMarginAmount } from "@/utils";
import ContactCarrierPersons from "./ContactCarrierPersons";
import { getIcon } from "@/components/common/icons/getIcon";

const Asset = ({ index }: {
  index: number;
  onRemove?: (index: number) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadDetails } = useSelector((state: RootState) => state.load)
  const carrierData = useSelector((state: RootState) => state.load.carrierIds);
  const [assignDrivers, setAssignDrivers] = useState(carrierData?.assignDrivers || []);
  const [openDriverForm, setOpenDriverForm] = useState(false)
  const [openPowerUnitForm, setOpenPowerUnitForm] = useState(false)
  const [openTrailerForm, setOpenTrailerForm] = useState(false)
  const queryClient = useQueryClient();

  const { data: selectedCarrierData } = useQuery<ICarrier | null>({
    queryKey: ['carrier', carrierData.carrier],
    queryFn: async () => {
      const response = await apiService.getCarrier(carrierData.carrier);
      return response.data;
    },
    enabled: !!carrierData.carrier,
  });

  const { data: drivers = [] } = useQuery<IDriver[]>({
    queryKey: ['drivers', carrierData.carrier],
    queryFn: async () => {
      const response = await apiService.getDrivers({ carrierId: carrierData.carrier });
      return response.data;
    },
    enabled: !!carrierData.carrier,
  });

  const handleDispatchRateChange = (value: any) => {
    const newValue = Number(value) || 0
    dispatch(setDispatchRate({ index, carrierPay: newValue }))
  };
  const ChangeCarrier = (e: SelectChangeEvent<string>) => {
    const carrierId = e.target.value;
    setAssignDrivers([]);
    dispatch(setCarrier({ index, carrier: carrierId }));
    dispatch(AssignDriversToCarrier({ index, assignDrivers: [] }));
    dispatch(setTrailer({ index, trailer: [] }));
    dispatch(setDispatchRate({ index, carrierPay: 0 })); // Create this action if needed
  };
  const handlePowerUnitChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (!value) return
    dispatch(setPowerunit({ index, powerunit: value }));
  };
  const handleTrailerChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;

    if (!value) return
    dispatch(setTrailer({ index, trailer: value }));
  };
  const AddDriver = (e: SelectChangeEvent<string>) => {
    let value = e.target.value;
    if (!value) return;
    dispatch(AddAssignDriver({ index, driverId: value }));
  };

  const removeDriver = (driverId: string) => {
    dispatch(removeAssignDriver({ index, driverId }));
  };

  useEffect(() => {
    setAssignDrivers(carrierData.assignDrivers)
  }, [carrierData.assignDrivers])
  const renderDispatchRateSection = () => (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>Carrier Amount</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Margin"
            variant="outlined"
            value={getCarrierMarginAmount(loadDetails.loadAmount || 0 as number, carrierData.carrierPay || 0)}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Carrier Pay"
            type="number"
            variant="outlined"
            value={carrierData.carrierPay}
            onChange={(e) => handleDispatchRateChange(e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const handleCloseDriverForm = () => {
    setOpenDriverForm(false)
  }
  const onUpdate = () => {
    setOpenTrailerForm(false)
    setOpenPowerUnitForm(false)
    setOpenDriverForm(false)
    if (carrierData.carrier) {
      queryClient.invalidateQueries({ queryKey: ['carrier', carrierData.carrier] });
      queryClient.invalidateQueries({ queryKey: ['drivers', carrierData.carrier] });
    }
  }
  const handleOpenPowerUnitForm = () => {
    setOpenPowerUnitForm(true)
  }
  const handleOpenTrailerForm = () => {
    setOpenTrailerForm(true)
  }
  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Stack spacing={3}>

        {/* Carrier Selection */}

        <CarrierOnSelect index={index} updateLocation={ChangeCarrier as unknown as any} />

        {selectedCarrierData && (
          <>
            {/* Carrier Details Section */}
            <Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Company Name" value={selectedCarrierData?.company || ''} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="MC Number" value={selectedCarrierData?.mcNumber || ''} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="USDOT Number" value={selectedCarrierData?.usdot || ''} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Phone" value={selectedCarrierData?.phone || ''} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Email" value={selectedCarrierData?.email || ''} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Address" value={selectedCarrierData?.address || ''} variant="outlined" InputProps={{ readOnly: true }} multiline maxRows={2} />
                </Grid>

                {/* Contact Person */}
                <ContactCarrierPersons />

                {/* Power Unit */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id="powerunit-label">Power Unit</InputLabel>
                    <Select
                      labelId="powerunit-label"
                      label="Power Unit"
                      value={carrierData.powerunit}
                      onChange={handlePowerUnitChange}
                    >
                      <MenuItem value="" onClick={handleOpenPowerUnitForm}>
                        <Typography variant="body2" color="primary">+ Add Power Unit</Typography>
                      </MenuItem>
                      {Array.isArray(selectedCarrierData?.powerunit) && selectedCarrierData.powerunit.map((pu: string) => (
                        <MenuItem key={pu} value={pu}>{pu}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Trailer */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id="trailer-label">Trailer</InputLabel>
                    <Select
                      labelId="trailer-label"
                      label="Trailer"
                      value={carrierData.trailer}
                      onChange={handleTrailerChange}
                    >
                      <MenuItem value="" onClick={handleOpenTrailerForm}>
                        <Typography variant="body2" color="primary">+ Add Trailer</Typography>
                      </MenuItem>
                      {Array.isArray(selectedCarrierData?.trailer) && selectedCarrierData.trailer.map((t: string) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Select drivers */}
                <Grid item xs={12} md={carrierData.contactPerson?12:6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="edit-driver-label">Select a Driver</InputLabel>
                    <Select onChange={AddDriver} label="Select a Driver" labelId="edit-driver-label">
                      <MenuItem disabled value="">Select a Driver</MenuItem>
                      {drivers?.filter((driver: IDriver) => !assignDrivers.includes(driver._id as unknown as any)) // Prevent duplicate selection
                        .map((driver: any) => (
                          <MenuItem key={driver._id} value={driver._id} sx={{ flex: 1 }}>
                            {driver.driverName}

                            <Chip
                              size="small"
                              label={driver?.isActive ? 'Active' : 'Inactive'}
                              color={driver?.isActive ? 'success' : 'error'}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            </Box>



            {/* Add matetial ui divider */}
            <Divider sx={{ mt: 2, mb: 2 }} />

            {/* Driver Assignment Section */}


            {/* Assigned Drivers List */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>Assigned Drivers</Typography>
                <Button variant="outlined" size="small" startIcon={getIcon('plus')} onClick={() => setOpenDriverForm(true)}>Add Driver</Button>
              </Box>
              {assignDrivers.length > 0 ? (
                assignDrivers.map((driverId, idx) => {
                  const driver = drivers?.find((d: any) => d._id === driverId);
                  return (
                    <Card variant="outlined" key={idx} sx={{ mt: 1, p: 1, display: "flex", justifyContent: "space-between" }}>
                      <Box flexDirection={"row"}>
                        <Typography> <strong>Name</strong>: {driver?.driverName || "Unknown Driver"}  <Chip
                          label={driver?.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={driver?.isActive ? 'success' : 'error'}
                        /></Typography>

                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={getIcon("delete")}
                        onClick={() => removeDriver(driverId)}
                      >
                        Remove
                      </Button>
                    </Card>
                  );
                })
              ) : (
                <Typography>No drivers assigned</Typography>
              )}
            </Paper>
            {/* Add Margin Amount Section here */}
            {renderDispatchRateSection()}
          </>
        )}
        <Dialog open={openDriverForm} onClose={handleCloseDriverForm}>
          <DialogActions>
            <IconButton onClick={handleCloseDriverForm} size="small">
              {getIcon('CloseIcon')}
            </IconButton>
          </DialogActions>
          <DialogTitle>Add Driver</DialogTitle>
          <DialogContent>
            <DriverForm carrier={carrierData.carrier} onCancel={() => { handleCloseDriverForm() }} onUpdate={async () => {
              setOpenDriverForm(false)
              queryClient.invalidateQueries({ queryKey: ['drivers', carrierData.carrier] });
            }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDriverForm}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Stack>
      <PowerUnitForm onClose={() => { setOpenPowerUnitForm(false) }} carrierId={carrierData.carrier} open={openPowerUnitForm} onUpdate={onUpdate} />
      <TrailerForm onClose={() => { setOpenTrailerForm(false) }} carrierId={carrierData.carrier} open={openTrailerForm} onUpdate={onUpdate} />
    </Card>
  );
};
export default Asset
