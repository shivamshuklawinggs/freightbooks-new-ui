
import { ILoad } from "@/types";
import { initalLoadData } from "@/redux/InitialData/Load";
import { createSlice } from "@reduxjs/toolkit";

const initialState :ILoad= initalLoadData

const loadSlice = createSlice({
  name: "editload",
  initialState,
  reducers: {
     // Document upload actions
     setFiles: (state, action) => {
      state.files = action.payload;
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
    },
    setPowerunit: (state, action) => {
      state.carrierIds.powerunit = action.payload.powerunit;
    },
    setTrailer: (state, action) => {
      state.carrierIds.trailer = action.payload.trailer;
    },
    AssignDriversToCarrier: (state, action) => {
      state.carrierIds.assignDrivers = action.payload.assignDrivers;
    },
    AddAssignDriver: (state, action) => {
      let driverId=action.payload.driverId
      let assignDrivers=state.carrierIds.assignDrivers
      if (!assignDrivers.includes(driverId)) {
        // Push driverId
        state.carrierIds.assignDrivers.push(driverId);
      }
   
    },
    removeAssignDriver: (state, action) => {
      const { driverId } = action.payload;
      const assignDrivers = state.carrierIds.assignDrivers;
      const driverIndex = assignDrivers.findIndex((id) => id === driverId);
    
      if (driverIndex !== -1) {
        assignDrivers.splice(driverIndex, 1);
      }
    },
    
    setCarrier: (state, action) => {
      state.carrierIds.carrier = action.payload.carrier;
    },
    setDispatchRate: (state, action) => {
      state.carrierIds.carrierPay = action.payload.carrierPay;
    },
    
    removeFile: (state, action) => {
      // check removed file has a originalname
      const fileToRemove = state.files[action.payload];
      if (fileToRemove.originalname) {
        // Get current deletedfiles array or initialize empty array
        const currentDeletedFiles = state.deletedfiles || [];
        // Add the originalname to deletedfiles array
        state.deletedfiles = [...currentDeletedFiles, fileToRemove.filename];
      }
      state.files = state.files.filter((_, index) => index !== action.payload);
    },
   
    setLoadDetails: (state, action) => {
      state.loadDetails = action.payload;
    },
    setCustomerInformation: (state, action) => {
      state.customerId = action.payload;
    },
    setcarrierIds: (state, action) => {
      state.carrierIds = action.payload;
    },
       setCarrierContactPerson: (state, action) => {
      state.carrierIds.contactPerson = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    // Updated for multiple pickup locations
    setPickupInfo: (state, action) => {
      const { index, pickup } = action.payload;
      state.pickupLocationId[index] = pickup;
    },
    addPickupLocation: (state,) => {
      state.pickupLocationId.push(initialState.pickupLocationId[0]);
    },
    removePickupLocation: (state, action) => {
      if(state.pickupLocationId.length > 1){
        state.pickupLocationId = state.pickupLocationId.filter((_, index) => index !== action.payload);
      }
    },
    updatePickupLocation: (state, action) => {
      state.pickupLocationId[action.payload.index] = action.payload;
    },
    // update for multiple delivery location
    updateDeliveryLocation: (state, action) => {
      state.deliveryLocationId[action.payload.index] = action.payload;
    },
    addDeliveryLocation: (state) => {
      state.deliveryLocationId.push(initialState.deliveryLocationId[0]);
    },
    removeDeliveryLocation: (state, action) => {
      if(state.deliveryLocationId.length > 1){
        state.deliveryLocationId = state.deliveryLocationId.filter((_, index) => index !== action.payload);
      }
    },
    // update carrierIds
    updateCarierLocation: (state, action) => {
      state.carrierIds = action.payload
    },

    // for customers
    setCustomerPnonumber: (state, action) => {
      state.pnonumber = action.payload;
    },
    setTermsAndConditions: (state, action) => {
      state.termsandconditions = action.payload;
    },
    setAcceptTerms: (state, action) => {
      state.AcceptTerms = action.payload;
    },
       // for signature
    setSignature: (state, action) => {
      state.signature = action.payload;
    },
    // Inside your loadSlice reducers:
initializeLoadData: (state, action) => {
  return {
    ...action.payload, // Merge with the incoming payload
    activeTab: "load",
  };
},
    resetLoad: () => initialState,
    setLoadId: (state, action) => {
      state.id = action.payload;
    },
    setCustomerContactPerson: (state, action) => {
      state.customerContactPerson = action.payload;
    }
    
  },
});

export const {
  setLoadDetails,
  setSignature,
  setCustomerInformation,
  setcarrierIds,setCustomerContactPerson,
  setActiveTab,
  AssignDriversToCarrier,removeAssignDriver,
  setTrailer,setPowerunit,
  setCarrier,
  setPickupInfo,
  addPickupLocation,
  removePickupLocation,
  resetLoad,
  updatePickupLocation,
  addDeliveryLocation, setFiles,
  addFile,setCarrierContactPerson,
  removeFile,
  AddAssignDriver,
  setDispatchRate,
  updateCarierLocation,
  setLoadId,
  removeDeliveryLocation,
  updateDeliveryLocation,initializeLoadData,
  setCustomerPnonumber,setTermsAndConditions,setAcceptTerms
 
} = loadSlice.actions;

export default loadSlice.reducer;