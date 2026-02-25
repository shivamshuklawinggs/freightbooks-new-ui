

import * as yup from 'yup';
export const DriverSchema=yup.object({
  driverName: yup.string().required('Driver name is required'),
  driverPhone: yup.string().required('Phone number is required'),
  driverCDL: yup.string().required('CDL number is required'),
  driverCDLExpiration: yup.date().required('Expiration date is required'),
  isActive: yup.boolean().required(),
  file: yup.mixed().required('File is required'),
});