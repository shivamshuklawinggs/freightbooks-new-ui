import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import apiService from '@/service/apiService';
import {
  Dialog, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Box, FormHelperText,
  InputAdornment,
  IconButton,
  OutlinedInput, Chip, Typography, Card, CardContent, useTheme, alpha, CircularProgress, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Phone, Lock, AdminPanelSettings, Business } from '@mui/icons-material';
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
import { getIcon } from '@/components/common/icons/getIcon';

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
  const theme = useTheme();
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header with close icon */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 3,
        py: 2.5,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            p: 1,
            borderRadius: 2,
            bgcolor: alpha('#fff', 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Person sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {user?._id ? 'Edit User' : 'Add New User'}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose}
          sx={{ 
            color: 'inherit',
            '&:hover': { 
              bgcolor: alpha('#fff', 0.1),
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          {getIcon('CloseIcon')}
        </IconButton>
      </Box>
      
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmitForm)} noValidate>
          <DialogContent sx={{ px: 3, py: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Person sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Basic Information
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Name"
                          fullWidth
                          required
                          placeholder="Enter user name"
                          {...register('name')}
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out'
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email"
                          type="email"
                          fullWidth
                          required
                          placeholder="Enter email address"
                          {...register('email')}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Phone"
                              placeholder="Enter phone number"
                              onChange={(e) => {
                                maxinputAllow(e as React.ChangeEvent<HTMLInputElement>, 10);
                                field.onChange(e);
                              }}
                              error={!!errors.phone}
                              helperText={errors.phone?.message}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="extentionNo"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Extension No"
                              placeholder="Enter extension number"
                              onKeyDown={preventStringInput}
                              error={!!errors.extentionNo}
                              helperText={errors.extentionNo?.message}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Security Section */}
              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Lock sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Security
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Password"
                          type={showPassword.password ? 'text' : 'password'}
                          fullWidth
                          autoComplete="new-password"
                          required={!user?._id}
                          placeholder={user?._id ? "Leave blank to keep current password" : "Enter password"}
                          {...register('password')}
                          InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('password')}
                                  edge="end"
                                  sx={{ color: 'action.active' }}
                                >
                                  {showPassword.password ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          error={!!errors.password}
                          helperText={errors.password?.message || (user?._id ? "Leave blank to keep current password" : "")}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Repeat Password"
                          type={showPassword.repeatPassword ? 'text' : 'password'}
                          fullWidth
                          placeholder={user?._id ? "Leave blank to keep current password" : "Confirm password"}
                          InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('repeatPassword')}
                                  edge="end"
                                  sx={{ color: 'action.active' }}
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
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Role & Permissions Section */}
              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AdminPanelSettings sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Role & Permissions
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.role}>
                          <InputLabel>Role *</InputLabel>
                          <Select
                            label="Role *"
                            required
                            defaultValue={user?.role || ''}
                            {...register('role')}
                            style={{ textTransform: "capitalize" }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
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
                      </Grid>
                      
                      {/* Manager if role is dispatcher */}
                      {watch('role') === 'dispatcher' && (
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth error={!!errors.manager}>
                            <InputLabel>Manager *</InputLabel>
                            <Select
                              label="Manager *"
                              required
                              {...register('manager')}
                              value={watch('manager')}
                              style={{ textTransform: "capitalize" }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
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
                        </Grid>
                      )}
                      
                      {/* Visible Companies */}
                      {(VisibleCompanyAssignedRoles.includes(watch('role') as Role) && companies?.length > 0) && (
                        <Grid item xs={12}>
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
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
                        </Grid>
                      )}
                      
                      {/* No Companies Available */}
                      {(VisibleCompanyAssignedRoles.includes(watch('role') as Role) && companies?.length === 0) && (
                        <Grid item xs={12}>
                          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                            <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                              No companies available. Please Create One First.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              color="primary" 
                              onClick={() => { navigate(paths.viewcompany); handleClose(); }}
                              startIcon={<Business />}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              Create Company
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Menu Permissions Section */}
              {[Role.DISPATCHER, Role.MANAGER, Role.ACCOUNTANT].includes(watch('role') as Role) && (
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AdminPanelSettings sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Menu Permissions
                        </Typography>
                      </Box>
                      <MenuPermissionsTable />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          {/* Actions */}
          <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  onClick={handleClose} 
                  color="inherit" 
                  disabled={mutation.isPending}
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: alpha(theme.palette.text.primary, 0.5),
                      bgcolor: alpha(theme.palette.action.hover, 0.04)
                    }
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={mutation.isPending}
                  fullWidth
                  startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {mutation.isPending ? 'Saving...' : user?._id ? 'Update' : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
};


export default UserForm;