import * as yup from 'yup';
import { isValidObjectId } from '@/utils';
const objectIdCheck = (value: any) => {
  return isValidObjectId(value);
}
const expenseItemSchema = yup.object().shape({
  productservice: yup.string().required("Product service is required").test("is-objectid", "Invalid Product service", objectIdCheck),
  description: yup.string().optional(),
  qty: yup.number().typeError("Quantity must be a number").required("Quantity is required"),
  rate: yup.number().typeError("Rate must be a number").required("Rate is required"),
   tax: yup.string().nullable().optional().test("is-objectid", "Invalid Tax", (value) => {
    return !value || isValidObjectId(value);
  }),
});
export {expenseItemSchema};