
import { companyType, ICompany } from "@/types";
import defaults from '@/data/defaults.json';
export const initialCompanyData: ICompany = {
    _id: '',
    address: '',
    phone: '',
    color: defaults.colorPresets.teal.main,
    label: '',
    prefix: '',
    mcNumber: '',
     usdot: '',
     type: '' as companyType  ,
    email: '',
    termsandconditions:"", 
    logo: null
  }