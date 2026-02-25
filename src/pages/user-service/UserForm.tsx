import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import apiService from '@/service/apiService';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Box, FormHelperText,
  InputAdornment,
  IconButton,
  OutlinedInput, Chip, Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import getAssignableRoles from '@/utils/getAvailableRoles';
import {  Userschema, defaulUsertValues } from './Schema/userSchema';
import { ICompany, IUser, Role, VisibleCompanyAssignedRoles } from '@/types';
import { toast } from 'react-toastify';
import { paths } from '@/utils/paths';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { isRole, maxinputAllow, preventStringInput } from '@/utils';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchAllCompanies } from '@/redux/api';
import MenuPermissionsTable from './MenuPermissionsTable';

type CompanyQueryKey = ['companies', string | undefined];


interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  user?: IUser | null
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user
}) => {
  const qc=useQueryClient()
  const { user: currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState({
    password: false,
    repeatPassword: false
  });

  const methods = useForm<IUser>({
     mode: "onSubmit",         // validate on submit
  reValidateMode: "onChange", // optional
  shouldFocusError: true,    // <--- automatically focus first field with error
    resolver: yupResolver(Userschema) as Resolver<IUser>,
    defaultValues: defaulUsertValues
  });
const {register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control}=methods
  const mutation = useMutation({
    mutationFn: (data: IUser) => {
      if (user?._id) {
        return apiService.updateUser(user._id, data);
      }
      return apiService.createUser(data);
    },
    onSuccess: () => {
      toast.info(user?._id ? 'User updated successfully' : 'User created successfully');
      qc.invalidateQueries({ queryKey: ['users'] });
      onSubmit();
      reset();
      navigate(paths.users);
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    },
  });

  const { data: users = [] } = useQuery<IUser[]>({
    queryKey: ['users', Role.MANAGER],
    queryFn: async () => {
      const response = await apiService.getUsers({ page: 1, limit: 100, role: Role.MANAGER });
      return response.data;
    }
  });
 

  const togglePasswordVisibility = (field: 'password' | 'repeatPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const availableRoles = getAssignableRoles();

  const onSubmitForm = async (data: IUser) => {
    if (isRole.isSuperAdmin(currentUser?.role || '')) {
      data.role = Role.ADMIN
    }
    mutation.mutate(data);
  };

  useEffect(() => {
    if (open) {
      const initialValues = user ? { ...defaulUsertValues, ...user, isUpdate: true } : { ...defaulUsertValues, isUpdate: false };
      reset(initialValues);
    }
  }, [user, open, reset]);

  useEffect(() => {
    if (!isRole.isDispatcher(watch('role') || '')) {
      setValue('manager', null);
    }
    if(currentUser?.role===Role.SUPERADMIN){
      setValue("role",Role.ADMIN)
    }
  }, [watch('role')]);

  // Fetch companies using React Query
  const { data: companies = [] } = useQuery<ICompany[], Error, ICompany[], CompanyQueryKey>({
    queryKey: ['companies', user?._id],
    queryFn: async () => {
      const response = await dispatch(fetchAllCompanies({ check: true })).unwrap();
      return response;
    },
    enabled: !!currentUser && currentUser.role !== Role.SUPERADMIN,
  });

  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user?._id ? 'Edit User' : 'Add New User'}</DialogTitle>
      <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              fullWidth
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone"
                  onChange={(e) => {
                    maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                    field.onChange(e);
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  size='small'
                />
              )}
            />
            <Controller
              name="extentionNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Extention No"
                  onKeyDown={preventStringInput}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  size='small'
                />
              )}
            />
            <TextField
              label="Password"
              type={showPassword.password ? 'text' : 'password'}
              fullWidth
              autoComplete="new-password"
              required={!user?._id}
              {...register('password')}
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('password')}
                      edge="end"
                    >
                      {showPassword.password ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={!!errors.password}
              helperText={errors.password?.message || (user?._id ? "Leave blank to keep current password" : "")}
            />

            <TextField
              label="Repeat Password"
              type={showPassword.repeatPassword ? 'text' : 'password'}
              fullWidth
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('repeatPassword')}
                      edge="end"
                    >
                      {showPassword.repeatPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              required={!user?._id}
              {...register('repeatPassword')}
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message || (user?._id ? "Leave blank to keep current password" : "")}
            />
                <>
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      label="Role *"
                      required
                      defaultValue={user?.role || ''}
                      {...register('role')}
                      style={{ textTransform: "capitalize" }}
                    >
                      {availableRoles.map((role) => (
                        <MenuItem
                          key={role}
                          value={role}
                          style={{ textTransform: "capitalize" }}
                        >
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                  </FormControl>
                  {/* manager if role is dispatcher */}
                  {watch('role') === 'dispatcher' && (
                    <FormControl fullWidth error={!!errors.manager}>
                      <InputLabel>Manager *</InputLabel>
                      <Select
                        label="Manager *"
                        required
                        {...register('manager')}
                        value={watch('manager')}
                        style={{ textTransform: "capitalize" }}
                      >
                        {users.map((user) => (
                          <MenuItem
                            key={user._id}
                            value={user._id}
                            style={{ textTransform: "capitalize" }}
                          >
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.manager && <FormHelperText>{errors.manager.message}</FormHelperText>}
                    </FormControl>
                  )}
                  {(VisibleCompanyAssignedRoles.includes(watch('role') as Role) && companies?.length > 0) && (
                    <FormControl fullWidth error={!!errors.visibleCompany}>
                      <InputLabel>Visible Companies *</InputLabel>
                      <Select
                        multiple
                        value={watch('visibleCompany') || []}
                        onChange={(e) => setValue('visibleCompany', e.target.value as string[])}
                        input={<OutlinedInput label="Visible Companies *" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const company = companies?.find(c => c._id === value);
                              return <Chip key={value} label={company?.label || value} />;
                            })}
                          </Box>
                        )}
                      >
                        {companies?.map((company) => (
                          <MenuItem key={company._id} value={company._id}>
                            {company.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.visibleCompany && (
                        <FormHelperText>{errors.visibleCompany.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                  {(VisibleCompanyAssignedRoles.includes(watch('role') as Role) && companies?.length === 0) && (
                    <>
                      <Typography variant="body2" color="error">
                        No companies available. Please Create One First.
                        {/* link to create company */}
                        <Button color="primary" onClick={() => { navigate(paths.viewcompany); handleClose(); }}>
                          Create Company
                        </Button>
                      </Typography>
                    </>
                  )}
                </>
              
            
            {/* Menu Permissions Section */}
           {([Role.DISPATCHER, Role.MANAGER, Role.ACCOUNTANT].includes(watch('role') as Role)) && (
  <MenuPermissionsTable
  />
)}

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : user?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
      </FormProvider>
    </Dialog>
  );
};


export default UserForm;