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
   <Box sx={{ minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Expense & Fee Types</Typography>
          <Typography variant="body2" color="text.secondary">Manage expense and fee categories</Typography>
        </Box>
        <HasPermission resource={["expense_service"]} action="create" component={
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
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
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
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="error">Failed to fetch item services</Typography>
                  </TableCell>
                </TableRow>
              ) : itemServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No expense types found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                itemServices.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.25 }}>{item.label}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{item.value}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <VerticalMenu actions={[
                        { label: 'Edit', onClick: () => handleEdit(item), icon: 'edit' },
                      ]}/>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    <ExpenseFessServiceForm
      showModal={showModal}
      handleModalClose={handleModalClose}
      editingItem={editingItem}
    />
  
    </Box>
  );
};

export default withPermission("view",["expense_service"])(ItemServicesList);