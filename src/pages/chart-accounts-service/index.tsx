import React, { useState } from 'react';
import { Box, Button, Dialog, TableRow, TableCell, DialogActions } from '@mui/material';
import { PageHeader, DataTable } from '@/components/ui';
import { IChartAccount } from '@/types';
import ChartAccountForm from './ChartAccountForm';
import apiService from '@/service/apiService';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FilterBox from './FilterBox';
import useDebounce from '@/hooks/useDebounce';
import { hasAccess,withPermission } from '@/hooks/ProtectedRoute/authUtils';
import VerticalMenu from '@/components/VerticalMenu';
import ErrorHandlerAlert from '@/components/common/ErrorHandlerAlert';
import { toast } from 'react-toastify';
import { getIcon } from '@/components/common/icons/getIcon';
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
      <PageHeader
        title="Charts of Accounts"
        subtitle="Manage your chart of accounts"
        actions={
          <Button variant="contained" size="small" onClick={() => { setEditing(null); setOpen(true); }} sx={{ borderRadius: 2 }}>
            + New Account
          </Button>
        }
      />

      <FilterBox
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        setPage={setPage}
      />
   <ErrorHandlerAlert error={error}/>
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'accountType', label: 'Account Type' },
          { key: 'detailType', label: 'Detail Type' },
          { key: 'endingBalance', label: 'Ending Balance' },
          { key: 'actions', label: 'Actions', align: 'right' },
        ]}
        data={paginatedRows}
        isLoading={isLoading}
        emptyMessage="No accounts yet"
        total={chartAccountsData?.total ?? 0}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setPage(1); }}
        renderRow={(row: IChartAccount) => (
          <TableRow key={row._id} hover>
            <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser) && navigate(paths.AccountRegister +"/"+ row._id)}>{row.id}</TableCell>
            <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser) && navigate(paths.AccountRegister +"/"+ row._id)}>{row.name}</TableCell>
            <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser) && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.accountTypeData?.name || row?.accountType}</TableCell>
            <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser) && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.detailTypeData?.name || row?.detailType}</TableCell>
            <TableCell onClick={() => hasAccess(["accounting"],"view",currentUser) && navigate(paths.AccountRegister +"/"+ row._id)}>{row?.endingBalance || 0}</TableCell>
            <TableCell align="right">
              <VerticalMenu actions={[
                hasAccess(["accounting"],"update",currentUser) ? { onClick: () => { setEditing(row); setOpen(true); }, label: "Edit", icon: "edit" } : null,
                hasAccess(["accounting"],"view",currentUser) ? { onClick: () => navigate(paths.AccountRegister+"/" + row._id), label: "View Register", icon: "RemoveRedEye" } : null,
                hasAccess(["accounting"],"delete",currentUser) ? { onClick: () => handleDeleteInvoice(row._id as string), label: "Delete", icon: "delete" } : null,
              ]}/>
            </TableCell>
          </TableRow>
        )}
      />

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {getIcon('CloseIcon')}
          </Button>
        </DialogActions>
        <ChartAccountForm
          initial={editing ?? undefined}
          onSuccess={handleFormSuccess}
        />
      </Dialog>
    </Box>
  );
};

export default withPermission("view",["accounting"])(ChartAccountsPage);