import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILocationWithIds } from '@/types';
import { fetchLocations } from '../api';

interface LocationState {
  locations:ILocationWithIds[];
  loading:boolean;
  error:any,
  type:string,
  search:string
}

const initialState: LocationState = {
  locations: [],
  loading:false,
  error:null,
  type:"",
  search:""
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setLocations: (state, action: PayloadAction<ILocationWithIds[]>) => {
      state.locations = action.payload;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setLocationType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setLocationSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
  extraReducers(builder){
    builder.addCase(fetchLocations.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchLocations.fulfilled,(state,action)=>{
      state.loading=false;
      state.error=null;
      state.locations=action.payload;
    })
    builder.addCase(fetchLocations.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
      state.locations=[]
    })
  }
});

export const { setLocations,setLocationLoading,setLocationError,setLocationType,setLocationSearch } = locationSlice.actions;
export default locationSlice.reducer; 