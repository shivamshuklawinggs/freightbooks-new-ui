import React, { useEffect } from 'react'
import { FormControl, TextField, Autocomplete } from '@mui/material'
import { initalLoadData } from '@/redux/InitialData/Load';
import { useDispatch, useSelector } from 'react-redux';
import { IPickupLocation } from '@/types';
import { AppDispatch, RootState } from '@/redux/store';
import { setLocationSearch } from '@/redux/Slice/locationSLlce';
import useDebounce from '@/hooks/useDebounce';
import { toast } from 'react-toastify';


interface LocationSelectProps {
  index: number;
  updateLocation: any;
}

const DeliveryLocationSelect: React.FC<LocationSelectProps> = ({index, updateLocation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locations, loading } = useSelector((state:RootState) => state.location);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);


  const handleLocationUpdate = (event: React.SyntheticEvent, location: IPickupLocation | null) => {
    try {
      if (!location) {
        dispatch(updateLocation({ index, ...initalLoadData.pickupLocationId[0] }));
        return;
      }

      const updateData:IPickupLocation = {
        index,
        ...initalLoadData.pickupLocationId[0],
        address: location.address || "",
        city: location.city || "",
        state: location.state || "",
        zipcode: location.zipcode || "",
        country: location.country || "",
        locationClass: location.locationClass || "",
        requirements: location.requirements || [],
        checkin: null,
        checkout: null,
        time:location.time,
        endTime:location.endTime,
        warehouse:location.warehouse
      };
      dispatch(updateLocation(updateData));
    } catch (error:any) {
      toast.error(error.message)
      console.warn("Error updating location", error);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    dispatch(setLocationSearch(debouncedSearch));
  }, [debouncedSearch]);

  return (
    <FormControl fullWidth>
      <Autocomplete
        options={locations as IPickupLocation[]}
        loading={loading}
        getOptionLabel={(option: IPickupLocation) => 
          `${option.warehouse}, Address-${option.address}${option.city ? ` - ${option.city}` : ''}${option.state ? ` - ${option.state}` : ''}${option.zipcode ? ` - ${option.zipcode}` : ''}`
        }
        onChange={handleLocationUpdate}
        onInputChange={(event, newInputValue) => {
         setSearch(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Search Location"
            variant="outlined"
          />
        )}
      />
    </FormControl>
  );
};

export default DeliveryLocationSelect