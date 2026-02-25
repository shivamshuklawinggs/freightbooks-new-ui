import moment, { Moment } from 'moment';
import { TIME_FORMAT } from '@/config/constant';

/**
 * Format a date safely using Moment.js and your TIME_FORMAT constant.
 */
export const formatDate = (date: Date | string | Moment | null): string => {
  try {
    if (!date) return '';
    return moment(date).format(TIME_FORMAT);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

/**
 * Add or subtract days from a given date.
 * @param date Base date (Date | string | Moment)
 * @param days Number of days to add (negative to subtract)
 * @returns A new JavaScript Date
 */
export const addDays = (date: Date | string | Moment, days: number): Date => {
  return moment(date).add(days, 'days').toDate();
};

/**
 * Add or subtract months from a given date.
 */
export const addMonths = (date: Date | string | Moment, months: number): Date => {
  return moment(date).add(months, 'months').toDate();
};

/**
 * Add or subtract years from a given date.
 */
export const addYears = (date: Date | string | Moment, years: number): Date => {
  return moment(date).add(years, 'years').toDate();
};

/**
 * Get the start of a given period.
 */
export const startOf = (date: Date | string | Moment, unit: moment.unitOfTime.StartOf): Date => {
  return moment(date).startOf(unit).toDate();
};

/**
 * Get the end of a given period.
 */
export const endOf = (date: Date | string | Moment, unit: moment.unitOfTime.StartOf): Date => {
  return moment(date).endOf(unit).toDate();
};

/**
 * Compare two dates. Returns:
 *  -1 if a < b
 *   0 if a == b
 *   1 if a > b
 */
export const compareDates = (a: Date | string | Moment, b: Date | string | Moment): number => {
  const diff = moment(a).diff(moment(b));
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
};

/**
 * Calculate the difference in days between two dates.
 */
export const diffInDays = (a: Date | string | Moment, b: Date | string | Moment): number => {
  return moment(a).diff(moment(b), 'days');
};

/**
 * Convert a Date to an ISO string safely.
 */
export const toISOString = (date: Date | string | Moment): string => {
  return moment(date).toISOString();
};

/**
 * Parse a string into a Date safely.
 */
export const parseDate = (dateString: string, format?: string): Date => {
  return format ? moment(dateString, format).toDate() : moment(dateString).toDate();
};
//  show  no of yesra and months if date i passed years if in nts then months if days then days show
export const getDuration = (date: Date): string => {
  const diff = moment().diff(moment(date));
  const years = moment.duration(diff).years();
  const months = moment.duration(diff).months();
  const days = moment.duration(diff).days();
  if (years > 0) return `${years} years ${months} months ${days} days`;
  if (months > 0) return `${months} months ${days} days`;
  return `${days} days `;
};

