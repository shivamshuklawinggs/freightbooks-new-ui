import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAccountsCustomerView } from '@/types';
import { fetchAccountsCustomers } from '../../api';

interface CustomerState {
  data:IAccountsCustomerView[];
  loading:boolean;
  error:any,
  type:string,
  search:string,
  pagination:{
    total:number,
    limit:number,
    page:number,
    totalPages:number
  }
}

const initialState: CustomerState = {
  data: [],
  loading:false,
  error:null,
  type:"",
  search:"",
  pagination:{
    total:0,
    limit:5,
    page:1,
    totalPages:0
  }
};

const CustomersSlice = createSlice({
  name: 'accounts/customers',
  initialState,
  reducers: {
    setAccountsCustomers: (state, action: PayloadAction<IAccountsCustomerView[]>) => {
      state.data = action.payload;
    },
    setAccountsCustomerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAccountsCustomerError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setAccountsCustomerType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setAccountsCustomerSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setAccountsCustomerPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchAccountsCustomers.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchAccountsCustomers.fulfilled,(state,action)=>{
      state.loading=false;
      state.error=null;
      state.data=action.payload?.data || [] 
      state.pagination={
        total:action.payload?.pagination?.total || 0,
        limit:action.payload?.pagination?.limit || 5,
        page:action.payload?.pagination?.page || 1,
        totalPages:action.payload?.pagination?.totalPages || 0
      }
    })
    builder.addCase(fetchAccountsCustomers.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
      state.data=[]
      state.pagination={
        total:0,
        limit:5,
        page:1,
        totalPages:0
      }
    })
    
  }
});

export const { setAccountsCustomers,setAccountsCustomerLoading,setAccountsCustomerError,setAccountsCustomerType,setAccountsCustomerSearch,setAccountsCustomerPagination } = CustomersSlice.actions;
export default CustomersSlice.reducer; 