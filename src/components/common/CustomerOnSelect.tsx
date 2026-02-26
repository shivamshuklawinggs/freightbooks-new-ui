import React, { useState } from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import { ICustomer } from '@/types';
import useDebounce from '@/hooks/useDebounce';
import AddCustomer from '@/pages/customer-service/load-customers/components/AddCustomer';
import { toast } from 'react-toastify';
import { checkInsuranceExpiryDate, isAuthorizedUsdot } from '@/utils';
import apiService from '@/service/apiService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

interface CustomerOnSelectProps {
  updateLocation: (event: React.ChangeEvent<{ value: unknown }>) => void;
  clearData: () => void;
}

const CustomerOnSelect: React.FC<CustomerOnSelectProps> = ({ updateLocation,clearData }) => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const currentCompany=useSelector((state:RootState)=>state.user.currentCompany)
  const debouncedSearch = useDebounce(search, 500);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  const { data: customers = [], isLoading: loading } = useQuery({
    queryKey: ['customers', debouncedSearch],
    queryFn: () => apiService.getCustomers({ search: debouncedSearch, page: 1, limit: 50 }),
    enabled: Boolean(currentCompany),
    select: (response) => response.data || []
  });

  const handleCustomerChange = async(event: React.SyntheticEvent, carrier: ICustomer | null,reason:string) => {
    try {
        if (reason === 'clear') {
      // Don't open customer form on clear
      setSelectedCustomer(null);
      clearData()
      return;
    }
    if(!carrier?._id){
      setShowCustomerForm(true)
      return 
    }
    if (carrier) {
      setSelectedCustomer(carrier);
        let data=carrier as ICustomer
            let checkisInsuranseExpire=checkInsuranceExpiryDate(data?.commercialGeneralLiability?.expiryDate?.toString()||"",data?.automobileLiability?.expiryDate?.toString()||"",data?.cargoLiability?.expiryDate?.toString()||"")
            if(checkisInsuranseExpire){
              toast.error('Insurance is expired');
              return
            }
            if(data?.usdot){
            let isAuth=await isAuthorizedUsdot(data?.usdot as string)
            if(!isAuth){
              toast.error("Customer is not authorized");
              return
            }
            }
      // Simulate a Select-like event to match existing `handleCustomerChange` usage
      const syntheticEvent = {
        target: { value: carrier._id }
      } as React.ChangeEvent<{ value: unknown }>;
      updateLocation(syntheticEvent);
    } 
    } catch (error:any) {
       toast.error(error?.message || "Something went wrong");
    }
  };
  return (
    <>
    <FormControl fullWidth>
      <Autocomplete
        options={[{ } as ICustomer, ...customers]}
        value={selectedCustomer}
        loading={loading}
        loadingText="Loading customers..."
        noOptionsText="No customers found"
        getOptionLabel={(option: ICustomer) =>{
          let label=option._id ?`${option.usdot} - ${option.company }`:"Create New Customer"
          return  label
        }    }
        onChange={handleCustomerChange}

        onInputChange={(event, newInputValue) => {
          setSearch(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Customer"
            variant="outlined"
            size="small"
          />
        )}
      />
    </FormControl>
    {showCustomerForm && (
        <AddCustomer
          open={showCustomerForm}
          onClose={() => {
            setShowCustomerForm(false);
               queryClient.invalidateQueries({ queryKey: ['customers',"customer"] });
          }}
        />
      )}
    </>
  );
};

export default CustomerOnSelect;
