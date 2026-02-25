
import * as yup from 'yup';
export enum FollowUpStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
}
export enum PaymentStatus {
    UNPAID = 'Unpaid',
    PAID = 'Paid'
}
export interface IFollowUp {
    location: string;
    service: string;
    status: FollowUpStatus;
    followupDate: Date;
    paymentStatus: PaymentStatus;
}
export const FollowUpSchema = yup.object<IFollowUp>().shape({
  location: yup.string().required('Location is required'),
  service: yup.string().required('Service is required'),
  status: yup
    .string()
    .oneOf(Object.values(FollowUpStatus), 'Invalid status')
    .required('Status is required'),
  followupDate: yup.mixed<Date>().required('Follow-up Date is required'),
  paymentStatus: yup
    .string()
    .oneOf(Object.values(PaymentStatus), 'Invalid payment status')
    .required('Payment Status is required')
});

export const defaultFollowUpValues = {
  location: "",
  service: "",
  status: FollowUpStatus.PENDING,
  followupDate:new Date(),
  paymentStatus: PaymentStatus.UNPAID
} as const;

export type FollowUpFormData = yup.InferType<typeof FollowUpSchema>;