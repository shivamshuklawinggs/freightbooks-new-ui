import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Modal,
  Button,
  Grid,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { maxinputAllow, preventInvalidPhone, preventStringInput } from '@/utils';
import apiService from '@/service/apiService';
import { UpdateContactListProps } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Using the Contact interface from types
import { Contact } from '@/types';

const UpdateContactList: React.FC<UpdateContactListProps> = ({ customerId }) => {
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', extentionNo: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading, isError, refetch } = useQuery<Contact[]>({ 
    queryKey: ['contacts', customerId], 
    queryFn: async () => {
      if (!customerId) return [];
      const response = await apiService.getAllContactPerson(customerId);
      return response.data || [];
    },
    enabled: !!customerId 
  });

  const addContactMutation = useMutation({
    mutationFn: (contact: any) => apiService.addContactPerson(customerId, contact),
    onSuccess: () => {
      toast.success('Contact added successfully');
      queryClient.invalidateQueries({ queryKey: ['contacts', customerId] });
      setIsAddingNew(false);
      setNewContact({ name: '', email: '', phone: '', extentionNo: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add contact');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (contact: Contact) => apiService.updateContactPerson(contact._id!, contact),
    onSuccess: () => {
      toast.success('Contact updated successfully');
      queryClient.invalidateQueries({ queryKey: ['contacts', customerId] });
      setEditingContact(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update contact');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => apiService.deleteContactPerson(contactId),
    onSuccess: () => {
      toast.success('Contact removed successfully');
      queryClient.invalidateQueries({ queryKey: ['contacts', customerId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove contact');
    },
  });

  const validateContact = (contact: { name: string; }) => {
    if (!contact.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    return true;
  };

  const handleAddContact = async (): Promise<void> => {
    if (!validateContact(newContact)) return;
    addContactMutation.mutate(newContact);
  };

  const handleEditContact = (contact: Contact): void => {
    setEditingContact({ ...contact });
  };

  const handleUpdateContact = async (): Promise<void> => {
    if (!editingContact) return;
    if (!validateContact(editingContact)) return;
    updateContactMutation.mutate(editingContact);
  };

  const handleCancelEdit = (): void => {
    setEditingContact(null);
  };

  const handleRemoveContact = async (contactId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    if (editingContact) {
      setEditingContact({ ...editingContact, [name]: value });
    } else {
      setNewContact({ ...newContact, [name]: value });
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" color="primary">
            {/* Contact Persons */}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingNew(true)}
            disabled={isLoading || addContactMutation.isPending}
            
          >
            Add Contact
          </Button>
        </Box>
        <Divider />
      </Grid>

      {/* Loading and Error States */}
      {isLoading && (
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={40} />
          </Box>
        </Grid>
      )}

      {isError && !isLoading && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load contacts
            <Button onClick={() => refetch()} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        </Grid>
      )}

      {/* Contacts Table */}
      {!isLoading && !isError && (
        <Grid item xs={12}>
          {contacts.length > 0 ? (
            <TableContainer component={Paper} elevation={1}>
              <Table >
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell width="30%"><Typography fontWeight="bold">Name</Typography></TableCell>
                    <TableCell width="30%"><Typography fontWeight="bold">Email</Typography></TableCell>
                    <TableCell width="25%"><Typography fontWeight="bold">Phone</Typography></TableCell>
                    <TableCell width="25%"><Typography fontWeight="bold">Extention No</Typography></TableCell>
                    <TableCell width="15%" align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id} hover>
                      <TableCell>
                        {editingContact && editingContact._id === contact._id ? (
                          <TextField
                            fullWidth
                            
                            name="name"
                            value={editingContact.name}
                            onChange={handleContactChange}
                            required
                          />
                        ) : (
                          <Box display="flex" alignItems="center">
                            {/* <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> */}
                            <Typography>{contact.name}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingContact && editingContact._id === contact._id ? (
                          <TextField
                            fullWidth
                            
                            name="email"
                            type="email"
                            value={editingContact.email}
                            onChange={handleContactChange}
                          />
                        ) : (
                          <Box display="flex" alignItems="center">
                            {/* <EmailIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} /> */}
                            <Typography>{contact.email || '-'}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingContact && editingContact._id === contact._id ? (
                          <TextField
                            fullWidth
                            
                            name="phone"
                            value={editingContact.phone}
                            onChange={(e) => {
                              maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
                              handleContactChange(e as ChangeEvent<HTMLInputElement>);
                            }}
                            onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>)=>preventInvalidPhone(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                          />
                        ) : (
                          <Box display="flex" alignItems="center">
                            {/* <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> */}
                            <Typography>{contact.phone || '-'}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingContact && editingContact._id === contact._id ? (
                          <TextField
                            fullWidth
                            
                            name="extentionNo"
                            value={editingContact.extentionNo}
                            onChange={(e) => {
                              maxinputAllow(e as ChangeEvent<HTMLInputElement>, 10);
                              handleContactChange(e as ChangeEvent<HTMLInputElement>);
                            }}
                            onKeyDown={preventStringInput}
                          />
                        ) : (
                          <Box display="flex" alignItems="center">
                            {/* <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> */}
                            <Typography>{contact.extentionNo || '-'}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingContact && editingContact._id === contact._id ? (
                          <Box>
                            <Tooltip title="Save">
                              <IconButton
                                color="primary"
                                
                                onClick={handleUpdateContact}
                                disabled={updateContactMutation.isPending}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                color="default"
                                
                                onClick={handleCancelEdit}
                                disabled={updateContactMutation.isPending}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                
                                onClick={() => handleEditContact(contact)}
                                disabled={isLoading || !!editingContact}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                
                                onClick={() => contact._id && handleRemoveContact(contact._id)}
                                disabled={isLoading || !!editingContact || !contact._id}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No contacts added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add contacts to manage customer communication
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddingNew(true)}
                >
                  Add First Contact
                </Button>
              </CardActions>
            </Card>
          )}
        </Grid>
      )}

      {/* Add Contact Modal */}
      <Modal 
        open={isAddingNew} 
        onClose={() => setIsAddingNew(false)}
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            width: 400,
            maxWidth: '90%',
            borderRadius: 2,
            boxShadow: 24
          }}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddContact();
          }}>
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
              autoFocus
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
              onKeyDown={preventStringInput}
              onChange={handleContactChange}
              sx={{ mb: 2 }}
            />
          
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                onClick={() => setIsAddingNew(false)}
                disabled={addContactMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                disabled={addContactMutation.isPending || !newContact.name.trim()}
                startIcon={addContactMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Modal>
    </Grid>
  );
};

export default UpdateContactList;