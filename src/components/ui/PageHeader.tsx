import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={2.5}
      flexWrap="wrap"
      gap={1}
    >
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          {actions}
        </Stack>
      )}
    </Box>
  );
};

export default PageHeader;
