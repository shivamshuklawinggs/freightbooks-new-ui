import apiService from "@/service/apiService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { store } from "../store";
import { logout ,IUser} from "../Slice/UserSlice";
import { CustomerResponse, CarrierResponse, ICompany} from "@/types";

// Async thunk to fetch the current user/session from the API.
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
    
      const response = await apiService.getCurrentUser();
      // Expecting the API to return the user object in response.data
      return response.data as IUser;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);
export const fetchCurrentCompany = createAsyncThunk(
  'company/fetchCurrentCompany',
  async ({companyId}: {companyId:string}, { rejectWithValue }) => {
    try {
     
      const response = await apiService.getCompany(companyId);
      // Expecting the API to return the user object in response.data
      return response.data as ICompany;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);
export const fetchLocations = createAsyncThunk(
  'locations/fetchLocations',
  async (params:{type:string}, { rejectWithValue }) => {
    try {
      const search=store.getState().location.search || "";
      const response = await apiService.getLocations(params.type,search);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
  }
})
export const fetchItemService = createAsyncThunk(
  'itemService/fetchItemService',
  async ( { page = 1, limit = 5 }: { page?: number; limit?: number; }, { rejectWithValue }) => {
    try {
      const response = await apiService.getItemServices();
      response.data.unshift({
        "_id": "", 
    })
      return response;
    } catch (error) {
      return rejectWithValue(error);
  }
})
export const fetchPaymentTerms = createAsyncThunk(
  'paymentTerms/fetchPaymentTerms',
  async (params:{page?:number,limit?:number,customerId?:string}, { rejectWithValue }) => {
    try {
      const search=store.getState().paymentTerms.search || "";
      const response = await apiService.getPaymentTerms({search,page:params.page ,limit:params.limit});
    //   response.data.unshift({
    //     "_id": "", 
    // })
      return response;
    } catch (error) {
      return rejectWithValue(error);
  }
})
export const fetchCarriers = createAsyncThunk(
  'carriers/fetchCarriers',
  async (params:{page?:number,limit?:number}, { rejectWithValue }) => {
    try {
      const search=store.getState().carriers.search || ""
  
      const response = await apiService.getCarriers({search,page:params.page ,limit:params.limit});
      response.data.unshift({
        "_id": "", 
    })
      return response;
    } catch (error) {
      return rejectWithValue(error);
  }
})
export const fetchAccountsCustomers = createAsyncThunk(
  'accounts/customers/fetchCustomers',
   async ( { page = 1, limit = 5 ,all=false}: { page?: number; limit?: number;all?:boolean }, { rejectWithValue }) => {
    try {
      const search=store.getState()["accounts.customers"].search || "";
      const response = await apiService.getAccountsCustomers({page,limit,search,all});
      response.data.unshift({
        "_id": "", 
        name:""
    })
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})
export const fetchVendors = createAsyncThunk(
  'accounts/vendors/fetchVendors',
   async ( { page = 1, limit = 5 ,search=""}: { page?: number; limit?: number;search?:string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getVendors({page,limit,search});
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async ( { page = 1, limit = 5 }: { page?: number; limit?: number; }, { rejectWithValue }) => {
    try {
      const search=store.getState().customers.search || "";
      const response = await apiService.getCustomers({page,limit,search});
      response.data.unshift({
        "_id": "", 
        name:""
    })
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async ( { page = 1, limit = 5,search="" }: { page?: number; limit?: number;search?:string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getCompanies({page,limit,search});
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})
export const fetchAllCompanies = createAsyncThunk(
  'companies/fetchAllCompanies',
  async ({check=false}: { check?: boolean; }, { rejectWithValue }) => {
    try {
      let hasMore = true;
      let page = 1;
      let limit = 10;
      let allData = [];

      while (hasMore) {
        const response = await apiService.getCompanies({ page, limit });
        if (!response.data || response.data.length < limit) {
          hasMore = false;
        }
        if (response.data) {
          allData.push(...response.data);
        }
        page++;
      }
      
      return allData;
    } catch (error) {
      console.warn("Error fetching all companies:", error);
      return rejectWithValue(error);
    }
  }
)
export const fetchAllAccountsCustomers = createAsyncThunk(
  'accounts/customers/fetchAllAccountsCustomers',
  async ({check=false}: { check?: boolean; }, { rejectWithValue }) => {
    try {
      let hasMore = true;
      let page = 1;
      let limit = 10;
      let allData = [];

      while (hasMore) {
        const response = await apiService.getAccountsCustomers({ page, limit });
        if (!response.data || response.data.length < limit) {
          hasMore = false;
        }
        if (response.data) {
          allData.push(...response.data);
        }
        page++;
      }
      
      return allData;
    } catch (error) {
      console.warn("Error fetching all accounts customers:", error);
      return rejectWithValue(error);
    }
  }
)
export const fetchAllVendorsAndCarriers = createAsyncThunk(
  'accounts/customers/fetchAllVendorsAndCarriers',
  async ({check=false}: { check?: boolean; }, { rejectWithValue }) => {
    try {
      let hasMore = true;
      let page = 1;
      let limit = 10;
      let allData = [];

      while (hasMore) {
        const response = await apiService.getAllVendorsAndCarriers({ page, limit });
        if (!response.data || response.data.length < limit) {
          hasMore = false;
        }
        if (response.data) {
          allData.push(...response.data);
        }
        page++;
      }
      
      return allData;
    } catch (error) {
      console.warn("Error fetching all vendors and carriers:", error);
      return rejectWithValue(error);
    }
  }
)
export const fetchAllCustomersWithLoads = createAsyncThunk(
  'customers/fetchAllCustomersWithLoads',
  async ({check=false}: { check?: boolean; }, { rejectWithValue }) => {
    try {
      let hasMore = true;
      let page = 1;
      let allData = [];

      while (hasMore) {
        const response :CustomerResponse = await apiService.getCustomersWithLoads({ page, });
        const { total } = response.pagination || {}
        hasMore = allData.length<total
        if (response.data) {
          allData.push(...response.data);
        }
        if(hasMore){
          page++;
        }
        
      }
      
      return allData;
    } catch (error) {
      console.warn("Error fetching all customers with loads:", error);
      return []
    }
  }
)
export const fetchAllCarriersWithLoads = createAsyncThunk(
  'carriers/fetchAllCarriersWithLoads',
  async ({check=false}: { check?: boolean; }, { rejectWithValue }) => {
    try {
      let hasMore = true;
      let page = 1;
      let allData = [];

      while (hasMore) {
        const response :CarrierResponse = await apiService.getCarriersWithLoads({ page, });
        const { total } = response.pagination || {}
        hasMore = allData.length<total
        if (response.data) {
          allData.push(...response.data);
        }
        if(hasMore){
          page++;
        }
        
      }
      
      return allData;
    } catch (error) {
      console.warn("Error fetching all companies:", error);
      return []
    }
  }
)
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async ( { page = 1, limit = 5,type="load" }: { page?: number; limit?: number;type?:string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocuments({page,limit,type});
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})
export const fetchSubDocuments = createAsyncThunk(
  'documents/fetchSubDocuments',
  async ( params: Record<string,any>= {page:1,limit:5,type:"load"}, { rejectWithValue }) => {
    try {
      const response = await apiService.getSubDocuments(params as any);
      return response
    } catch (error) {
      console.warn("error",error)
      return rejectWithValue(error);
  }
})

export const UserLogout = createAsyncThunk(
  'user/logout',
  async (_, {dispatch, rejectWithValue }) => {
    try {
      await apiService.logout();
      dispatch(logout()); // Dispatch the logout action to clear user state
      // Optionally, you can also clear any other related state or perform additional cleanup here
      return true; // Indicate successful logout
    } catch (error) {
      return rejectWithValue(error);
    }
  } 
);
