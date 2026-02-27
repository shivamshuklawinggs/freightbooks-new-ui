import React, { useState } from 'react';
import apiService from '@/service/apiService';
import { IProductService } from '@/types';
import { Button, TableRow, TableCell, Box, IconButton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProductServiceForm from './ProductServiceForm';
import { useQuery } from '@tanstack/react-query';
import { capitalizeFirstLetter } from '@/utils';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { toast } from 'react-toastify';
import { PageHeader, DataTable } from '@/components/ui';
import { getIcon } from '@/components/common/icons/getIcon';

const ProductServices: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IProductService | null>(null);
  const [isPagination, setIsPagination] = useState<{ limit: number, page: number }>({ limit: 10, page: 1 })

  const { data, isPending, error,refetch } = useQuery({
    queryKey: ["productService", isPagination.limit, isPagination.page],
    queryFn: async () => await apiService.getProductServiceData(isPagination)
  })

  const { data: productServices = [], pagination } = data || {};

  const handleModalShow = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleEdit = (item: IProductService) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item service?')) {
      try {
        await apiService.deleteProductServiceData(id);
        refetch()
      } catch (error:any) {
        console.warn('Error:', error);
        toast.error(error.message || "Failed to delete")
      }
    }
  };



  return (
   <Box sx={{ minHeight: '100vh' }}>
      <PageHeader
        title="Products & Services"
        subtitle="Manage your product and service catalog"
        actions={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleModalShow} sx={{ borderRadius: 2 }}>
            Add New
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: 'label', label: 'Label' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'incomeAccount', label: 'Income Account' },
          { key: 'expenseAccount', label: 'Expense Account' },
          { key: 'openingStock', label: 'Opening Stock' },
          { key: 'reorderPoint', label: 'Reorder Point' },
          { key: 'currentLevel', label: 'Current Level' },
          { key: 'inventoryAccount', label: 'Inventory Account' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={productServices}
        isLoading={isPending}
        emptyMessage={error ? 'Failed to fetch product services' : 'No products or services found'}
        total={pagination?.total ?? 0}
        page={isPagination.page - 1}
        rowsPerPage={isPagination.limit}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        onPageChange={(newPage) => setIsPagination({ ...isPagination, page: newPage + 1 })}
        onRowsPerPageChange={(rows) => setIsPagination({ ...isPagination, limit: rows, page: 1 })}
        renderRow={(item: IProductService) => (
          <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ py: 1.25 }}>{capitalizeFirstLetter(item.name || 'N/A')}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{capitalizeFirstLetter(item.category || 'N/A')}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{item.description || 'N/A'}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{capitalizeFirstLetter(item?.incomeAccountData?.name || item?.incomeAccount || 'N/A')}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{capitalizeFirstLetter(item?.expenseAccountData?.name || item?.expenseAccount || 'N/A')}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{item.OpeningStock || 0}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{item.reorderStock || 0}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{item.currentLevel || 0}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{capitalizeFirstLetter(item?.inventoryAccountData?.name || item?.inventoryAccount || 'N/A')}</TableCell>
            <TableCell sx={{ py: 0.5 }}>
              <Box display="flex" gap={0.5}>
                <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                  {getIcon("edit")}
                </IconButton>
                <IconButton size="small" color="error" onClick={() => item._id && handleDelete(item._id)}>
                  {getIcon("delete")}
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        )}
      />

       <ProductServiceForm showModal={showModal} handleModalClose={handleModalClose} editingItem={editingItem} />
    </Box>
  );
};

export default withPermission("view",["accounting"])(ProductServices);