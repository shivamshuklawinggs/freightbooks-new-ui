import React, { useState } from 'react';

import {toast} from "react-toastify"
import apiService from '@/service/apiService';
import { IitemService } from '@/types';
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,  Box,  CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ExpenseFessServiceForm from './ExpenseFessServiceForm';
import { useQuery } from '@tanstack/react-query';
import { HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';

const ItemServicesList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IitemService | null>(null);

  const { data: itemServices = [], isLoading, isError } = useQuery<IitemService[]>({ 
    queryKey: ['itemServices'], 
    queryFn: async () => {
      try {
        const response = await apiService.getItemServices();
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch item services');
        console.warn('Error:', error);
        return [];
      }
    } 
  });

  const handleModalShow = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleEdit = (item: IitemService) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // const handleDelete = async (id: string) => {
  //   if (window.confirm('Are you sure you want to delete this item service?')) {
  //     try {
  //       await apiService.deleteItemService(id);
  //       // fetchItemServices();
  //     } catch (error) {
  //       console.warn('Error:', error);
  //     }
  //   }
  // };

  return (
   <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h5"></Typography>
      <HasPermission resource={["expense_service"]} action="create" component={<Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleModalShow}
        >
          Add New
        </Button>}/>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
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
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>Failed to fetch item services</Typography>
                </TableCell>
              </TableRow>
            ) : itemServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>No item services found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              itemServices.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                       <VerticalMenu actions={
                        [
                          {
                            label:"Edit",
                            onClick:() => handleEdit(item),
                            icon:"edit"
                          },
                        
                        ]
                       }/>
                      {/* <IconButton 
                        color="error" 
                         
                        onClick={() => item._id && handleDelete(item._id)}
                      >
                        <FaTrash />
                      </IconButton> */}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    <ExpenseFessServiceForm
      showModal={showModal}
      handleModalClose={handleModalClose}
      editingItem={editingItem}
    />
  
    </Box>
  );
};

export default withPermission("view",["expense_service"])(ItemServicesList);