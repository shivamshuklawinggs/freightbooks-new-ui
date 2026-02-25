// src/redux/userLoginSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  ICompany, Role } from '@/types';
import { initialCompanyData } from '@/redux/InitialData/initialCompanyData'
import { fetchCurrentUser } from '../api';
import theme from '@/data/theme';
export interface IUser {
  _id: string;
  email: string;
  name: string;
  menuPermission: {
    dashboard:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    loads:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    dispatcher:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    customers:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    carriers:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    documents:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    expense_service:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
    accounting:{
      permissions:{
        create:boolean,
        delete:boolean,
        update:boolean,
        view:boolean,
        import:boolean,
        export:boolean
      }
    },
  };
  role:Role
 
}

export interface UserState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  themeMode?: 'light' | 'dark';
  primaryColor?: string;
  error: string | null;
  currentCompany?:string,
  currentCompanyDetails:ICompany
  initialized: boolean; // 👈 marks that the thunk has run once
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  themeMode: 'light',
  primaryColor: theme.palette.primary.main,
  error: null,
  currentCompany:"",
  currentCompanyDetails:initialCompanyData,
  initialized: false,
  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    loginSuccess: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload.user
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated=false
      state.user=null
      
    },
    logout: (state) => {
      // assign initialState to state
      Object.assign(state, initialState);
    },
    // setCurrentCompany:(state,action:PayloadAction<string>)=>{
    //   state.currentCompany=action.payload
    // },
    // setCurrentCompanyDetails:(state,action:PayloadAction<ICompany>)=>{
    //   state.currentCompanyDetails=action.payload
    // },
    setCompany:(state,action:PayloadAction<ICompany>)=>{
      state.currentCompanyDetails=action.payload || initialCompanyData
      state.currentCompany=action.payload._id || ""
      state.primaryColor=action.payload.color || initialCompanyData.color
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<IUser | null>) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload as IUser;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
     
        }
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
        
      })

     
  },
});

export const { loginStart, loginSuccess, loginFailure, logout,toggleThemeMode,setCompany } = userSlice.actions;
export default userSlice.reducer;
