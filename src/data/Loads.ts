import { Colors } from "./theme";

  const locationClasses = ["warehouse", "port"];
  const locationRequirement = [
    { id: 1, name: "Liftgate Service Needed",color:"#FFD200" },
    { id: 2, name: "Inside Pickup",color:"#FFD200" },
    { id: 3, name: "Appointment Required",color:"#FFD200" },
    { id: 4, name: "Driver Assist Required",color:"#FFD200" },
  ];
  // Enums for LoadStatus, LoadSize, and EquipmentType
const LoadStatus = [
  {id:1, name: 'Pending',color:Colors.Pending},
  {id:2, name: 'In Progress',color:Colors.InProgress},
  {id:3, name: 'Dispatched',color:Colors.Dispatched},
  {id:4, name: 'Delivered',color:Colors.Delivered},
  {id:5, name: 'Picked Up',color:Colors.PickedUp},
  {id:6, name: 'Claimed',color:Colors.Claimed},
  {id:7, name: 'Claimed & Delivered',color:Colors.ClaimedDelivered},
  {id:8, name: 'Cancelled',color:Colors.Cancelled},
]

const  LoadSize =[
  {id:"partial", name: 'Partial',color:Colors.Partial},
  {id:"full", name: 'Full',color:Colors.Full},
]
const tabs = ["load", "customer", "asset", "pickup", "delivery", "document"];
const EquipmentType=[
    {
      "category": "1. Dry Van",
      "options": [
        { "value": "Van", "label": "Van",color:Colors.Van },
        { "value": "Van - Air-Ride", "label": "Van - Air-Ride",color:Colors.VanAirRide },
        { "value": "Van - Hazardous", "label": "Van - Hazardous",color:Colors.VanHazardous },
        { "value": "Van - Vented", "label": "Van - Vented",color:Colors.VanVented },
        { "value": "Van w/ Curtains", "label": "Van w/ Curtains",color:Colors.VanCurtains },
        { "value": "Van w/ Pallet Exchange", "label": "Van w/ Pallet Exchange",color:Colors.VanPalletExchange }
      ]
    },
    {
      "category": "2. Temp. Control",
      "options": [
        { "value": "Reefer", "label": "Reefer",color:Colors.Reefer },
        { "value": "Reefer - Hazardous", "label": "Reefer - Hazardous",color:Colors.ReeferHazardous },
        { "value": "Reefer w/ Pallet Exchange", "label": "Reefer w/ Pallet Exchange",color:Colors.ReeferPalletExchange }
      ]
    },
    {
      "category": "3. Flatbed",
      "options": [
        { "value": "Double Drop", "label": "Double Drop",color:Colors.DoubleDrop },
        { "value": "Flatbed", "label": "Flatbed",color:Colors.Flatbed },
        { "value": "Flatbed - Hazardous", "label": "Flatbed - Hazardous",color:Colors.FlatbedHazardous },
        { "value": "Flatbed w/ Pallet Exchange", "label": "Flatbed w/ Pallet Exchange",color:Colors.FlatbedPalletExchange },
        { "value": "Flatbed w/ Sides", "label": "Flatbed w/ Sides",color:Colors.FlatbedSides },
        { "value": "Lowboy", "label": "Lowboy",color:Colors.Lowboy },
        { "value": "Maxi", "label": "Maxi",color:Colors.Maxi },
        { "value": "Removable Gooseneck", "label": "Removable Gooseneck",color:Colors.RemovableGooseneck },
        { "value": "Step Deck", "label": "Step Deck",color:Colors.StepDeck }
      ]
    },
    {
      "category": "4. Specialized",
      "options": [
        { "value": "Auto Carrier", "label": "Auto Carrier",color:Colors.AutoCarrier },
        { "value": "Dump Trailer", "label": "Dump Trailer",color:Colors.DumpTrailer },
        { "value": "Hopper Bottom", "label": "Hopper Bottom",color:Colors.HopperBottom },
        { "value": "Hotshot", "label": "Hotshot",color:Colors.Hotshot },
        { "value": "Tanker", "label": "Tanker",color:Colors.Tanker }
      ]
    },
    {
      "category": "5. Flexible Type",
      "options": [
        { "value": "Flatbed/Step Deck", "label": "Flatbed/Step Deck",color:Colors.FlatbedStepDeck },
        { "value": "Flatbed/Van", "label": "Flatbed/Van",color:Colors.FlatbedVan },
        { "value": "Flatbed/Reefer", "label": "Flatbed/Reefer",color:Colors.FlatbedReefer },
        { "value": "Reefer/Van", "label": "Reefer/Van",color:Colors.ReeferVan },
        { "value": "Flatbed/Reefer/Van", "label": "Flatbed/Reefer/Van",color:Colors.FlatbedReeferVan }
      ]
    },
    {
      "category": "Misc.",
      "options": [
        { "value": "Power Only", "label": "Power Only",color:Colors.PowerOnly }
      ]
    }
  ]
  const LOAD_STATUSES = [
    { key: 'allLoad', label: 'All Loads',color:Colors.unknown},
    { key: 'Pending', label: 'Pending',color:Colors.Pending },
    { key: 'In Progress', label: 'In Progress',color:Colors.InProgress },
    { key: 'Dispatched', label: 'Dispatched',color:Colors.Dispatched },
    { key: 'Delivered', label: 'Delivered',color:Colors.Delivered },
    { key: 'Cancelled', label: 'Cancelled',color:Colors.Cancelled },
    { key: 'Picked Up', label: 'Picked Up',color:Colors.PickedUp },
    { key: 'Claimed', label: 'Claimed',color:Colors.Claimed },
    { key: 'Claimed & Delivered', label: 'Claimed & Delivered',color:Colors.ClaimedDelivered },
  ];
const COLUMN_OPTIONS = [
  { key: 'loadNumber', label: 'Load No',color:Colors.loadNumber },
  { key: 'pickDate', label: 'Pick Up Date',color:Colors.pickDate },
  { key: 'dropDate', label: 'Drop Date',color:Colors.dropDate },
  { key: 'status', label: 'Status',color:Colors.status },
  { key: 'loadAmount', label: 'Load Pay',color:Colors.loadAmount },
  
  // { key: 'invoice', label: 'Invoice',color:Colors.invoice },
  { key: 'customeramt', label: 'Customer Amt',color:Colors.customeramt },
  { key: 'customer', label: 'Customer',color:Colors.customer },
  { key: 'picks', label: 'Origin',color:Colors.picks },
  { key: 'drops', label: 'Destination',color:Colors.drops },
  { key: 'currentLocation', label: 'Current Location',color:Colors.currentLocation },
  { key: 'carrierPay', label: 'Carrier Pay',color:Colors.carrierPay },
  { key: 'margin', label: 'Margin Amt',color:Colors.unknown },
  { key: 'carrierTotal', label: 'carrier Total',color:Colors.unknown },
  { key: 'dipsatchRateAmt', label: 'Dispatch Rate Amt',color:Colors.dipsatchRateAmt },
  { key: 'carrier', label: 'Carrier',color:Colors.carrier },
  { key: 'driver', label: 'Driver',color:Colors.driver },
  { key: 'equipment', label: 'Equipment',color:Colors.equipment },
  { key: 'temperature', label: 'Temperature',color:Colors.unknown },
  { key: 'powerUnit', label: 'Power Unit',color:Colors.powerUnit },
  { key: 'trailer', label: 'Trailer',color:Colors.trailer },
  { key: 'createdBy', label: 'Created By',color:Colors.createdBy },
  { key: 'status', label: "Status",color:Colors.status },
] as const 
export type COLUMN_OPTIONSTYPE = typeof COLUMN_OPTIONS[0]["key"][]

 const tempreatureEquipmentlist = EquipmentType.flatMap((type) => 
  type.options.filter((option) => (
    option.value.includes("Reefer")
  )).map((option) => (
    option.value
  ))
)

export  {locationClasses,tempreatureEquipmentlist,locationRequirement,LOAD_STATUSES,COLUMN_OPTIONS,LoadStatus,LoadSize,EquipmentType,tabs};