import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IPickupLocation } from "@/types";
import LocationForm from "../../common/LocationForm";
import { removePickupLocation, updatePickupLocation, addPickupLocation, setCustomerPnonumber } from "@/redux/Slice/EditloadSlice";

interface PickupLocationProps {
  index: number;
  pickup: IPickupLocation;
  onRemove: boolean;
}

const PickupLocation: FC<PickupLocationProps> = ({ index, pickup, onRemove }) => {
  const { pnonumber } = useSelector((state: RootState) => state.editload);

  const pickupActions = {
    remove: removePickupLocation,
    update: updatePickupLocation,
    add: addPickupLocation,
    setPoNumber: setCustomerPnonumber,
  };

  return (
    <LocationForm
      index={index}
      locationData={pickup}
      onRemove={onRemove}
      locationType="pickup"
      actions={pickupActions}
      pnonumber={pnonumber}
      sliceName="editload"
    />
  );
};

export default PickupLocation;