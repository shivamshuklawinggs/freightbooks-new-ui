import React, { useState } from 'react';

import {toast} from "react-toastify"
import apiService from '@/service/apiService';
import { IitemService } from '@/types';
import { Button, TableRow, TableCell, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ExpenseFessServiceForm from './ExpenseFessServiceForm';
import { useQuery } from '@tanstack/react-query';
import { HasPermission, withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { PageHeader, DataTable } from '@/components/ui';
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
      <PageHeader
        title="Expense & Fee Types"
        subtitle="Manage expense and fee categories"
        actions={
          <HasPermission resource={["expense_service"]} action="create" component={
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleModalShow} sx={{ borderRadius: 2 }}>
              Add New
            </Button>
          }/>
        }
      />

      <DataTable
        columns={[
          { key: 'label', label: 'Label' },
          { key: 'type', label: 'Type' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={itemServices}
        isLoading={isLoading}
        emptyMessage={isError ? 'Failed to fetch item services' : 'No expense types found'}
        renderRow={(item) => (
          <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ py: 1.25 }}>{item.label}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{item.value}</TableCell>
            <TableCell sx={{ py: 0.5 }}>
              <VerticalMenu actions={[
                { label: 'Edit', onClick: () => handleEdit(item), icon: 'edit' },
              ]}/>
            </TableCell>
          </TableRow>
        )}
      />
    <ExpenseFessServiceForm
      showModal={showModal}
      handleModalClose={handleModalClose}
      editingItem={editingItem}
    />
  
    </Box>
  );
};

export default withPermission("view",["expense_service"])(ItemServicesList);