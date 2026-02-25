import * as Yup from "yup";
import {  locationClasses } from "@/data/Loads";

// Load Schema
const LoadSchema = Yup.object().shape({
  loadNumber: Yup.string()
    .label('Load Number')
    .required('Please enter a valid load number')
    .min(3, 'Load number must be at least 3 characters'),
  loadAmount: Yup.number()
    .label('Load Amount')
    .transform((value, originalValue) => {
      return isNaN(value) || originalValue === '' ? null : value;
    })
    .required('Please enter the load amount')
    .positive('Load amount must be greater than zero'),
  status: Yup.string()
    .label('Status')
    .required('Please select the current load status'),
  commodity: Yup.string()
    .label('Commodity')
    .required('Please specify the commodity type')
    .min(2, 'Commodity description must be at least 2 characters'),
  loadSize: Yup.string()
    .label('Load Size')
    .required('Load size is required'),
  declaredValue: Yup.number().label('Declared Value').transform((value, originalValue) => {
      // Convert empty strings or invalid numbers to `null`
      return isNaN(value) || originalValue === '' ? null : value;
    }).nullable(),
  weight: Yup.number().label('Weight').transform((value, originalValue) => {
      // Convert empty strings or invalid numbers to `null`
      return isNaN(value) || originalValue === '' ? null : value;
    }).nullable(),
  temperature: Yup.number().label('Temperature').transform((value, originalValue) => {
      // Convert empty strings or invalid numbers to `null`
      return isNaN(value) || originalValue === '' ? null : value;
    }).nullable(),
  temperatureUnit: Yup.string().oneOf(["F","C"]).label('Temperature Unit').nullable(),
  equipmentType: Yup.string().label('Equipment Type').required('Equipment type is required'),
  equipmentLength: Yup.mixed().label('Equipment Length').required('Equipment length is required'),
  notes: Yup.string().label('Notes').nullable(),
  pnonumber: Yup.string().label('PO Number').nullable().optional(),
});

// Pickup Schema
const PickupLocationSchema = Yup.array().of(
  Yup.object().shape({
    address: Yup.string().label('Address').required('Address is required'),
    city: Yup.string().label('City').required('City is required'),
    state: Yup.string().label('State').required('State is required'),
    zipcode: Yup.string().label('Zipcode').required('Zipcode is required'),
    country: Yup.string().label('Country').nullable(),
    locationClass: Yup.mixed().label('Location Class').oneOf(locationClasses).required('Location class is required'),
    date: Yup.date().label('Date').required('Date is required'),
    time: Yup.string().label('Time').required('Time is required'),
    endTime: Yup.string().label('End Time').optional()
    // .when("requirements", {
    //   is: (value: string[]) => value.includes("Appointment Required"),
    //   then: (schema) => schema.required("End time is required"),
    //   otherwise: (schema) => schema.notRequired(),
    // })
    ,
    requirements: Yup.array().label('Requirements').default([]),
    notes: Yup.string().label('Notes').nullable(),
  })
);

const DeliveryLocationSchema = Yup.array().of(
  Yup.object().shape({
    address: Yup.string().label('Address').required('Address is required'),
    city: Yup.string().label('City').required('City is required'),
    state: Yup.string().label('State').required('State is required'),
    zipcode: Yup.string().label('Zipcode').required('Zipcode is required'),
    country: Yup.string().label('Country').nullable(),
    locationClass: Yup.mixed().label('Location Class').oneOf(locationClasses).required('Location class is required'),
    date: Yup.date().label('Date').required('Date is required'),
    time: Yup.string().label('Time').required('Time is required'),
    endTime: Yup.string().label('End Time').optional()
    // .when("requirements", {
    //   is: (value: string[]) => value.includes("Appointment Required"),
    //   then: (schema) => schema.required("End time is required"),
    //   otherwise: (schema) => schema.notRequired(),
    // })
    ,
    requirements: Yup.array().label('Requirements').default([]),
    notes: Yup.string().label('Notes').nullable(),
  
  })
);
// Customer Schema
 const CustomerSchema = Yup.object().shape({
  customerId: Yup.string()
    .label('Customer Information')
    .required('Please Add Customer Information'),
  customerContactPerson:Yup.string().label('Contact Person').required('Contact Person is required'),
});
// Main document upload form schema
const documentUploadSchema = Yup.object().shape({
  files: Yup.array()
    .label('Files')
    .of(Yup.mixed())
    .max(10, 'Maximum 10 files allowed'),
});

// Carrier Schema
const CarrierSchema = Yup.object().shape({
    carrier: Yup.string().label('Carrier').required('Carrier is required'),
    powerunit: Yup.string().label('Power Unit').required("Please Add Power Unit"),
    trailer: Yup.string().label('Trailer').required("Please Add Trailer"),
    assignDrivers: Yup.array().label('Assign Drivers').min(1,"Please Add aleast 1 Driver ").of(Yup.string()).default([]).label("Drivers"),
    carrierPay: Yup.number().min(1,"Please Add Carrier Pay").label('Carrier Pay').required("Please Add Carrier Pay"),
    contactPerson: Yup.string().label('Carrier Contact Person').required('Carrier Contact Person is required'),
  })


const tabsSchema={
    "load":LoadSchema, "customer":CustomerSchema, "asset":CarrierSchema, "pickup":PickupLocationSchema,
   "delivery":DeliveryLocationSchema,
   "document":documentUploadSchema
}
const validateLoadSchema = async (tab:string, formData:any) => {
  try {
    // Validate the form data using Yup schema for the specific tab
    await tabsSchema[tab as keyof typeof tabsSchema].validate(formData, { abortEarly: false });
    return { isValid: true, error: null }; // No errors, return valid
  } catch (error) {
    if (error instanceof Yup.ValidationError && error.inner && error.inner.length > 0) {
      // Get the first error message
      const firstError = error.inner[0].message;
      let tabname = tab;
      if(tabname === 'document'){
        tabname = 'Document Upload';
      }else if(tabname === 'pickup'){
        tabname = 'Pickup';
      }else if(tabname === 'delivery'){
        tabname = 'Delivery';
      }else if(tabname === 'customer'){
        tabname = 'Customer';
      }else if(tabname === 'asset'){
        tabname = 'Carrier';
      }else if(tabname === 'load'){
        tabname = 'load';
      }
      let message= tabname=="load"?"":`${tabname}: `;

      throw new Error(`${message}${firstError}`);
    }
  }
};


export { LoadSchema,validateLoadSchema, tabsSchema };
