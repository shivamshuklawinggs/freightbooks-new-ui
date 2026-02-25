import { PaymentMethods } from '@/types/enum';
import { capitalizeFirstLetter } from '@/utils';
import * as yup from 'yup';
import { validPhoneNumber } from '@/utils';
import { ICustomer, OpraStatus } from '@/types';
const combinedSchema = yup.object().shape({
  usdot: yup.string().optional(),
  deleteFiles:yup.array().of(yup.string()).optional().notRequired(),
  mcNumber: yup.string().required('MC Number is required for customers'),
  company: yup.string().required('Company is required for customers'),
  email: yup.string().email('Invalid email').optional().label("Email"),
   phone: yup
     .string().optional().label("Phone NO")
    //  .test('is-valid-phone', 'Invalid phone number', validPhoneNumber)
     ,
   alternatphone: yup
     .string()
     .label("Alternate Phone NO")
     .optional().test('is-valid-phone', 'Invalid phone number', (value) => {
      if (!value) return true;
      return validPhoneNumber(value);
    }).when("phone", {
      is: (value:string) => !value,
      then: (schema) => schema.required("Alternate Phone NO is required"),
    }),
    extentionNo:yup.string().optional(),
  address: yup.string().required('Address is required'),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zipCode: yup.string().optional(),
  paymentMethod: yup.string().optional(),
  paymentTerms: yup.string().optional(),
  vatNumber: yup.string().optional(),
  utrNumber: yup.string().optional(),
  // city: yup.string().required('City is required'),
  // state: yup.string().required('State is required'),
  // zipCode: yup.string().required('Zip code is required'),
  // paymentMethod: yup.string().required('Payment method is required'),
  // paymentTerms: yup.array().of(yup.mixed()).min(1, 'At least one payment term is required'),
  // vatNumber: yup.string().required('VAT Registration Number is required'),
  // utrNumber: yup.string().required('UTR number is required'),
  contactPersons:yup.array().default([]).of(yup.object().shape({
    
  })),
   insurerCompany: yup.string().label('Insurer Company').required('Insurer Company is required'),
    agentName: yup.string().label('Agent Name').required('Agent Name is required'),
    agentAddress: yup.string().label('Agent Address').required('Agent Address is required'),
    agentEmail: yup.string().label('Agent Email').required('Agent Email is required'),
    agentPhoneNumber: yup.string().label('Agent Phone Number').test("phone", "Invalid Phone number", (value)=>validPhoneNumber(value as string)).min(10,"Agent Phone Number must be 10 digits").max(10,"Agent Phone Number must be 10 digits").required('Agent Phone Number is required'),
    commercialGeneralLiability: yup.object().shape({
      issueDate: yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
      expiryDate: yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
      amount: yup.number().label('Amount').required('Amount is required'),
    }),
    automobileLiability: yup.object().shape({
      issueDate: yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
      expiryDate: yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
      amount: yup.number().label('Amount').required('Amount is required'),
    }),
    cargoLiability: yup.object().shape({
      issueDate: yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
      expiryDate: yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
      amount: yup.number().label('Amount').required('Amount is required'),
    }),

});

const PAYMENT_METHODS = Object.values(PaymentMethods).map((method) => ({
  value: method,
  label: capitalizeFirstLetter(method),
}));
const defaultCustomerData:ICustomer={
  company: '',
  email: '',
  phone: '',
  alternatphone: '',
  extentionNo: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  mcNumber: '',
  usdot: '',
  paymentMethod: PaymentMethods.NA,
  paymentTerms: "",
  vatNumber: '',
  utrNumber: '',
  _id: '',
  documents: [],
  deleteFiles: [],
  entity_type: '',
  dba_name: '',
  legal_name: '',
  operating_status: '' as OpraStatus,
  physical_address: '',
  mailing_address: '',
  carrier_operation: [],
  out_of_service_date: '',
  insurerCompany: '',
  agentName: '',
  agentAddress: '',
  agentEmail: '',
  agentPhoneNumber: '',
  commercialGeneralLiability: {
    issueDate: undefined,
    expiryDate: undefined,
    amount: undefined
  },
  automobileLiability: {
    issueDate: undefined,
    expiryDate: undefined,
    amount: undefined
  },
  cargoLiability: {
    issueDate: undefined,
    expiryDate: undefined,
    amount: undefined
  },
  insuranceDocuments: [],
  deleteInsuranceFiles: [],
}
export { PAYMENT_METHODS,defaultCustomerData };
export default combinedSchema;