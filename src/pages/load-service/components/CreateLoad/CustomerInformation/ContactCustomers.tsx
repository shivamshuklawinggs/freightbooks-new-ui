import React, {  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setCustomerContactPerson } from '@/redux/Slice/loadSlice';
import { IContactPerson } from '@/types';
import apiService from '@/service/apiService';
import {
  Typography,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { toast } from 'react-toastify';
import ContactactFormModal from './contactactFormModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';


const ContactCustomers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customerId, customerContactPerson } = useSelector((state: RootState) => state.load);
  const queryClient = useQueryClient();

  const [isAddingNew, setIsAddingNew] = useState(false);

  const { data: contactPersons = [] } = useQuery<IContactPerson[]>({
    queryKey: ['contactPersons', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      try {
        const response = await apiService.getAllContactPerson(customerId);
        return response.data || [];
      } catch (error) {
        toast.error("Failed to fetch contacts");
        return [];
      }
    },
    enabled: !!customerId,
  });

  const { data: selectedContact } = useQuery<IContactPerson | null>({
    queryKey: ['contactPerson', customerContactPerson],
    queryFn: async () => {
      if (!customerContactPerson) return null;
      try {
        const response = await apiService.getSingleContactPerson(customerContactPerson);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!customerContactPerson,
  });


  const handleSelectContact = (e: SelectChangeEvent<string>) => {
    const contactId = e.target.value;

    if (!contactId) {
      setIsAddingNew(true);
      dispatch(setCustomerContactPerson(null));
    } else {
      setIsAddingNew(false);
      dispatch(setCustomerContactPerson(contactId));
    }
  };

  const toggleAddNew = () => {
    setIsAddingNew(!isAddingNew);
    dispatch(setCustomerContactPerson(null));
  };
  const onSuccess=async(contactId:string)=>{
    setIsAddingNew(false);
    dispatch(setCustomerContactPerson(contactId));
    await queryClient.invalidateQueries({ queryKey: ['contactPersons', customerId] });
  }

  return (
    <>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="contact-select-label">Select Contact</InputLabel>
          <Select
            labelId="contact-select-label"
            name="customerContactPerson"
            value={customerContactPerson || ''}
            onChange={handleSelectContact}
            label="Select Contact"
          >
            <MenuItem value="" onClick={() => {
              setIsAddingNew(true);
              dispatch(setCustomerContactPerson(null));
            }}>
              <Typography
                variant="body2"
                color={isAddingNew ? 'primary' : 'textSecondary'}
                sx={{ cursor: 'pointer' }}
              >
                {isAddingNew ? '✓ Adding new contact' : '+ Add new contact'}
              </Typography>
            </MenuItem>
            {contactPersons.map((person) => (
              <MenuItem key={person._id} value={person._id}>
                {person.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <ContactactFormModal
        isAddingNew={isAddingNew}
        toggleAddNew={toggleAddNew}
        onSuccess={onSuccess}
      />

      {selectedContact && (
        <>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Contact Email"
              value={selectedContact?.email || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Contact Phone"
              value={selectedContact?.phone || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
        </>
      )}
    </>
  );
};
export default ContactCustomers
