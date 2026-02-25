import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { formatCurrency } from '@/utils';

type Section = {
  totalAmount: number;
  count: number;
  label: string;
  percentage: number;
  color: string;
};

type Props = {
  sections: Section[];
};

const StyledSummaryBar: React.FC<Props> = ({ sections }) => {
  // const maxAmount = Math.max(...sections.map(s => s.totalAmount), 0);

  return (
    <Card elevation={1} sx={{ borderRadius: 2, px: 1, py: 1 }}>
      <CardContent sx={{ padding: '12px 16px' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          {sections.map(({ label, totalAmount, count, color,percentage }) => {
          

            const tooltipLabel =
              count === 0
                ? `${label}: ${formatCurrency(totalAmount)} (full bar because count is 0)`
                : `${label}: ${formatCurrency(
                    totalAmount
                  )} (${percentage.toFixed(1)}% of max)`;

            return (
              <Box
                key={label}
                textAlign="center"
                flex={1}
                minWidth={100}
                sx={{ wordBreak: 'break-word' }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {formatCurrency(totalAmount)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: 'block' }}
                >
                  {count} {label.toLowerCase()}
                </Typography>
                <Box
                  position="relative"
                  height={10}
                  borderRadius={5}
                  bgcolor="#e0e0e0"
                  overflow="hidden"
                  aria-label={`${label} bar`}
                >
                  <Tooltip title={tooltipLabel} placement="top" arrow>
                    <Box
                      component="div"
                      sx={{
                        width: `${percentage}%`,
                        bgcolor: color,
                        height: '100%',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StyledSummaryBar;
