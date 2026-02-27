import React, { useState } from 'react';
import { Box, Button, TableRow, TableCell, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageHeader, DataTable } from '@/components/ui';
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
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and permissions"
        actions={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
            Add User
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={data?.data ?? []}
        isLoading={isLoading}
        total={data?.pagination?.total ?? 0}
        page={currentPage - 1}
        rowsPerPage={limit}
        onPageChange={(newPage) => setCurrentPage(newPage + 1)}
        onRowsPerPageChange={(rows) => setLimit(rows)}
        renderRow={(user) => (
          <TableRow key={user._id} hover sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ py: 1.25 }}>{user.name}</TableCell>
            <TableCell sx={{ py: 1.25 }}>{user.email}</TableCell>
            <TableCell sx={{ py: 1.25, textTransform: 'capitalize' }}>{user.role}</TableCell>
            <TableCell sx={{ py: 1.25 }}>
              <Chip size="small" label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} />
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
        )}
      />

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