// Pickup.jsx
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  addPickupLocation, 
} from "@/redux/Slice/loadSlice";
import PickupLocation from "./PickupLocation";
import { AppDispatch, RootState } from "@/redux/store";
import { IPickupLocation } from "@/types";
import { Typography, Button, Box } from "@mui/material";
import { fetchLocations } from "@/redux/api";
import { getIcon } from "@/components/common/icons/getIcon";

const Pickup :FC= () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pickupLocationId } = useSelector((state:RootState) => state.load);
  const search = useSelector((state:RootState) => state.location.search);
  useEffect(() => {
    dispatch(fetchLocations({ type: "pickup" }));
  }, [search]);

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
          {getIcon("plus")} Add Another Pickup Location
        </Button>
      </Box>
    </>
  );
};

export default Pickup;