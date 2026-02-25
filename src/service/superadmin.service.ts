import api from "@/utils/axiosInterceptor";

export interface SystemStats {
  counts: {
    users: number;
    invoices: number;
    bills: number;
    payments: number;
    loads: number;
    carriers: number;
    customers: number;
    drivers: number;
    expenses: number;
    journalEntries: number;
  };
  "invoicesSummary": {
    "_id": string,
    "totalInvoiceAmount": number,
    "totalPaidAmount": number,
    "totalDueAmount": number,
    "invoicePaidAmt": number
},
"billsSummary": {
    "_id": string,
    "totalInvoiceAmount": number,
    "totalPaidAmount": number,
    "totalDueAmount": number,
    "billPaidAmt": number
},
  paymentsSummary: {
    totalAmount: number;
    totalPayments: number;
  };
  operational: {
    totalLoadAmount: number;
    totalLoads: number;
  };
  companyId: string;
  timestamp: string;
  totalRevenue: number;
}

export interface CleanupResult {
  deletedCounts: Record<string, number>;
  affectedRecords: number;
  timestamp: string;
  performedBy: string;
  dryRun?: boolean;
}

const superadminService = {
  // Get system statistics
  getStats: async (companyId?: string) => {
    const params = companyId ? { companyId } : {};
    const response = await api.get("/superadmin/stats", { params });
    return response.data;
  },

  // Cleanup users
  cleanupUsers: async (data: {
    companyId: string;
    keepAdmins?: boolean;
    dryRun?: boolean;
  }) => {
    const response = await api.post("/superadmin/cleanup/users", data);
    return response.data;
  },

  // Cleanup financial data
  cleanupFinancial: async (data: {
    companyId: string;
    includeInvoices?: boolean;
    includeBills?: boolean;
    includePayments?: boolean;
    includeJournalEntries?: boolean;
    dryRun?: boolean;
  }) => {
    const response = await api.post("/superadmin/cleanup/financial", data);
    return response.data;
  },

  // Cleanup operational data
  cleanupOperational: async (data: {
    companyId: string;
    includeLoads?: boolean;
    includeCarriers?: boolean;
    includeCustomers?: boolean;
    includeDrivers?: boolean;
    dryRun?: boolean;
  }) => {
    const response = await api.post("/superadmin/cleanup/operational", data);
    return response.data;
  },
  // Reset company data
  resetCompany: async (data: {
    companyId: string;
    confirmationCode: string;
    keepChartOfAccounts?: boolean;
  }) => {
    const response = await api.post("/superadmin/reset/company", data);
    return response.data;
  },
};

export default superadminService;
