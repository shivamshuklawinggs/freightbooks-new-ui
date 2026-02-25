import React from 'react';
import { useParams } from 'react-router-dom';
import UnifiedReport from '@/components/common/UnifiedReport';

const DriverReport: React.FC = () => {
  const { driverId = "" } = useParams<{ driverId: string }>();
   
  return (
    <UnifiedReport
      entityId={driverId}
      entityType="driver"
    />
  );
};

export default DriverReport;
