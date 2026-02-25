import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IDeliveryLocation } from "@/types";
import LocationForm from "../../common/LocationForm";
import { removeDeliveryLocation, updateDeliveryLocation, addDeliveryLocation, setCustomerPnonumber } from "@/redux/Slice/loadSlice";

interface DeliveryLocationProps {
  index: number;
  pickup: IDeliveryLocation;
  onRemove: boolean;
}

const DeliveryLocation: FC<DeliveryLocationProps> = ({ index, pickup, onRemove }) => {
  const { pnonumber } = useSelector((state: RootState) => state.load);

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
      sliceName="load"
    />
  );
};

export default DeliveryLocation;
