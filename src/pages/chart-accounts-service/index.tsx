import React, { useState } from 'react';
import { Box, Button, Dialog, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Typography } from '@mui/material';
import { IChartAccount } from '@/types';
import ChartAccountForm from './ChartAccountForm';
import apiService from '@/service/apiService';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FilterBox from './FilterBox';
import useDebounce from '@/hooks/useDebounce';
import { hasAccess,withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';
import ErrorHandlerAlert from '@/components/common/ErrorHandlerAlert';
import { toast } from 'react-toastify';
export type ChartAccountFilterType="balance_sheet" | "profit_and_loss" | "all" | "createdBy"
const ChartAccountsPage: React.FC = () => {
  const navigate = useNavigate()
  const currentUser  = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IChartAccount | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ChartAccountFilterType>("all");
  const queryClient = useQueryClient();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Fetch chart accounts using React Query
  const { data: chartAccountsData, isLoading, error,refetch } = useQuery({
    queryKey: ['chartAccounts', debouncedSearchQuery, filterType,page,rowsPerPage],
    queryFn: async () => {
      const balancesheets=["asset","liability","equity"].join(",") // balance sheet accounts
      const incomeexpense=["income","expense"].join(","); // income and expense accounts
      const type=filterType=="all"?undefined:filterType==="balance_sheet"?balancesheets: filterType==="createdBy"?filterType: incomeexpense
      const res = await apiService.getChartAccounts({ 
        isChartData:"1",nor:"",
        search: debouncedSearchQuery, type: type,limit:rowsPerPage,page:page });
      return res.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
  
  const deleteMutation = useMutation({
    mutationFn: (InvoicesId: string) => apiService.deleteChartAccount(InvoicesId),
    onSuccess: () => {
      toast.success('Chart Of Account deleted successfully');
      refetch();
    },
    onError: (error: any) => {
   
      toast.error( error.message || 'Failed to delete Chart Account');
    },
  });
  const handleDeleteInvoice= async (InvoiceId: string): Promise<void> => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Chart Of Account?");
    if (confirmDelete) {
      deleteMutation.mutate(InvoiceId);
    }
  };
  // slice data for current page
 
  const paginatedRows = chartAccountsData?.data || []

  const handleFormSuccess = () => {
    setOpen(false);
    // Invalidate the query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['chartAccounts'] });
  };
  return (
    <Box p={2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6" component="h2">
          Charts of Accounts
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + New Account
        </Button>
      </Box>

      <FilterBox
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        setPage={setPage}
      />
   <ErrorHandlerAlert error={error}/>
      {/* Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Account Type</TableCell>
            <TableCell>Detail Type</TableCell>
            <TableCell>Ending Balance</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <LoadingSpinner size={40} />
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row: IChartAccount) => (
              <TableRow key={row._id} hover>
                <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser)  && navigate(paths.AccountRegister +"/"+ row._id)}>{row.id}</TableCell>
                <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser)  && navigate(paths.AccountRegister +"/"+ row._id)}>{row.name}</TableCell>
                <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser)  && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.accountTypeData?.name || row?.accountType}</TableCell>
                <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser)  && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.detailTypeData?.name || row?.detailType}</TableCell>
                <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser)  && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.endingBalance || 0}</TableCell>
                <TableCell align="right">
                  <VerticalMenu actions={[
                        hasAccess(["accounting"],"update",currentUser) ? {
                          onClick:() => {
                            setEditing(row);
                            setOpen(true);
                          },
                          label:"Edit",
                          icon:"edit"
                        } : null,
                        hasAccess(["accounting"],"view",currentUser) ? {
                            onClick:() => {
                              navigate(paths.AccountRegister+"/" + row._id);
                            },
                            label:"View Register",
                            icon:"RemoveRedEye"
                        } : null,
                        hasAccess(["accounting"],"delete",currentUser)  ? {
                            onClick:() => {
                              handleDeleteInvoice(row._id as string);
                            },
                            label:"Delete",
                            icon:"delete"
                        } : null,
                        
              
                  ]}/>
                
                </TableCell>
              </TableRow>
            ))
          )}

          {!isLoading &&  paginatedRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No accounts yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={chartAccountsData?.total || 0}
        page={page-1}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <ChartAccountForm
          initial={editing ?? undefined}
          onSuccess={handleFormSuccess}
        />
      </Dialog>
    </Box>
  );
};

export default withPermission("view",["accounting"])(ChartAccountsPage);