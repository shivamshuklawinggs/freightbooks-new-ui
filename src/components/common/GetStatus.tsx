import React from "react";
import { ICustomerInvoicesPaymentDetails } from "@/types";
import { Chip, Box, Typography } from "@mui/material";
import { formatCurrency } from "@/utils";

type StatusConfig = { color: string; bg: string; border: string };

const STATUS_MAP: Record<string, StatusConfig> = {
  Paid:    { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  Overdue: { color: '#9f1239', bg: '#fff1f2', border: '#fecdd3' },
  Partial: { color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  Pending: { color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
};

const GetStatus: React.FC<{ invoice: ICustomerInvoicesPaymentDetails }> = ({ invoice }) => {
  const cfg = STATUS_MAP[invoice.status] ?? { color: '#374151', bg: '#f9fafb', border: '#e5e7eb' };
  const amountDue = invoice.dueAmount ? formatCurrency(invoice.dueAmount) : '';

  let subtext = '';
  if (invoice.status === 'Partial' && amountDue) subtext = `${amountDue} due`;
  else if (invoice.status === 'Overdue' && invoice.daysLate > 0) subtext = `${invoice.daysLate}d late`;
  if (invoice.credits > 0) subtext += `${subtext ? ' · ' : ''}${formatCurrency(invoice.credits)} credit`;

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.3 }}>
      <Chip
        label={invoice.status}
        size="small"
        sx={{
          height: 22,
          fontWeight: 700,
          fontSize: '0.7rem',
          bgcolor: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
          '& .MuiChip-label': { px: 1 },
        }}
      />
      {subtext && (
        <Typography variant="caption" sx={{ color: cfg.color, fontSize: '0.65rem', fontWeight: 500 }}>
          {subtext}
        </Typography>
      )}
    </Box>
  );
};

export default GetStatus;
