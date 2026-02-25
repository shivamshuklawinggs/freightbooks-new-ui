import React from 'react';
import { lazy } from 'react';
import { paths } from '@/utils/paths';
import InvoiseSectionEdit from '@/pages/customer-service/CustomerTransactionList/Modals/InvoiseSectionEdit';
import BillSectionEdit from '@/pages/carrier-service/VendorTransactionList/Modals/BillSectionEdit';
import { ActionType, ResourceType, RoteExtended } from '@/types';
import SignatureDrawer from '@/components/SignatureDrawer';

// CHART OF ACCOUNTS
const ChartAccounts = lazy(() => import('@/pages/chart-accounts-service'));
const AccountRegister = lazy(() => import('@/pages/chart-accounts-service/AccountRegister'));
// journal entry
const JournalEntry = lazy(() => import('@/pages/journal-entry-service'));
const JournalEntryList = lazy(() => import('@/pages/journal-entry-service/JournalEntryList'));

/** ----------------- Accounting ----------------- */
// Reports
const Reports = lazy(() => import('@/pages/report-service'));
// payments 
const Payments = lazy(() => import('@/pages/payment-service'));

// Sales 
const GetInvoices = lazy(() => import('@/pages/invoice-service'))
const GetEstimates = lazy(() => import('@/pages/estimate-service/LoadInvoices'))
const GetRecievedPayment = lazy(() => import('@/pages/invoice-service/InvoiceRecieptes/RecievedPayment'))
const CustomerTransactionList = lazy(() => import('@/pages/customer-service/CustomerTransactionList'))
const RecievedPaymentEdit = lazy(() => import('@/pages/invoice-service/InvoiceRecieptes/Edit/RecievedPayment'))
// Purchase 
const Vendors = lazy(() => import('@/pages/carrier-service/Vendors'));
const VendorBills = lazy(() => import('@/pages/carrier-service/VendorBills'))
const VendorTransactionList = lazy(() => import('@/pages/carrier-service/VendorTransactionList'))
const GetRecievedPaymentPurchase = lazy(() => import('@/pages/carrier-service/BillRecieptes/RecievedPayment'))
const RecievedPaymentEditPurchase = lazy(() => import('@/pages/carrier-service/BillRecieptes/Edit/RecievedPayment'))
const GetTaxOptions = lazy(() => import('@/pages/tax-service'))
const PaymentTermsList = lazy(() => import('@/pages/payment-terms-service/PaymentTermsList'));
const AccountsCustomers = lazy(() => import('@/pages/customer-service/acoount-customers'));
const ProductServices = lazy(() => import('@/pages/product-service'));
// users 
const Users = lazy(() => import('@/pages/user-service'));
// superadmin: data management
const SuperadminDashboard = lazy(() => import('@/pages/superadmin-service/SuperadminDashboard'));
const SuperadminDataCleanup = lazy(() => import('@/pages/superadmin-service/SuperadminDataCleanup'));
const Plans = lazy(() => import('@/pages/superadmin-service/Plans'));
// Carriers 
const Carriers = lazy(() => import('@/pages/carrier-service'));
const CarrierRatingDetails = lazy(() => import('@/components/VendorRating/VendoRatingDetails'));
const DriverRatingDetails = lazy(() => import('@/components/DriverRating/DriverRatingDetails'));
const CarrierReport = lazy(() => import('@/pages/carrier-service/CarrierReport'));
const DriverReport = lazy(() => import('@/pages/carrier-service/Drivers/DriverReport'));

// Loads 
const Dispatcher = lazy(() => import('@/pages/load-service/components/Dispatcher'));
const ViewLoad = lazy(() => import('@/pages/load-service'));
const CreateLoad = lazy(() => import('@/pages/load-service/components/CreateLoad/CreateLoad'));
const EditLoad = lazy(() => import('@/pages/load-service/components/EditLoad'));
// Customers 
const Customers = lazy(() => import('@/pages/customer-service/load-customers'));
const CustomerReport = lazy(() => import('@/pages/customer-service/load-customers/CustomerReport'));
const CustomerRatingDetails = lazy(() => import('@/components/CustomerRating/CustomerRatingDetails'));
// Item Services 
const ItemServicesList = lazy(() => import('@/pages/expense-fee-service'));
// Dashboard 
const Dashboard = lazy(() => import('@/pages/dashboard-service'));
// Company 
const ViewCompany = lazy(() => import('@/pages/company-service'));
// Documents 
const Documents = lazy(() => import('@/pages/document-service'));
// auth pages
const Login = lazy(() => import('@/pages/auth-service/Login'));
const ForgetPassword = lazy(() => import('@/pages/auth-service/ForgetPassword'));
const NotAuthorized = lazy(() => import('@/pages/NotAuthorized'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ResetPassword = lazy(() => import('@/pages/auth-service/resetPassword'));
const BaseImageViewer = lazy(() => import('@/components/common/BaseImageViewer'));

// Define route interface
export interface Route {
  path: string;
  element?: React.LazyExoticComponent<React.FC> | React.FC;
  title: string;
  key: string;
  icon?: string;
  icontype?: string;
  currentCompany?: boolean;
  hideInMenu?: boolean;
  children?: Route[];
  action?: ActionType;
  resource?: ResourceType[];
}

// Function to generate routes recursively
const generateRoutes = (routes: Route[], parentPath = ''): Route[] => {
  return routes.map(route => {
    const fullPath = `${parentPath}${route.path}`.replace('//', '/');
    const newRoute: Route = {
      ...route,
      path: fullPath,
      element: route.element,
    };

    if (route.children) {
      newRoute.children = generateRoutes(route.children, fullPath);
    }

    return newRoute;
  });
};

// Function to flatten routes for React Router
const flattenRoutes = (routes: Route[]): Route[] => {
  return routes.reduce((acc: Route[], route: Route) => {
    acc.push(route);
    if (route.children) {
      acc.push(...flattenRoutes(route.children));
    }
    return acc;
  }, []);
};

// Base routes configuration
const baseProtectedRoutes: Route[] = [
  {
    path: paths.dashboard,
    element: Dashboard,
    title: 'Dashboard',
    key: "dashboard",
    icon: 'dashboard',
    icontype: "md",
    currentCompany: false,
    action: 'view',
    resource: ['dashboard'],
  },
  {
    path: `${paths.customers}/rating/:customerId`,
    element: CustomerRatingDetails,
    title: 'Customer Rating Details',
    key: "customers",
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['customers'],
  },
  {
    path: `${paths.viewcompany}`,
    element: ViewCompany,
    title: 'Company',
    icon: 'company',
    key: "company",
    currentCompany: false,
    action: 'view',
    resource: ['company'],
  },
  {
    path: `${paths.viewload}`,
    element: ViewLoad,
    title: 'Loads',
    icon: 'truck',
    key: "loads",
    currentCompany: true,
    action: 'view',
    resource: ['loads'],
  },
  {
    path: `${paths.dispatcher}`,
    element: Dispatcher,
    title: 'Dispatcher',
    icontype: "md",
    icon: 'OutlineSend',
    key: "dispatcher",
    currentCompany: true,
    action: 'view',
    resource: ['dispatcher'],
  },
  {
    path: '/createload',
    element: CreateLoad,
    title: 'Create Load',
    key: "loads",
    currentCompany: true,
    icon: 'plus',
    hideInMenu: true,
    action: 'create',
    resource: ['loads'],
  },
  {
    path: `${paths.editload}/:loadId`,
    element: EditLoad,
    title: 'Edit Load',
    icon: 'edit',
    key: "loads",
    currentCompany: true,
    hideInMenu: true,
    action: 'update',
    resource: ['loads'],
  },
  {
    path: `${paths.customers}/report/:customerId`,
    element: CustomerReport,
    title: 'Customer Report',
    key: "customers",
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['customers'],
  },
  {
    path: `${paths.carriers}/report/:carrierId`,
    element: CarrierReport,
    title: 'Carrier Report',
    key: "carriers",
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['carriers'],
  },
  {
    path: `${paths.carriers}/driver/:driverId`,
    element: DriverReport,
    title: 'Driver Report',
    key: "carriers",
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['carriers'],
  },

  {
    path: paths.customers,
    element: Customers,
    title: 'Customers',
    key: "customers",
    currentCompany: true,
    icon: 'customers',
    action: 'view',
    resource: ['customers'],
  },
  {
    path: paths.carriers,
    element: Carriers,
    title: 'Carriers',
    key: "carriers",
    currentCompany: true,
    icon: 'carriers',
    action: 'view',
    resource: ['carriers'],
  },
  {
    path: `${paths.carriers}/rating/:carrierId`,
    element: CarrierRatingDetails,
    title: 'Carrier Rating Details',
    key: "carriers",
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['carriers'],
  },
  {
    path: `${paths.drivers}/rating`,
    element: DriverRatingDetails,
    title: 'Drivers',
    key: "carriers",
    icon: 'drivers',
    currentCompany: true,
    hideInMenu: false,
    action: 'view',
    resource: ['carriers'],
  },
  {
    path: paths.documents,
    element: Documents,
    title: 'Documents',
    icon: 'file',
    key: "documents",
    currentCompany: true,
    action: 'view',
    resource: ['documents'],
  },
  {
    path: paths.expensefeeslist,
    element: ItemServicesList,
    title: 'Expense Service',
    key: "expense_service",
    currentCompany: true,
    icon: 'AttachMoneyIcon',
    action: 'view',
    resource: ['expense_service'],
  },
  // edit invoice
  {
    path: `${paths.editinvoice}/:id`,
    element: InvoiseSectionEdit,
    title: 'Edit Invoice',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'update',
    resource: ['accounting'],
  },
  // edit invoice
  {
    path: `${paths.editbill}/:id`,
    element: BillSectionEdit,
    title: 'Edit Bill',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'update',
    resource: ['accounting'],
  },
  //  Accounts
  {
    path: `${paths.recievedpayment}/:id`,
    element: RecievedPaymentEdit,
    title: 'Edit Receive Payment',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'update',
    resource: ['accounting'],
  },
  {
    path: `${paths.recievedbill}/:id`,
    element: RecievedPaymentEditPurchase,
    title: 'Edit Bill Payment',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'update',
    resource: ['accounting'],
  },
  {
    path: `${paths.customertransactionlist}/:id`,
    element: CustomerTransactionList,
    title: 'Customer Transaction List',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['accounting'],
  },
  {
    path: `${paths.vendortransactionlist}/:id`,
    element: VendorTransactionList,
    title: 'Vendor Transaction List',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['accounting'],
  },
  {
    path: `${paths.AccountRegister}/:id`,
    element: AccountRegister,
    title: 'Account Register',
    key: "accounting",
    icon: 'edit',
    currentCompany: true,
    hideInMenu: true,
    action: 'view',
    resource: ['accounting'],
  },

  {
    path: '/accounting',
    title: 'Accounting',
    icon: 'accountBalanceWallet',
    icontype: "md",
    key: "accounting",
    currentCompany: true,
    action: 'view',
    resource: ['accounting'],
    children: [
      {
        title: "Sales",
        path: "/sales",
        element: GetInvoices,
        icon: "sales",
        key: "accounting",
        action: 'view',
        resource: ['accounting'],
        children: [
          {
            path: '/invoices',
            element: GetInvoices,
            title: 'Invoices',
            key: "accounting",
            icon: 'invoices',
            currentCompany: true,
            action: 'view',
            resource: ['accounting'],
          },
          {
            path: '/estimates',
            element: GetEstimates,
            title: 'Estimates',
            key: "accounting",
            icon: 'estimates',
            currentCompany: true,
            action: 'view',
            resource: ['accounting'],
          },

          {
            path: '/accounts/customers',
            element: AccountsCustomers,
            title: 'Customers',
            key: "accounting",
            icon: 'customers',
            currentCompany: true,
            action: 'view',
            resource: ['accounting'],
          },
          {
            path: '/accounts/recievedpayment/:customerId?',
            element: GetRecievedPayment,
            title: 'Receive Payment',
            key: "accounting",
            icon: 'amazonPay',
            currentCompany: true,
            action: 'create',
            resource: ['accounting'],
          },
        ]
      },
      {
        title: "Purchase",
        path: "/purchase",
        icon: "purchase",
        key: "accounting",
        action: 'view',
        resource: ['accounting'],
        children: [
          {
            path: '/vendors',
            element: Vendors,
            title: 'Vendors',
            key: "accounting",
            icon: 'vendors',
            currentCompany: true,
            action: 'view',
            resource: ['accounting'],

          },
          {
            path: '/bills',
            element: VendorBills,
            title: 'Bills',
            key: "accounting",
            icon: 'bills',
            currentCompany: true,
            action: 'view',
            resource: ['accounting'],
          },
          {
            path: '/accounts/recievedbill/:customerId?',
            element: GetRecievedPaymentPurchase,
            title: 'Bill Payment',
            key: "accounting",
            icon: 'amazonPay',
            currentCompany: true,
            action: 'create',
            resource: ['accounting'],
          },
        ]
      },
      {
        path: paths.paymentterms,
        element: PaymentTermsList,
        title: 'Payment Terms',
        key: "accounting",
        icon: 'amazonPay',
        currentCompany: true,
        action: 'view',
        resource: ['accounting'],
      },
      {
        path: '/taxoptions',
        element: GetTaxOptions,
        title: 'Tax Rate',
        key: "accounting",
        icon: 'tax',
        currentCompany: true,
        action: 'view',
        resource: ['accounting'],
      },
      {
        path: '/productservices',
        element: ProductServices,
        title: 'Product Services',
        key: "accounting",
        icon: 'product',
        currentCompany: true,
        action: 'view',
        resource: ['accounting'],
      },
      {
        path: paths.chartofaccounts,
        element: ChartAccounts,
        title: 'Chart Of Accounts',
        key: "accounting",
        icon: 'chartAccounts',
        currentCompany: true,
        action: 'view',
        resource: ['accounting'],
      },
      {
        path: paths.JournalEntry,
        element: JournalEntry,
        title: 'Journal Entry',
        key: "accounting",
        currentCompany: true,
        icon: 'journalEntry',
        action: 'create',
        resource: ['accounting'],
      },
      {
        path: paths.JournalEntryList,
        element: JournalEntryList,
        title: 'Journal Entry List',
        key: "accounting",
        currentCompany: true,
        icon: 'journalEntry',
        action: 'view',
        resource: ['accounting'],
      },
      {
        path: `${paths.JournalEntry}/:JournalEntryId`,
        element: JournalEntry,
        title: 'Edit Journal Entry',
        key: "accounting",
        currentCompany: true,
        hideInMenu: true,
        icon: 'journalEntry',
        action: 'update',
        resource: ['accounting'],
      },
      {
        title: "Payments",
        action: "view",
        currentCompany: true,
        key: "payments",
        icon: 'sales',
        resource: ['accounting'],
        path: `${paths.payments}`,
        element: Payments,
      }
    ]
  },
  {
    path: `${paths.Reports}/:type?`,
    element: Reports,
    title: 'Reports',
    key: "reports",
    icon: 'reports',
    currentCompany: true,
    action: 'view',
    resource: ['accounting'],
  }
  // End Accounts
  ,
  {
    path: paths.superadminDashboard,
    element: SuperadminDashboard,
    title: 'Dashboard',
    key: "superadmin-dashboard",
    icon: 'dashboard',
    currentCompany: false,
    action: 'view',
    resource: ['superadmin'],
  },
  {
    path: paths.users,
    element: Users,
    title: 'Users',
    key: "users",
    icon: 'users',
    currentCompany: false,
    action: 'view',
    resource: ['users','superadmin'],
  },
  {
    path: paths.plans,
    element: Plans,
    title: 'Plans',
    key: "plans",
    icon: 'priceChange',
    currentCompany: false,
    action: 'view',
    resource: ['superadmin'],
  },
  
  {
    path: '/superadmin/data-cleanup',
    element: SuperadminDataCleanup,
    title: 'Data Cleanup',
    key: "superadmin-cleanup",
    icon: 'delete',
    currentCompany: false,
    action: 'view',
    resource: ['superadmin'],
  },


];

export const publicRoutes: RoteExtended[] = [
  {
    path: paths.login,
    element: Login,
    title: 'Login',
    key: "login",
    action: 'view',
    resource: ['public'],
  },
  {
    path: '/signature',
    element: SignatureDrawer,
    title: 'Login',
    key: "login",
    action: 'view',
    resource: ['public'],
  },
  {
    path: paths.notfound,
    element: NotFound,
    key: "notfound",
    title: '404',
    action: 'view',
    resource: ['public'],
  },
  {
    path: paths.base64imageviewer + "/:id/:type",
    element: BaseImageViewer,
    key: "base64imageviewer",
    title: 'Base64 Image Viewer',
    action: 'view',
    resource: ['public'],
  },

  // forget password
  {
    path: paths.forgetpassword,
    element: ForgetPassword,
    key: "forgetpassword",
    title: 'Forget Password',
    action: 'view',
    resource: ['public'],
  },
  // not authorized
  {
    path: paths.NotAuthorized,
    key: "notauthorized",
    element: NotAuthorized,
    title: '403',
    action: 'view',
    resource: ['public'],
  },
  // wild card route
  {
    path: '*',
    element: NotFound,
    key: "wildcard",
    title: '404',
    action: 'view',
    resource: ['public'],
  },
  {
    path: `${paths.resetpassword}/:token`,
    element: ResetPassword,
    key: "resetpassword",
    title: '404',
    action: 'view',
    resource: ['public'],
  },



];

export const routes = generateRoutes(publicRoutes);
export const protectedRoutes = generateRoutes(baseProtectedRoutes);