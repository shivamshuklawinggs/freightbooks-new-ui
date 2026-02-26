import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Toolbar, Breadcrumbs, Link, Chip } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import AppHeader from './Header';
import SideDrawer from './Sidebar/Index';
import { RootState } from '@/redux/store';
import { protectedRoutes,Route } from '@/routes';

// Helper function to find route by path
// Returns an array of matched routes (from root -> leaf)
const findRouteChain = (routes: Route[], path: string): Route[] | null => {
  for (const route of routes) {

    // Direct match
    if (route.path === path) {
      return [route];
    }

    // Dynamic match
    if (route.path.includes(':')) {

      const routePathPattern = route.path.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${routePathPattern}$`);
      if (regex.test(path)) {
        return [route];
      }
    }

    // Children recursion
    if (route.children) {
      const childChain = findRouteChain(route.children, path);
      if (childChain) {
        return [route, ...childChain];
      }
    }
  }

  return null;
};


const Layout: React.FC = () => {
  const isSidebarExpanded = useSelector((state: RootState) => state.sidebar.isOpen);
  const drawerWidth = isSidebarExpanded ? 190 : 73;
  const location = useLocation();
  const navigate = useNavigate();

  // get full breadcrumb chain
  const routeChain = findRouteChain(protectedRoutes, location.pathname) || [];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <AppHeader drawerWidth={drawerWidth} />
      <SideDrawer drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          pt: 2,
          pb: 4,
          bgcolor: 'background.default',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: theme =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        {/* Breadcrumb Bar */}
        <Box
          sx={{
            mb: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
            aria-label="breadcrumb"
          >
            <Link
              color="inherit"
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                textDecoration: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: '0.8rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              <HomeIcon sx={{ fontSize: 14 }} />
              Home
            </Link>
            {routeChain.map((route, idx) =>
              idx < routeChain.length - 1 ? (
                <Link
                  key={idx}
                  onClick={() => navigate(route.path || '/')}
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {route.title}
                </Link>
              ) : (
                <Chip
                  key={idx}
                  label={route.title}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )
            )}
          </Breadcrumbs>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
};


export default Layout;
