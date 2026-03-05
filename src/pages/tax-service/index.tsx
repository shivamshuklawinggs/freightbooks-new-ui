import React, { useState } from 'react';


import apiService from '@/service/apiService';
import { ITaxOption } from '@/types';
import { PageHeader, DataTable } from '@/components/ui';
import { 
  Button, 
  TableCell, 
  TableRow, 
  Box, 
  IconButton, 
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
      <PageHeader
        title="Tax Options"
        subtitle="Manage tax rates and labels"
        actions={
          <HasPermission action="create" resource={["accounting"]} component={
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleModalShow} sx={{ borderRadius: 2 }}>
              Add New
            </Button>
          }/>
        }
      />

      <DataTable
        columns={[
          { key: 'label', label: 'Label' },
          { key: 'value', label: 'Value' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={Array.isArray(data) ? data : []}
        isLoading={isLoading}
        emptyMessage="No tax options found"
        renderRow={(item: ITaxOption) => (
          <TableRow key={item._id}  sx={{ '&:last-child td': { border: 0 } }}>
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
        )}
      />
      <TaxForm 
        showModal={showModal}
        handleModalClose={handleModalClose}
        editingItem={editingItem}
  
      />
     
    </Box>
  );
};

export default withPermission("view",["accounting"])(TaxServicesList);