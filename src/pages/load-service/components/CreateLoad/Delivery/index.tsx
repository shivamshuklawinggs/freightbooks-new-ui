// Delivery.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  addDeliveryLocation, 
} from "@/redux/Slice/loadSlice";
import DeliveryLocation from "./DeliveryLocation";
import { RootState, AppDispatch } from "@/redux/store";
import {  Box, Button,  } from "@mui/material";
import { fetchLocations } from "@/redux/api";
import LoadTermsAndCondition from "@/components/common/LoadTermsAndCondition";
import { getIcon } from "@/components/common/icons/getIcon";


const Delivery:React.FC  = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveryLocationId } = useSelector((state:RootState) => state.load);
  /**
   * description: fetch delivery locations
   * @param type delivery
   * @returns void
   * @author Shivam Shukla
   * @date 2025-05-22
   */
  const search = useSelector((state:RootState) => state.location.search);
  useEffect(() => {
    dispatch(fetchLocations({ type: "delivery" }));
  }, [search]);

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