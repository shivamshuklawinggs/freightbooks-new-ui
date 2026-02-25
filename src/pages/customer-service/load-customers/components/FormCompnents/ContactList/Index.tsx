import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Modal,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';
import { ContactListProps, Contact, BaseContactListState } from '@/types';

const ContactList: React.FC<ContactListProps> = ({ control, setValue, watch, errors }) => {
  const [state, setState] = useState<BaseContactListState>({
    contacts: [],
    newContact: { name: '', email: '', phone: '', extentionNo: '' },
    isAddingNew: false,
    isLoading: false,
    selectedContactId: '',
    isEditing: false,
    editingContact: null
  });

  const { contacts, newContact, isAddingNew, isLoading, selectedContactId, isEditing, editingContact } = state;

  const handleAddContact = (): void => {
    const { name, email, phone } = newContact;
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format');
      return;
    }
    if (contacts.some(contact => contact.email === email)) {
      toast.error('Email already exists');
      return;
    }

    if (contacts.some(contact => contact.phone === phone)) {
      toast.error('Phone number already exists');
      return;
    }

    const newContactObj: Contact = {
      ...newContact,
      id: Date.now().toString() + Math.random().toString(),
    };

    const updatedContacts = [...contacts, newContactObj];
    setState(prev => ({
      ...prev,
      contacts: updatedContacts,
      newContact: { name: '', email: '', phone: '', extentionNo: '' },
      isAddingNew: false,
      selectedContactId: newContactObj.id || ''
    }));
    setValue('contactPersons', updatedContacts);
  };

  const handleRemoveContact = (contactId: string): void => {
    if (contactId) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setState(prev => ({
        ...prev,
        contacts: updatedContacts,
        selectedContactId: ''
      }));
      setValue('contactPersons', updatedContacts);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      newContact: { ...prev.newContact, [name]: value }
    }));
  };

  const handleEditContact = (contact: Contact): void => {
    setState(prev => ({
      ...prev,
      editingContact: { ...contact },
      isEditing: true
    }));
  };

  const handleUpdateContact = (): void => {
    if (!editingContact) return;

    const { name, email, phone } = editingContact;
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format');
      return;
    }

    const otherContacts = contacts.filter(c => c.id !== editingContact.id);
    if (otherContacts.some(contact => contact.email === email)) {
      toast.error('Email already exists');
      return;
    }

    if (otherContacts.some(contact => contact.phone === phone)) {
      toast.error('Phone number already exists');
      return;
    }

    const updatedContacts = contacts.map(contact =>
      contact.id === editingContact.id ? editingContact : contact
    );

    setState(prev => ({
      ...prev,
      contacts: updatedContacts,
      isEditing: false,
      editingContact: null,
      selectedContactId: editingContact.id || ''
    }));
    setValue('contactPersons', updatedContacts);
  };

  const handleEditingContactChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (!editingContact) return;
    setState(prev => ({
      ...prev,
      editingContact: { 
        ...prev.editingContact, 
        [name]: value || '' 
      } as Contact
    }));
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  return (
    <Grid container spacing={2}>
      {contacts.length > 0 && (
        <>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Contact Persons</InputLabel>
              <Select
                label="Contact Persons"
                value={selectedContactId}
                onChange={(e) => setState(prev => ({ ...prev, selectedContactId: e.target.value }))}
                disabled={isLoading}
              >
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Box>
                        <Typography fontWeight="bold">{contact.name}</Typography>
                      </Box>

                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3.5}>
            <TextField
              value={selectedContact?.email || ''}
              fullWidth
              label="Contact Email"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={3.5}>
            <TextField
              value={selectedContact?.phone || ''}
              fullWidth
              label="Contact Phone"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={3.5}>
            <TextField
              value={selectedContact?.extentionNo || ''}
              fullWidth
              label="Contact Extention No"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={1} sx={{
            justifyContent: "center",
            alignContent: "center",
            display: "flex",
            gap: 1
          }}>
            <Button
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedContact) {
                  handleEditContact(selectedContact);
                }
              }}
            >
              Edit
            </Button>
            <Button
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedContact?.id) {
                  handleRemoveContact(selectedContact.id);
                }
              }}
            >
              Remove
            </Button>
          </Grid>

        </>
      )}

      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setState(prev => ({ ...prev, isAddingNew: true }))}
          disabled={isLoading}
        >
          Add Contact
        </Button>
      </Grid>

      <Modal open={isAddingNew} onClose={() => setState(prev => ({ ...prev, isAddingNew: false }))}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            width: 400,
            maxWidth: '90%',
          }}
        >
          <Typography variant="h6" mb={2}>
            Add New Contact
          </Typography>
          <TextField
            fullWidth
            label="Name *"
            name="name"
            value={newContact.name}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={newContact.email}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={newContact.phone}
            onChange={(e) => {
              maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
              handleContactChange(e as ChangeEvent<HTMLInputElement>);
            }}
            
            onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
            
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Extention No"
            name="extentionNo"
            value={newContact.extentionNo}
            onChange={handleContactChange}
            sx={{ mb: 2 }}
          />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setState(prev => ({ ...prev, isAddingNew: false }))}>Cancel</Button>
            <Button variant="contained" onClick={handleAddContact}>
              Add Contact
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal open={Boolean(isEditing)} onClose={() => setState(prev => ({ ...prev, isEditing: false, editingContact: null }))}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            width: 400,
            maxWidth: '90%',
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Contact
          </Typography>
          <TextField
            fullWidth
            label="Name *"
            name="name"
            value={editingContact?.name || ''}
            onChange={handleEditingContactChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={editingContact?.email || ''}
            onChange={handleEditingContactChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={editingContact?.phone || ''}
            onChange={(e) => {
              maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
              handleEditingContactChange(e as ChangeEvent<HTMLInputElement>);
            }}
            onKeyDown={preventStringInput}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Extension No"
            name="extentionNo"
            value={editingContact?.extentionNo || ''}
            onChange={handleEditingContactChange}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setState(prev => ({ ...prev, isEditing: false, editingContact: null }))}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateContact}>
              Update Contact
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Grid>
  );
};

export default ContactList;
