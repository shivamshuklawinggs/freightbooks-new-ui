import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomerInformation, setCustomerContactPerson, setCustomerPnonumber } from '@/redux/Slice/EditloadSlice';
import apiService from '@/service/apiService';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import { AttachMoney as DollarIcon } from '@mui/icons-material';
import ContactCustomers from './ContactCustomers';
import { AppDispatch, RootState } from '@/redux/store';
import { getCustomerSubtotal } from '@/utils';
import CustomerOnSelect from '@/components/common/CustomerOnSelect';
import { fetchCustomers } from '@/redux/api';
import { setCustomerSearch } from '@/redux/Slice/CustomersSlice';

const CustomerInformation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [customer, setCustomerData] = useState(null);
  const { customerId = "", loadDetails, pnonumber } = useSelector((state: RootState) => state.editload || {});
  const { search } = useSelector((state: RootState) => state.customers || {});

  useEffect(() => {
    dispatch(fetchCustomers({
      page: 1,
      limit: 5
    }))
  }, [search]);
  useEffect(() => {
    dispatch(setCustomerSearch(""))
  }, [customerId])

  const handleCustomerChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedCustomerId = e.target.value;
    try {
      dispatch(setCustomerInformation(selectedCustomerId || null));
      dispatch(setCustomerContactPerson(null));
      !selectedCustomerId && dispatch(setCustomerContactPerson(null))
    } catch (err) {
      dispatch(setCustomerInformation(null));
      dispatch(setCustomerContactPerson(null));
      setCustomerData(null)
    }
  };

  const getCustomer = async (customerId: string) => {
    try {
      const response = await apiService.getCustomer(customerId);
      setCustomerData(response.data)
    } catch (error) {
      setCustomerData(null)
    }
  }

  const clearData = () => {
    dispatch(setCustomerInformation(null));
    dispatch(setCustomerContactPerson(null));
    setCustomerData(null)
  }

  useEffect(() => {
    customerId && getCustomer(customerId)
    !customerId && setCustomerData(null)
  }, [customerId])

  const customerFields = [
    { label: 'Company Name', name: 'company' },
    { label: 'Company Email', name: 'email' },
    { label: 'Company Phone', name: 'phone' },
    { label: 'MC Number', name: 'mcNumber' },
    { label: 'Company Address', name: 'address', multiline: true },
    { label: 'USDOT Number', name: 'usdot' },
    { label: 'UTR Number', name: 'utrNumber' },
  ];

  return (
    <Card elevation={2} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
           
            <CustomerOnSelect updateLocation={handleCustomerChange as unknown as any} clearData={clearData} />
          </Box>

          {customer && (
            <>
              <Grid container spacing={3}>
                {customerFields.map(({ label, name, multiline }) => (
                  <Grid item xs={12} md={multiline ? 6 : 3} key={name}>
                    <TextField
                      fullWidth
                      size="small"
                      label={label}
                      value={customer[name] || ''}
                      InputProps={{ readOnly: true }}
                      multiline={multiline}
                      rows={multiline ? 2 : 1}
                      variant="outlined"
                    />
                  </Grid>
                ))}

                <ContactCustomers />

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
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
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="PO Number"
                    value={pnonumber}
                    onChange={(e) => dispatch(setCustomerPnonumber(e.target.value))}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;