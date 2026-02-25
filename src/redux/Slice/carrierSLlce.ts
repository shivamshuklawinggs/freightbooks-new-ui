import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICarrier } from '@/types';
import { fetchCarriers } from '../api';

interface CarrierState {
  data:ICarrier[];
  loading:boolean;
  error:any,
  type:string,
  search:string
  pagination:{
    total:number,
    limit:number,
    page:number,
    totalPages:number
  }
}

const initialState: CarrierState = {
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

const CarriersSlice = createSlice({
  name: 'carriers',
  initialState,
  reducers: {
    setCarriers: (state, action: PayloadAction<ICarrier[]>) => {
      state.data = action.payload;
    },
    setCarrierLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCarrierError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setCarrierType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setCarrierSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCarrierPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchCarriers.pending,(state)=>{
      state.loading=true;
      state.error=null;
      state.pagination={
        total:0,
        limit:5,
        page:1,
        totalPages:0
      }
    })
    builder.addCase(fetchCarriers.fulfilled,(state,action)=>{
      state.loading=false;
      state.error=null;
      state.data=action.payload.data
      state.pagination=action.payload.pagination || {
        total:0,
        limit:5,
        page:1,
        totalPages:0
      };
    })
    builder.addCase(fetchCarriers.rejected,(state,action)=>{
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

export const { setCarriers,setCarrierLoading,setCarrierError,setCarrierType,setCarrierSearch } = CarriersSlice.actions;
export default CarriersSlice.reducer; 