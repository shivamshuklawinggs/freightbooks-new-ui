

import { initalLoadData } from "@/redux/InitialData/Load";
import { EquipmentType, ICarrierAssignment, ILoad, LoadSize, LoadStatus, temperatureUnitType } from "@/types";

interface LoadData {
  loadNumber?: string;
  signature?: string;
  loadAmount?: number;
  status?: string;
  commodity?: string;
  loadSize?: string;
  declaredValue?: number;
  weight?: number;
  temperature?: number;
  equipmentType?: string;
  equipmentLength?: string;
  notes?: string;
  temperatureUnit?: string;
  customerId: string;
  customerContactPerson?: string;
  carrierIds?: ICarrierAssignment;
  pickupLocationId?: [];
  deliveryLocationId?: [];
  files?: any[];
  freightCharge?: number;
  _id?: string;
  termsandconditions: string;
  pnonumber?: string;
  AcceptTerms?: boolean;
}

interface CarrierData {
  _id?: string;
  mc_mx_ff_numbers?: string;
  mcNumber?: string;
  usdot?: string;
  legal_name?: string;
  drivers?: any[];
  safety_rating?: number;
  safety_rating_date?: number;
  safety_review_date?: number;
  safety_type?: number;
  latest_update?: string;
  physical_address?: string;
  address?: string;
  phone?: string;
  email?: string;
  driver1Name?: string;
  driver2Name?: string;
  driver1Phone?: string;
  driver2Phone?: string;
  driver1CDL?: string;
  driver2CDL?: string;
  driver1CDLExpiration?: string;
  driver2CDLExpiration?: string;
  power_units?: string;
  powerunit?: string;
  duns_number?: string;
  trailer?: string;
}

const transformLoadData = (apiData: LoadData) => {
  const data:ILoad={
     signature:apiData?.signature || "",
    loadDetails: {
      loadNumber: apiData.loadNumber as string,
      loadAmount: apiData.loadAmount as number,
      status: apiData.status as LoadStatus,
      commodity: apiData.commodity as string,
      loadSize: apiData.loadSize as LoadSize,
      declaredValue: apiData.declaredValue as number,
      weight: apiData.weight as number,
      temperature: apiData.temperature as number,
      equipmentType: apiData.equipmentType as EquipmentType,
      equipmentLength: apiData.equipmentLength as string,
      notes: apiData.notes,
      temperatureUnit: apiData?.temperatureUnit as temperatureUnitType ||  initalLoadData.loadDetails.temperatureUnit,
    },
    termsandconditions:apiData.termsandconditions,
    AcceptTerms:apiData?.AcceptTerms || false,
    pnonumber: apiData.pnonumber || initalLoadData.pnonumber, 
    customerId: apiData.customerId || initalLoadData.customerId,
    customerContactPerson: apiData.customerContactPerson || initalLoadData.customerContactPerson,
    carrierIds: apiData.carrierIds || initalLoadData.carrierIds,
    pickupLocationId: apiData.pickupLocationId || initalLoadData.pickupLocationId,
    deliveryLocationId: apiData.deliveryLocationId || initalLoadData.deliveryLocationId,
    files: apiData.files || initalLoadData.files,
    id: apiData._id || null,
    activeTab: "load",
  };
  return data
};

const taransformCarrierData = (apiData: CarrierData) => {
  return {
    _id: apiData._id || null,
    mcNumber: apiData.mc_mx_ff_numbers || apiData.mcNumber,
    usdot: apiData.usdot || apiData.usdot,
    legal_name: apiData.legal_name || apiData.legal_name,
    drivers: apiData.drivers || apiData.drivers,
    safety_rating: apiData.safety_rating ? Number(apiData.safety_rating) : 0,
    safety_rating_date: apiData.safety_rating_date ? Number(apiData.safety_rating_date) : null,
    safety_review_date: apiData.safety_review_date ? Number(apiData.safety_review_date) : null,
    safety_type: apiData.safety_type ? Number(apiData.safety_type) : null,
    latest_update: apiData.latest_update ? new Date(apiData.latest_update) : null,
    address: apiData.physical_address || apiData.address,
    phone: apiData.phone || apiData.phone,
    email: apiData.email || apiData.email,
    driverInfo: {
      driver1Name: apiData.driver1Name || apiData.driver1Name,
      driver2Name: apiData.driver2Name || apiData.driver2Name,
      driver1Phone: apiData.driver1Phone || apiData.driver1Phone,
      driver2Phone: apiData.driver2Phone || apiData.driver2Phone,
      driver1CDL: apiData.driver1CDL || apiData.driver1CDL,
      driver2CDL: apiData.driver2CDL || apiData.driver2CDL,
      driver1CDLExpiration: apiData.driver1CDLExpiration || apiData.driver1CDLExpiration,
      driver2CDLExpiration: apiData.driver2CDLExpiration || apiData.driver2CDLExpiration,
      powerunit: apiData.power_units || apiData.powerunit,
      duns_number: apiData.duns_number || apiData.duns_number,
      trailer: apiData.trailer || apiData.trailer,
    },
  };
};

export { transformLoadData, taransformCarrierData };