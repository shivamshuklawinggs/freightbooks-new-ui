import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Modal,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { IContactPerson } from '@/types';
import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { setCustomerContactPerson } from '@/redux/Slice/loadSlice';
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
  const { customerId } = useSelector((state: RootState) => state.load);

  const onSubmit = async (data: Omit<IContactPerson, '_id'>) => {
    try {
      const isValid = data.name?.trim();
      if (!isValid || !customerId) {
        toast.error("Invalid contact or missing customer.");
        return;
      }

      // Call API to add contact
      const response = await apiService.addContactPerson(customerId, data);
      const newContactId = response.data._id;

      // Set to Redux
      dispatch(setCustomerContactPerson(newContactId));

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
          p: 0,
          width: 440,
          borderRadius: 2,
          outline: 'none',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2}>
          <Typography variant="h6" fontWeight={600}>Add New Contact</Typography>
          <IconButton size="small" onClick={toggleAddNew}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Divider />
        <Box px={3} py={2.5}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
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
                  size="small"
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
                  size="small"
                  sx={{ mb: 2 }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
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
                  label="Extension No"
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  onKeyDown={preventStringInput}
                  error={!!errors.extentionNo}
                  helperText={errors.extentionNo?.message}
                />
              )}
            />
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" onClick={toggleAddNew}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>Add Contact</Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ContactFormModal;
