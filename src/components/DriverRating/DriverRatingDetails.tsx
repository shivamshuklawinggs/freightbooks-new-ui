import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Rating, 
  Card, 
  CardContent,
  Avatar,
  Chip,
  useTheme,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Behavior, Communication  ,ReportScore} from '@/components/common/icons/RatingIcons';
import apiService from '@/service/apiService';
import { IDriver, ICarrier } from '@/types';
import { getRatingColor, getRatingLabel } from '@/utils';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';

// Rating category type
interface RatingCategory {
  name: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  color: string;
}


interface IDriverWithCarrier extends IDriver {
  carrierId?: string;
}

const DriverRatingDetails: React.FC = () => {
  const [loadingDrivers, setLoading] = useState<boolean>(true);
  const [Driver, setDriver] = useState<IDriverWithCarrier | null>(null);
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    const fetchDriverDetails = async () => {
      if (!selectedDriverId) return;
      
      try {
        setLoading(true);
        const response = await apiService.getDriver(selectedDriverId);
        
        if (response.success && response.data) {
          const driverData = response.data as IDriverWithCarrier;
          setDriver(driverData);
          if (driverData.carrierId) {
            setSelectedCarrierId(driverData.carrierId);
          }
          if (driverData._id) {
            setSelectedDriverId(driverData._id);
          }
        }
      } catch (error) {
        console.error('Error fetching Driver details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
  }, [selectedDriverId]);

  // Fetch carriers list once
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await apiService.getCarriers({ page: 1, limit: 100, search: '' });
        if (response.success && response.data) {
          setCarriers(response.data as ICarrier[]);
        }
      } catch (error) {
        console.error('Error fetching carriers:', error);
      }
    };

    fetchCarriers();
  }, []);

  // Fetch drivers when carrier changes
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!selectedCarrierId) return;

      try {
        const response = await apiService.getDrivers({ page: 1, limit: 100, search: '', carrierId: selectedCarrierId });
        if (response.success && response.data) {
          setDrivers(response.data as IDriver[]);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, [selectedCarrierId]);

  const handleCarrierChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const carrierId = event.target.value as string;
    setSelectedCarrierId(carrierId);
    setSelectedDriverId('');
    setDrivers([]);
    setDriver(null)
  };

  const handleDriverChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const driverId = event.target.value as string;
    setSelectedDriverId(driverId);
    try {
      setLoading(true);
      const response = await apiService.getDriver(driverId);
      if (response.success && response.data) {
        const driverData = response.data as IDriverWithCarrier;
        setDriver(driverData);
      }
    } catch (error) {
      console.error('Error fetching Driver details:', error);
    } finally {
      setLoading(false);
    }
  };

  

  // Format rating categories with icons and colors
  const getRatingCategories = (): RatingCategory[] => {
    if (!Driver) return [];

    const pickupRating = Driver.pickupStats?.timelyPickupRating || 0;
    const deliveryRating = Driver.deliveryStats?.timelyDeliveryRating || 0;
    const reportScore = (Driver as any).reportScore || 0;

    return [
      {
        name: 'pickupPerformance',
        label: 'Pickup Performance',
        icon: <Communication />,
        value: pickupRating,
        color: getRatingColor(pickupRating)
      },
      {
        name: 'deliveryPerformance',
        label: 'Delivery Performance',
        icon: <Behavior />,
        value: deliveryRating,
        color: getRatingColor(deliveryRating)
      },
      {
        name: 'reportScore',
        label: 'Report Score',
        icon: <ReportScore />,
        value: reportScore,
        color: getRatingColor(reportScore)
      },
   
    ];
  };

  // Calculate percentage for progress bars
  const getPercentage = (value: number): number => {
    return (value / 5) * 100;
  };

  const ratingCategories = getRatingCategories();
  const overallScore = Driver?.overallStats?.rating || 0;
  const overallColor = getRatingColor(overallScore);
  const overallLabel =  getRatingLabel(overallScore);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="carrier-select-label">Carrier</InputLabel>
              <Select
                labelId="carrier-select-label"
                value={selectedCarrierId}
                label="Carrier"
                onChange={handleCarrierChange as any}
              >
                <MenuItem value="">
                  <em>Select Carrier</em>
                </MenuItem>
                {carriers.map((carrier) => (
                  <MenuItem key={carrier._id} value={carrier._id || ''}>
                    {carrier.company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={!selectedCarrierId}>
              <InputLabel id="driver-select-label">Driver</InputLabel>
              <Select
                labelId="driver-select-label"
                value={selectedDriverId}
                label="Driver"
                onChange={handleDriverChange as any}
              >
                <MenuItem value="">
                  <em>Select Driver</em>
                </MenuItem>
                {loadingDrivers ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Loading Drivers...
                  </MenuItem>
                ) : (
                  drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id || ''}>
                      {driver.driverName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
       {
        Driver && <>
          {/* Driver Info Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f9fafb)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative accent */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '4px', 
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})` 
          }} 
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: theme.palette.primary.main,
                  mr: 2
                }}
              >
                {Driver?.driverName?.charAt(0) || 'D'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {Driver?.driverName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    label={Driver?.isActive ? 'Active' : 'Inactive'} 
                    color={Driver?.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ID: {Driver?._id}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.driverPhone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">CDL Number</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.driverCDL || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">CDL Expiration</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {Driver?.driverCDLExpiration ? new Date(Driver.driverCDLExpiration).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Divider sx={{mb:10}}/>
              <Grid item xs={12} sm={3} >
                <Typography variant="body2" color="text.secondary">Total Pickups</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.pickupStats?.totalPickups ?? 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Delivery</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.deliveryStats?.totalDeliveries ?? 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">On Time %</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.overallStats?.onTimePercentage ?? 0}%</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Late %</Typography>
                <Typography variant="body1" fontWeight={500}>{Driver?.overallStats?.latePercentage ?? 0}%</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '4px', 
                  bgcolor: overallColor 
                }} 
              />
              <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Overall Rating
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Rating 
                    value={overallScore} 
                    precision={0.1} 
                    readOnly 
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: overallColor,
                      }
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: overallColor,
                    mb: 1
                  }}
                >
                  {overallScore.toFixed(1)}
                </Typography>
                
                <Chip 
                  label={overallLabel} 
                  sx={{ 
                    bgcolor: overallColor, 
                    color: 'white',
                    fontWeight: 'bold',
                    px: 1
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Rating Details */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f9fafb)',
        }}
      >
      
        <Grid container spacing={3}>
          {ratingCategories.map((category) => (
            <Grid item xs={12} md={4} key={category.name}>
              <Card 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid #f0f0f0',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: category.color,
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    {category.icon}
                  </Avatar>
                  <Typography variant="h6">{category.label}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={category.value} 
                    readOnly 
                    precision={0.1}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: category.color,
                      }
                    }}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      ml: 2, 
                      fontWeight: 'bold',
                      color: category.color
                    }}
                  >
                    {category.value.toFixed(1)}
                  </Typography>
                </Box>

                {/* Progress bar */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Performance</Typography>
                    <Typography variant="caption" fontWeight="bold" color={category.color}>
                      {getPercentage(category.value).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${getPercentage(category.value)}%`,
                        bgcolor: category.color,
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
        </>
       }
     
    </Box>
  );
};

export default withPermission("view",["carriers"],)(DriverRatingDetails)
