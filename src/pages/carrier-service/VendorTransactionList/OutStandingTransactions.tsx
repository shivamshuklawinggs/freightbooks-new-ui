import React from 'react'
import { Box } from '@mui/material'
import { ICustomerInvoicesPaymentDetails,ITotalTransactionCount } from '@/types';
import { paths } from '@/utils/paths';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { useParams, useNavigate } from 'react-router-dom';
const ITEMS_PER_PAGE = 10;
import TransactionTable from '../../../components/common/TransactionTable';
import { todayDate } from '@/config/constant';
import FilterTransaction from '../../../components/common/FilterTransaction';
import PaginatedTable from '@/components/PaginatedTable';
const OutStandingTransactions: React.FC = () => {
  const [selectedYear, setSelectedYear] = React.useState<number>(todayDate.getFullYear());

  const { id } = useParams()
    const queryClient = useQueryClient()
  const navigate = useNavigate();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isLoadingInvoice
  } = useInfiniteQuery({
    queryKey: ['getTransactionsByCustomerId', id,selectedYear],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getCustomerBillTransactionByCustomerId(
       id as string,
        pageParam,
        ITEMS_PER_PAGE,
        selectedYear
      );
      return response;
    },
    getNextPageParam: (data: any) => {
      if (data && data.hasMore) {
        return (data.page+1)
      }
      return undefined;
    },
    enabled: !!id,
    initialPageParam: 1,
  });

    const {data:TotalTransactionCount}=useQuery<ITotalTransactionCount>({
    queryKey:['TotalTransactionCount',id],
    queryFn:async()=>{
      const response=await apiService.getTotalTransactionCountByCustomerId(id as string,"customer")
      return response.data
    },
    enabled:!!id
  })
  // payment delete mutation
    const { mutate: deletePayment,  isPending: isDeletingPayment
 } = useMutation({
    mutationFn: (id:string) => 
      apiService.deleteRecivedPayment(id),
    onSuccess: () => {
         // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['getTransactionsByCustomerId', id] });
      queryClient.invalidateQueries({ queryKey: ['TotalTransactionCount', id] });
    }
  });
  const getamount = (invoice: ICustomerInvoicesPaymentDetails) => {

    if (invoice.transaction === "Bill") {
      return invoice.totalAmountWithTax
    } else {
      return invoice.amount
    }
  }
  const getdate = (invoice: ICustomerInvoicesPaymentDetails) => {
    if (invoice.transaction === "Bill") {
      return invoice.dueDate
    } else {
      return invoice.paymentDate
    }
  }
  const handleEdit = (invoice: ICustomerInvoicesPaymentDetails) => {
    try {
      if (invoice.transaction === "Journal Entry") {
        navigate(`/accounting${paths.JournalEntry}/${invoice._id}`);
      }
      else if (invoice.transaction === "Invoice") {
        navigate(`${paths.editinvoice}/${invoice._id}`);
      }
      else if (invoice.transaction === "Bill") {
        navigate(`${paths.editbill}/${invoice._id}`);
      } else if (invoice.transaction === "payment") {
        navigate(`${paths.recievedbill}/${invoice._id}`);
      }
    } catch (error) {
      console.error(error)
    }
  }
  const handleDelete = (invoice: ICustomerInvoicesPaymentDetails) => {
    try {
      // ask irst to delete 
      const Isdeklete=confirm("Are you sure you want to delete this payment?")

      if (invoice.transaction === "payment" && Isdeklete) {
        deletePayment(invoice._id);
      }
    } catch (error) {
      console.error(error)
    }
  }
  const invoiceData = data?.pages.flatMap(page => page.data) || [];
 const totalLoaded = invoiceData.length;
  const totalRecords = TotalTransactionCount?.total || 0;
  const years = TotalTransactionCount?.years || [];
  return (
     <Box>
      <FilterTransaction years={years} selectedYear={selectedYear} setSelectedYear={setSelectedYear} totalLoaded={totalLoaded} totalRecords={totalRecords} type="vendor"/>
    <PaginatedTable
  data={invoiceData}
  totalLoaded={totalLoaded}
  totalRecords={totalRecords}
  isLoading={isLoadingInvoice}
  isFetching={isFetching}
  hasNextPage={hasNextPage}
  fetchNextPage={fetchNextPage}
  paginationType="infinite" // or "normal"
  columns={[
    { key: "srNo", label: "Sr No" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "no", label: "No" },
    { key: "customer", label: "Vendor" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ]}
  renderRow={(invoice, index) => (
    <TransactionTable
      key={invoice._id}
      invoice={invoice}
      index={index}
      getdate={getdate}
      getamount={getamount}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      isDeletingPayment={isDeletingPayment}
    />
  )}
/>
</Box>

  )
}

export default OutStandingTransactions