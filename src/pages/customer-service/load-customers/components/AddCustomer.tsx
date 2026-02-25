import React from 'react';
import CustomerForm from './CustomerForm';
import { ICustomer } from '@/types';

interface AddCustomerProps {
   open: boolean | ICustomer;
   onClose: () => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ open, onClose }) => {


  return (
        <CustomerForm
            open={open}
            submitButtonText={typeof open=="object" && open._id ? 'Update' : 'Create'}
            onClose={onClose}
          />
  );
};

export default AddCustomer;