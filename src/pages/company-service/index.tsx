import React, { useState } from 'react';
import { Button, Box, TableRow, TableCell } from '@mui/material';
import { PageHeader, DataTable } from '@/components/ui';
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
      <PageHeader
        title="Companies"
        subtitle="Manage your company profiles"
        actions={
          <Button variant="contained" size="small" onClick={() => handleOpenDialog()} sx={{ borderRadius: 2 }}>
            Add New Company
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'type', label: 'Type' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={companies}
        isLoading={isLoading}
        emptyMessage={error ? 'Error loading companies' : 'No companies found'}
        total={pagination?.total ?? 0}
        page={currentPage - 1}
        rowsPerPage={limit}
        onPageChange={(newPage) => setCurrentPage(newPage + 1)}
        onRowsPerPageChange={(rows) => { setLimit(rows); setCurrentPage(1); }}
        renderRow={(company) => (
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
        )}
      />

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