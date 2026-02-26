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
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: '12px 16px !important' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 0 }}
          divider={
            <Box
              sx={{
                width: '1px',
                bgcolor: 'divider',
                mx: 2,
                display: { xs: 'none', sm: 'block' },
              }}
            />
          }
        >
          {sections.map(({ label, totalAmount, count, color, percentage }) => {
            const tooltipLabel = `${label}: ${formatCurrency(totalAmount)} — ${count} item${count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`;

            return (
              <Box
                key={label}
                flex={1}
                minWidth={90}
                sx={{ px: { sm: 1 } }}
              >
                <Typography variant="body2" fontWeight={700} noWrap>
                  {formatCurrency(totalAmount)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.75, mt: 0.25 }}
                >
                  {count} {label.toLowerCase()}
                </Typography>
                <Tooltip title={tooltipLabel} placement="top" arrow>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'action.hover',
                      overflow: 'hidden',
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%`,
                        bgcolor: color,
                        height: '100%',
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StyledSummaryBar;
