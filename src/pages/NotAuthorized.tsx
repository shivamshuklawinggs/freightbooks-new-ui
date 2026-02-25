import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Chip } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

import { paths } from '@/utils/paths';
import { Role } from '@/types';
import { useAppSelector } from '@/redux/store';

const NotAuthorized: FC = () => {
  const role = useAppSelector((state) => state.user?.user?.role);  

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" color="error" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary"  sx={{ mb: 3 }}>
          Sorry, you don't have permission to access this page.
        </Typography>
        {role && (
          <Chip
            label={`Current Role: ${role}`}
            color="default"
            sx={{ mb: 4 }}
          />
        )}
        <Button
          component={Link}
          to={role===Role.SUPERADMIN ?paths.superadminDashboard :!role?paths.login: paths.dashboard}
          variant="contained"
          color="primary"
          size="large"
        >
         {
          !role ?"Login":"Dashboard"
         }
        </Button>
      </Box>
    </Container>
  );
};

export default NotAuthorized;