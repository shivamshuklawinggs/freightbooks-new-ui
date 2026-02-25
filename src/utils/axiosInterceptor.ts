import axios from "axios";
import { store } from "@/redux/store";
import { logout } from "@/redux/Slice/UserSlice";
import { API_URL } from "@/config";
import { toast } from "react-toastify";
import { decryptErrorResponse, decryptResponse, encryptRequest } from "./aes";

const API_KEY = import.meta.env.VITE_API_KEY;

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL + "api",
  withCredentials: true,
  headers: {
    "x-api-key": API_KEY,
  }
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from Redux store instead of localStorage
    const state = store.getState();
    const companyId = state.user.currentCompany;
    // config.headers["isencrypted"]="true"
    config.headers["isencrypted"]="false"
    if (companyId) {
      config.headers.companyId = companyId;
    }
    // Encrypt request data for POST and PUT requests
   if(config.headers.isencrypted =='true') { 
    encryptRequest(config)
  }
    return config;
  },
  (error:any) => {
    console.warn("errrr",error)
    Promise.reject(error)
  }
);

// Response Interceptor
api.interceptors.response.use(
   (response) => {
    try {
      // Handle encrypted responses
     if(response.config.headers.isencrypted =='true') {
      
       decryptResponse(response)
     } 
      return response;
    } catch (error:any) {
      if( error.config.headers.isencrypted=='true' ){ 
         decryptErrorResponse(error)
      }
      return Promise.reject(error);
    }
  },
  async (error:any) => {
    if( error.config.headers.isencrypted=='true' ) { 
      decryptErrorResponse(error)
    }
    // Handle response errors
        switch (error.response?.status) {
      case 401:
        // Handle unauthorized error
        store.dispatch(logout());
        toast.error("Session expired. Please login again.");
        error.message="Session expired. Please login again.";
        break;
      case 403:
        // toast.error("Access denied");
        error.message="Access denied";
        break;
      default:
        if (error.response?.data?.message) {
          // toast.error(error.response.data.message);
          error.message=error.response.data.message;
        } else {
          // toast.error("An error occurred");
          error.message=error.message
        }
    }
    return Promise.reject(error);
  }
);

export default api;