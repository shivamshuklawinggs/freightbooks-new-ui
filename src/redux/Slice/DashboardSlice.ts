import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '@/service/apiService';
import { Dashboardtoday, LastMonth } from '@/pages/dashboard-service/constant';
import { Moment } from 'moment';


interface ProfitAndLossTotals {
    _id: string;
    Income: number;
    COGS: number;
    Expenses: number;
    OtherIncome: number;
    OtherExpense: number;
    grossProfit: number;
    netOperatingIncome: number;
    netOtherIncome: number;
    netProfit: number;
}
interface Data {
    "_id": string,
    "type": "income" | "expense",
    "masterType": string,
    "typeId": string,
    "month": number,
    "year": number,
    "monthName": string,
    "totalAmount": number,
    "ageInMonths": number
}

interface DashboardState {
    ProfitAndLossData: Data[];
    ProfitAndLossTotals: ProfitAndLossTotals;
    SalesData: Data[];
    TotalSales: number;
    AccountsReceivable: {
        _id: string;
        currentMonth: number;
        twoToSixMonths: number;
        greaterThanSixMonths: number;
        totalAmount: number;
    };
    AccountsPayable: {
        _id: string;
        currentMonth: number;
        twoToSixMonths: number;
        greaterThanSixMonths: number;
        totalAmount: number;
    };
    expenseData: {
        _id: string;
        name: string;
        totalAmount: number;
    }[];
    expenseTotal: number
    Loads: {
        _id: string;
        total: number;
    }[];
    dateFilters: {
        AccPayable: {
            fromDate: Moment | null;
            toDate: Moment | null;
            customeDate:boolean
        } ;
        AccReceivable: {
            fromDate: Moment | null;
            toDate: Moment | null;
            customeDate:boolean
        } ;
        Sales: {
            fromDate: Moment | null;
            toDate: Moment | null;
            customeDate:boolean
        };
        Expenses: {
            fromDate: Moment | null;
            toDate: Moment | null;
            customeDate:boolean
        } ;
        "Profit&Loss": {
            fromDate: Moment | null;
            toDate: Moment | null;
            customeDate:boolean
        } ;
    };
}



const initialState: {dashboard:DashboardState ,loading:boolean,error:string | null} = {
    dashboard: {
        ProfitAndLossData: [],
        SalesData: [],
        ProfitAndLossTotals: {
            "_id": "ProfitAndLoss",
            "Income": 0,
            "COGS": 0,
            "Expenses": 0,
            "OtherIncome": 0,
            "OtherExpense": 0,
            "grossProfit": 0,
            "netOperatingIncome": 0,
            "netOtherIncome": 0,
            "netProfit": 0
        },
        TotalSales: 0,
        AccountsReceivable: {
            "_id": "AccountsReceivable",
            "currentMonth": 0,
            "twoToSixMonths": 0,
            "greaterThanSixMonths": 0,
            "totalAmount": 0
        },
        AccountsPayable: {
            "_id": "AccountsPayable",
            "currentMonth": 0,
            "twoToSixMonths": 0,
            "greaterThanSixMonths": 0,
            "totalAmount": 0
        },
        expenseData: [],
        expenseTotal: 0,
        Loads: [
            {
                "_id": "Pending",
                "total": 0
            },
            {
                "_id": "In Progress",
                "total": 0
            },
            {
                "_id": "Dispatched",
                "total": 0
            },
            {
                "_id": "Delivered",
                "total": 0
            },
            {
                "_id": "Cancelled",
                "total": 0
            },
            {
                "_id": "Picked Up",
                "total": 0
            }
        ],
        dateFilters: {
            AccPayable: {
                fromDate: LastMonth,
                toDate:Dashboardtoday,
                customeDate:false
            },
            AccReceivable: {
                fromDate: LastMonth,
                toDate:Dashboardtoday,
                customeDate:false
            }, 
            Sales: {
                fromDate: LastMonth,
                toDate:Dashboardtoday,
                customeDate:false
            },
            Expenses: {
                fromDate: LastMonth,
                toDate:Dashboardtoday,
                customeDate:false
            },
            "Profit&Loss": {
                fromDate: LastMonth,
                toDate:Dashboardtoday,
                customeDate:false
            }
        }
    },
    loading: false,
    error: null,
};
const initalLoadData = initialState.dashboard.Loads;
const initalProfitAndLossData = {
    ProfitAndLossData: initialState.dashboard.ProfitAndLossData,
    ProfitAndLossTotals: initialState.dashboard.ProfitAndLossTotals
}
const initalSalesData = {
    SalesData: initialState.dashboard.SalesData,
    TotalSales: initialState.dashboard.TotalSales
}
const initalAccountsReceivableData = {
    AccountsReceivable: initialState.dashboard.AccountsReceivable
}
const initalAccountsPayableData = {
    AccountsPayable: initialState.dashboard.AccountsPayable
};
const initalExpenseData = {
    expenseData: initialState.dashboard.expenseData,
    expenseTotal: initialState.dashboard.expenseTotal
};


export const fetchAllLoadStats = createAsyncThunk(
    'dashboard/fetchAllLoadStats',
    async (_, { rejectWithValue }) => {
        try {
       
            const response = await apiService.Dashboard.getLoadDashboard();
       
            return response.data || initalLoadData
        } catch (error: any) {
            return initalLoadData
        }
    }
);
export const fetchAllProfitAndLossStats = createAsyncThunk(
    'dashboard/fetchAllProfitAndLossStats',
    async ({fromDate,toDate}: {fromDate: Moment,toDate: Moment}, { rejectWithValue }) => {
        try {
           
            const response = await apiService.Dashboard.getProfitAndLossDashboard({fromDate,toDate});
            return response.data || initalProfitAndLossData 
        } catch (error: any) {
            return initalProfitAndLossData
        }
    }
);
export const fetchAllSalesStats = createAsyncThunk(
    'dashboard/fetchAllSalesStats',
    async ({fromDate,toDate}: {fromDate: Moment,toDate: Moment}, { rejectWithValue }) => {
        try {
     
            const response = await apiService.Dashboard.getSalesDashboard({fromDate,toDate});
            return response.data || initalSalesData 
           
        } catch (error: any) {
            return initalSalesData
        }
    }
);
export const fetchAllAccountsReceivableStats = createAsyncThunk(
    'dashboard/fetchAllAccountsReceivableStats',
    async ({fromDate,toDate}: {fromDate: Moment,toDate: Moment}, { rejectWithValue }) => {
        try {
        
            const response = await apiService.Dashboard.getAccountsReceivable({fromDate,toDate});
            return response.data || initalAccountsReceivableData 
        } catch (error: any) {
            return initalAccountsReceivableData
        }
    }
);
export const fetchAllAccountsPayableStats = createAsyncThunk(
    'dashboard/fetchAllAccountsPayableStats',
    async ({fromDate,toDate}: {fromDate: Moment,toDate: Moment}, { rejectWithValue }) => {
        try {
       
            const response = await apiService.Dashboard.getAccountsPayable({fromDate,toDate});
            return response.data || initalAccountsPayableData 
        } catch (error: any) {
            return initalAccountsPayableData
        }
    }
);
export const fetchAllExpenseStats = createAsyncThunk(
    'dashboard/fetchAllExpenseStats',
    async ({fromDate,toDate}: {fromDate: Moment,toDate: Moment}, { rejectWithValue }) => {
        try {
      
            const response = await apiService.Dashboard.getExpense({fromDate,toDate});
            return response.data || initalExpenseData 
        } catch (error: any) {
            return initalExpenseData
        }
    }
); 


// Slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardData: (state) => {
            state.dashboard = initialState.dashboard;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setFromDateFilter: (state, action: PayloadAction<{customeDate:boolean, type: keyof DashboardState['dateFilters']; value: Moment | null, }>) => {
            const { type, value,customeDate } = action.payload;
            state.dashboard.dateFilters[type].fromDate = value;
            state.dashboard.dateFilters[type].customeDate = customeDate;
            
        },
        setToDateFilter: (state, action: PayloadAction<{customeDate:boolean, type: keyof DashboardState['dateFilters']; value: Moment | null }>) => {
            const { type, value,customeDate } = action.payload;
            state.dashboard.dateFilters[type].toDate = value;
            state.dashboard.dateFilters[type].customeDate = customeDate;
            
        },
    },
    extraReducers: (builder) => {
        // Fetch all load stats
        builder
            .addCase(fetchAllLoadStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllLoadStats.fulfilled, (state, action: PayloadAction< DashboardState['Loads']>) => {
                state.loading = false;
                state.dashboard.Loads = action.payload;
            })
            .addCase(fetchAllLoadStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        
        // Fetch all profit and loss stats
        builder
            .addCase(fetchAllProfitAndLossStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProfitAndLossStats.fulfilled, (state, action: PayloadAction<{ ProfitAndLossData: DashboardState['ProfitAndLossData'], ProfitAndLossTotals: DashboardState['ProfitAndLossTotals'] }>) => {
                state.loading = false;
                state.dashboard.ProfitAndLossData = action.payload.ProfitAndLossData;
                state.dashboard.ProfitAndLossTotals = action.payload.ProfitAndLossTotals;
            })
            .addCase(fetchAllProfitAndLossStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        
        // Fetch all sales stats
        builder
            .addCase(fetchAllSalesStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSalesStats.fulfilled, (state, action: PayloadAction<{ SalesData: DashboardState['SalesData'], TotalSales: DashboardState['TotalSales'] }>) => {
                state.loading = false;
                state.dashboard.SalesData = action.payload.SalesData;
                state.dashboard.TotalSales = action.payload.TotalSales;
            })
            .addCase(fetchAllSalesStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        
        // Fetch all accounts receivable stats
        builder
            .addCase(fetchAllAccountsReceivableStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAccountsReceivableStats.fulfilled, (state, action: PayloadAction<{ AccountsReceivable: DashboardState['AccountsReceivable'] }>) => {
                state.loading = false;
                state.dashboard.AccountsReceivable = action.payload.AccountsReceivable;
            })
            .addCase(fetchAllAccountsReceivableStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        
        // Fetch all accounts payable stats
        builder
            .addCase(fetchAllAccountsPayableStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAccountsPayableStats.fulfilled, (state, action: PayloadAction<{ AccountsPayable: DashboardState['AccountsPayable'] }>) => {
                state.loading = false;
                state.dashboard.AccountsPayable = action.payload.AccountsPayable;
            })
            .addCase(fetchAllAccountsPayableStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        
        // Fetch all expense stats
        builder
            .addCase(fetchAllExpenseStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllExpenseStats.fulfilled, (state, action: PayloadAction<{ expenseData: DashboardState['expenseData'], expenseTotal: DashboardState['expenseTotal'] }>) => {
                state.loading = false;
                state.dashboard.expenseData = action.payload.expenseData;
                state.dashboard.expenseTotal = action.payload.expenseTotal;
            })
            .addCase(fetchAllExpenseStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDashboardData, clearError, setFromDateFilter,setToDateFilter } = dashboardSlice.actions;
export {LastMonth}
export default dashboardSlice.reducer;
