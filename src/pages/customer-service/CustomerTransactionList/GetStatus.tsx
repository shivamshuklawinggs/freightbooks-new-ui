import { ICustomerInvoicesPaymentDetails } from "@/types";
import { Typography, Box } from "@mui/material";
import { formatCurrency } from "@/utils";

const statusColors: Record<string, string> = {
  Paid: "success.main",
  Overdue: "error.main",
  Partial: "warning.main",
  Pending: "info.main",
};

const GetStatus: React.FC<{ invoice: ICustomerInvoicesPaymentDetails }> = ({ invoice }) => {
  const amountDue = invoice.dueAmount ? formatCurrency(invoice.dueAmount) : "";
  const color = statusColors[invoice.status] || "text.primary";

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" color={color}>
        {invoice.status}
        {invoice.status === "Partial" && amountDue && ` — ${amountDue} due`}
        {invoice.status === "Overdue" && invoice.daysLate > 0 && ` — ${invoice.daysLate} days late`}
        {invoice.credits > 0 && ` — ${formatCurrency(invoice.credits)} credit left`}
      </Typography>
    </Box>
  );
};

export default GetStatus;
