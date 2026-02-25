/**
 * @author Shivam Shukla
 * @description Carrier Modal Component
 * @version 1.0.0
 * @createdAt 10/06/2025
 * @lastModifiedBy Shivam Shukla
 * @lastModifiedDate 10/06/2025
 */
import React from 'react';
import { ICarrier } from '@/types';

import CarrierForm from './CarrierForm';
import VendorForm from './VendorForm';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';

interface CarrierModalProps {
  open: boolean | ICarrier
  onClose: () => void;
  onUpdate?: () => void;
  isCarrier:boolean
}

const CarrierModal: React.FC<CarrierModalProps> = ({
  open,
  onClose,
  onUpdate,
  isCarrier=false
}) => {
  
  return !isCarrier ? <VendorForm open={open} onClose={onClose} submitButtonText={typeof open === 'object' && (open as ICarrier)?._id ? "Update":"Create"} /> : <CarrierForm open={open} onClose={onClose} onUpdate={onUpdate}  />;
};

export default withPermission("create",["carriers"])(CarrierModal);
