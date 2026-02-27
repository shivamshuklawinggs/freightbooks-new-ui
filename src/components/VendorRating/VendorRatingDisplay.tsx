import { FC } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Divider,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { getRatingColor, getRatingLabel } from '@/utils';

interface VendorRatingDisplayProps {
  overallScore?: number; // 1-5 average score
}


 

const VendorRatingDisplay: FC<VendorRatingDisplayProps> = ({ overallScore }) => {
  if (!overallScore) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No rating available yet
        </Typography>
      </Paper>
    );
  }

  const ratingColor = getRatingColor(overallScore);
  const ratingLabel = getRatingLabel(overallScore);

  const percentage = (overallScore / 5) * 100;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mt: 2, 
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
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
          background: `linear-gradient(to right, ${ratingColor}, ${ratingColor}88)` 
        }} 
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Carrier Average Rating
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Based on all loads with this carrier
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: ratingColor, 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            {ratingLabel}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Rating visualization */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side - stars */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, mb: { xs: 2, sm: 0 } }}>
          <Rating
            value={overallScore}
            precision={0.1}
            readOnly
            size="large"
            icon={<Star fontSize="inherit" sx={{ fontSize: '2rem' }} />}
            emptyIcon={<Star fontSize="inherit" sx={{ fontSize: '2rem' }} />}
            sx={{
              '& .MuiRating-iconFilled': {
                color: ratingColor,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
              },
              '& .MuiRating-iconEmpty': {
                color: '#e0e0e0',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {percentage.toFixed(0)}% performance score
          </Typography>
        </Box>
        
        {/* Right side - score */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.8)', 
            borderRadius: 2,
            p: 2,
            minWidth: 100,
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              color: ratingColor,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1
            }}
          >
            {overallScore.toFixed(1)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
            out of 5.0
          </Typography>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Performance</Typography>
          <Typography variant="caption" fontWeight="bold" color={ratingColor}>
            {percentage.toFixed(0)}%
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', height: 8, bgcolor: 'action.disabledBackground', borderRadius: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${percentage}%`,
              bgcolor: ratingColor,
              borderRadius: 4,
              transition: 'width 0.5s ease',
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
              backgroundSize: '1rem 1rem',
              animation: 'progress-bar-stripes 1s linear infinite',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default VendorRatingDisplay;