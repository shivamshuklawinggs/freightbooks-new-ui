import React, { useState } from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import { ICarrier } from '@/types';
import useDebounce from '@/hooks/useDebounce';
import CarrierModal from '@/pages/carrier-service/CarrierModal';
import { checkInsuranceExpiryDate,isAuthorizedUsdot } from '@/utils';
import { toast } from 'react-toastify';
import apiService from '@/service/apiService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
interface CarrierOnSelectProps {
  index: number;
  updateLocation: (event: React.ChangeEvent<{ value: unknown }>) => void;
}

const CarrierOnSelect: React.FC<CarrierOnSelectProps> = ({ index, updateLocation }) => {
  const queryClient = useQueryClient();
    const currentCompany=useSelector((state:RootState)=>state.user.currentCompany)
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [showCarrierModal,setShowCarrierModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<ICarrier | null>(null);

  const { data: carriers = [], isLoading: loading } = useQuery({
    queryKey: ['carriers', debouncedSearch],
    queryFn: () => apiService.getCarriers({ search: debouncedSearch, page: 1, limit: 50 }),
     enabled: Boolean(currentCompany),
    select: (response) => response.data || []
  });

  const handleCarrierChange = async (event: React.SyntheticEvent, carrier: ICarrier | null,reason:string) => {
    try {
      if (reason === 'clear') {
        // Don't open customer form on clear
        const syntheticEvent = {
          target: { value: null }
        } as React.ChangeEvent<{ value: unknown }>;
        setSelectedCarrier(null);
        updateLocation(syntheticEvent);
        return;
      }
      if(!carrier?._id){
        setShowCarrierModal(true)
        return 
      }
      setSelectedCarrier(carrier);
      if (carrier) {
        let data=carrier as ICarrier
        let checkisInsuranseExpire=checkInsuranceExpiryDate(data?.commercialGeneralLiability?.expiryDate?.toString()||"",data?.automobileLiability?.expiryDate?.toString()||"",data?.cargoLiability?.expiryDate?.toString()||"")
        if(checkisInsuranseExpire){
          toast.error('Insurance is expired');
          return
        }
        const  {isAuth,nonMatchedData}=await isAuthorizedUsdot(data?.usdot as string,data as ICarrier)
        if(!isAuth){
          toast.error("Carrier is not authorized");
          return
        }
        if(nonMatchedData){
          await apiService.saferUpdateCarrier(carrier._id,nonMatchedData)
          
        }
        // Simulate a Select-like event to match existing `handleCarrierChange` usage
        const syntheticEvent = {
          target: { value: carrier._id }
        } as React.ChangeEvent<{ value: unknown }>;
        updateLocation(syntheticEvent);
      }
    } catch (error:any) {
      toast.error(error?.message || "Something went wrong");
    }finally{
      queryClient.invalidateQueries({ queryKey: ['carriers',"carrier",carrier?._id] });
    }
    
  };

  return (
    <>
    <FormControl fullWidth>
      <Autocomplete
        options={[{ } as ICarrier, ...carriers]}
        value={selectedCarrier}
        loading={loading}
        loadingText="Loading carriers..."
        noOptionsText="No carriers found"
        getOptionLabel={(option: ICarrier) =>{
          let label=option._id ?`${option.company} - ${option.mcNumber || 'N/A'} (${option.totalDrivers || 0} Drivers)`:"Create New Carrier"
          return  label
        }    }
        onChange={handleCarrierChange}
        onInputChange={(event, newInputValue) => {
          setSearch(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Carrier"
            variant="outlined"
            size="small"
          />
        )}
      />
    </FormControl>
      <CarrierModal
          open={showCarrierModal}
          onClose={() => {
            setShowCarrierModal(false)
            setSelectedCarrier(null)
             queryClient.invalidateQueries({ queryKey: ['carriers',"carrier"] });
          }}
          isCarrier={true}
        />
    </>
  );
};

export default CarrierOnSelect;
