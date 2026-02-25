import React from 'react';
import { useParams } from 'react-router-dom';
import UnifiedReport from '@/components/common/UnifiedReport';

const CustomerReport: React.FC = () => {
  const { customerId = "" } = useParams<{ customerId: string }>();
   
  return (
    <UnifiedReport
      entityId={customerId}
      entityType="customer"
    />
  );
};

export default CustomerReport;
