import React from 'react'
import { TableRow, TableCell, Stack, Chip } from '@mui/material'
import { ICustomerInvoicesPaymentDetails } from '@/types';
import { formatCurrency } from '@/utils';
import GetStatus from './GetStatus';
import { Edit as EditIcon,  Delete as DeleteIcon } from "@mui/icons-material";
import { formatDate } from '@/utils/dateUtils';
const TransactionTable:React.FC<{
    invoice:ICustomerInvoicesPaymentDetails,
    getdate:(invoice:ICustomerInvoicesPaymentDetails)=>Date,
    getamount:(invoice:ICustomerInvoicesPaymentDetails)=>string |number,
    index:number,
    handleEdit:(invoice:ICustomerInvoicesPaymentDetails)=>void,
    handleDelete:(invoice:ICustomerInvoicesPaymentDetails)=>void,
    isDeletingPayment:boolean
}> = ({invoice,getdate,index,getamount,handleDelete,handleEdit,isDeletingPayment}) => {
    
  return (
    <TableRow key={invoice._id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{formatDate(getdate(invoice))}</TableCell>
          <TableCell>{invoice.transaction}</TableCell>
          <TableCell>{invoice.invoiceNumber}</TableCell>
          <TableCell>{invoice.customer?.company || "N/A"}</TableCell>
          <TableCell>{formatCurrency(getamount(invoice) as number)}</TableCell>
          <TableCell><GetStatus invoice={invoice} /></TableCell>
          <TableCell>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<EditIcon />}
                label="Edit"
                size="small"
                onClick={() => handleEdit(invoice)}
                clickable
                disabled={isDeletingPayment}
                color="primary"
                variant="outlined"
              />
              {invoice.transaction === "payment" && (
                <Chip
                  icon={<DeleteIcon />}
                  label="Delete"
                  size="small"
                  disabled={isDeletingPayment}
                  onClick={() => handleDelete(invoice)}
                  clickable
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </TableCell>
        </TableRow>
  )
}

export default TransactionTable