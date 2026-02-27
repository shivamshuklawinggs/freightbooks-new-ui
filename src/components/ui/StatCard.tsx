import React from 'react';
import { Box, Card, CardContent, Typography, alpha } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; label?: string };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, color = '#00C48C', trend }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 140,
        borderRadius: 2,
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: '14px 16px !important' }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: alpha(color, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                flexShrink: 0,
                '& svg': { fontSize: 18 },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h5" fontWeight={700} lineHeight={1.2} color="text.primary">
          {value}
        </Typography>
        {subValue && (
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            {subValue}
          </Typography>
        )}
        {trend !== undefined && (
          <Box display="flex" alignItems="center" mt={0.75} gap={0.5}>
            <Box
              sx={{
                height: 4,
                borderRadius: 2,
                flex: 1,
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(Math.abs(trend.value), 100)}%`,
                  height: '100%',
                  bgcolor: color,
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
            {trend.label && (
              <Typography variant="caption" color="text.secondary">
                {trend.label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
