import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Typography, Chip, CircularProgress,
  TablePagination
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import apiService from '@/service/apiService';
import UserForm from './UserForm';
import { IUser } from '@/types';
import { useQuery } from '@tanstack/react-query';
import VerticalMenu from '@/components/VerticalMenu';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
interface IsuerResponse {
  data: IUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}


const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);


const {isLoading,data,refetch} = useQuery<IsuerResponse>({
  queryKey: ['users', currentPage, limit],
  queryFn: () => apiService.getUsers({ page: currentPage, limit }),
 
});

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };
  
  const handleFormSubmit = async () => {
     refetch();
    handleFormClose();
  };

  const handleToggleActivate = async (user: IUser) => {
    try {
    user?._id &&   await apiService.ActivateUser(user._id, !user.isActive);
      refetch();
    } catch (error) {
      console.warn('Error activating user:', error);
    }
  };


  return (
  <Box sx={{ minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage user accounts and permissions</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add User
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : data?.data?.map((user) => (
                <TableRow key={user._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ py: 1.25 }}>{user.name}</TableCell>
                  <TableCell sx={{ py: 1.25 }}>{user.email}</TableCell>
                  <TableCell sx={{ py: 1.25, textTransform: 'capitalize' }}>{user.role}</TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Chip
                      size="small"
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <VerticalMenu
                      actions={[
                        { label: 'Edit', onClick: () => handleEdit(user), icon: 'edit' },
                        { label: user.isActive ? 'Deactivate' : 'Activate', onClick: () => handleToggleActivate(user), icon: user.isActive ? 'checkCircle' : 'cancel' },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.pagination?.total || 0}
          page={currentPage - 1}
          onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50]}
          onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
        />
      </Paper>

      <UserForm
        open={open}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />
    </Box>
  );
};

export default withPermission("view",["users","superadmin"])(Users);