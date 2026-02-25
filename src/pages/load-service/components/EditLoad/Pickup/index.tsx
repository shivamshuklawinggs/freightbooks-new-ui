// Pickup.jsx
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  addPickupLocation, 
} from "@/redux/Slice/EditloadSlice";
import PickupLocation from "./PickupLocation";
import { AppDispatch, RootState } from "@/redux/store";
import { IPickupLocation } from "@/types";
import { Typography, Button, Box } from "@mui/material";
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { getIcon } from "@/components/common/icons/getIcon";

const Pickup :FC= () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pickupLocationId } = useSelector((state:RootState) => state.editload);
  const search = useSelector((state:RootState) => state.location.search);

  const { data: locations } = useQuery({
    queryKey: ['locations', 'pickup', search],
    queryFn: () => apiService.getLocations('pickup', search),
  });

  useEffect(() => {
    if (locations) {
      // You might want to dispatch an action to set the locations in your Redux store
      // For example: dispatch(setPickupLocations(locations.data));
    }
  }, [locations, dispatch]);

  return (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        Pickup Information
      </Typography>
      {pickupLocationId.map((pickup:IPickupLocation, index:number) => (
        <PickupLocation
        key={ index} // Add unique key
          index={index}
          pickup={pickup}
          onRemove={pickupLocationId.length > 1 ? true : false}
        />
      ))}

      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={getIcon("plus")}
          onClick={() => dispatch(addPickupLocation())}
        >
         {getIcon("plus")}Add Another Pickup Location
        </Button>
      </Box>
    </>
  );
};

export default Pickup;