import React, { useState } from 'react';
import apiService from '@/service/apiService';
import { IProductService } from '@/types';
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, CircularProgress, TablePagination, } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProductServiceForm from './ProductServiceForm';
import { useQuery } from '@tanstack/react-query';
import { capitalizeFirstLetter } from '@/utils';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { toast } from 'react-toastify';
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
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Products & Services</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product and service catalog</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleModalShow} sx={{ borderRadius: 2 }}>
          Add New
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Income Account</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expense Account</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Opening Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reorder Point</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Inventory Account</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="error">Failed to fetch product services</Typography>
                  </TableCell>
                </TableRow>
              ) : productServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No products or services found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                productServices.map((item: IProductService) => (
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
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={pagination?.total || 0}
            page={isPagination.page - 1}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            rowsPerPage={isPagination.limit}
            onPageChange={(_, newPage) => setIsPagination({ ...isPagination, page: newPage + 1 })}
            onRowsPerPageChange={(event) => setIsPagination({ ...isPagination, limit: parseInt(event.target.value, 10), page: 1 })}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
          />
        </TableContainer>
      </Paper>

       <ProductServiceForm showModal={showModal} handleModalClose={handleModalClose} editingItem={editingItem} />
    </Box>
  );
};

export default withPermission("view",["accounting"])(ProductServices);