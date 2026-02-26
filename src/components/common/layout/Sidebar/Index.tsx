import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  Collapse,
  Typography,
  Tooltip,
  Box,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { protectedRoutes } from "@/routes";
import { toggleSidebar } from "@/redux/Slice/sidebarSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { UserLogout } from "@/redux/api";
import { getIcon, iconType } from "@/components/common/icons/getIcon";
import { SidebarMenuItem, SideDrawerProps } from "@/types";
import { hasAccess } from "@/hooks/ProtectedRoute/authUtils";

const SideDrawer: React.FC<SideDrawerProps> = ({ drawerWidth }) => {
  const isExpanded = useSelector((state: RootState) => state.sidebar.isOpen);
  const user = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  // Use dynamic routes if available, otherwise fallback to static routes
  const menuRoutes = protectedRoutes;
  

  // On location change, auto-open any parent menus whose children match the current path
  React.useEffect(() => {
    const expanded: Record<string, boolean> = {};

    const stripParams = (path: string) => path.split(":")[0].replace(/\/$/, "");

    const expandMatchingSubMenus = (items: SidebarMenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const hasMatch = item.children.some((child) => {
            if (!child.path) return false;
            const base = stripParams(child.path);
            return location.pathname.startsWith(base);
          });
          if (hasMatch) {
            expanded[item.title] = true;
          }
          // Recurse into deeper levels if nested
          expandMatchingSubMenus(item.children);
        }
      });
    };

    expandMatchingSubMenus(menuRoutes as SidebarMenuItem[]);
    setOpenSubMenus((prev) => ({ ...prev, ...expanded }));
  }, [location.pathname, menuRoutes]);

  const handleSubMenuToggle = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const stripParams = (path: string) => path.split(":")[0].replace(/\/$/, "");
  const normalizePath = (p: string) => stripParams(p);

  const renderMenuItems = (items: SidebarMenuItem[], level = 0) => {
    return items
      .filter((route) => !route.hideInMenu && hasAccess(route.resource, "view", user))
      .map((item, index) => {
        const icon = getIcon(item.icon as iconType);
        const basePath = item.path ? normalizePath(item.path) : "";
        const isActive = basePath && location.pathname.startsWith(basePath);
        const hasChildren = item.children && item.children.length > 0;
        const isSubMenuOpen = openSubMenus[item.title] || false;

        if (hasChildren) {
          return (
            <React.Fragment key={`${level}-${index}`}>
              <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
                <Tooltip title={!isExpanded ? item.title : ""} placement="right">
                  <ListItemButton
                    onClick={() => handleSubMenuToggle(item.title)}
                    sx={{
                      borderRadius: 1.5,
                      pl: isExpanded ? level * 1.5 + 1.5 : 1,
                      justifyContent: isExpanded ? 'flex-start' : 'center',
                      bgcolor: isActive ? alpha('#fff', 0.2) : 'transparent',
                      '&:hover': { bgcolor: alpha('#fff', 0.12) },
                      minHeight: 40,
                    }}
                  >
                    {icon && (
                      <ListItemIcon sx={{ color: 'rgba(255,255,255,0.9)', minWidth: isExpanded ? 36 : 'unset', justifyContent: 'center', '& svg': { fontSize: 20 } }}>
                        {icon}
                      </ListItemIcon>
                    )}
                    {isExpanded && (
                      <>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: 'rgba(255,255,255,0.95)' }}
                        />
                        {isSubMenuOpen
                          ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }} />
                          : <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }} />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              <Collapse in={isExpanded && isSubMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children && renderMenuItems(item.children, level + 1)}
                </List>
              </Collapse>
            </React.Fragment>
          );
        }

        const targetPath = item.path ? normalizePath(item.path) : "#";

        return (
          <ListItem disablePadding key={`${level}-${index}`} sx={{ px: 1, mb: 0.25 }}>
            <Tooltip title={!isExpanded ? item.title : ""} placement="right">
              <ListItemButton
                component={Link}
                to={targetPath}
                sx={{
                  borderRadius: 1.5,
                  pl: isExpanded ? level * 1.5 + 1.5 : 1,
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  bgcolor: isActive ? alpha('#fff', 0.18) : 'transparent',
                  position: 'relative',
                  minHeight: 40,
                  '&:hover': { bgcolor: alpha('#fff', 0.12) },
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: 3,
                    borderRadius: '0 3px 3px 0',
                    bgcolor: 'rgba(255,255,255,0.9)',
                  } : {},
                }}
              >
                {icon && (
                  <ListItemIcon sx={{ color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.75)', minWidth: isExpanded ? 36 : 'unset', justifyContent: 'center', '& svg': { fontSize: 20 } }}>
                    {icon}
                  </ListItemIcon>
                )}
                {isExpanded && (
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)' }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: 'primary.main',
          backgroundImage: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      open={isExpanded}
    >
      {/* Logo / Brand Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          px: 1.5,
          minHeight: { xs: 56, sm: 64 },
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {isExpanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', lineHeight: 1 }}>F</Typography>
            </Box>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ color: 'white', fontWeight: 700, letterSpacing: '0.02em', fontSize: '0.95rem' }}
            >
              FreightBooks
            </Typography>
          </Box>
        )}
        <Tooltip title={isExpanded ? 'Collapse' : 'Expand'} placement="right">
          <IconButton
            onClick={() => dispatch(toggleSidebar())}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: 'white' },
            }}
          >
            {isExpanded ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Menu Items */}
      <List sx={{ pt: 0.5, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {renderMenuItems(menuRoutes as SidebarMenuItem[])}
      </List>

      {/* Logout at bottom */}
      <Box sx={{ pb: 1 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 1, mb: 0.5 }} />
        <ListItem disablePadding sx={{ px: 1 }}>
          <Tooltip title={!isExpanded ? 'Logout' : ''} placement="right">
            <ListItemButton
              onClick={async () => dispatch(UserLogout())}
              sx={{
                borderRadius: 1.5,
                minHeight: 40,
                justifyContent: isExpanded ? 'flex-start' : 'center',
                '&:hover': { bgcolor: 'rgba(255,80,80,0.2)' },
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,180,180,0.9)', minWidth: isExpanded ? 36 : 'unset', justifyContent: 'center' }}>
                <LogoutIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,200,200,0.9)' }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default SideDrawer;
