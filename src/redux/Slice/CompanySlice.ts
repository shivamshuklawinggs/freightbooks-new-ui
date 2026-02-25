import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICompany } from '@/types';
import { fetchCompanies } from '../api';

interface CompanyState {
  data: ICompany[];
  loading: boolean;
  error: any;
  type: string;
  search: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

const initialState: CompanyState = {
  data: [],
  loading: false,
  error: null,
  type: "",
  search: "",
  pagination: {
    total: 0,
    limit: 5,
    page: 1,
    totalPages: 0
  }
};

const CompanySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<ICompany[]>) => {
      state.data = action.payload;
    },
    setCompanyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCompanyError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setCompanyType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setCompanySearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCompanyPagination: (state, action: PayloadAction<{total:number,limit:number,page:number,totalPages:number}>) => {
      state.pagination = action.payload;
    },
   
  },
  extraReducers(builder){
    builder.addCase(fetchCompanies.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    builder.addCase(fetchCompanies.fulfilled,(state,action)=>{
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
    builder.addCase(fetchCompanies.rejected,(state,action)=>{
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

export const { 
  setCompany,
  setCompanyLoading,
  setCompanyError,
  setCompanyType,
  setCompanySearch,
  setCompanyPagination,
} = CompanySlice.actions;
export default CompanySlice.reducer; 