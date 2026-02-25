import React, {  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setCarrierContactPerson } from '@/redux/Slice/EditloadSlice';
import { IContactPerson } from '@/types';
import apiService from '@/service/apiService';
import {
  Paper,
  Stack,
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


const ContactCarrierPersons: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {carrierIds } = useSelector((state: RootState) => state.editload);
  const queryClient = useQueryClient();

  const [isAddingNew, setIsAddingNew] = useState(false);

  const { data: contactPersons = [] } = useQuery<IContactPerson[]>({
    queryKey: ['contactCarriers', carrierIds.carrier],
    queryFn: async () => {
      if (!carrierIds.carrier) return [];

      try {
        const response = await apiService.ContactCarrier.getAllContactPerson(carrierIds.carrier);
        return response.data || [];
      } catch (error) {
        toast.error("Failed to fetch contacts");
        return [];
      }
    },
    enabled: !!carrierIds.carrier,
  });

  const { data: selectedContact } = useQuery<IContactPerson | null>({
    queryKey: ['contactCarrier', carrierIds.contactPerson],
    queryFn: async () => {
      if (!carrierIds.contactPerson) return null;
      try {
        const response = await apiService.ContactCarrier.getSingleContactPerson(carrierIds.contactPerson);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!carrierIds.contactPerson,
  });


  const handleSelectContact = (e: SelectChangeEvent<string>) => {
    const contactId = e.target.value;

    if (!contactId) {
      setIsAddingNew(true);
      dispatch(setCarrierContactPerson(null));
    } else {
      setIsAddingNew(false);
      dispatch(setCarrierContactPerson(contactId));
    }
  };

  const toggleAddNew = () => {
    setIsAddingNew(!isAddingNew);
    dispatch(setCarrierContactPerson(null));
  };
  const onSuccess=async(contactId:string)=>{
    setIsAddingNew(false);
    dispatch(setCarrierContactPerson(contactId));
    await queryClient.invalidateQueries({ queryKey: ['contactCarriers', carrierIds.carrier] });
  }

  return (
    <>
      <Grid item xs={12} md={!carrierIds.contactPerson?6:3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.default',
            height: '100%'
          }}
        >
          <Stack spacing={1}>

            <FormControl fullWidth >
              <InputLabel id="contact-select-label">Select Contact</InputLabel>
              <Select
                labelId="contact-select-label"
                name="customerContactPerson"
                value={carrierIds.contactPerson || ''}
                onChange={(e)=>{
                  handleSelectContact(e)
                }}
                label="Select Contact"
              >
                
                <MenuItem value="" onClick={()=>{
                    setIsAddingNew(true);
                    dispatch(setCarrierContactPerson(null));
                }} >
                  <Typography
                    variant="body2"
                    color={isAddingNew ? "primary" : "textSecondary"}
                    sx={{ cursor: 'pointer' }}
                  >
                    {isAddingNew ? "✓ Adding new contact" : "+ Add new contact"}
                  </Typography>
                </MenuItem>
                {contactPersons.length > 0 && (
                  contactPersons.map((person) => (
                    <MenuItem 
                      key={person._id} 
                      value={person._id}
                    >
                      {person.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Grid>

      {/* Contact Form Modal - Moved outside of layout components */}
      <ContactactFormModal
        isAddingNew={isAddingNew}
        toggleAddNew={toggleAddNew}
        onSuccess={onSuccess}
      />

      {
        selectedContact && <>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '100%'
              }}
            >
              <Stack spacing={1}>
                
                <TextField
                  fullWidth
                  
                  label="Email"
                  value={selectedContact?.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '100%'
              }}
            >
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  
                  label="Phone"
                  value={selectedContact?.phone || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              
              </Stack>
            </Paper>
          </Grid>
        </>
      }
    </>

  );
};
export default ContactCarrierPersons
