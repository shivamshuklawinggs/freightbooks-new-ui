// import { validPhoneNumber } from "@/utils";
import { validPhoneNumber } from "@/utils";
import * as Yup from "yup";

const carrierFormSchema = Yup.object().shape({
  usdot: Yup.string().label('USDOT').required('USDOT is required'),
  mcNumber: Yup.string().label('MC Number').required('MC Number is required'),
  company: Yup.string().label('Company Name').required('Company Name is required'),
  address: Yup.string().label('Address').required('Address is required'),
   contactPersons:Yup.array().default([]).notRequired(),
  alternatphone: Yup.string().optional()
    .label('Alternate Contact').when("phone", {
      is: (value:string) => !value,
      then: (schema) => schema.required("Alternate Phone NO is required"),
    }),
    // .test('is-valid-phone', 'Invalid phone number', validPhoneNumber),
  phone: Yup.string().optional()
    .label('Primary Contact'),
    extentionNo: Yup.string().optional()
    .label('Extension No'),
    // .test('is-valid-phone', 'Invalid phone number', validPhoneNumber),
  email: Yup.string().email("Invalid email").label('Contact Email').optional(),
  rate: Yup.number().label('Rate').required('Rate is required'),
  powerunit: Yup.array().of(Yup.string()).label('Power Unit').required('Power Unit is required'),
  trailer: Yup.array().of(Yup.string()).label('Trailer').required('Trailer is required'),
  documents: Yup.array().of(Yup.mixed()).label('Documents').required('Documents are required'),
  insurerCompany: Yup.string().label('Insurer Company').required('Insurer Company is required'),
  agentName: Yup.string().label('Agent Name').required('Agent Name is required'),
  agentAddress: Yup.string().label('Agent Address').required('Agent Address is required'),
  agentEmail: Yup.string().label('Agent Email').required('Agent Email is required'),
  agentPhoneNumber: Yup.string().label('Agent Phone Number').test("phone", "Invalid Phone number", (value)=>validPhoneNumber(value as string)).min(10,"Agent Phone Number must be 10 digits").max(10,"Agent Phone Number must be 10 digits").required('Agent Phone Number is required'),
  commercialGeneralLiability: Yup.object().shape({
    issueDate: Yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
    expiryDate: Yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
    amount: Yup.number().label('Amount').required('Amount is required'),
  }),
  automobileLiability: Yup.object().shape({
    issueDate: Yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
    expiryDate: Yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
    amount: Yup.number().label('Amount').required('Amount is required'),
  }),
  cargoLiability: Yup.object().shape({
    issueDate: Yup.date().label('Issue Date').max(new Date(), 'Issue Date must be today or in the past').required('Issue Date is required'),
    expiryDate: Yup.date().label('Expiry Date').min(new Date(), 'Expiry Date must be in the future').required('Expiry Date is required'),
    amount: Yup.number().label('Amount').required('Amount is required'),
  }),
})

export default carrierFormSchema;
