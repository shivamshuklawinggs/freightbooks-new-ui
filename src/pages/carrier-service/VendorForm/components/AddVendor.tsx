import React from 'react';
import VendorForm from '..';
import {  ICarrier } from '@/types';

interface AddVendorProps {
   open: boolean | ICarrier;
   onClose: () => void;
}

const AddVendor: React.FC<AddVendorProps> = ({ open, onClose }) => {
  return (
        <VendorForm
            open={open}
            submitButtonText={open ? 'Update' : 'Create'}
            onClose={onClose}
          />
  );
};

export default AddVendor;