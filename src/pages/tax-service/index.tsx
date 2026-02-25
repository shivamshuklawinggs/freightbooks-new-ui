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
   <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h5"></Typography>
      <HasPermission action="create" resource={["accounting"]} component={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleModalShow}
        >
          Add New
        </Button>
      }/>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) :Array.isArray(data) && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>No tax options found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item:ITaxOption) => (
                <TableRow key={item._id}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <HasPermission action="update" resource={["accounting"]} component={
                      <IconButton 
                        color="primary" 
                         
                        onClick={() => handleEdit(item)}
                      >
                       {getIcon("edit")}
                      </IconButton>
                      }/>
                       <IconButton 
                        color="error" 
                        onClick={() => item._id && handleDelete(item._id)}
                      >
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
      <TaxForm 
        showModal={showModal}
        handleModalClose={handleModalClose}
        editingItem={editingItem}
  
      />
     
    </Box>
  );
};

export default withPermission("view",["accounting"])(TaxServicesList);