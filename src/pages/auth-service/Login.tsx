import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, IconButton, InputAdornment, Alert, Paper, alpha } from '@mui/material';
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
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);

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
        backgroundImage: `url('/banners/freight-login-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        bgcolor: 'background.default',
      }}
    >
      {/* Left side overlay */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '55%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.92)} 0%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 460 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="FreightBooks"
            sx={{ height: 64, mb: 4, filter: 'brightness(0) invert(1)' }}
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: { md: '2rem', lg: '2.5rem' },
              lineHeight: 1.3,
              mb: 2,
            }}
          >
            Where Freight Meets Technology
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            Streamline your freight operations with our comprehensive management platform.
          </Typography>
        </Box>
      </Box>

      {/* Right side — login form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>F</Typography>
            </Box>
          </Box>

          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.75 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your credentials to access your account
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="you@company.com"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2, py: 0.5, borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">Remember me</Typography>
                }
                sx={{ m: 0 }}
              />
              <Link
                to={paths.forgetpassword}
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
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
              size="large"
              sx={{ py: 1.25, mb: 3, borderRadius: 2 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              {['Terms', 'Privacy', 'Support'].map((item) => (
                <Link
                  key={item}
                  to="#"
                  style={{
                    color: theme.palette.text.secondary,
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
