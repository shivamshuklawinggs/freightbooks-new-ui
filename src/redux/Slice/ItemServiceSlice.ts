import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPaymentTerm } from '@/types';
import {  fetchItemService } from '../api';

interface ItemServiceSliceState {
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

const initialState: ItemServiceSliceState = {
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

const ItemServiceSlice = createSlice({
  name: 'itemService',
  initialState,
  reducers: {
    setItemService: (state, action: PayloadAction<IPaymentTerm[]>) => {
      state.data = action.payload;
    },
    setItemServiceLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setItemServiceError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setItemServiceType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setItemServiceSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setItemServicePagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchItemService.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchItemService.fulfilled,(state,action)=>{
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
    builder.addCase(fetchItemService.rejected,(state,action)=>{
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

export const { setItemService,setItemServiceLoading,setItemServiceError,setItemServiceType,setItemServiceSearch,setItemServicePagination } = ItemServiceSlice.actions;
export default ItemServiceSlice.reducer; 