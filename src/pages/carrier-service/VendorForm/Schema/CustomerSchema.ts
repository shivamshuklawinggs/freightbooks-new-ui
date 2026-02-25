import { PaymentMethods } from '@/types/enum';
import * as yup from 'yup';
import { validPhoneNumber } from '@/utils';
import { ICarrier } from '@/types';
import { capitalizeFirstLetter } from '@/utils';
const combinedSchema = yup.object().shape({
  title: yup.string().oneOf(['mr','mrs','ms','dr','other']).required("Title is required"),
  firstName: yup.string().required("First Name is required"),
  middleName: yup.string().optional(),
  lastName: yup.string().required("Last Name is required"),
  company: yup.string().required("Company is required"),
  displayCustomerName: yup.string().required("Display Vendor Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().test('is-valid-phone', 'Invalid phone number', (value) => {
    if (!value) return true;
    return validPhoneNumber(value);
  }).required("Phone number is required"),
  mobileNo: yup.string().test('is-valid-phone', 'Invalid phone number', (value) => {
    if (!value) return true;
    return validPhoneNumber(value);
  }).optional(),
  fax: yup.string().optional(),
  other: yup.string().optional(),
  website: yup.string().url("Invalid URL").optional(),
  nameToPrintOnCheck: yup.string().optional(),
  isSubCustomer: yup.boolean().label("Is Sub Vendor").optional(),
  parentCustomer: yup.string().label("Parent Vendor").nullable().optional(),

  billingAddress: yup.object().shape({
    address: yup.string().required("Billing Address is required"),
    city: yup.string().required("Billing City is required"),
    state: yup.string().required("Billing State is required"),
    zipCode: yup.string().required("Billing Zip Code is required"),
    country: yup.string().required("Billing Country is required"),
  }),

  shippingAddress: yup.object().shape({
    address: yup.string().required("Shipping Address is required"),
    city: yup.string().required("Shipping City is required"),
    state: yup.string().required("Shipping State is required"),
    zipCode: yup.string().required("Shipping Zip Code is required"),
    country: yup.string().required("Shipping Country is required"),
  }),

  notes: yup.string().optional(),
  status: yup.string().optional(),
  rating: yup.string().optional(),

  paymentMethod: yup
    .string()
    .optional(),

  paymentTerms: yup
    .string()
    .optional(),

  documents: yup.array().default([]),
  deleteFiles: yup.array().of(yup.string()).optional(),
  sameAsBillingAddress:yup.boolean().optional(),
})

const PAYMENT_METHODS = Object.values(PaymentMethods).map((method) => ({
  value: method,
  label: capitalizeFirstLetter(method),
}));
const defaultCustomerData:ICarrier={
  title:'mr',
  firstName: '',
  middleName: '',
  lastName: '',
  company: '',
  email:'',
  insuranceDocuments:[],
  deleteInsuranceFiles:[],
  powerunit:[],
  trailer:[],
  extentionNo:'',
  mcNumber:'',
  usdot:"",
  alternatphone:'',
  address:'',
  rate:0,
  phone: '',
  mobileNo: '',
  fax: '',
  other: '',
  website: '',
  notes: '',
  billingAddress:{
    address:'',
    city:'',
    state:'',
    zipCode:'',
    country:''
  },
  shippingAddress:{
    address:'',
    city:'',
    state:'',
    zipCode:'',
    country:''
  },
  sameAsBillingAddress:false,
  nameToPrintOnCheck:'',
  displayCustomerName:'',
  paymentMethod:PaymentMethods.NA,
  paymentTerms: "",
  documents: [],
  deleteFiles: [],

}
export { PAYMENT_METHODS,defaultCustomerData };
export default combinedSchema;