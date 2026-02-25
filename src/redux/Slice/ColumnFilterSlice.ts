import { AccountsCustomerColumns, CustomerColumns, VendorsColumns } from "@/data/customer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialColumns=[
  "loadNumber",
  "loadAmount",
  "status",
  "picks",
  "pickDate",
  "drops",
  "dropDate",
  "equipment",
  "powerUnit",
  "trailer",
  "createdBy"
]
const initialAccountsCustomerColumns=AccountsCustomerColumns.slice(0,6).map((col)=>col.key)
const initialCustomerColumns=CustomerColumns.slice(0,6).map((col)=>col.key)
const initialVendorsColumns=VendorsColumns.slice(0,6).map((col)=>col.key)
export interface ColumnFilterState {
  // Load
  visibleColumns: string[];
  hiddenColumns: string[];
  // Accounts Customer
  accountsCustomerVisbleColmns:string[]
  accountsCustomerhiddenColmns:string[]
  // Customer
  CustomerVisbleColmns:string[]
  CustomerhiddenColmns:string[]
  // vendors
  vendorsVisbleColmns:string[]
  vendorshiddenColmns:string[]
}

const initialState: ColumnFilterState = {
  visibleColumns: initialColumns,
  hiddenColumns: [],
  accountsCustomerVisbleColmns:initialAccountsCustomerColumns,
  accountsCustomerhiddenColmns:[],
  CustomerVisbleColmns:initialCustomerColumns,
  CustomerhiddenColmns:[],
  vendorsVisbleColmns:initialVendorsColumns,
  vendorshiddenColmns:[],
};

const columnFilterSlice = createSlice({
  name: "columnFilter",
  initialState,
  reducers: {
    setVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.visibleColumns = action.payload;
    },
    setHiddenColumns: (state, action: PayloadAction<string[]>) => {
      state.hiddenColumns = action.payload;
    },
    toggleColumn: (state, action: PayloadAction<string>) => {
      const column = action.payload;
      if (state.visibleColumns.includes(column)) {
        state.visibleColumns = state.visibleColumns.filter((col) => col !== column);
        state.hiddenColumns.push(column);
      } else {
        state.hiddenColumns = state.hiddenColumns.filter((col) => col !== column);
        state.visibleColumns.push(column);
      }
    },
    setAccountsCustomerVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.accountsCustomerVisbleColmns = action.payload;
    },
    setAccountsCustomerHiddenColumns: (state, action: PayloadAction<string[]>) => {
      state.accountsCustomerhiddenColmns = action.payload;
    },
    toggleAccountsCustomerColumn: (state, action: PayloadAction<string>) => {
      const column = action.payload;
      if (state.accountsCustomerVisbleColmns.includes(column)) {
        state.accountsCustomerVisbleColmns = state.accountsCustomerVisbleColmns.filter((col) => col !== column);
        state.accountsCustomerhiddenColmns.push(column);
      } else {
        state.accountsCustomerhiddenColmns = state.accountsCustomerhiddenColmns.filter((col) => col !== column);
        state.accountsCustomerVisbleColmns.push(column);
      }
    },
    setCustomerVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.CustomerVisbleColmns = action.payload;
    },
    setCustomerHiddenColumns: (state, action: PayloadAction<string[]>) => {
      state.CustomerhiddenColmns = action.payload;
    },
    toggleCustomerColumn: (state, action: PayloadAction<string>) => {
      const column = action.payload;
      if (state.CustomerVisbleColmns.includes(column)) {
        state.CustomerVisbleColmns = state.CustomerVisbleColmns.filter((col) => col !== column);
        state.CustomerhiddenColmns.push(column);
      } else {
        state.CustomerhiddenColmns = state.CustomerhiddenColmns.filter((col) => col !== column);
        state.CustomerVisbleColmns.push(column);
      }
    },
    setVendorsVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.vendorsVisbleColmns = action.payload;
    },
    setVendorsHiddenColumns: (state, action: PayloadAction<string[]>) => {
      state.vendorshiddenColmns = action.payload;
    },
    toggleVendorsColumn: (state, action: PayloadAction<string>) => {
      const column = action.payload;
      if (state.vendorsVisbleColmns.includes(column)) {
        state.vendorsVisbleColmns = state.vendorsVisbleColmns.filter((col) => col !== column);
        state.vendorshiddenColmns.push(column);
      } else {
        state.vendorshiddenColmns = state.vendorshiddenColmns.filter((col) => col !== column);
        state.vendorsVisbleColmns.push(column);
      }
    },
  },
});

export const { setVisibleColumns, setHiddenColumns, toggleColumn ,
  setAccountsCustomerVisibleColumns,setAccountsCustomerHiddenColumns,toggleAccountsCustomerColumn,
  setCustomerVisibleColumns,setCustomerHiddenColumns,toggleCustomerColumn,
  setVendorsVisibleColumns,setVendorsHiddenColumns,toggleVendorsColumn,
} = columnFilterSlice.actions;
export default columnFilterSlice.reducer;
