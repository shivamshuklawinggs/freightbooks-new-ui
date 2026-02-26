import React, { useState } from 'react';


import apiService from '@/service/apiService';
import { ITaxOption } from '@/types';
import { 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Box, 
  IconButton, 
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import TaxForm from './TaxForm';
import { HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { toast } from 'react-toastify';
import { getIcon } from '@/components/common/icons/getIcon';




const TaxServicesList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ITaxOption | null>(null);



  const fetchItemServices = async () => {
    try {
      const response = await apiService.getTaxOptions();
      return response.data
    } catch (error) {
      console.warn('Error:', error);
      return []
    } 
  };

  const {data,isLoading,refetch}=useQuery({
    queryKey:['taxOptions'],
    queryFn:async()=>await fetchItemServices(),
  
  })
  const handleDelete = async (id: string) => {
     try {
        const confirmDelete = window.confirm('Are you sure you want to delete this tax option?');
    if (!confirmDelete) return;
        await  apiService.deleteTaxOption(id);
       refetch();
     } catch (error:any) {
      toast.error(error?.message || "Failed to delete tax option")
     }
  };

  const handleModalShow = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setEditingItem(null)
    setShowModal(false);
  };

  const handleEdit = (item: ITaxOption) => {
    setEditingItem(item);
    setShowModal(true);
  };
  return (
   <Box sx={{ minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tax Options</Typography>
          <Typography variant="body2" color="text.secondary">Manage tax rates and labels</Typography>
        </Box>
        <HasPermission action="create" resource={["accounting"]} component={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleModalShow} sx={{ borderRadius: 2 }}>
            Add New
          </Button>
        }/>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : Array.isArray(data) && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No tax options found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: ITaxOption) => (
                  <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.25 }}>{item.label}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{item.value}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box display="flex" gap={0.5}>
                        <HasPermission action="update" resource={["accounting"]} component={
                          <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                            {getIcon("edit")}
                          </IconButton>
                        }/>
                        <IconButton size="small" color="error" onClick={() => item._id && handleDelete(item._id)}>
                          {getIcon("delete")}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TaxForm 
        showModal={showModal}
        handleModalClose={handleModalClose}
        editingItem={editingItem}
  
      />
     
    </Box>
  );
};

export default withPermission("view",["accounting"])(TaxServicesList);