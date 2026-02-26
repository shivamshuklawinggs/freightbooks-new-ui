import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createIndexedDBStorage from "redux-persist-indexeddb-storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import sidebarReducer from "./Slice/sidebarSlice";
import loadSliceReducer from "./Slice/loadSlice";
import editloadSliceReducer from "./Slice/EditloadSlice";
import toastReducer from "./Slice/toastSlice";
import userReducer,{UserState} from "./Slice/UserSlice";
import columnFilterReducer,{ColumnFilterState} from './Slice/ColumnFilterSlice'
import locationSliceReducer from './Slice/locationSLlce'
import carriersSliceReducer from './Slice/carrierSLlce'
import customersSliceReducer from './Slice/CustomersSlice'
import accountsCustomersSliceReducer from './Slice/accounts/CustomersSlice'
import vendorSliceReducer from './Slice/VendorSlice'
import documentsSliceReducer from './Slice/DocumentSlice'
import subDocumentsSliceReducer from './Slice/SubDocumentSlice'
import companySliceReducer from './Slice/CompanySlice'
import paymentTermsSliceReducer from './Slice/PaymenTermsSlice'
import itemServiceSliceReducer from './Slice/ItemServiceSlice'
import reportReducer from '../store/reports';
import dashboardReducer from './Slice/DashboardSlice';
import superadminReducer from './Slice/SuperadminSlice';
import themeReducer, { ThemeSettings } from './Slice/themeSlice';
// Import types for proper typing with redux-persist
import { PersistConfig } from 'redux-persist';
import { ILoad, SidebarState } from "@/types";
import { TypedUseSelectorHook,useSelector, useDispatch } from "react-redux";
import { companyResetMiddleware } from "./middlewares/companyReset.middleware";
import storage from "redux-persist/lib/storage";

export const indexedDBStorage = createIndexedDBStorage("myAppDB");
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && !Array.isArray(value) && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value)

const createTypeSafeMigrate = (
  persistKey: string,
  validator: (state: unknown) => boolean
) => {
  return async (state: any): Promise<any> => {
    if (state == null) return state;
    if (validator(state)) return state;

    console.warn(`Invalid persisted state removed: persist:${persistKey}`);
    try {
      await indexedDBStorage.removeItem(`persist:${persistKey}`);
    } catch (error) {
      console.warn(`Failed to remove invalid persisted key: persist:${persistKey}`, error);
    }
    return undefined;
  };
};

const isLoadPersistState = (state: unknown): state is ILoad => {
  if (!isObject(state)) return false;
  return (
    Array.isArray(state.pickupLocationId) &&
    Array.isArray(state.deliveryLocationId) &&
    Array.isArray(state.files) &&
    isObject(state.carrierIds) &&
    isObject(state.loadDetails)
  );
};

const isColumnFilterPersistState = (state: unknown): state is ColumnFilterState => {
  if (!isObject(state)) return false;
  return (
    isStringArray(state.visibleColumns) &&
    isStringArray(state.hiddenColumns) &&
    isStringArray(state.accountsCustomerVisbleColmns) &&
    isStringArray(state.accountsCustomerhiddenColmns) &&
    isStringArray(state.CustomerVisbleColmns) &&
    isStringArray(state.CustomerhiddenColmns) &&
    isStringArray(state.vendorsVisbleColmns) &&
    isStringArray(state.vendorshiddenColmns)
  );
};

const isSidebarPersistState = (state: unknown): state is SidebarState => {
  if (!isObject(state)) return false;
  return (
    typeof state.isOpen === "boolean" &&
    typeof state.activeMenu === "string" &&
    isStringArray(state.openMenus)
  );
};

const isUserPersistState = (state: unknown): state is UserState => {
  if (!isObject(state)) return false;
  if ("themeMode" in state && state.themeMode !== "light" && state.themeMode !== "dark") return false;
  if ("primaryColor" in state && typeof state.primaryColor !== "string") return false;
  if ("currentCompany" in state && typeof state.currentCompany !== "string") return false;
  return true;
};

const encryptionTransform = encryptTransform({
  secretKey: import.meta.env.VITE_API_INDEX_DB_STORAGE,
  onError: (error: Error) => {
    console.warn("Encryption error:", error);
  },
});

// Properly typed persist configs
const LoadpersistConfig: PersistConfig<ILoad> = {
  key: "load",
  storage: indexedDBStorage,
  transforms: [encryptionTransform],
  migrate: createTypeSafeMigrate("load", isLoadPersistState),
  blacklist: ['search','loadDetails.loadNumber']
};

const columnFilterpersistConfig: PersistConfig<ColumnFilterState> = {
  key: "columnFilter",
  storage: indexedDBStorage,
  transforms: [encryptionTransform],
  migrate: createTypeSafeMigrate("columnFilter", isColumnFilterPersistState),
};
const themePersistConfig: PersistConfig<ThemeSettings> = {
  key: "theme",
  storage: storage,
};

const sidebarpersistConfig: PersistConfig<SidebarState> = {
  key: "sidebar",
  storage: indexedDBStorage,
  transforms: [encryptionTransform],
  migrate: createTypeSafeMigrate("sidebar", isSidebarPersistState),
};
const AuthPersistConfig: PersistConfig<UserState> = {
  key: "company",
  storage: indexedDBStorage,
  blacklist: ['user','isAuthenticated','loading','error','initialized','currentCompanyDetails'],
  transforms: [encryptionTransform],
  migrate: createTypeSafeMigrate("company", isUserPersistState),
};

// Create the store with properly typed reducers
export const store = configureStore({
  reducer: {
    sidebar: persistReducer<SidebarState>(sidebarpersistConfig, sidebarReducer),
    load: persistReducer<ILoad>(LoadpersistConfig, loadSliceReducer),
    toast: toastReducer,
    editload: editloadSliceReducer,
    user: persistReducer<UserState>(AuthPersistConfig, userReducer),
    columnFilter: persistReducer<ColumnFilterState>(columnFilterpersistConfig, columnFilterReducer),
    location: locationSliceReducer,
    carriers: carriersSliceReducer,
    report: reportReducer,
    theme:persistReducer<ThemeSettings>(themePersistConfig, themeReducer),
    dashboard: dashboardReducer,

    ["accounts.customers"]: accountsCustomersSliceReducer,
    customers: customersSliceReducer,
    documents: documentsSliceReducer,
    vendor: vendorSliceReducer,
    subDocuments: subDocumentsSliceReducer,
    company: companySliceReducer,
    paymentTerms: paymentTermsSliceReducer,
    itemService: itemServiceSliceReducer,
    superadmin: superadminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck:false
    }).concat(companyResetMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
