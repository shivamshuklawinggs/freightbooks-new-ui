import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPaymentTerm } from '@/types';
import {  fetchPaymentTerms } from '../api';

interface PaymentTermState {
  data:IPaymentTerm[];
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

const initialState: PaymentTermState = {
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

const PaymentTermsSlice = createSlice({
  name: 'paymentTerms',
  initialState,
  reducers: {
    setPaymentTerms: (state, action: PayloadAction<IPaymentTerm[]>) => {
      state.data = action.payload;
    },
    setPaymentTermsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPaymentTermsError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setPaymentTermsType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setPaymentTermsSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setPaymentTermsPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchPaymentTerms.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchPaymentTerms.fulfilled,(state,action)=>{
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
    builder.addCase(fetchPaymentTerms.rejected,(state,action)=>{
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

export const { setPaymentTerms,setPaymentTermsLoading,setPaymentTermsError,setPaymentTermsType,setPaymentTermsSearch,setPaymentTermsPagination } = PaymentTermsSlice.actions;
export default PaymentTermsSlice.reducer; 