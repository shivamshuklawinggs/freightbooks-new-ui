import { Colors } from "@/data/theme";
import { companyType, ICompany } from "@/types";

export const initialCompanyData: ICompany = {
    _id: '',
    address: '',
    phone: '',
    color: Colors.palette.primary.main,
    label: '',
    prefix: '',
    mcNumber: '',
     usdot: '',
     type: '' as companyType  ,
    email: '',
    termsandconditions:"", 
    logo: null
  }