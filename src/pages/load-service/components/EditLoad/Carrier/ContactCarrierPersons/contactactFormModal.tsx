import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Modal,
  Button,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { IContactPerson } from '@/types';
import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { setCarrierContactPerson } from '@/redux/Slice/EditloadSlice';
interface ContactFormModalProps {
  isAddingNew: boolean;
  toggleAddNew: () => void;
  onSuccess: (Customerid: string) => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isAddingNew,
  toggleAddNew,
  onSuccess
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<IContactPerson, '_id'>>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      extentionNo: ''
    },
  });
  const dispatch = useDispatch<AppDispatch>();
  const { carrierIds } = useSelector((state: RootState) => state.editload);

  const onSubmit = async (data: Omit<IContactPerson, '_id'>) => {
    try {
      const isValid = data.name?.trim();
      if (!isValid || !carrierIds.carrier) {
        toast.error("Invalid contact or missing carrier.");
        return;
      }

      // Call API to add contact
      const response = await apiService.ContactCarrier.addContactPerson(carrierIds.carrier, data);
      const newContactId = response.data._id;

      // Set to Redux
      dispatch(setCarrierContactPerson(newContactId));

      toast.success("Contact added successfully");
      reset()
      onSuccess(newContactId)
    } catch (error: any) {
      toast.error(error.message || "Failed to add contact");
    }

  };

  return (
    <Modal open={isAddingNew} onClose={toggleAddNew}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3,
          width: 400,
        }}
      >
        <Typography variant="h6" mb={2}>
          Add New Contact
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                name="phone"
                label="Phone"
                fullWidth
                sx={{ mb: 2 }}
                onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                onChange={(e) => {
                  maxinputAllow(e as unknown as React.ChangeEvent<HTMLInputElement>, 10);
                  field.onChange(e);
                }}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
          <Controller
            name="extentionNo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                name="extentionNo"
                label="Extention No"
                fullWidth
                sx={{ mb: 2 }}
                  onKeyDown={preventStringInput}
                error={!!errors.extentionNo}
                helperText={errors.extentionNo?.message}
              />
            )}
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button type="submit" variant="contained" onClick={handleSubmit(onSubmit)} color="primary">
              Add Contact
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default ContactFormModal;
