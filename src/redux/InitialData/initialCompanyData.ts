import { colorPresets } from "@/data/colors";
import { companyType, ICompany } from "@/types";

export const initialCompanyData: ICompany = {
    _id: '',
    address: '',
    phone: '',
    color: colorPresets.teal.main,
    label: '',
    prefix: '',
    mcNumber: '',
     usdot: '',
     type: '' as companyType  ,
    email: '',
    termsandconditions:"", 
    logo: null
  }