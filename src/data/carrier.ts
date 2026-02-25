import { ICarrier } from "@/types";
import { PaymentMethods } from "@/types/enum";

export const initialCarrierData:ICarrier= {
      usdot: '',
      mcNumber: '',
      company: '',
      address: '',
      phone: '',
      extentionNo:'',
      alternatphone: '',
      email: '',
      state: '',
      rate: 0,
      powerunit: [],
      zipCode: '',
      trailer: [],
      documents: [],
      drivers: [], // Add drivers array
      insurerCompany: '',
      agentName: '',
      agentAddress: '',
      agentEmail: '',
      agentPhoneNumber: '',
      paymentTerms:"",
      paymentMethod:"" as PaymentMethods,
      insuranceDocuments: [],
      deleteInsuranceFiles: [],
      deleteFiles: [],
      contactPersons:[],

    }