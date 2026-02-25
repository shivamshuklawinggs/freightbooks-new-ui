import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,

} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

import { ICustomer, IAccountsCustomerView } from '@/types';
import { maxinputAllow } from '@/utils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchAllAccountsCustomers } from '@/redux/api';
const CompanySection = () => {
  const form = useFormContext<ICustomer>();
  const dispatch = useDispatch<AppDispatch>()
  const [customers, setCustomers] = useState<IAccountsCustomerView[]>([])

  const getAllCustomers = async () => {
    try {
      const response = await dispatch(fetchAllAccountsCustomers({ check: true })).unwrap()
      if(response) {
        setCustomers(response)
      }
    } catch (error) {
      setCustomers([])
    }
  }
  useEffect(() => {
    getAllCustomers()
  }, [])
  return (
    <Grid container spacing={2}>
      {/* Company  */}
      <Grid item xs={12} md={2}>
        {/* select form mr mrs and others */}
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Select
              {...field}
              fullWidth
              label="Title"
              error={!!form.formState.errors.title}
              size='small'
              disabled={form.formState.isSubmitting}
              inputProps={{
                shrink: true,
              }}
            >
              <MenuItem value="mr">Mr</MenuItem>
              <MenuItem value="mrs">Mrs</MenuItem>
              <MenuItem value="ms">Ms</MenuItem>
              <MenuItem value="dr">Dr</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          )}
        />

      </Grid>

      <Grid item xs={12} md={2}>
        <Controller
          name="firstName"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="First Name"
              error={!!form.formState.errors.firstName}
              size='small'
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="middleName"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Middle Name"
              error={!!form.formState.errors.middleName}
              helperText={form.formState.errors.middleName?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* email */}
      <Grid item xs={12} md={4}>
        <Controller
          name="lastName"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Last Name"
              error={!!form.formState.errors.lastName}
              helperText={form.formState.errors.lastName?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* company */}
      <Grid item xs={12} md={6}>
        <Controller
          name="company"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Company"
              error={!!form.formState.errors.company}
              helperText={form.formState.errors.company?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* display customer name */}
      <Grid item xs={12} md={6}>
        <Controller
          name="displayCustomerName"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Display Customer Name"
              error={!!form.formState.errors.displayCustomerName}
              helperText={form.formState.errors.displayCustomerName?.message}
              size='small'
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Email"
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* phone number */}
      <Grid item xs={12} md={6}>
        <Controller
          name="phone"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone"
              onChange={(e) => {
                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                field.onChange(e);
              }}
              error={!!form.formState.errors.phone}
              helperText={form.formState.errors.phone?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* mobile no */}
      <Grid item xs={12} md={6}>
        <Controller
          name="mobileNo"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Mobile No"
              onChange={(e) => {
                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                field.onChange(e);
              }}
              error={!!form.formState.errors.mobileNo}
              helperText={form.formState.errors.mobileNo?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* fax */}
      <Grid item xs={12} md={6}>
        <Controller
          name="fax"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Fax"
              error={!!form.formState.errors.fax}
              helperText={form.formState.errors.fax?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* other */}
      <Grid item xs={12} md={6}>
        <Controller
          name="other"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Other"
              error={!!form.formState.errors.other}
              helperText={form.formState.errors.other?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* web site */}
      <Grid item xs={12} md={6}>
        <Controller
          name="website"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Website"
              error={!!form.formState.errors.website}
              helperText={form.formState.errors.website?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* name to print on check */}
      <Grid item xs={12} md={6}>
        <Controller
          name="nameToPrintOnCheck"
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Name To Print On Check"
              error={!!form.formState.errors.nameToPrintOnCheck}
              helperText={form.formState.errors.nameToPrintOnCheck?.message}
              size='small'
            />
          )}
        />
      </Grid>
      {/* is a Sub Customer */}
      <Grid item xs={12} md={6}>
        <FormControlLabel control={<Controller
          name="isSubCustomer"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value}
              onChange={(e) => {
                form.setValue('isSubCustomer', e.target.checked);
              }}
            />
          )}
        />}
          label="Is Sub Customer"
        />

      </Grid>
      {/* parent customer */}
      {
        form.watch('isSubCustomer') && (
          <Grid item xs={12} md={12}>
            <FormControl fullWidth >
              <InputLabel id="parentCustomer">Parent Customer</InputLabel>
            <Controller
              name="parentCustomer"
              control={form.control}
              render={({ field }) => (
                <Select
                labelId="parentCustomer"
                  {...field}
                  fullWidth
                  label="Parent Customer"
                  error={!!form.formState.errors.parentCustomer}
                  size='small'
                  disabled={form.formState.isSubmitting}
               
                  inputProps={{
                    shrink: true,
                  }}
                >
                  <MenuItem value="">Select Parent Customer</MenuItem>
                  {
                   customers.filter((customer: IAccountsCustomerView) => customer._id !== form.watch('_id')).map((customer: IAccountsCustomerView) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.firstName} {customer.lastName}
                    </MenuItem>
                  ))
                  }

                </Select>
              )}
            />
            </FormControl>
          </Grid>
        )}

    </Grid>
  )
}

export default CompanySection