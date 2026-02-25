import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICarrier } from '@/types';
import { fetchVendors } from '../api';

interface VendorSliceState {
  data:ICarrier[];
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

const initialState: VendorSliceState = {
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

const VendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setVendor: (state, action: PayloadAction<ICarrier[]>) => {
      state.data = action.payload;
    },
    setVendorLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setVendorError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setVendorType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setVendorSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setVendorPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchVendors.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchVendors.fulfilled,(state,action)=>{
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
    builder.addCase(fetchVendors.rejected,(state,action)=>{
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

export const { setVendor,setVendorLoading,setVendorError,setVendorType,setVendorSearch,setVendorPagination } = VendorSlice.actions;
export default VendorSlice.reducer; 