import { ILocationWithIds } from '@/types';
import { useDispatch } from 'react-redux';
import CustomDatePicker from './CommonDatePicker';

interface TimeRangePickerProps {
  pickup: ILocationWithIds;
  index: number;
  name: string;
  label: string;
  updateDeliveryLocation?: any;
  updatePickupLocation?: any;
}

const TimeRangePicker = ({
  pickup,
  index,
  name,
  label,
  updateDeliveryLocation,
  updatePickupLocation,
}: TimeRangePickerProps) => {
  const dispatch = useDispatch();

  const handleChange = (e: any) => {
    const formattedValue = e.target.value || '';
    const updatedPickupInfo = { ...pickup, [name]: formattedValue };

    if (updatePickupLocation) {
      dispatch(updatePickupLocation({ index, ...updatedPickupInfo }));
    } else if (updateDeliveryLocation) {
      dispatch(updateDeliveryLocation({ index, ...updatedPickupInfo }));
    }
  };

  // Returns the current time value (string)
  const getValue = () => {
    const timeValue = name === 'time' ? pickup.time : pickup.endTime;
    return timeValue || '';
  };

  return (
    <CustomDatePicker
      name={name}
      label={label}
      value={getValue()}
      onChange={handleChange}
      isTimePicker={true}
      size="small"
      isMobileTimePicker={true}
    />
  );
};

export default TimeRangePicker;
