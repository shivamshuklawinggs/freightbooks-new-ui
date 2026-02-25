import * as yup from 'yup';
import { isValidObjectId } from '@/utils';
const objectIdCheck = (value: any) => {
  return isValidObjectId(value);
}
export const ItemSecviceSchema = yup.object().shape({
   label: yup.string().required('Label is required'),
    value: yup.string().required('Value is required'),
      productservice: yup
       .string()
       .required("Product service is required")
       .test("is-objectid", "Invalid Product service", objectIdCheck),
});
    