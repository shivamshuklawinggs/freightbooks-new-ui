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
   <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h5"></Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleModalShow}
        >
          Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Income Account</TableCell>
              <TableCell>Expense Account</TableCell>
              <TableCell>Opening Stock</TableCell>
              <TableCell>Reorder Point</TableCell>
              <TableCell>Current Level</TableCell>
              <TableCell>Inventory Account</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography>Failed to fetch product services</Typography>
                </TableCell>
              </TableRow>
            ) : productServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography>No item services found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              productServices.map((item: IProductService) => (
                <TableRow key={item._id}>
                  <TableCell>{capitalizeFirstLetter(item.name || 'N/A')}</TableCell>
                  <TableCell>{capitalizeFirstLetter(item.category || 'N/A')}</TableCell>
                  <TableCell>{item.description || 'N/A'}</TableCell>
                  <TableCell>{capitalizeFirstLetter(item?.incomeAccountData?.name ||  item?.incomeAccount || 'N/A')}</TableCell>
                  <TableCell>{capitalizeFirstLetter(item?.expenseAccountData?.name ||  item?.expenseAccount || 'N/A')}</TableCell>
                  <TableCell>{item.OpeningStock || 0}</TableCell>
                  <TableCell>{item.reorderStock || 0}</TableCell>
                  <TableCell>{item.currentLevel || 0}</TableCell>
                  <TableCell>{capitalizeFirstLetter(item?.inventoryAccountData?.name || item?.inventoryAccount || 'N/A')}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        color="primary" 
                         
                        onClick={() => handleEdit(item)}
                      >
                        {getIcon("edit")}
                      </IconButton>
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
         <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={isPagination.page - 1}
          // rows perpage start from 5 
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          rowsPerPage={isPagination.limit}
          onPageChange={(event, newPage) => setIsPagination({ ...isPagination, page: newPage + 1 })}
          onRowsPerPageChange={(event) => setIsPagination({ ...isPagination, limit: parseInt(event.target.value, 10), page: 1 })}
        />
      </TableContainer>

       <ProductServiceForm showModal={showModal} handleModalClose={handleModalClose} editingItem={editingItem} />
    </Box>
  );
};

export default withPermission("view",["accounting"])(ProductServices);