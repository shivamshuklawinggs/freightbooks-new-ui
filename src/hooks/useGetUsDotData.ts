import apiService from '@/service/apiService';
import { ICarrier, ICommonUsdotData } from '@/types';
import {  useState } from 'react';







const formatAddress = (address: string = '') => {
  const addressParts = address.split(' ');
  const zipCode = addressParts[addressParts.length - 1] || '';
  const state = addressParts[addressParts.length - 3] || '';
  return { address, zipCode,state };
};

const useGetUsDotData = (type: 'customer' | 'carrier', setValue?: any) => {
  const [data, setData] = useState<ICommonUsdotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = async (usdot:string) => {
    if (!usdot) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getDataByUsdotNumber(usdot);
      
      if (response?.data) {
        const { address, zipCode,state } =response?.data?.physical_address ? formatAddress(response?.data?.physical_address) : { address: '', zipCode: '',state:'' };
        const commonData:ICommonUsdotData = {
          address,
          mcNumber: response?.data?.mc_mx_ff_numbers || '',
          usdot: response?.data?.usdot || '',
          zipCode:zipCode,
          state:state,
          phone:response?.data?.phone || '',
          entity_type:response?.data?.entity_type || '',
          dba_name:response?.data?.dba_name || '',
          legal_name:response?.data?.legal_name || '',
          operating_status:response?.data?.operating_status || '',
          physical_address:response?.data?.physical_address || '',
          mailing_address:response?.data?.mailing_address || '',
          carrier_operation:response?.data?.carrier_operation || [],
          out_of_service_date:response?.data?.out_of_service_date || '',

        };

        const formattedData = type === 'customer' 
          ? {
              ...commonData,
              company: response?.data?.legal_name || response?.data?.dba_name || '',
              phone: response?.data?.phone || ''
            } as ICommonUsdotData
          : {
              ...commonData,
              company: response?.data?.legal_name || response?.data?.dba_name || '',
              phone: response?.data?.phone || ''
            } as ICommonUsdotData;

        setData(formattedData);

        // Update form fields if setValue is provided (for customer form)
        if (setValue && type === 'customer') {
          const customer = formattedData as ICommonUsdotData;
          setValue('company', customer.company);
          setValue('phone', customer.phone);
          setValue('address', customer.address);
          setValue('mcNumber', customer.mcNumber);
          setValue("zipCode",customer.zipCode)
          setValue("state",customer.state)
          setValue("entity_type",customer.entity_type)
          setValue("dba_name",customer.dba_name)
          setValue("legal_name",customer.legal_name)
          setValue("operating_status",customer.operating_status)
          setValue("physical_address",customer.physical_address)
          setValue("mailing_address",customer.mailing_address)
          setValue("carrier_operation",customer.carrier_operation)
          setValue("out_of_service_date",customer.out_of_service_date)
        }
        if(setValue && type === 'carrier'){
           setValue('mcNumber',formattedData.mcNumber)
           setValue('company',formattedData.company || '')
           setValue('phone',formattedData.phone || '')
           setValue('address',formattedData.address || '')
           setValue('zipCode',formattedData.zipCode || '')
           setValue('state',formattedData.state || '')
           setValue('entity_type',formattedData.entity_type || '')
           setValue('dba_name',formattedData.dba_name || '')
           setValue('legal_name',formattedData.legal_name || '')
           setValue('operating_status',formattedData.operating_status || '')
           setValue('physical_address',formattedData.physical_address || '')
           setValue('mailing_address',formattedData.mailing_address || '')
           setValue('carrier_operation',formattedData.carrier_operation || [])
           setValue('out_of_service_date',formattedData.out_of_service_date || '')
        }
      }
    } catch (err) {
      console.warn("errrrr",err)
      setError(err instanceof Error ? err : new Error('Failed to fetch USDOT data'));
      setData(null);
      // Update form fields if setValue is provided (for customer form)
     if (setValue && type === 'customer') {
      setValue('company', '');
      setValue('phone', '');
      setValue('address', '');
      setValue('mcNumber', '');
      setValue("zipCode","")
      setValue("state","")
      setValue("entity_type","")
      setValue("dba_name","")
      setValue("legal_name","")
      setValue("operating_status","")
      setValue("physical_address","")
      setValue("mailing_address","")
      setValue("carrier_operation","")
      setValue("out_of_service_date","")
    }
    // if(type === 'carrier' && setValue){
     
    //   setValue('company','')
    //   setValue('phone','')
    //   setValue('address','')
    //   setValue('mcNumber','')
    //   setValue("zipCode","")
    //   setValue("state","")
    //   setValue('entity_type','')
    //   setValue('dba_name','')
    //   setValue('legal_name','')
    //   setValue('operating_status','')
    //   setValue('physical_address','')
    //   setValue('mailing_address','')
    //   setValue('carrier_operation','')
    //   setValue('out_of_service_date','')     
    // }
    } finally {
      setLoading(false);
    }
  };
   const handleSubmit = (value:string) => {
     if(setValue && type === 'customer'){
       setValue('usdot',value);
     }
     if(setValue && type === 'carrier'){
      setValue('usdot',value);
     }
     fetchData(value);
  };
  return { 
    usDotData: data, 
    loading, 
    error ,
    handleSubmit
  };
};
export const MatchUSDotDataCarrier = async (
  carrierData: ICarrier,
  response: { data: any }
) => {
  let data: ICommonUsdotData | null = null;

  try {
    if (response?.data) {
      const { address, zipCode, state } = response?.data?.physical_address
        ? formatAddress(response?.data?.physical_address)
        : { address: "", zipCode: "", state: "" };

      const commonData: ICommonUsdotData = {
        address,
        mcNumber: response?.data?.mc_mx_ff_numbers || "",
        usdot: response?.data?.usdot || "",
        zipCode,
        state,
        phone: response?.data?.phone || "",
        entity_type: response?.data?.entity_type || "",
        dba_name: response?.data?.dba_name || "",
        legal_name: response?.data?.legal_name || "",
        operating_status: response?.data?.operating_status || undefined,
        physical_address: response?.data?.physical_address || "",
        mailing_address: response?.data?.mailing_address || "",
        carrier_operation: response?.data?.carrier_operation || [],
        out_of_service_date: response?.data?.out_of_service_date || "",
      };

      data = {
        ...commonData,
        company:
          response?.data?.legal_name || response?.data?.dba_name || "",
        phone: response?.data?.phone || "",
      } as ICommonUsdotData;
    }
  } catch (err) {
    data = {
      usdot:"",
      company: "",
      phone: "",
      address: "",
      mcNumber: "",
      zipCode: "",
      state: "",
      entity_type: "",
      dba_name: "",
      legal_name: "",
      operating_status: undefined,
      physical_address: "",
      mailing_address: "",
      carrier_operation: [],
      out_of_service_date: "",
    };
  }

  if (!data) return {};
  const compareProperties: (keyof ICommonUsdotData)[] = [
    "address",
    "mcNumber",
    "usdot",
    "zipCode",
    "phone",
    "company",
    "company",
    "state",
    "entity_type",
    "dba_name",
    "legal_name",
    "operating_status",
    "physical_address",
    "mailing_address",
    "carrier_operation",
    "out_of_service_date"
  ];
  
  const comparisonResult = compareProperties.reduce(
    (acc, key) => {
      const oldValue = carrierData[key];
      const newValue = data?.[key];
      // Handle arrays separately (like carrier_operation)
      const isEqual = Array.isArray(oldValue) && Array.isArray(newValue)
        ? oldValue.length === newValue.length &&
          oldValue.every((val, idx) => val === newValue[idx])
        : oldValue === newValue;
  
      if (isEqual) {
        acc.matched[key] = newValue as any;
      } else {
        acc.nonMatched[key] = 
          newValue
      }
  
      return acc;
    },
    {
      matched: {} as Partial<ICommonUsdotData>,
      nonMatched: {} as Record<
        keyof ICommonUsdotData,
        any
      >,
    }
  );
  
  return Object.keys(comparisonResult.nonMatched).length > 0 ? comparisonResult.nonMatched : null;
  
};


export const useGetUsDotDataForCustomer = ( setValue: any) => {
  return useGetUsDotData('customer', setValue);
};

export const useUSDOTForCarrier = (setValue:Function) => {
  return useGetUsDotData('carrier',setValue);
};
