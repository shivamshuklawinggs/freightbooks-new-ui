import { FormControl,InputLabel,MenuItem,Select,FormHelperText } from '@mui/material';
import { useFormContext,Controller } from 'react-hook-form';
import { ICarrier, IVendorBill } from '@/types';
import { FC } from 'react';
import { useEffect } from 'react';
import apiService from '@/service/apiService';
import { useQuery } from '@tanstack/react-query';
import { PaymentMethods } from '@/types/enum';
const CustomerSelect:FC<{openCustomerModal:()=>void}> = ({openCustomerModal}) => {

    const form=useFormContext<IVendorBill>();
      const isUpdate=!!form.watch('_id')
      const getCustomerByid=async(id:string)=>{
       try {
        form.clearErrors('vendorId')
        const data:{
          data:ICarrier
        }=await apiService.getVendor(id)
        form.setValue("name",data.data.company || form.watch("name") || "")
        form.setValue("address",data.data.address || data.data.billingAddress?.address || "")
        form.setValue("email",data.data.email || form.watch("email") || "") 
        if(!isUpdate){
          form.setValue("paymentOptions",data?.data?.paymentMethod || PaymentMethods.NA)
          form.setValue("terms",data?.data?.paymentTerms || "")
        }
        form.setValue("customer",data.data as any)
 
       } catch (error) {
          form.setValue("name",form.watch("name") || "")
          form.setValue("address",form.watch("address") || "")
          form.setValue("email",form.watch("email") || "")
          form.setValue("customer",undefined)
          if(!isUpdate){
            form.setValue("paymentOptions",PaymentMethods.NA)
            form.setValue("terms","")
          }
          form.setError('vendorId', { type: 'manual', message: 'Customer not found' })
       }
      }
const { data: customers = [] } = useQuery({
  queryKey: ["accountsCustomerBills"],
  queryFn: async () => {
    let page = 1;
    let limit = 10;
    let hasMore = true;
    let allData: ICarrier[] = [];

    while (hasMore) {
      const response = await apiService.getVendors({ page, limit });

      if (!response.data || response.data.length < limit) {
        hasMore = false;
      }

      if (response.data) {
        allData.push(...response.data);
      }

      page += 1;
    }

    return allData;
  },
});

     useEffect(()=>{
      if(form.watch('vendorId')){
        getCustomerByid(form.watch('vendorId') as string)
      }
     },[form.watch('vendorId')])

  return (
    <FormControl fullWidth >
    <InputLabel id="customer-select-label">
    Vendor Name
    </InputLabel>
     <Controller
     name="vendorId"
     control={form.control}
     render={({field})=>(
      <Select
      {...field}
      label="Vendor Name"
    >
      <MenuItem value="" onClick={openCustomerModal}>Create New Vendor</MenuItem>
      {customers?.map((customer:ICarrier,index:number) => (
        <MenuItem key={customer._id || index } value={customer._id || index }>
          {customer?.company || customer?.company || 'No company name'}
        </MenuItem>
      ))}
    </Select>
    
     )}
     />
   <FormHelperText>{form.formState.errors.vendorId?.message}</FormHelperText>
  </FormControl>
  )
}

export default CustomerSelect