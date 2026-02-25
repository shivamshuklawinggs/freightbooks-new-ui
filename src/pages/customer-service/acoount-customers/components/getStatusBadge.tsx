import { CustomerStatus, } from '@/types';
import { Chip } from '@mui/material';
import { JSX } from 'react';
 const getStatusBadge = (status: CustomerStatus): JSX.Element => {
    const statusColors: Record<CustomerStatus, string> = {
      active: 'success',
      inactive: 'error',
      suspended: 'warning',
    };
    return (
      <Chip
        label={status.toUpperCase()}
        color={statusColors[status] as 'success' | 'warning' | 'error'}
        
        className="customer-status"
      />
    );
  };
  export default getStatusBadge