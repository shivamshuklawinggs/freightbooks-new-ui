import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography, TablePagination } from '@mui/material';
import CompanyForm from './components/CompanyForm';
import { ICompany } from '@/types';

interface CompanyResponse {
  data: ICompany[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

type CompanyQueryKey = ['company', number, number, string];
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import VerticalMenu from '@/components/VerticalMenu';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { toast } from 'react-toastify';

const CompanyList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search] = useState<string>('');

  // Fetch companies using React Query
  const { data, isLoading, error,refetch } = useQuery<CompanyResponse, Error, CompanyResponse, CompanyQueryKey>({
    queryKey: ['company', currentPage, limit, search],
    queryFn: async () => {
      const response = await apiService.getCompanies({ page: currentPage, limit, search });
      return response;
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  const handleDelete=async(id:string)=>{
    try {
         const confirmDelete = window.confirm("Are you sure you want to delete this Company?");
         if(confirmDelete){
           await apiService.deleteCompany(id)
         }
       refetch()
    } catch (error:any) {
      toast.error(error.message || "Something is wrong")
    }
  }
  const { data: companies = [], pagination } = data || {};

  const handleOpenDialog = (company?: ICompany) => {
    if (company) {
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Companies</Typography>
          <Typography variant="body2" color="text.secondary">Manage your company profiles</Typography>
        </Box>
        <Button variant="contained" size="small" onClick={() => handleOpenDialog()} sx={{ borderRadius: 2 }}>
          Add New Company
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <LoadingSpinner size={36} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="error">Error loading companies</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.25 }}>{company.label}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{company.description}</TableCell>
                    <TableCell sx={{ py: 1.25 }}>{company.type}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <VerticalMenu actions={[
                        { label: 'Edit', onClick: () => handleOpenDialog(company), icon: 'edit' },
                        { label: 'Delete', onClick: () => handleDelete(company._id as string), icon: 'delete' },
                      ]}/>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={currentPage - 1}
          rowsPerPage={limit}
          onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
          onRowsPerPageChange={(event) => { setLimit(parseInt(event.target.value, 10)); setCurrentPage(1); }}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
        />
      </Paper>

      <CompanyForm
        open={openDialog}
        onClose={handleCloseDialog}
        initialData={selectedCompany || undefined}
        title={selectedCompany ? 'Edit Company' : 'Add New Company'}
       
      />
    </Box>
  );
};

export default withPermission("view",["company"])(CompanyList);