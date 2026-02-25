import { ChangeEvent, FC } from "react";
import { useDispatch } from "react-redux";
import CustomDatePicker from "@/components/common/CommonDatePicker";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import { locationClasses, locationRequirement } from "@/data/Loads";
import { IPickupLocation, IDeliveryLocation } from "@/types";
import { TextField, Box, FormControl, InputLabel, Select, MenuItem, Button, Checkbox, FormControlLabel, FormGroup, Typography, Grid, Paper, Stack } from "@mui/material";
import TimeRangePicker from "@/components/common/TimeRangePicker";
import LocationSelect from "@/components/common/PickupLocationSelect";
import { AppDispatch } from "@/redux/store";
import FloatInput from "@/components/ui/FloatInput";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { Production } from "@/config";
import { getIcon } from "@/components/common/icons/getIcon";

interface LocationFormProps {
  index: number;
  locationData: IPickupLocation | IDeliveryLocation;
  onRemove: boolean;
  locationType: 'pickup' | 'delivery';
  actions: {
    remove: ActionCreatorWithPayload<number>;
    update: ActionCreatorWithPayload<any>;
    add: () => { type: string };
    setPoNumber: ActionCreatorWithPayload<string>;
  };
  pnonumber: string;
  sliceName: 'load' | 'editload';
}

const LocationForm: FC<LocationFormProps> = ({ index, locationData, onRemove, locationType, actions, pnonumber, sliceName }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedLocationInfo = { ...locationData, [name]: value };

    if (!locationData.requirements?.includes("Appointment Required")) {
      updatedLocationInfo.endTime = "";
    }
    dispatch(actions.update({ index, ...updatedLocationInfo }));
  };

  const handleLocationSelect = (data: { address: string, city: string, state: string, zipcode: string, warehouse: string }) => {
    const updated = { ...locationData, ...data };
    dispatch(actions.update({ index, ...updated }));
  };

  const handleRequirementChange = (requirementName: string) => {
    const currentRequirements = new Set(locationData.requirements || []);
    if (currentRequirements.has(requirementName)) {
      currentRequirements.delete(requirementName);
    } else {
      currentRequirements.add(requirementName);
    }

    const updatedLocationInfo = {
      ...locationData,
      requirements: Array.from(currentRequirements)
    };

    if (!updatedLocationInfo.requirements?.includes("Appointment Required")) {
      updatedLocationInfo.endTime = "";
    }
    dispatch(actions.update({ index, ...updatedLocationInfo }));
  };

  const title = locationType.charAt(0).toUpperCase() + locationType.slice(1);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title} Location {index + 1}</Typography>
        <Stack direction="row" spacing={2}>
          {onRemove && (
            <Button
              variant="outlined"
              color="error"
              startIcon={getIcon("delete")}
              onClick={() => dispatch(actions.remove(index))}
            >
              Remove
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={getIcon("plus")}
            onClick={() => dispatch(actions.add())}
          >
            Add
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <LocationSelect index={index} updateLocation={actions.update} />
        </Grid>
        <Grid item xs={12} md={12}>
          <TextField
            fullWidth
            label="Warehouse"
            placeholder="Warehouse"
            name="warehouse"
            value={locationData.warehouse || ""}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {
            Production ?<AddressAutocomplete
            value={locationData.address || ''}
            onChange={() => {}}
            onLocationSelect={handleLocationSelect}
            label="Address"
            placeholder="Enter address"
            error={false}
          />:<TextField
            fullWidth
            label="Address"
            placeholder="Enter address"
            name="address"
            value={locationData.address || ""}
            onChange={handleChange}
            variant="outlined"
          />
          }
          
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            placeholder="City"
            name="city"
            value={locationData.city || ""}
            onChange={handleChange}
            variant="outlined"
            // InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="State"
            placeholder="State"
            name="state"
            value={locationData.state || ""}
            onChange={handleChange}
            // inputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Zipcode"
            placeholder="Zipcode"
            name="zipcode"
            value={locationData.zipcode || ""}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Location Class</InputLabel>
            <Select
              sx={{textTransform:"capitalize"}}
              name="locationClass"
              value={locationData.locationClass || ""}
              onChange={handleChange as any}
              label="Location Class"
            >
              <MenuItem value="" disabled>Location Class</MenuItem>
              {locationClasses.map((locationClass) => (
                <MenuItem sx={{textTransform:"capitalize"}} key={locationClass} value={locationClass}>{locationClass}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomDatePicker
            label={`${title} Date`}
            name="date"
            value={locationData.date || ""}
            onChange={(e: any) => handleChange(e)}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TimeRangePicker pickup={locationData} index={index} name="time" label={`${title} Time`} updatePickupLocation={actions.update} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TimeRangePicker pickup={locationData} index={index} name="endTime" label={`${title} End Time`} updatePickupLocation={actions.update} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="PO Number"
            value={pnonumber || ''}
            onChange={(e) => dispatch(actions.setPoNumber(e.target.value))}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label={`${title} Number`}
            name={locationType === 'pickup' ? 'pickupNumber' : 'deliveryNumber'}
            value={(locationData as any)[locationType === 'pickup' ? 'pickupNumber' : 'deliveryNumber'] || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FloatInput
            fullWidth
            label="Weight"
            name="weight"
            value={String(locationData.weight)}
            onChange={(value) => handleChange({ target: { name: "weight", value } } as any)}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Case Count"
            name="casecount"
            type="number"
            value={locationData.casecount || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Pallete Count"
            name="palletcount"
            type="number"
            value={locationData.palletcount || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Driver Instructions"
            placeholder="Enter additional details..."
            name="notes"
            value={locationData.notes || ''}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Warehouse Instructions"
            placeholder="Enter additional details..."
            name="wherehouseInstructions"
            value={locationData.wherehouseInstructions || ''}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1">Location Requirements</Typography>
          </Box>
          <FormGroup row>
            {locationRequirement.map((requirement) => (
              <FormControlLabel
                key={requirement.id}
                control={
                  <Checkbox
                    name={requirement.name}
                    checked={locationData.requirements?.includes(requirement.name) || false}
                    onChange={() => handleRequirementChange(requirement.name)}
                  />
                }
                label={requirement.name}
                sx={{ mr: 3 }}
              />
            ))}
          </FormGroup>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LocationForm;
