import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { Box, Button, Container, TextField, Typography, Checkbox, FormControlLabel, IconButton, InputAdornment , } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { defaultLoginValues, loginSchema } from '@/pages/auth-service/Schema/loginSchema';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginFailure, loginStart, loginSuccess } from '@/redux/Slice/UserSlice';
import apiService from '@/service/apiService';
import { paths } from '@/utils/paths';
import { Link } from 'react-router-dom';
import { RootState } from '@/redux/store';
import { useQueryClient } from '@tanstack/react-query';
import { initialCompanyData } from '@/redux/InitialData/initialCompanyData';
import { Role } from '@/types';
const Login = () => {
  const q=useQueryClient()
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading,error } = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });
  const onSubmit = async (data: any) => {

   const nextPath=searchParams.get("next")

    try {
      dispatch(loginStart());
      const response = await apiService.login(data);
  
      dispatch(loginSuccess({
        user:response.data,
        isAuthenticated:true,
        loading:false,
        error:null,
        initialized:true,
        currentCompanyDetails:initialCompanyData,
      }));
      navigate(nextPath ?nextPath:response?.data?.role==Role.SUPERADMIN? paths.superadminDashboard : paths.dashboard);
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }finally{
      q.invalidateQueries({
        queryKey: ['fetchUser'],
      })
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        backgroundImage: `url('/banners/freight-login-bg.jpg')`, // Use the correct path to your background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          clipPath: 'polygon(0 0, 55% 0, 65% 100%, 0% 100%)'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '50%', position: 'relative', zIndex: 2, pl: 4 ,textAlign:"center"}}>
          <Box sx={{ mb: 2 }}>
            <Box 
              component="img"
              src={"/logo.png"} // Use the correct path to your logo image
              alt="Freight Books Logo"
              sx={{ 
                width: 'auto',
                height: '80px',
                mb: 1
              }}
            />
          </Box>
          {/* <Typography 
            variant="h3" 
            sx={{ 
              color: "#000",
              fontWeight: 600,
              mb: 1,
              fontSize: '2.25rem',
              lineHeight: 1.2
            }}
          >
            Welcome back to
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              color: "#000",
              fontWeight: 600,
              mb: 1,
              fontSize: '2.25rem',
              lineHeight: 1.2
            }}
          >
            freight books     
            
          </Typography> */}
          <Typography 
            variant="h3" 
            sx={{ 
              color: "#000",
              fontWeight: 600,
              fontSize: '2.25rem',
              lineHeight: 1.2
            }}
          >
           Where Freight Meets Technology    
            
          </Typography>
      </Box>
        <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            bgcolor: 'white',
            borderRadius: 2,
            p: 4,
          }}>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Enter your email and password to access your account
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                placeholder="Email Address *"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
              <TextField

                fullWidth
               type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 2 }}
                  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword((prev) => !prev)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
              />
              {error && <Box sx={{color:"red"}}>{error}</Box>}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ 
                        color: '#DF5727',
                        '&.Mui-checked': {
                          color: '#DF5727',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                />
                <Link 
                  to={paths.forgetpassword}
                  style={{ 
                    color: '#DF5727',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  bgcolor: '#DF5727',
                  '&:hover': {
                    bgcolor: '#c94d22'
                  },
                  mb: 3
                }}
              >
                Access Securely
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                {['Terms', 'Privacy', 'Support'].map((item) => (
                  <Link
                    key={item}
                    to="#"
                    style={{ 
                      color: '#666',
                      textDecoration: 'none',
                      fontSize: '0.75rem'
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </form>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
