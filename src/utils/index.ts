import { LOAD_STATUSES } from "@/data/Loads";
import { Colors } from "@/data/theme";
import {   ICarrier,  ICommonUsdotData,  IDocument, IFile, IInvoice, invoiceexpense, IVendorBill, Role } from "@/types";
import axios from "axios";
// import  {PhoneNumberUtil} from "google-libphonenumber"
import moment from "moment";
import api from "./axiosInterceptor";
import { toast } from "react-toastify";
import apiService from "@/service/apiService";
import { MatchUSDotDataCarrier } from "@/hooks/useGetUsDotData";
import {  invoiceStatus } from "@/types/enum";
import { TIME_FORMAT } from "@/config/constant";
// const phoneUtil = PhoneNumberUtil.getInstance();
/**
 * @description max input allow
 * @param e event
 * @param n number
 */
const maxinputAllow = (e: React.ChangeEvent<HTMLInputElement>, n: number = 10): void => {
  if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
    e.target.value = '';
    return;
  } else {
    e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, n);
  }
};
const maxnumberInput = (e: React.ChangeEvent<HTMLInputElement>, max: number = 10): void => {
  const rawValue = e.target.value;

  // Allow empty string (user deleting)
  if (rawValue === '') {
    e.target.value = '';
    return;
  }

  const numericValue = parseInt(rawValue, 10);

  // If not a number, clear it
  if (isNaN(numericValue)) {
    e.target.value = '';
    return;
  }

  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(numericValue, 0), max);

  e.target.value = clampedValue.toString();
};

/**
 * @description check expiry of  insurance
 * @param expiryDate expiry date
 */
const checkInsuranceExpiryDate = (
  commercialexpiryDate: string,
  automobileexpiryDate: string,
  cargoexpiryDate: string
): boolean => {
  const sevenDaysFromNow = moment().add(7, 'days'); // today + 7 days
  let isExpire = false;

  if (!commercialexpiryDate || !automobileexpiryDate || !cargoexpiryDate) {

    return true;
  }

  const expiryDates = [
    moment(commercialexpiryDate),
    moment(automobileexpiryDate),
    moment(cargoexpiryDate)
  ];

  expiryDates.forEach((expiry, index) => {
    console.info(`expiry${index + 1}:`, expiry.format(TIME_FORMAT));
  });

  console.info("Checking against date:", sevenDaysFromNow.format(TIME_FORMAT));

  // Check if any expiry is before or equal to 7 days from now
  isExpire = expiryDates.some(expiry => expiry.isSameOrBefore(sevenDaysFromNow));

  console.info("isExpire", isExpire);
  return isExpire;
};
/**
 * @description check operating status
 * @param data data
 */
const isAuthorizedUsdot =async (usdot:string,carrier?:ICarrier): Promise<{isAuth:boolean,nonMatchedData:any}> => {
  const usdotNumber:{
    data:ICommonUsdotData
  }=await apiService.getDataByUsdotNumber(usdot)
  let isAuth=["NOT AUTHORIZED", "OUT-OF-SERVICE"].includes(usdotNumber?.data?.operating_status as string) ?false:true
  if(carrier){
    const nonMatchedData=await MatchUSDotDataCarrier(carrier,usdotNumber)
    return {isAuth:isAuth,nonMatchedData:nonMatchedData}
  }
  return {isAuth:isAuth,nonMatchedData:{}}
};
const getSubDocumentName = (document: IDocument, subtype: string) => {
  switch (subtype) {
    case 'carrier':
      return document?.company || 'N/A';
    case 'customer':
      return document?.company || 'N/A';
    case 'load':
      return document?.loadNumber || 'N/A';
    case 'invoice':
      return document?.invoiceNumber || 'N/A';
    case 'driver':
      return document?.driverName || 'N/A';
    case 'deliverycheckout':
      return document?.loadNumber || 'N/A';
    case 'pickupcheckout':
      return document?.loadNumber || 'N/A';
    case 'expense':
      return document?.service.label || 'N/A';
    case 'carrierinsurance':
      return document?.insurerCompany || 'N/A';
    case 'customerinsurance':
      return document?.insurerCompany || 'N/A';
    default:
      return 'N/A';
  }
}
const getDocumentCell = (activeTab: string) => {
  switch (activeTab) {
    case 'load':
      return "Load Number"
    case 'customer':
      return "Customer Name";
    case 'carrier':
      return "Carrier Name";
    case 'invoice':
      return "Invoice Number";
    case 'driver':
      return "Driver Name";
    case 'deliverycheckout':
      return "Delivery Checkout";
    case 'pickupcheckout':
      return "Load Number";
    case 'expense':
      return "Expense";
    default:
      return '';
  }
}
/**
 * @description prevent string input
 * @param e event
 */
const preventStringInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

/**
 * @description prevent string input with minus
 * @param e event
 */
const preventStringInputWithMinus = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (e.key === '-') {
    const input = e.target as HTMLInputElement;
    if (input.selectionStart !== 0 || input.value.includes('-')) {
      e.preventDefault();
    }
    return;
  }

  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};
/**
 * @description Allows numbers, minus (only at start), and one decimal point.
 * @param e event
 */
const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

  // Always allow navigation & deletion keys
  if (allowedKeys.includes(e.key)) return;

  const input = e.target as HTMLInputElement;
  const value = input.value;

  // Allow one minus sign only at the start
  if (e.key === '-') {
    if (input.selectionStart !== 0 || value.includes('-')) {
      e.preventDefault();
    }
    return;
  }

  // Allow one decimal point (but not at start or multiple times)
  if (e.key === '.') {
    if (value.includes('.') || input.selectionStart === 0) {
      e.preventDefault();
    }
    return;
  }

  // Allow only digits (0–9)
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * @description get carrier subtotal
 * @param loadAmount load amount
 * @param rate rate
 * @returns 
 */
const getCarrierSubtotal = (loadAmount: number = 0, rate: number = 0, carrierPay: number = 0): number => {
  try {
    const Amount = (loadAmount || 0) - (carrierPay || 0)
    const amount = (Amount || 0) - (Amount * rate / 100)
    return amount
  } catch (error) {
    console.warn("Error in getCarrierSubtotal:", error);
    return 0;
  }
};

/**
 * @description get carrier amount
 * @param loadAmount load amount
 * @param carrierPay carrierPay
 * @returns 
 */
const getCarrierMarginAmount = (loadAmount: number = 0, carrierPay: number = 0): number => {
  try {
    const Amount = (loadAmount || 0) - (carrierPay || 0)
    return Amount
  } catch (error) {
    console.warn("Error in getCarrierMarginAmount:", error);
    return 0;
  }
};

/**
 * @description get customer subtotal
 * @param loadAmount load amount
 * @returns 
 */
const getCustomerSubtotal = (loadAmount: number = 0): number => {
  try {
    return loadAmount
  } catch (error) {
    console.warn("Error in getCustomerSubtotal:", error);
    return 0;
  }
};

/**
 * @description get status color
 * @param status status
 * @returns 
 */
const getStatusColor = (status: string) => {

  switch (status) {
    case 'Pending':
      return Colors.Pending;
    case 'Delivered':
      return Colors.Delivered;
    case 'Cancelled':
      return Colors.Cancelled;
    case 'In Progress':
      return Colors.InProgress;

    case 'Dispatched':
      return Colors.Dispatched;
    case 'Picked Up':
      return Colors.PickedUp;
    case 'Claimed':
      return Colors.Claimed;
    case 'Claimed & Delivered':
      return Colors.ClaimedDelivered;
    case 'customer':
      return Colors.customer;
    case 'carrier':
      return Colors.carrier;
    case 'repair':
      return Colors.repair;
    default:
      return Colors.unknown;
  }
};
  // Function to get color based on rating value
export   const getRatingColor = (value: number | null | undefined): string => {
    if (!value) return '#9e9e9e';
    if (value >= 4.5) return '#4caf50'; // Excellent - green
    if (value >= 3.5) return '#8bc34a'; // Good - light green
    if (value >= 2.5) return '#ff9800'; // Average - orange
    if (value >= 1.5) return '#ff5722'; // Poor - deep orange
    return '#f44336'; // Very Poor - red
  };
export  const getRatingLabel = (value: number): string => {
    if (value >= 4.5) return 'Excellent';
    if (value >= 3.5) return 'Good';
    if (value >= 2.5) return 'Average';
    if (value >= 1.5) return 'Poor';
    if (value >= 0.001) return 'Very Poor';
    return 'Excellent';
  };
const invoiceStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return Colors.Pending;
    case 'Partially':
      return Colors.PartiallyPaid;
    case 'Paid':
      return Colors.Paid;
    case 'Overdue':
      return Colors.Overdue;
    case 'Cancelled':
      return Colors.Cancelled;
    default:
      return Colors.unknown;
  }
};
const getInvoiceStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return Colors.Pending;
    case 'Partially':
      return Colors.PartiallyPaid;
    case 'Paid':
      return Colors.Paid;
    case 'Overdue':
      return Colors.Overdue;
    case 'Cancelled':
      return Colors.Cancelled;
    default:
      return Colors.unknown;
  }
}

/**
 * @description is valid object id
 * @param id id
 * @returns 
 */
const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};

/**
 * @description get location by name
 * @param newLocation location name
 * @returns 
 */
const getLocationByName = async (newLocation: string) => {
  try {
    const API_URL = 'https://nationalusa.net/api/';
    const response = await axios.get(`${API_URL}getlocationlistbyname?apikey=a1nm2o55l5&name=${newLocation}`);
    if (!response.data) {
      throw new Error('Failed to fetch location data');
    }
    const data = response.data;
    return data.response?.map((item: any) => {
      // let location = item.location;
      let city = item?.city?.name;
      let state = item?.state?.name;
      let zipcode = item?.zipcode;
      let country = item?.country?.name;
      return `${city || ''}, ${state || ''} ${zipcode || ''},${country || ''}`;
    }) || [];
  } catch (error: any) {
    console.warn('Error fetching location data:', error);
    return [];
  }
};
/**
 * @description auto cimplete location
 * @param newLocation location name
 * @returns 
 */
const AutoCimpleteLocation = async (newLocation: string) => {
  try {
    const API_URL = 'https://nationalusa.net/api/';
    const response = await axios.get(`${API_URL}getlocationlistbyname?apikey=a1nm2o55l5&name=${newLocation}`);
    if (!response.data) {
      throw new Error('Failed to fetch location data');
    }
    const data = response.data;
    return data.response?.map((item: any) => {
      // let location = item.location;
      let city = item?.city?.name;
      let state = item?.state?.name;
      let zipcode = item?.zipcode;
      let country = item?.country?.name;
      return {
        city,
        state,
        zipcode,
        country
      }
    }) || [];
  } catch (error: any) {
    console.warn('Error fetching location data:', error);
    return [];
  }
};
// capitalize first letter and after space first letter also
const capitalizeFirstLetter = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
const parseJSON = (value: string | undefined) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return undefined;
  }
}
const handleFileDownload = async (file: IFile, dest: string) => {


  const fileUrl = `${dest}${file.filename}`;

  try {
    // Fetch the file from the server
    const response = await api.get(fileUrl, { responseType: 'blob' });
    if (!response) throw new Error(`Failed to fetch file`);

    // Get the file as a Blob
    const blob = response.data

    // Create a temporary URL for the Blob
    const blobUrl = URL.createObjectURL(blob);

    // Create and trigger an invisible download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.originalname; // Force download with filename
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.warn('Download error:', error);
    toast.error('Failed to download file');
  }
};
/**
 * 🔽 Download Base64 File Utility
 * -------------------------------------
 * Converts a base64 string into a Blob and triggers a file download.
 * Supports any file type (default: PDF).
 *
 * @param base64Data - The base64 encoded file data (without the data URI prefix)
 * @param fileName - The desired download filename (default: "document.pdf")
 * @param mimeType - The MIME type (default: "application/pdf")
 * @returns The object URL (for optional preview)
 */
export const downloadBase64File = (
  base64Data: string,
  fileName = "document.pdf",
  mimeType = "application/pdf"
): string => {
  try {
    // Decode base64 string to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Convert binary to Blob
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Create Object URL
    const fileURL = URL.createObjectURL(blob);

    // Trigger browser download
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;
    link.click();

    // Optional: cleanup after short delay
    setTimeout(() => URL.revokeObjectURL(fileURL), 5000);

    return fileURL;
  } catch (error) {
    console.error("Error downloading base64 file:", error);
    throw new Error("Failed to process base64 file.");
  }
};

const getClaimedStatus = (status: string) => {
  let data = LOAD_STATUSES.find(
    (item) =>
      [Colors.ClaimedDelivered, Colors.Claimed].includes(item.color) &&
      item.label === status
  );
  return data
};

const validPhoneNumber = (value: string) => {
  try {
    // const parsedNumber = phoneUtil.parse(value); // You can pass a second arg like 'US' as default region
    // return phoneUtil.isValidNumber(parsedNumber);
    // check phone number is valid or not
    //check 10 digit number
    let check = value.length === 10;
    return !value ? false : check;
  } catch (error) {
    console.warn("error", error)
    return false;
  }
};
const preventInvalidPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  // Optional: restrict to allowed characters (digits, spaces, dash, parentheses)
  //replace non numeric characters
  value = value.replace(/[^\d]/g, '');
  e.target.value = value;
}
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};



const isRole = {
  isSuperAdmin: (role: string) => {
    return role === Role.SUPERADMIN;
  },
  isAdmin: (role: string) => {
    return role === Role.ADMIN;
  },
  isDispatcher: (role: string) => {
    return role === Role.DISPATCHER;
  },
  isManager: (role: string) => {
    return role === Role.MANAGER;
  },
  isAccountant: (role: string) => {
    return role === Role.ACCOUNTANT;
  }
}
const getRateInvoice = (invoiceType: "customer" | "carrier" | "other") => {
  let rate="Customer Rate"
  switch (invoiceType) {
    case "customer":
      rate="Customer Rate";
      break;
    case "carrier":
      rate="Dispatch Rate";
      break;
    case "other":
      rate="Rate";
      break;
    default:
      break;
  }
  return rate
}
const getRateInvoiceData = ( {invoice,bill}: {invoice?: IInvoice,bill?:IVendorBill} ) => {
  const invoiceType :"customer"|"vendor"|"other"= bill?.vendorId? "vendor":invoice?.customerId? "customer":"other"
  const isload=bill?.loadId || invoice?.loadId
  let amount=0
  switch (true) {
    case isload && invoiceType==="customer":
      amount=getCustomerSubtotal((invoice as IInvoice).loadAmount);
      break;
    case isload && invoiceType==="vendor":
      amount= 0
      break;
    default:
      break;
  }
  return amount
}
const truncateText = (text: string, maxLength: number = 15): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
const getFullName = (data: Record<string, any>) => {
  let text = ''
  if(data){

  
  if (data?.title) {
    text += capitalizeFirstLetter(data.title) + ' '
  }
  if (data?.firstName) {
    text += capitalizeFirstLetter(data.firstName) + ' '
  }
  if (data?.lastName) {
    text += capitalizeFirstLetter(data.lastName)
  }
  if(data.hasOwnProperty("isCarrier") && !data?.isCarrier){
    return capitalizeFirstLetter(data?.company ||  data?.company || "N/A")  
  } 
  if(data.hasOwnProperty("isAccountCustomer") && !data?.isAccountCustomer){
    return   capitalizeFirstLetter(data?.company || data?.company || "N/A")
  }
  if(data?.company){
    return capitalizeFirstLetter(data?.company)
  }
}
 
  return text
}
const calculateSubTotal = (expenses: invoiceexpense[]) =>
  expenses.reduce((total, exp) => total + Number(exp.amount), 0);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
const downloadCSV = async ({filename="", mimeType="", base64=""}) => {

  const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};
const handlePrint = (printRef: React.RefObject<HTMLDivElement>,title:string="") => {
  if (!printRef.current) return;

  // Clone the node so we don't mutate the live DOM
  const clone = printRef.current.cloneNode(true) as HTMLElement;

  // Remove all elements with class "no-print"
  clone.querySelectorAll('.no-print').forEach(el => el.remove());

  const printContents = clone.innerHTML;

  const printWindow = window.open('', '', 'width=1024,height=768');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 12px;
            }
            th {
              background: #f5f5f5;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
};
const addressformat = ({
  billingAddress
}: {
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}) => {
  let text = '';
  if (billingAddress?.address) {
    text += billingAddress?.address;
  }
  if (billingAddress?.city) {
    text += ', ' + billingAddress?.city;
  }
  if (billingAddress?.state) {
    text += ', ' + billingAddress?.state;
  }
  if (billingAddress?.zipCode) {
    text += ', ' + billingAddress?.zipCode;
  }
  if (billingAddress?.country) {
    text += ', ' + billingAddress?.country;
  }
  return text;
};

/**
 * @description Calculate total received amount for a specific invoice
 * @param recievedPayments Array of received payments
 * @param invoiceId Invoice ID to filter by
 * @returns Total received amount for the invoice
 */
const calculateTotalRecievedAmount = (
  recievedPayments: Array<{ invoiceId: string; amount: number | string }>=[],
  invoiceId: string,
  nonRecievedPayments: Array<{ invoiceId: string; amount: number | string }>=[],
): number => {
  if (!recievedPayments || !invoiceId || !nonRecievedPayments) return 0;
  const totalAmount = [...recievedPayments,...nonRecievedPayments]
    .filter(payment => payment.invoiceId === invoiceId)
    .reduce((acc, payment) => acc + Number(payment.amount || 0), 0);
    return totalAmount
};

/**
 * @description Get total amount for a specific invoice from customer invoices
 * @param customerInvoices Array of customer invoices
 * @param invoiceId Invoice ID to find
 * @returns Total amount with tax for the invoice
 */
const getInvoiceTotalAmount = (
  customerInvoices: Array<{ _id: string; totalAmountWithTax: number }>,
  invoiceId: string
): number => {
  if (!customerInvoices || !invoiceId) return 0;
  
  const invoice = customerInvoices.find(inv => inv._id === invoiceId);
  return invoice?.totalAmountWithTax || 0;
};

/**
 * @description Calculate real-time due amount for a specific invoice
 * @param customerInvoices Array of customer invoices
 * @param recievedPayments Array of received payments
 * @param invoiceId Invoice ID to calculate for
 * @returns Due amount remaining for the invoice
 */
const calculateInvoiceDueAmount = (
  customerInvoices: Array<{ _id: string; totalAmountWithTax: number }>,
  recievedPayments: Array<{ invoiceId: string; amount: number | string }>,
  invoiceId: string,
  nonRecievedPayments: Array<{ invoiceId: string; amount: number | string }>,
): number => {
  if (!invoiceId) return 0;
  
  const totalAmount = getInvoiceTotalAmount(customerInvoices, invoiceId);
  const totalReceived = calculateTotalRecievedAmount(recievedPayments, invoiceId,nonRecievedPayments);
  
  return Math.max(0, totalAmount - totalReceived);
};

/**
 * @description Validate payment amount against available due amount
 * @param customerInvoices Array of customer invoices
 * @param recievedPayments Array of received payments
 * @param invoiceId Invoice ID to validate against
 * @param amount Amount to validate
 * @param currentPaymentAmount Current payment amount to exclude from calculation
 * @returns Validation result with error message and limits
 */
const validatePaymentAmount = (
  customerInvoices: Array<{ _id: string; totalAmountWithTax: number; dueAmount: number }>,
  recievedPayments: Array<{ invoiceId: string; amount: number | string }>,
  invoiceId: string,
  currentPaymentAmount: number = 0,
  nonRecievedPayments: Array<{ invoiceId: string; amount: number | string }>,
): {
  isValid: boolean;
  maxAllowed: number;
  errorMessage: string;
} => {
  if (!invoiceId) {
    return {
      isValid: false,
      maxAllowed: 0,
      errorMessage: 'Invalid invoice'
    };
  }
  const invoice = customerInvoices?.filter(inv => inv._id === invoiceId);
  const originalDueAmount = invoice.reduce((acc, inv) => acc + inv.dueAmount, 0);
  const currentReceivedAmount = calculateTotalRecievedAmount(recievedPayments, invoiceId,nonRecievedPayments) - currentPaymentAmount;
  const maxAllowedPayment = Math.max(0, (originalDueAmount - currentReceivedAmount)-currentPaymentAmount);

  return {
    isValid: maxAllowedPayment > 0,
    maxAllowed: maxAllowedPayment,
    errorMessage: maxAllowedPayment <= 0 
      ? 'No remaining balance to pay' 
      : `Max allowed: ${formatCurrency(maxAllowedPayment)}`
  };
};
const getInvoiceStatus=(dueAmount:number,dueDate:Date,type:"bill" | "invoice"):{label:string,color:"success"|"error"|"info"}=>{
       const today = new Date();
     const dueDateObj = new Date(dueDate);
     const isDueDatePassed = dueDateObj < today && dueAmount > 0;
     
   if(type === "bill"){
     if (isDueDatePassed) {
      const passseddays = today.getTime() - dueDateObj.getTime();
      const days = Math.floor(passseddays / (1000 * 60 * 60 * 24));
       return {label:`${invoiceStatus.OVERDUE} (${days} days)`,color:"error"};
     }
    else if (dueAmount > 0) {
       return {label:invoiceStatus.PENDING,color:"info"};
     }
     else if (dueAmount === 0) {
       return {label:invoiceStatus.PAID,color:"success"};
     }
    }
    else if(type === "invoice"){
     if (isDueDatePassed) {
      const passseddays = today.getTime() - dueDateObj.getTime();
      const days = Math.floor(passseddays / (1000 * 60 * 60 * 24));
       return {label:`${invoiceStatus.OVERDUE} (${days} days)`,color:"error"};
     }
     else if (dueAmount > 0) {
       return {label:invoiceStatus.PENDING,color:"info"};
     }
     else if (dueAmount === 0) {
       return {label:invoiceStatus.RECEIVED,color:"success"};
     }
    }

     return {label:invoiceStatus.PAID,color:"success"};
}

export {getInvoiceStatus, maxinputAllow,downloadCSV, getClaimedStatus,preventInvalidNumberInput, validPhoneNumber, getSubDocumentName, getDocumentCell, formatCurrency, preventStringInput, capitalizeFirstLetter, getStatusColor, getCustomerSubtotal, getCarrierSubtotal, preventStringInputWithMinus, isValidObjectId, getLocationByName, AutoCimpleteLocation, parseJSON, handleFileDownload, preventInvalidPhone, checkInsuranceExpiryDate, isAuthorizedUsdot, isRole, getCarrierMarginAmount, calculateSubTotal, getRateInvoice, getRateInvoiceData, maxnumberInput, truncateText, getFullName, getInitials,invoiceStatusColor ,getInvoiceStatusIcon,handlePrint,addressformat, calculateTotalRecievedAmount, getInvoiceTotalAmount, calculateInvoiceDueAmount, validatePaymentAmount };