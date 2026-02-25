import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICustomer } from '@/types';
import { fetchCustomers } from '../api';

interface CustomerState {
  data:ICustomer[];
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
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<ICustomer[]>) => {
      state.data = action.payload;
    },
    setCustomerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCustomerError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setCustomerType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setCustomerSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCustomerPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchCustomers.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchCustomers.fulfilled,(state,action)=>{
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
    builder.addCase(fetchCustomers.rejected,(state,action)=>{
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

export const { setCustomers,setCustomerLoading,setCustomerError,setCustomerType,setCustomerSearch,setCustomerPagination } = CustomersSlice.actions;
export default CustomersSlice.reducer; 