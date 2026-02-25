import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomerInformation, setCustomerContactPerson,setCustomerPnonumber } from '@/redux/Slice/EditloadSlice';
import apiService from '@/service/apiService';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Stack,
 
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Numbers as NumbersIcon,
  AttachMoney as DollarIcon
} from '@mui/icons-material';
import ContactCustomers from './ContactCustomers';
import { AppDispatch, RootState } from '@/redux/store';
import { getCustomerSubtotal } from '@/utils';
import CustomerOnSelect from '@/components/common/CustomerOnSelect';
import { fetchCustomers } from '@/redux/api';
import { setCustomerSearch } from '@/redux/Slice/CustomersSlice';

const CustomerInformation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [customer, setCustomerData] = useState(null);
  const { customerId = "",loadDetails,customerContactPerson,pnonumber } = useSelector((state:RootState) => state.editload || {});
  const { search} = useSelector((state:RootState) => state.customers || {});

 
  useEffect(() => {
    dispatch(fetchCustomers({
      page:1,
      limit:5
    }))
   }, [search]);
     useEffect(()=>{
        dispatch(setCustomerSearch(""))
     },[customerId])
   const handleCustomerChange = async (e:ChangeEvent<HTMLInputElement>) => {
     const selectedCustomerId = e.target.value;
       try {
          dispatch(setCustomerInformation(selectedCustomerId || null));
          dispatch(setCustomerContactPerson(null));
          !selectedCustomerId &&  dispatch(setCustomerContactPerson(null))
       } catch (err) {
         dispatch(setCustomerInformation(null));
         dispatch(setCustomerContactPerson(null));
         setCustomerData(null)
       }
   };
 
   const getCustomer=async(customerId:string)=>{
      try {
       const response = await apiService.getCustomer(customerId);
       setCustomerData(response.data)
      } catch (error) {
       setCustomerData(null)
      }
   }
 const clearData=()=>{
   dispatch(setCustomerInformation(null));
   dispatch(setCustomerContactPerson(null));
   setCustomerData(null)
 }
 useEffect(()=>{
   customerId &&  getCustomer(customerId)
   !customerId &&  setCustomerData(null)
 },[customerId])
 

  const customerFields = [
    { icon: <BusinessIcon />, label: "Company Name", name: "company" },
    // { icon: <PersonIcon />, label: "Contact Name", name: "company" },
    { icon: <EmailIcon />, label: "Company Email", name: "email" },
    { icon: <PhoneIcon />, label: "Company Phone", name: "phone" },
    { icon: <NumbersIcon />, label: "MC Number", name: "mcNumber" },
    { icon: <LocationIcon />, label: "Company Address", name: "address", multiline: true },
    { icon: <NumbersIcon />, label: "USDOT Number", name: "usdot" },
    { icon: <NumbersIcon />, label: "UTR Number", name: "utrNumber" }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Stack spacing={3}>
            {/* Customer Selection */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Customer Information
              </Typography>
              <CustomerOnSelect updateLocation={handleCustomerChange as unknown as any} clearData={clearData}/>

            </Box>

      {/* Customer Details */}
            {customer && (
              <>
                <Grid container spacing={2}>
                  {customerFields.map(({ icon, label, name, multiline }) => (
                    <Grid item xs={12} md={multiline ? 6 : 3} key={name}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          height: '100%'
                        }}
                      >
                        <Stack spacing={1}>
                      
                            <TextField
                            fullWidth
                            label={label}
                            value={customer[name] || ""}
                            InputProps={{ readOnly: true }}
                            multiline={multiline}
                            rows={multiline ? 3 : 1}
                            variant="outlined"
                          />
                          {/* )} */}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                  {/* customer rate field add changeable  */}
                    <ContactCustomers />

                  <Grid item xs={12} md={!customerContactPerson?6:3}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        height: '100%'
                      }}
                    >
                      <Stack spacing={1}>
                        <TextField
                          fullWidth
                          label="Rate"
                          
                          value={getCustomerSubtotal(Number(loadDetails.loadAmount) || 0)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <DollarIcon color="primary" />
                              </InputAdornment>
                            ),
                            readOnly: true
                          }}
                          variant="outlined"
                        />
                       
                      </Stack>
                    </Paper>
                    </Grid>
                    {/* set pno number */}
                    <Grid item xs ={12} md={3}>
                          <TextField
                          fullWidth
                          label="PO Number"
                          value={pnonumber}
                          onChange={(e)=>dispatch(setCustomerPnonumber(e.target.value))}
                          variant="outlined"
                          />
                        </Grid>
                </Grid>

                {/* Customer Expenses */}
                {/* <CustomerExpense /> */}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

    </Box>
  );
};

export default CustomerInformation;