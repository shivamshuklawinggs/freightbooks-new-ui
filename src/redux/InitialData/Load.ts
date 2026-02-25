
import { todayDate } from "@/config/constant";
import { ICarrierAssignment, IPickupLocation,IDeliveryLocation, ILoad, IloadDetails, EquipmentType, LoadSize } from "@/types";

export interface LoadValidationData {
  load: IloadDetails;
  customer: {
    customerId: string | null;
    customerContactPerson: string | null;
  };
  asset: ICarrierAssignment;
  pickup: IPickupLocation[];
  delivery: IDeliveryLocation[];
  document: {
    files: File[];
  };
}
export const initalLoadData: ILoad = {
  search:"",
  pnonumber: "",
   signature:"",
  AcceptTerms:false,
  termsandconditions:"",
  deletedfiles: [],
  loadDetails: {
    loadNumber: '',
    loadAmount: null,
    status:undefined,
    commodity: '',
    loadSize: "" as LoadSize,
    declaredValue:0,
    weight:0,
    temperature:null,
    equipmentType: EquipmentType.REEFER,
    equipmentLength: '53',
    notes: '',
    temperatureUnit: null
  },
  customerContactPerson: null,
  customerId: null,
  carrierIds: {
    carrier: "",
    powerunit: "",
    trailer: "",
    carrierPay: 0,
    assignDrivers: [],
    pnonumber: "",
    contactPerson: null
  },
  deliveryLocationId: [
    {
      requirements: [],
      address: "",
      state: "",
      city: "",
      zipcode: "",
      locationClass: "",
      date:todayDate,
      time: "",
      endTime: "",
      notes: "",
      deliveryNumber: "",
      weight: 0,
      casecount: 0,
      palletcount:0
    },
  ],
  pickupLocationId: [
    {
      address: "",
      state: "",
      city: "",
      zipcode: "",
      locationClass: "",
      date:todayDate,
      time: "",
      endTime: "",
      requirements: [],
      notes: "",
      pickupNumber: "",
      checkin: undefined,
      checkout: undefined,
      weight: 0,
      casecount: 0,
      palletcount:0
    },
  ],
  files: [],
  id: null,
  activeTab: "load",
};

export const initialLoadetails = initalLoadData.loadDetails;
export const initialCustomerInformation = initalLoadData.customerId;
export const initialcarrierIds = initalLoadData.carrierIds;
export const initialDeliveryLocations = initalLoadData.deliveryLocationId[0];
export const initialPickupLocations = initalLoadData.pickupLocationId[0];

export const initialDocumentUpload = {
  files: [],
  freightCharge: 'Prepaid'
};