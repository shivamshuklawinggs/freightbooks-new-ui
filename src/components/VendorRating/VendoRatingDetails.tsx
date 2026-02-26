import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Rating, 
  CircularProgress, 
  Card, 
  CardContent,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import { Behavior, Communication ,Payment ,BusinessStability ,ReportScore} from '@/components/common/icons/RatingIcons';
import { useParams } from 'react-router-dom';
import apiService from '@/service/apiService';
import { ICarrier } from '@/types';
import { getRatingColor, getRatingLabel } from '@/utils';

// Rating category type
interface RatingCategory {
  name: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  color: string;
}


const VendoRatingDetails: React.FC = () => {
  const { carrierId } = useParams<{ carrierId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [carrier, setCarrier] = useState<ICarrier | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchCarrierDetails = async () => {
      if (!carrierId) return;
      
      try {
        setLoading(true);
        const response = await apiService.getVendoRatingDetails(carrierId);
        
        if (response.success && response.data) {
          setCarrier(response.data);
        }
      } catch (error) {
        console.error('Error fetching carrier details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrierDetails();
  }, [carrierId]);

  

  // Format rating categories with icons and colors
  const getRatingCategories = (): RatingCategory[] => {
    if (!carrier?.rating) return [];
    
    return [
      {
        name: 'communication',
        label: 'Communication',
        icon: <Communication />,
        value: carrier?.rating.communication || 0,
        color: getRatingColor(carrier?.rating.communication || 0)
      },
      {
        name: 'Behavior',
        label: 'Behavior',
        icon: <Behavior />,
        value: carrier?.rating.Behavior || 0,
        color: getRatingColor(carrier?.rating.Behavior || 0)
      },
      {
        name: 'Performance',
        label: 'Performance',
        icon: <Payment />,
        value: carrier?.rating.Performance || 0,
        color: getRatingColor(carrier?.rating.Performance || 0)
      },
      {
        name: 'BusinessStability',
        label: 'Business Stability',
        icon: <BusinessStability />,
        value: carrier?.rating.BusinessStability || 0,
        color: getRatingColor(carrier?.rating.BusinessStability || 0)
      },
      {
        name: 'reportScore',
        label: 'Report Score',
        icon: <ReportScore />,
        value: carrier?.rating.reportScore || 0,
        color: getRatingColor(carrier?.rating.reportScore || 0)
      },
    ];
  };

  // Calculate percentage for progress bars
  const getPercentage = (value: number): number => {
    return (value / 5) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }


  const ratingCategories = getRatingCategories();
  const overallScore = carrier?.rating?.overallScore || 0;
  const overallColor = getRatingColor(overallScore);
  const overallLabel = getRatingLabel(overallScore);

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
    
      {/* Carrier Info Card */}
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
                {carrier?.company?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {carrier?.company}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    label={carrier?.status ? 'Active' : 'Inactive'} 
                    color={carrier?.status==="active" ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ID: {carrier?.id}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">MC Number</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.mcNumber || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">USDOT</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.usdot || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Rate</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.rate || 0}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Drivers</Typography>
                <Typography variant="body1" fontWeight={500}>{carrier?.totalDriver || 0}</Typography>
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
    </Box>
  );
};

export default VendoRatingDetails;
