import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IDeliveryLocation } from "@/types";
import LocationForm from "../../common/LocationForm";
import { removeDeliveryLocation, updateDeliveryLocation, addDeliveryLocation, setCustomerPnonumber } from "@/redux/Slice/EditloadSlice";

interface DeliveryLocationProps {
  index: number;
  pickup: IDeliveryLocation;
  onRemove: boolean;
}

const DeliveryLocation: FC<DeliveryLocationProps> = ({ index, pickup, onRemove }) => {
  const { pnonumber } = useSelector((state: RootState) => state.editload);

  const deliveryActions = {
    remove: removeDeliveryLocation,
    update: updateDeliveryLocation,
    add: addDeliveryLocation,
    setPoNumber: setCustomerPnonumber,
  };

  return (
    <LocationForm
      index={index}
      locationData={pickup}
      onRemove={onRemove}
      locationType="delivery"
      actions={deliveryActions}
      pnonumber={pnonumber}
      sliceName="editload"
    />
  );
};

export default DeliveryLocation;
