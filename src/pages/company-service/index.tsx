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
    <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Company</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Company
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Description</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Type</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <LoadingSpinner size={50} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Error loading companies
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell>{company.label}</TableCell>
                    <TableCell>{company.description}</TableCell>
                    <TableCell>{company.type}</TableCell>
                    <TableCell>
                      <VerticalMenu actions={
                        [
                          {
                            label:"Edit",
                            onClick:() => handleOpenDialog(company),
                            icon:"edit"
                          },
                          {
                            label:"Delete",
                            onClick:() => handleDelete(company._id as string),
                            icon:"delete"
                          },
                        
                        ]
                      }/>
                      
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={(currentPage - 1)}
          rowsPerPage={limit}
          onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setLimit(parseInt(event.target.value, 10));
            setCurrentPage(1);
          }}
        />
        
      </TableContainer>

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