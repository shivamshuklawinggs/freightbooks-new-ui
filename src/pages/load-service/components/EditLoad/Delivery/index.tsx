// Delivery.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addDeliveryLocation,
} from "@/redux/Slice/EditloadSlice";
import DeliveryLocation from "./DeliveryLocation";
import { RootState, AppDispatch } from "@/redux/store";
import {  Box, Button } from "@mui/material";
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import LoadTermsAndCondition from "@/components/common/LoadTermsAndCondition";
import { getIcon } from "@/components/common/icons/getIcon";


const Delivery: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveryLocationId } = useSelector((state: RootState) => state.editload);
  const search = useSelector((state: RootState) => state.location.search);
  const { data: locations } = useQuery({
    queryKey: ['locations', 'delivery', search],
    queryFn: () => apiService.getLocations('delivery', search),
  });

  useEffect(() => {
    if (locations) {
      // You might want to dispatch an action to set the locations in your Redux store
      // For example: dispatch(setDeliveryLocations(locations.data));
    }
  }, [locations, dispatch]);

  return (
    <>
      {deliveryLocationId.map((pickup, index) => (
        <DeliveryLocation
          key={index}
          index={index}
          pickup={pickup}
          onRemove={deliveryLocationId.length > 1 ? true : false}

        />
      ))}
       <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={getIcon("plus")}
          onClick={() => dispatch(addDeliveryLocation())}
        >
          {getIcon("plus")} Add Another Delivery  Location
        </Button>
      </Box>
      <Box  mb={2}>
      <LoadTermsAndCondition type="editload" handleAddDelivery={() => dispatch(addDeliveryLocation())} />
      </Box>
     
    </>
  );
};

export default Delivery;