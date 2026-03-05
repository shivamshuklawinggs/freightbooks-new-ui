
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { invoiceStatus, PaymentMethods } from "./enum";
import { CategoryType, } from "@/data/ProductServiceData";
import { Route } from "@/routes";
// =============================================================================
// 1. TYPE DEFINITIONS (Mirrors backend for consistency)
// =============================================================================

const allowedreportTypes = ["profit-and-loss", "profit-and-loss-month", "balance-sheet", "AccountsReceiveable", "AccountsPayable", "AccountsPayableDetail", "AccountsRecieveableDetail", "TrialBalanceReport", "GeneralLedgerReport"] as const
export type ActionType = 'create' | 'view' | 'update' | 'delete' | 'import' | 'export';
export enum PaymentType {
    bill = "bill",
    invoice = "invoice",
}
export type ResourceType = 'loads' | 'dispatcher' | 'customers' | 'carriers' | 'documents' | 'expense_service' | 'accounting' | 'users' | 'dashboard' | 'company' | 'layout' | 'public' | 'superadmin' 
export type allowedreports = typeof allowedreportTypes[number]
export interface PermissionCheck {
  action: ActionType;
  resource: ResourceType[]
}
export enum paidtype {
  customer="customer",other="other",vendor="vendor"
}
// Render public routes
export interface RoteExtended extends Route {
  action: ActionType;
  resource: ResourceType[];
}
export interface GetLoadsParams {
  page: number;
  limit: number;
  status: string;
  search?: string;
  startAmt?: string;
  endAmt?: string;
  StartPickupDate?: any;
  EndPickupDate?: any;
  StartDeliveryDate?: any;
  EndDeliveryDate?: any;
}
export interface ISessionDoc {
  _id: string;
  expires: Date;
  session: { userId?: string; createdAt?: Date };
};
export interface IPaymentTerm {
  _id?: string;
  name: string;
  description?: string;
  dueDays?: number;
  discountPercent?: number;
  discountDays?: number;
  isActive?: boolean;
  companyId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPayment {
  _id: string;
  invoiceNumber?: string;
  postingDate: Date;
  customerId?: string;
  createdAt?: Date;
  status: "Settled" | "Unpaid" | "Partially Paid";
  PaymentType?:PaymentType;
  updatedAt?: Date;
  invoiceIds?: string[];
  billids?: string[];
  createdBy: string;
  updatedBy: string;
  companyId?: string;
  paymentDate: Date;
  paymentMethod: string;
  referenceNo: string;
  depositTo: string;
  amount: number;
  customer?: {
    _id: string;
    displayName: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  // Added from API response
  credit?: number;
  debit?: number;
  type?: "Invoice" | "Bill" | "Unsettled";
}

export interface IPlan {
  _id?: string;
  name: string;
  description: string;
  price: number;
  noOfUsers: number;
  isActive: boolean;
};
export interface SidebarMenuItem {
  path: string;
  title: string;
  icon?: string;
  icontype?: string;
  action: ActionType;
  resource: ResourceType[];
  currentCompany?: boolean;
  children?: SidebarMenuItem[];
  hideInMenu?: boolean;
}

export interface SideDrawerProps {
  drawerWidth: number;
}
export enum Role {
  DISPATCHER = 'dispatcher',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  MANAGER = 'manager',
  ACCOUNTANT = 'accountant',
}

export const ROLES = Object.values(Role);
export const VisibleCompanyAssignedRoles = [Role.DISPATCHER, Role.MANAGER, Role.ACCOUNTANT];
export interface IExpenseItem {
  value: number | any
  service: string | any
  desc: string;
  positive: boolean;
}
export type AccountCategoryType =
  | "income"
  | "expense"
  | "asset"
  | "liability"
  | "equity";
export interface IParentAccountType {
  _id: string;
 name: string;
    type: IParentAccountTypeEnum;
    masterType:masterType;
    desc:string,
    subLevel:number,
    typeId:string,
    typeMnemonic:string,
    typeEnumName:string,
    detailTypeId:string,
    detailType:string,
    detailTypeMnemonic:string,
    detailTypeEnumName:string,
    journalCodeTypeId?:string
}
export interface IAccountDetailType {
  _id: string;
   desc: string;
  name: string;
  subLevel: number;
  typeId: string;
  type: IParentAccountTypeEnum;
  masterType:masterType;
  typeMnemonic: string;
  typeEnumName: string;
  detailTypeId: string;
  detailType: string;
  detailTypeMnemonic: string;
  detailTypeEnumName: string;
  journalCodeTypeId?: string;
  parentAccountTypeId:string;
}
export interface IActivityLog {
  _id?: string;
  userName: string;
  collectionName: string;
  action: string;
  changes: string;
  timestamp: string;
}
export interface IContactPerson {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  extentionNo?: string
}
export interface IPaymentRecived {
  customer: string;
  paymentDate: Date;
  postingDate: Date;
  paymentMethod: string;
  referenceNo: string;
  searchInvoice: string,
  fromDate: Date | null,
  toDate: Date | null,
  overdueOnly: string,
  invoicePayments: Array<{
    invoiceId: string;
    amount: number;
    totalAmountWithTax?: number
  }>;
  recievedPayments?: Array<{
    invoiceId: string;
    amount: number;
    totalAmountWithTax?: number
  }>;
  nonRecievedPayments?: Array<{
    invoiceId: string;
    amount: number;
    totalAmountWithTax?: number
  }>;
  amount: number;
  depositTo: string
  credits?: number;
  deletedPayments?: any
  customerInvoices?: ICustomerInvoicesPaymentDetails[];
}
export interface IPaymentRecivedData {
  paymentDate: Date;
  postingDate: Date;
  paymentMethod: string;
  referenceNo: string;
  invoicePayments: Array<{
    invoiceId: string;
    amount: number;
    totalAmountWithTax?: number
  }>;
  amount: number;
  depositTo: string;
  customer: {
    _id: string,
    email: string,
    phone: string,
    billingAddress: {
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    },
    paymentMethod: PaymentMethods,
    company: string,
    account: boolean
  },
}
export interface IPaymentRecivedUpdate {
  paymentDate: Date;
  postingDate: Date;
  paymentMethod: string;
  referenceNo: string;
  amount: number;
  depositTo: string;
}

export interface ICustomerInvoicesPaymentDetails {
  _id: string;
  BillNumber?: string;
  dueDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  totalAmountWithTax: number;
  dueAmount: number;
  recievedAmount: number;
  createdAt: string;
  status: invoiceStatus
  type: string;
  amount: string;
  daysLate: number;
  paymentDate: Date;
  vendorId: string;
  credits: number;
  transaction: "payment" | "Invoice" | "Bill" | "Journal Entry"
  customer: {
    _id: string,
    email: string,
    phone: string,
    billingAddress: {
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    },
    paymentMethod: PaymentMethods,
    company: string,
    account: boolean
  },
}
export interface ITotalTransactionCount {
  years: number[],
  total: number
}


export interface ICustomerTransactionDetails {
  _id: string;
  isCarrier?: boolean
  isAccountCustomer?: boolean
  // Financial details
  OpenBalance?: number;
  totalRecievedAmount?: number;
  totalDueAmount?: number;
  totalOverDueAmt?: number;

  // Identification & company info
  customerId?: string;
  company?: string;
  dba_name?: string;
  legal_name?: string;
  entity_type?: string;
  operating_status?: OpraStatus;
  mcNumber?: string;
  usdot?: string;
  vatNumber?: string;
  utrNumber?: string;
  rating?: string;
  status?: string;

  // Contact info
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nameToPrintOnCheck?: string;
  displayCustomerName?: string;
  email: string;
  phone?: string;
  mobileNo?: string;
  alternatphone?: string;
  extentionNo?: string;
  fax?: string;
  other?: string;
  website?: string;

  // Addresses
  address?: string;
  state?: string;
  zipCode?: string;
  physical_address?: string;
  mailing_address?: string;
  billingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  shippingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // Payment
  paymentMethod?: string;
  paymentTerms?: string;

  // Documents
  documents?: Array<{
    fieldname?: string;
    originalname?: string;
    encoding?: string;
    mimetype?: string;
    destination?: string;
    filename?: string;
    path?: string;
    size?: number;
    _id?: string;
  }>;
  insuranceDocuments?: any[];

  // Insurance / liability
  commercialGeneralLiability?: {
    issueDate?: string;
    expiryDate?: string;
    amount?: number;
  };
  automobileLiability?: {
    issueDate?: string;
    expiryDate?: string;
    amount?: number;
  };
  cargoLiability?: {
    issueDate?: string;
    expiryDate?: string;
    amount?: number;
  };

  // Carrier operations
  carrier_operation?: string[];
  out_of_service_date?: string;

  // Notes / metadata
  notes?: string;
  insurerCompany?: string;
  agentExtentionNo?: string;
  agentName?: string;
  agentAddress?: string;
  agentEmail?: string;
  agentPhoneNumber?: string;

  // Timestamps
  createdBy?: string;
  updatedBy?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStatementCreate {
  data: [
    {
      _id: string,
      type: string,
      invoiceNumber: string,
      status: invoiceStatus,
      invoiceDate: Date,
      dueDate: Date,
      recievedAmount: number,
      overdueAmount: number,
      totalAmount: number,
      balanceDue: number
    }
  ],
  totalBalance: number,
  totalRecievedAmount: number,
  totalBalanceDue: number,
  customerId: string,
  account: boolean,

}
export interface IStatements {
  data: [
    {
      _id: string,
      type: string,
      invoiceNumber: string,
      status: invoiceStatus,
      invoiceDate: Date,
      dueDate: Date,
      recievedAmount: number,
      overdueAmount: number,
      totalAmount: number,
      balanceDue: number
    }
  ],
  customer: {
    _id: string,
    totalBalance: number,
    totalRecievedAmount: number,
    totalBalanceDue: number,
    email: string,
    phone: string,
    paymentMethod: string,
    company: string,
    billingAddress: {
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    },
    account: boolean,
    customer: {
      _id: string,
      email: string,
      phone: string,
      billingAddress: {
        address: string,
        city: string,
        state: string,
        zipCode: string,
        country: string
      },
      paymentMethod: string,
      company: string,
      account: boolean
    }
  }
}
export interface IStatementsReponse {
  _id: string,
  data: [
    {
      _id: string,
      type: string,
      invoiceNumber: string,
      status: invoiceStatus,
      invoiceDate: string,
      dueDate: string,
      recievedAmount: number,
      overdueAmount: number,
      totalAmount: number,
      balanceDue: number
    }
  ],
  customer: {
    _id: string,
    totalBalance: number,
    totalRecievedAmount: number,
    totalBalanceDue: number,
    email: string,
    phone: string,
    paymentMethod: string,
    company: string,
    billingAddress: {
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    },
    account: boolean,
  },
  totalBalance: number,
  totalRecievedAmount: number,
  totalBalanceDue: number;
  createdAt: Date
}

export interface IFile {
  fieldname: string;
  file?: File;
  id?: string;
  preview?: string;
  isNew?: boolean;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url?: string

}

export enum LocationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

export interface IDeliveryLocation {
  index?: number
  _id?: string,
  address: string;
  combinedDateTime?: Date;
  warehouse?: string,
  city: string;
  state: string;
  zipcode: string;
  country?: string;
  locationClass?: string;
  requirements?: string[]; // Array of enum strings
  date: Date;
  time: string
  notes?: string;
  checkin?: Date | null;
  checkout?: Date | null
  endTime?: string;
  files?: IFile[];
  deliveryNumber: string;
  type?: LocationType;
  weight: number;
  casecount: number;
  palletcount: number
  wherehouseInstructions?: string;
}
export interface IPickupLocation {
  index?: number
  _id?: string,
  address: string;
  warehouse?: string,
  city: string;
  state: string;
  combinedDateTime?: Date;
  zipcode: string;
  country?: string;
  locationClass?: string;
  requirements?: string[]; // Array of enum strings
  date: Date;
  time: string
  notes?: string;
  checkin?: Date | null;
  checkout?: Date | null
  endTime?: string;
  files?: IFile[];
  pickupNumber: string;
  type?: LocationType;
  weight: number;
  casecount: number;
  wherehouseInstructions?: string;
  palletcount: number
}

export interface ILocationWithIds {
  index?: number
  _id?: string,
  address: string;
  warehouse?: string,
  city: string;
  state: string;
  zipcode: string;
  country?: string;
  locationClass?: string;
  requirements?: string[]; // Array of enum strings
  date: Date;
  time: string
  notes?: string;
  checkin?: Date | null;
  checkout?: Date | null
  endTime?: string;
  files?: IFile[];
  pickupNumber?: string;
  deliveryNumber?: string;
  type?: 'pickup' | 'transit' | 'delivery';
}
export interface Attachment {
  file?: File;
  preview?: string;
  [key: string]: any;
}

export interface ITaxOption {
  _id: string;
  value: number;
  label: string;
  ChartOfAccountId: string;
}
// TypeScript interface for form data
export interface IProductService {
  name: string;
  category: CategoryType;
  isUpdate: boolean;
  description: string;
  incomeAccount: string;
  inventoryAccount: string;
  expenseAccount: string;
  incomeAccountData: Omit<IChartAccount, "accountTypeData"> & {
    name: string
  };
  inventoryAccountData: Omit<IChartAccount, "accountTypeData"> & {
    name: string
  };
  expenseAccountData: Omit<IChartAccount, "accountTypeData"> & {
    name: string
  };
  OpeningStock: number;
  reorderStock: number;
  currentLevel: number;
  ProductRate:number
  _id: string;
}
export interface IExpenseLoadItem {
  _id: string;
  loadId: string;
  location: string
  date: Date;
  service: string;
  receipt: IFile[];
  deleteFiles: string[]
  notes: string;
  rate: number;
  paidby: string;
  paidbytype: paidtype
}

export interface IExpenseDispatcher {
  loadId: string;
  _id: string;
  location: IPickupLocation | IDeliveryLocation;
  expenses: IExpenseLoadItem[];

}
export interface InvoiceCrrier {
  invoiceNumber: string;
  loadNumber: string;
  location: string;
  customerEmail: string;
  company: string;
  customerAddress: string;
  carrierId: string;
  loadAmount: number;
  carrierPay: number;
  discountPercent: number;
  tax: string;
  deposit: number;
  subTotal: number;
  totalDiscount: number;
  taxAmount: number;
  totalAmount: number;
  total: number;
  balanceDue: number;
  deletedfiles?: string[];
  attachments?: Attachment[];
  files?: Attachment[];
  [key: string]: any;
}
export interface invoiceexpense {
  productservice: string,
  description: string,
  qty: number,
  rate: number,
  tax: string,
  amount: number
  readonly: boolean
  paidby?: string;
  paidbytype?: "carrier" | "customer" | "other";
}
export interface IInvoice {
  deletedfiles?: string[];
  postingDate: Date;
  taxArray: ITaxOption[];
  productServiceArray: IProductService[];
  loadId?: string;
  loadAmount?: number;
  customer?: ICustomer;
  totalAmount?: number;
  _id?: string;
  email?: string;
  expense: invoiceexpense[]
  address: string;
  name: string;
  tax?: string;
  files: IFile[];
  invoiceNumber: string;
  status: invoiceStatus
  invoiceDate: Date;
  dueDate: Date;
  terms: string;
  customerNotes: string;
  terms_conditions: string;
  discountPercent: number;
  deposit: number;
  paymentOptions: PaymentMethods;
  customerId: string;
  type: 'customer' | 'carrier'
  subTotal: number;
  totalDiscount: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
  totalExpenses: number;
  recievedPaymentAmount?: {
    paymentDate: Date;
    recievedPaymentId: string;
    _id: string;
    paymentMethod: string;
    referenceNo: string;
    depositTo: string;
    amount: number;
  }[]
}
export interface IVendorBill {
  deletedfiles?: string[];
  taxArray: ITaxOption[];
  productServiceArray: IProductService[];
  customer?: ICustomer;
  postingDate: Date;
  totalAmount?: number;
  loadAmount?: number;
  _id?: string;
  email?: string;
  expense: invoiceexpense[]
  address: string;
  name: string;
  tax?: string;
  files: IFile[];
  BillNumber: string;
  loadId?: string;
  status: invoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  terms: string;
  customerNotes: string;
  terms_conditions: string;
  discountPercent: number;
  deposit: number;
  paymentOptions: PaymentMethods;
  vendorId: string;
  type: 'other';
  subTotal: number;
  totalDiscount: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
  totalExpenses: number;
  recievedPaymentAmount?: {
    paymentDate: Date;
    recievedPaymentId: string;
    _id: string;
    paymentMethod: string;
    referenceNo: string;
    depositTo: string;
    amount: number;
  }[]
}
export interface IDocument {
  _id: string;
  company: string;
  insurerCompany: string;
  agentName: string;
  agentAddress: string;
  agentEmail: string;
  agentPhoneNumber: string;

  amount: number;
  createdAt: string;
  updatedAt: string;
  files: IFile
  documents: IFile;
  customerDocs: IFile[];
  insuranceDocuments: IFile;
  file: IFile;
  service: IitemService;
  type: string;
  loadNumber: string;
  invoiceNumber: string;
  carrierName: string;
  usdot: string;
  mcNumber: string;
  driverName: string;
  pickupLocationId: {
    files: IFile;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    _id: string;
  };
  deliveryLocationId: {
    files: IFile;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    _id: string;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}
export interface IMenuPermission {
  menuName: string;
  permissions: {
    create: boolean;
    delete: boolean;
    update: boolean;
    view: boolean;
    import: boolean;
    export: boolean;
  };
}

export interface IUser {
  _id?: string;
  name: string;
  phone: string;
  extentionNo?: string;
  email: string;
  password: string;
  visibleCompany?: string[];
  repeatPassword?: string;
  role: Role
  isActive?: boolean;
  isBlocked?: boolean;
  manager?: string | null;
  createdBy?: string,
  isUpdate?: boolean,
  updatedBy?: string;
  menuPermission: {

    loads: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },
    dispatcher: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },
    customers: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },
    carriers: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },
    documents: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },
    expense_service: {
      permissions: {
        create: boolean,
        delete: boolean,
        update: boolean,
        view: boolean,
        import: boolean,
        export: boolean
      }
    },

  };
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  link: string
  isRead: boolean;
  loadId?: string;
  load?: IViewLoad;
  updatedAt: string;
  createdAt: Date;
  UserId: string;
  expenseId?: string;
}
export interface INotificationUpdate {
  _id?: string;
  title?: string;
  message?: string;
  isRead: boolean;
  loadId?: string;
  updatedAt?: string;
  createdAt?: Date;
  UserId?: string;
  expenseId?: string;
}

export interface IMenuItem {
  path: string;
  title: string;
  icon?: string;
  icontype?: any
  children?: IMenuItem[];
  allowedRoles: string[];
  hideInMenu?: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  activeMenu: string;
  openMenus: string[];
}

export interface IPaymentTerm {
  _id?: string;
  name: string;
  description?: string;
  days: number;
}
export type CustomerStatus = 'active' | 'inactive' | 'suspended'
export const  CustomerStatusList=[
                  {label:"All",value:""},
                  {label:"Active",value:"active"},
                  {label:"In Active",value:"inactive"},
                  {label:"Suspended",value:"suspended"},
              ]
export type CustomerRating = 'A' | 'B' | 'C' | 'D' | 'F'
export type IParentAccountTypeEnum = "asset" | "liability" | "equity" | "income" | "expense" | "createdBy"
export type masterType = "customer" | "vendor" | "other"
export interface IAccountType {
  name: string;
  type: IParentAccountTypeEnum;
  masterType: masterType;
}
export interface IAccountDetailType {
  desc: string;
  subLevel: number;
  typeId: string;
  type: IParentAccountTypeEnum;
  masterType: masterType;
  typeMnemonic: string;
  typeEnumName: string;
  detailTypeId: string;
  detailType: string;
  detailTypeMnemonic: string;
  detailTypeEnumName: string;
  journalCodeTypeId?: string;
  parentAccountTypeId: string;
  createdBy?: string;
  updatedBy?: string;
}
export interface IChartAccount {
  _id?: string;
  id?: string;
  name: string;
  accountType: string;
  detailType: string;
  isSubAccount: boolean;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  accountTypeData?: IAccountType
  detailTypeData?: IAccountDetailType
  updatedAt?: Date;
  endingBalance?: number
  endingBalanceNumeric?: number

}
export interface ICustomer {
  isAccountCustomer?: boolean
  email: string;
  ratingScore?: number;
  paymentScore?: number;
  id?: string;
  phone: string;
  usdot?: string;
  _id?: string;
  company?: string;
  alternatphone?: string;
  extentionNo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mcNumber?: string;
  entity_type?: string,
  dba_name?: string,
  legal_name?: string,
  operating_status?: OpraStatus,
  physical_address?: string,
  mailing_address?: string,
  carrier_operation?: string[],
  out_of_service_date?: string,
  status?: CustomerStatus;
  paymentMethod: PaymentMethods
  paymentTerms: string
  vatNumber?: string;
  utrNumber?: string;
  documents: IFile[]
  deleteFiles?: string[],
  insurerCompany?: string;
  agentName?: string;
  agentAddress?: string;
  agentEmail?: string;
  agentExtentionNo?: string
  agentPhoneNumber?: string;
  insuranceDocuments?: IFile[],
  deleteInsuranceFiles?: string[]
  commercialGeneralLiability?: {
    issueDate?: Date;
    expiryDate?: Date;
    amount?: number;
  };
  automobileLiability?: {
    issueDate?: Date;
    expiryDate?: Date;
    amount?: number;
  };
  cargoLiability?: {
    issueDate?: Date;
    expiryDate?: Date;
    amount?: number;
  };
  paymentTermsData?: IPaymentTerm[]
  dueAmount?: number
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  // below data is not  necessary for customer

  title?: Title;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayCustomerName?: string;
  mobileNo?: string;
  fax?: string;
  other?: string;
  website?: string;
  nameToPrintOnCheck?: string;
  isSubCustomer?: boolean;
  parentCustomer?: string;
  notes?: string;
  // below data is not  necessary for customer
  sameAsBillingAddress?: boolean

}
export type Title = 'mr' | 'mrs' | 'ms' | 'dr' | 'other'

export interface IAccountsCustomerView {
  _id?: string;
  id?: string;
  isAccountCustomer?: boolean
  ratingScore?: number;
  paymentScore?: number;
  title: Title;
  firstName: string;
  middleName: string;
  lastName: string;
  company: string;
  displayCustomerName: string;
  email: string;
  phone: string;
  mobileNo: string;
  fax: string;
  other: string;
  website: string;
  nameToPrintOnCheck: string;
  isSubCustomer: boolean;
  parentCustomer?: ICustomer;
  sameAsBillingAddress: boolean
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  notes: string;
  status?: CustomerStatus;
  rating?: CustomerRating;
  paymentMethod: PaymentMethods
  paymentTerms: string
  documents: IFile[];
  totalBalance?: number;
  totalRecievedAmount?: number;
  totalDueAmount?: number;
  dueAmount?: number
  // below data is not  necessary for customer
  deleteFiles?: string[],
}
export interface CustomerData {
  _id: string;
  customer: ICustomer;
  loadCount: number;
  id?: string;
}
export interface CarrierData {
  _id: string;
  carrier: ICarrier;
  loadCount: number;
  id?: string;
}
export interface CustomerResponse {
  data: CustomerData[],
  pagination: {
    total: number,
    limit: number,
    page: number,
    totalPages: number
  }
}
export interface CarrierResponse {
  data: CarrierData[],
  pagination: {
    total: number,
    limit: number,
    page: number,
    totalPages: number
  }
}

export interface StatusColors {
  [key: string]: string;
  active: string;
  inactive: string;
  pending: string;
}

export interface RatingColors {
  A: string;
  B: string;
  C: string;
  D: string;
  F: string;
  [key: string]: string;
}

export interface Contact {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  extentionNo?: string
  phone: string;
}
export interface IDriver {
  _id?: string;
  driverName: string;
  driverPhone: string;
  driverCDL: string;
  driverCDLExpiration: Date;
  isActive: boolean;
  file?: IFile
  previewUrl?: string;
  "reportScore": 5,
  pickupStats?: {
    "totalPickups": number,
    "latePickups": number,
    "timelyPickups": number,
    "timelyPickupRating": number,
    "latePickupPercentage": number
  },
  deliveryStats?: {
    "totalDeliveries": number,
    "lateDeliveries": number,
    "timelyDeliveries": number,
    "timelyDeliveryRating": number,
    "lateDeliveryPercentage": number,
    "averageDeliveryDelay": number
  },
  overallStats?: {
    totalLocations: number,
    "totalLate": number,
    "totalTimely": number,
    "onTimePercentage": number,
    "latePercentage": number,
    rating: number,
  },
}


export type DocumentFormValues = {
  document: IFile[];
};
export type OpraStatus = "NOT AUTHORIZED" | "OUT-OF-SERVICE"
export interface ICommonUsdotData {
  address: string;
  mcNumber: string;
  usdot: string;
  zipCode: string;
  phone: string;
  company?: string;
  state?: string
  entity_type?: string
  dba_name?: string
  legal_name?: string
  operating_status?: OpraStatus
  physical_address?: string
  mailing_address?: string
  carrier_operation?: string[]
  out_of_service_date?: string
}
export interface ICarrier {
  _id?: string | null;
  id?: string;
  contactPersons?:Contact[],
  rating?: {
    overallScore: number,
    communication: number,
    Behavior: number,
    Performance: number,
    reportScore: number,
    BusinessStability: number
  };
  dueAmount?:number;
  totalDriver?: number;
  company?: string;
  paymenttermsdata?: IPaymentTerm,
  status?: CustomerStatus
  displayCustomerName?: string
  sameAsBillingAddress?: boolean
  title?: Title;
  isSubCustomer?: boolean;
  parentCustomer?: string;
  nameToPrintOnCheck?: string
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  mobileNo?: string
  fax?: string
  other?: string
  website?: string
  notes?: string
  paymentMethod?: PaymentMethods
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }

  extentionNo: string
  mcNumber: string;
  usdot: string;
  alternatphone: string;
  address: string;
  rate: number;
  phone: string;
  zipCode?: string;
  state?: string;
  drivers?: IDriver[]
  totalDrivers?: number;
  powerunit: string[],
  trailer: string[]
  documents: IFile[]
  paymentTerms: string
  entity_type?: string
  dba_name?: string
  legal_name?: string
  operating_status?: OpraStatus
  physical_address?: string
  mailing_address?: string
  carrier_operation?: string[]
  out_of_service_date?: string
  deleteFiles?: string[],
  insurerCompany?: string;
  agentName?: string;
  agentAddress?: string;
  agentEmail?: string;
  agentExtentionNo?: string
  agentPhoneNumber?: string;
  insuranceDocuments: IFile[],
  deleteInsuranceFiles?: string[]
  commercialGeneralLiability?: {
    issueDate: Date;
    expiryDate: Date;
    amount: number;
  };
  automobileLiability?: {
    issueDate: Date;
    expiryDate: Date;
    amount: number;
  };
  cargoLiability?: {
    issueDate: Date;
    expiryDate: Date;
    amount: number;
  };
  isCarrier?: boolean
}
// load types

// Define types for item services
export interface IitemService {
  _id?: string;
  label: string;
  value: string;
  productservice: string;
  productservices?: {
    _id: string;
    name: string;
  };
}
export enum LocationClass {
  WAREHOUSE = 'warehouse',
  PORT = 'port',
  TERMINAL = 'terminal',
  OTHER = 'other',
}
export enum LocationRequirement {
  // Dynamically Added from Array
  LIFTGATE_SERVICE_NEEDED = 'Liftgate Service Needed',
  INSIDE_PICKUP = 'Inside Pickup',
  APPOINTMENT_REQUIRED = 'Appointment Required',
  DRIVER_ASSIST_REQUIRED = 'Driver Assist Required',
}
export enum LoadStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DISPATCHED = 'Dispatched',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',

}
export enum FollowUpLoadStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DISPATCHED = 'Completed',

}

export enum LoadSize {
  FULL = 'full',
  PARTIAL = 'partial',
}

export enum EquipmentType {
  VAN = 'Van',
  VAN_AIR_RIDE = 'Van - Air-Ride',
  VAN_HAZARDOUS = 'Van - Hazardous',
  VAN_VENTED = 'Van - Vented',
  VAN_CURTAINS = 'Van w/ Curtains',
  VAN_PALLET_EXCHANGE = 'Van w/ Pallet Exchange',
  REEFER = 'Reefer',
  REEFER_HAZARDOUS = 'Reefer - Hazardous',
  REEFER_PALLET_EXCHANGE = 'Reefer w/ Pallet Exchange',
  DOUBLE_DROP = 'Double Drop',
  FLATBED = 'Flatbed',
  FLATBED_HAZARDOUS = 'Flatbed - Hazardous',
  FLATBED_PALLET_EXCHANGE = 'Flatbed w/ Pallet Exchange',
  FLATBED_SIDES = 'Flatbed w/ Sides',
  LOWBOY = 'Lowboy',
  MAXI = 'Maxi',
  REMOVABLE_GOOSENECK = 'Removable Gooseneck',
  STEP_DECK = 'Step Deck',
  AUTO_CARRIER = 'Auto Carrier',
  DUMP_TRAILER = 'Dump Trailer',
  HOPPER_BOTTOM = 'Hopper Bottom',
  HOTSHOT = 'Hotshot',
  TANKER = 'Tanker',
  FLATBED_STEP_DECK = 'Flatbed/Step Deck',
  FLATBED_VAN = 'Flatbed/Van',
  FLATBED_REEFER = 'Flatbed/Reefer',
  REEFER_VAN = 'Reefer/Van',
  FLATBED_REEFER_VAN = 'Flatbed/Reefer/Van',
  POWER_ONLY = 'Power Only',
}





export interface ICarrierAssignment {
  _id?: string;
  carrier: string
  pnonumber: string;
  assignDrivers: IDriver[] | any[];
  carrierPay: number;
  powerunit: string;
  trailer: string;
  dipsatchRateAmt?: number;
  carrierTotal?: number;
  contactPerson: string | null;
}
export interface ICarrierViewLoad {
  _id?: string;
  carrier: ICarrier;
  margin?: number;
  assignDrivers: IDriver[];
  carrierPay: number;
  powerunit: string;
  dipsatchRateAmt?: number;
  carrierTotal?: number;
  trailer: string;
}
export interface ICarrierWIthId extends ICarrier {
  _id: string;
}
export interface ICarrierExpenseDispatcher {
  _id?: string;
  carrier: ICarrierWIthId
  assignDrivers: IDriver[];
  carrierPay: number;
  powerunit: string;
  trailer: string;
}
export type temperatureUnitType = 'F' | 'C' | null;
export type equipmentLengthType = '20' | '28' | '40' | '45' | '48' | '53' | string;
export interface IloadDetails {
  loadNumber: string;
  loadDate?: Date;
  distance?: number;
  routeType?: string;
  Mode?: string;
  status?: LoadStatus;
  followupstatus?: FollowUpLoadStatus;
  invoiceId?: any;
  commodity: string
  loadSize: LoadSize;
  declaredValue?: number | null;
  weight?: number | null;
  temperature?: number | null;
  equipmentType: EquipmentType | null;
  equipmentLength: equipmentLengthType;
  temperatureUnit?: temperatureUnitType;
  notes?: string;
  loadAmount?: number | null;

}
export interface ILoad {
  search?: string;
  signature: string
  deletedfiles?: string[];
  _id?: string;
  AcceptTerms: boolean;
  pnonumber: string;
  loadDetails: IloadDetails;
  termsandconditions: string,
  customerId: string | null;
  carrierIds: ICarrierAssignment
  pickupLocationId: IPickupLocation[];
  deliveryLocationId: IDeliveryLocation[];
  files: any[];
  customerContactPerson: string | null;
  createdBy?: string;
  updatedBy?: string;
  FolloupUser?: string;
  followUpDate?: Date;
  subTotal?: number;
  discountPercent?: number;
  tax?: any;
  total?: number;
  customer?: ICustomer;
  carrier?: ICarrier;
  deposit?: number;
  totalDiscount?: number;
  id?: string | null;
  activeTab?: string,
}
export type companyType = "BROKER" | "DISPATCH" | "OTHER"
export interface ICompany {
  _id?: string;
  label: string;
  signature?: string;
  mcNumber: string;
  usdot: string;
  prefix: string;
  description?: string;
  type: companyType
  color: string;
  logo: IFile | null;
  termsandconditions: string;
  phone: string;
  email: string;
  address: string;

}
export interface IAccounttype {
  desc: string,
  subLevel: number,
  typeId: string,
  type: string,
  typeMnemonic: string,
  typeEnumName: string,
  detailTypeId: string,
  detailType: string,
  detailTypeMnemonic: string,
  detailTypeEnumName: string,
  journalCodeTypeId?: string
}
export interface IViewLoad {
  _id: string;
  currentLocation?: string;
  loadNumber: string;
  status: LoadStatus;
  followupstatus?: FollowUpLoadStatus;
  invoiceId?: string;
  commodity: string;
  invoice: any
  carrierinvoices: any
  loadSize: LoadSize;
  declaredValue?: number;
  weight?: number;
  temperature?: number;
  equipmentType: EquipmentType | null
  equipmentLength: '20' | '28' | '40' | '45' | '48' | '53';
  temperatureUnit?: 'F' | 'C' | null;
  notes?: string;
  loadAmount: number;
  customerId: ICustomer
  carrierIds: ICarrierViewLoad;

  pickupLocationId: IPickupLocation[];
  deliveryLocationId: IDeliveryLocation[];
  files: any[];
  customerContactPerson: string;
  freightCharge: 'Prepaid' | 'Collect' | '3rd Party';
  createdBy?: string;
  createdUser: IUser
  updatedBy?: string;
  FolloupUser?: string;
  followUpDate?: Date;
  subTotal?: number;
  discountPercent?: number;
  tax?: any;
  total?: number;
  deposit?: number;
  totalDiscount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  customeramt?: any;
  MarginAmt?: number;
  dipsatchRateAmt?: number;
  carrierPay?: number;
  isActive: boolean;
}
export interface InvoiceResponse {
  _id: string;
  companyId: string;
  customerId: string;
  id?: string;
  type: 'customer' | 'carrier';
  email: string;
  files: any[]; // update this to a specific file type if needed
  tax: number | null;
  invoiceNumber: string;
  loadId: string;
  status: invoiceStatus
  invoiceDate: Date; // ISO string format
  dueDate: Date;
  terms: string;
  customerNotes: string;
  terms_conditions: string;
  discountPercent: number;
  deposit: number;
  paymentOptions: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  carrier: ICarrier;
  createdUser?: IUser
  totalAmount?: number;
  totalAmountWithTax?: number;
  recievedAmount?: number;
  dueAmount?: number;
  customer?: ICustomer

  load?: IViewLoad
}
export interface CustomerInvoiceResponse {
  _id: string;
  companyId: string;
  customerId: string;
  id?: string;
  type: 'other';
  email: string;
  files: any[]; // update this to a specific file type if needed
  tax: number | null;
  invoiceNumber: string;
  loadId: string;
  status: invoiceStatus;
  invoiceDate: string; // ISO string format
  dueDate: string;
  terms: string;
  customerNotes: string;
  terms_conditions: string;
  discountPercent: number;
  deposit: number;
  paymentOptions: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  carrier: ICarrier;
  createdUser?: IUser
  totalAmount?: number;
  totalAmountWithTax?: number;
  recievedAmount?: number;
  dueAmount?: number;
  customer?: ICustomer

  load?: IViewLoad
}
export interface VendorInvoiceResponse {
  _id: string;
  companyId: string;
  vendor: ICarrier
  id?: string;
  type: 'other';
  vendorId: string;
  email: string;
  files: any[]; // update this to a specific file type if needed
  tax: number | null;
  BillNumber: string;
  loadId: string;
  status: invoiceStatus;
  invoiceDate: Date; // ISO string format
  dueDate: Date;
  terms: string;
  customerNotes: string;
  terms_conditions: string;
  discountPercent: number;
  deposit: number;
  paymentOptions: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  carrier: ICarrier;
  createdUser?: IUser
  totalAmount?: number;
  totalAmountWithTax?: number;
  recievedAmount?: number;
  dueAmount?: number;
  customer?: ICustomer


  load?: IViewLoad
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  extentionNo?: string
  id?: string;
}

export interface ContactListProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

export interface UpdateContactListProps {
  customerId: string;
}

export interface BaseContactListState {
  contacts: Contact[];
  newContact: ContactFormData;
  isAddingNew: boolean;
  isLoading: boolean;
  selectedContactId: string;
  isEditing?: boolean;
  editingContact: Contact | null
}
export interface AllCustomerDataProps {
  customer: ICustomer
}
export interface AllVendorDataProps {
  customer: ICarrier
}

export interface recievedPaymentparmaSearchProps {
  invoiceNumber: string, fromDate: string, toDate: string, overdueOnly: string, customerId: string
}


export interface recievedPaymentFilterState {
  fromDate: Date | null;
  toDate: Date | null;
  overdueOnly: string;
  amount: number;
  searchInvoice: string;
  isLoading: boolean
  customerInvoices: ICustomerInvoicesPaymentDetails[];
  selectedInvoices: Array<{ invoiceId: string; amount: number; totalBalanceDue: number }>;

  recievedAmount: number;
  customerBalance: number;
  totalSelectedAmount: number;
  recievedPayments: {
    _id: string,
    invoiceNumber: string,
    invoiceId: string,
    amount: number,
    amountWithTax: number,
    totalAmountWithTax: number,
    totalTaxAmount: number,
    totalAmount: number,
    recievedAmount: number,
    dueAmount: number,
    recievedPaymentId: string
  }[];
  nonRecievedPayments: {
    _id: string,
    invoiceNumber: string,
    invoiceId: string,
    amount: number,
    amountWithTax: number,
    totalAmountWithTax: number,
    totalTaxAmount: number,
    totalAmount: number,
    recievedAmount: number,
    dueAmount: number,
    recievedPaymentId: string
  }[];
  deletedPayments: {
    _id: string,
    invoiceNumber: string,
    invoiceId: string,
    amount: number,
    amountWithTax: number,
    totalAmountWithTax: number,
    totalTaxAmount: number,
    totalAmount: number,
    recievedAmount: number,
    dueAmount: number,
    recievedPaymentId: string
  }[];
}
export interface CustomerDashboardData {
  data: {
    overdueInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    paidInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    totalInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    recentPaidInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    partialInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    open: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    UnbillIncome: {
      count: number;
      totalAmount: number;
      percentage: number
      loads: string[];
    };
  }

}

export type transactiontypes = "Invoice" | "Bill" | "i-p" | "i-b" | "JournalEntry" | 's-tax' | 's-discount' | 'p-discount' | 'p-tax'
export interface Transaction {
  _id: string;
  customer: {
    name: string
  };
  amount: number;
  debit: number;
  credit: number;
  postingDate: Date;
  balanceDue: number
  refrencetype: string;
  type: transactiontypes;
}



interface monthlyTotalsProps {
  month: number,
  year: number,
  totalAmount: number,
  endingBalance?: number,
  totalCredits?: number,
  totalDebits?: number
}
export interface ReportRowData {
  _id: string;
  name: string;
  monthlyTotals?: monthlyTotalsProps[]
  total?: number;
  totalAmount: number;
  endingBalance: number;
  totalCredits: number;
  totalDebits: number;
}

export interface ReportSection {
  _id: string;
  typeId?: string;
  data: ReportRowData[];
  total?: number;
  totalAmount: number;
  monthlyTotals?: monthlyTotalsProps[];
  totalCredits?: number;
  totalDebits?: number;
  endingBalance?: number;
}

export interface ReportData {
  data: Array<{
    _id: string;
    typeId: string;
    data: ReportRowData[];
    total?: number;
    totalAmount: number;
    monthlyTotals?: monthlyTotalsProps[];
    totalCredits?: number;
    totalDebits?: number;
    endingBalance?: number;
  }>;
  totals: {
    _id: string,
    Income: number,
    COGS: number,
    Expenses: number,
    OtherIncome: number,
    OtherExpense: number,
    grossProfit: number,
    netOperatingIncome: number,
    netOtherIncome: number,
    netProfit: number
  };
  monthlyTotals?: Array<{
    month: number,
    year: number,
    Income: number,
    COGS: number,
    Expenses: number,
    OtherIncome: number,
    OtherExpense: number,
    grossProfit: number,
    netOperatingIncome: number,
    netOtherIncome: number,
    netProfit: number
  }>;
}
export interface IAccountsReceiveableReportData {
  data: [
    {
      _id: string,
      totalDueAmount: number,
      customer: {
        _id: string,
        name: string,

      },
      totalAmount: number,
      currentDueAmount: number,
      due_0_30: number,
      due_31_60: number,
      due_61_90: number,
      due_90_plus: number,
      daysPastDue: number
    }
  ],
  totalData: {
    totalDueAmount: number,
    currentDueAmount: number,
    due_0_30: number,
    due_31_60: number,
    due_61_90: number,
    due_90_plus: number
  },
}
export interface IAccountsPayableReportData {
  data: [
    {
      _id: string,
      totalDueAmount: number,
      customer: {
        _id: string,
        name: string,
      },
      totalAmount: number,
      currentDueAmount: number,
      due_0_30: number,
      due_31_60: number,
      due_61_90: number,
      due_90_plus: number,
      daysPastDue: number
    }
  ],
  totalData: {
    totalDueAmount: number,
    currentDueAmount: number,
    due_0_30: number,
    due_31_60: number,
    due_61_90: number,
    due_90_plus: number
  },
}
interface GroupedInvoices {
  bucket: string
  bucketOrder: number
  invoices: {
    _id: string,
    date: Date,
    vendorDisplayName: string,
    num: string,
    transactionType: "Bill" | "Invoice",
    dueDate: Date,
    daysPastDue: number,
    amount: number,
    openBalance: number,
    bucket: string,
    bucketOrder: number
  }[],
  totalAmount: number
  totalOpenBalance: number
}
export interface IAccountsPayableDetail {

  data: GroupedInvoices[],
  totalDueAmount: number,
  totalAmountWithTax: number,
  total: number
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
}
export interface IAccountsRecieveableDetail {

  data: GroupedInvoices[],
  totalDueAmount: number,
  totalAmountWithTax: number,
  total: number
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
}
export interface ITrialBalanceReport {

  result: [
    {
      _id: string,
      name: string,
      totalCredits: number,
      totalDebits: number,
      endingBalance: number,
      totalAmount: number
    }

  ],
  totals: {
    _id: string,
    totalCredits: number,
    totalDebits: number,
    endingBalance: number,
    totalAmount: number
  }
}

interface Account {
  _id: string;
  name: string;
  payments: {
    _id: string
    debit: number;
    credit: number;
    amount: number;
  }[];
  totalCredits: number;
  totalDebits: number;
  endingBalanceNumeric: number;
  endingBalance: string;
}

export interface IGeneralLedgerReport {
  result: Account[];
  totals: {
    totalCredits: number;
    totalDebits: number;
    endingBalance: string;
  };
}
export interface BalanceSheetData {
  Assets: Array<{
    _id: string
    name: string
    typeId: string
    type: string
    data: Array<{
      _id: string
      name: string
      endingBalance: number
      totalAmount: number
      totalCredits: number
      totalDebits: number
    }>
    totalCredits: number
    totalDebits: number
    endingBalance: number
    totalAmount: number
  }>
  Liabilities: Array<{
    _id: string
    name: string
    typeId: string
    type: string
    data: Array<{
      _id: string
      name: string
      endingBalance: number
      totalAmount: number
      totalCredits: number
      totalDebits: number
    }>
    totalCredits: number
    totalDebits: number
    endingBalance: number
    totalAmount: number
  }>
  totals: {
    _id: string
    TotalAssets: number,
    TotalLiabilities: number,
    TotalEquity: number,
    TotalLiabilitiesAndEquity: number
  }
}
export interface FilterResponseData {
  data: {
    carrier_operation_list: string[];
    operating_status_list: string[],
  };
  success: boolean
}