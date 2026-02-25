import { LoadStatus } from '@/types';
import * as yup from 'yup';

export const StatusUpdateSchema = yup.object({
  status: yup
    .string()
    .required('Status is required'),

  notes: yup.string().optional(),
  currentLocation: yup.string().optional().nullable(),

  rating: yup
    .object({
      communication: yup.number().optional(),
      Behavior: yup.number().optional(),
      Performance: yup.number().optional(),
    })
    .when('status', {
      is: (val: any) =>
        val === LoadStatus.DELIVERED || val === LoadStatus.CANCELLED,
      then: (schema: any) =>
        schema.shape({
          communication: yup
            .number()
            .required('Add rating')
            .max(5, 'Max 5 star is required'),
          Behavior: yup
            .number()
            .required('Add rating')
            .max(5, 'Max 5 star is required'),
          Performance: yup
            .number()
            .required('Add rating')
            .max(5, 'Max 5 star is required'),
        })
        .required(),
      otherwise: (schema: any) => schema.notRequired(),
    }),
}).test("rating", "Rating is required", (value:any) => {
  const alloweLoadstatus=[LoadStatus.CANCELLED,LoadStatus.DELIVERED]
  if (!alloweLoadstatus.includes(value.status as LoadStatus)) {
      value.rating = undefined;
  }
  return true;
});
