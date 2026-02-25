import { Box, Button, TextField, Typography, Tabs, Tab, Avatar, IconButton } from '@mui/material'
import  { useState } from 'react'
import apiService from '@/service/apiService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Note {
  _id: string;
  note: string;
  updatedBy: {
    name: string;
    email: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  updatedAt: string;
}
interface NotesProps {
    id: string;
    OnSuccess?: () => Promise<void>;
}
const NotesSection = ({id,OnSuccess}: NotesProps) => {
    const {user}=useSelector((state:RootState)=>state.user)
    const [newNote, setNewNote] = useState<string>('');
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const queryClient = useQueryClient();

    const { data: notesData = [], isLoading: isFetchingNotes } = useQuery<Note[]>({ 
        queryKey: ['notes', id], 
        queryFn: async () => {
            const response = await apiService.getNotes(id);
            return response.data || [];
        },
        enabled: !!id,
    });

    const addNoteMutation = useMutation({
        mutationFn: (noteData: { note: string; createdBy: { name: string | undefined; email: string | undefined; }; }) => apiService.createNotes(id, noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', id] });
            setNewNote('');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add note');
        }
    });

    const updateNoteMutation = useMutation({
        mutationFn: ({ noteId, updatedFields }: { noteId: string, updatedFields: { note: string } }) => apiService.updateNotes(noteId, updatedFields),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', id] });
            setEditingNote(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update note');
        }
    });

    const deleteNoteMutation = useMutation({
        mutationFn: (noteId: string) => apiService.deleteNotes(noteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', id] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete note');
        }
    });

    const addNote = async () => {
      if (newNote?.trim()) {
        const newNoteData = {
          note: newNote,
          createdBy: {
              name:user?.name,
              email:user?.email,
            },
        };
        addNoteMutation.mutate(newNoteData);
      }
    };
  
    const updateNote = async (_id: string, updatedFields: { note: string }) => {
        updateNoteMutation.mutate({ noteId: _id, updatedFields });
    };
  
    const deleteNote = async (_id: string) => {
      const prompt = confirm("Are You Sure You want to delete");
      if (!prompt) return;
      deleteNoteMutation.mutate(_id);
    };
    const handleEditClick = (note: Note) => {
      setEditingNote(note);
    };
  
    const handleUpdateClick = () => {
      if (editingNote) {
        updateNote(editingNote._id, { note: editingNote.note });
      }
    };

  return (
    <>
    <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1">Add New Note</Typography>
    <TextField
      multiline
      rows={4}
      placeholder="Enter your note here..."
      value={newNote}
      onChange={(e) => setNewNote(e.target.value)}
      fullWidth
      sx={{ mt: 1 }}
    />
  
    <Button variant="contained" className="view-load__create-btn" sx={{ mt: 2 }} onClick={addNote} disabled={addNoteMutation.isPending}>
      Add Note
    </Button>
  </Box>
  <Tabs value="notes"  sx={{ mt: 3 }}>
    <Tab label="Notes" value="notes" />
  </Tabs>
    <Box className="notes-container" sx={{ mt: 2 }}>
      {isFetchingNotes ? <p>Loading...</p> : notesData?.map((note) => (
        <Box key={note._id} className="note-card" sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={`https://ui-avatars.com/api/?name=${note.createdBy?.name}&background=random&color=fff`}
              alt="User"
              sx={{ mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" className="note-author">
               {note.createdBy?.name} 
              </Typography>
              {editingNote?._id === note._id ? (
                <TextField
                  multiline
                  rows={2}
                  value={editingNote.note}
                  onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {note.note}
                </Typography>
              )}
              <Typography variant="caption" className="note-datetime">
                {moment(note.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}
              </Typography>
            </Box>
            {editingNote?._id === note._id ? (
              <Button variant="contained" sx={{ ml: 2 }} onClick={handleUpdateClick} disabled={updateNoteMutation.isPending}>
                Update
              </Button>
            ) : (
              <IconButton onClick={() => handleEditClick(note)} disabled={deleteNoteMutation.isPending || updateNoteMutation.isPending || addNoteMutation.isPending}>
                <EditIcon />
              </IconButton>
            )}
            <IconButton onClick={() => deleteNote(note._id)} disabled={deleteNoteMutation.isPending || updateNoteMutation.isPending || addNoteMutation.isPending}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
 
  </>
  )
}

export default NotesSection