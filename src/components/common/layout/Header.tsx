import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Badge, Menu, MenuItem, Tooltip, Box, ListItemIcon, ListItemText, Avatar, Divider, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu as MenuIcon, Notifications as NotificationsIcon, Logout as LogoutIcon, Person as PersonIcon, Circle as CircleIcon, DoneAll as DoneAllIcon } from "@mui/icons-material";
import { toggleSidebar } from "@/redux/Slice/sidebarSlice";
import {  INotification, Role } from "@/types";
import apiService from "@/service/apiService";
import { paths } from "@/utils/paths";
import { AppDispatch, RootState } from '@/redux/store';

import { useQuery, useMutation } from "@tanstack/react-query";
import SelectCoompany from "./SelectCoompany";
import { toast } from 'react-toastify';
import { logout } from "@/redux/Slice/UserSlice";

interface HeaderProps {
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, currentCompanyDetails } = useSelector((state: RootState) => state.user);
  // Fetch notifications using React Query
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<INotification[]>({
    queryKey: ['notifications', user?._id],
    queryFn: () => apiService.getNotifications().then(res => res.data),
    enabled: !!user?._id
  });
  // Menu anchors
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { mutate: updateAllNotification } = useMutation({
    mutationFn: (payload:string) => 
      apiService.updateNotifications(payload,{
        isRead:true
      }),
    onSuccess: () => {
      refetchNotifications();
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      dispatch(logout());
      navigate(paths.login, { replace: true });
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Logout failed');
    }
  });
 
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);

  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  const handleNotificationItemClick = async (notification: INotification) => {
    const currentclickednotificationIds = notification._id;
    await updateAllNotification(currentclickednotificationIds);
    if (notification?.load?.loadNumber) {
      navigate("/dispatcher?loadNumber="+ notification?.load?.loadNumber);
    }
    handleNotificationClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    handleUserMenuClose();
  };
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        {/* Mobile menu toggle */}
        <IconButton
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 1, display: { sm: 'none' }, color: 'text.secondary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Company label */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {currentCompanyDetails?.label && (
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              sx={{ color: 'text.primary', maxWidth: 280 }}
            >
              {currentCompanyDetails.label}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {user?.role !== Role.SUPERADMIN && <SelectCoompany />}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1,
                width: 340,
                maxHeight: 420,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
              {unreadCount > 0 && (
                <Tooltip title="Mark all read">
                  <IconButton size="small" onClick={() => notifications.forEach(n => !n.isRead && updateAllNotification(n._id))}>
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ overflowY: 'auto', maxHeight: 340 }}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleNotificationItemClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      gap: 1.5,
                      alignItems: 'flex-start',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: !notification.isRead ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 8,
                        mt: 0.8,
                        color: !notification.isRead ? 'primary.main' : 'transparent',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'normal' }}>
                      {notification.message}
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No notifications</Typography>
                </Box>
              )}
            </Box>
          </Menu>

          {/* User Avatar */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleUserMenuClick} sx={{ p: 0.5, ml: 0.5 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  cursor: 'pointer',
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            {/* User info header */}
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, bgcolor: 'primary.main' }}>
                {userInitials}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize', lineHeight: 1.2 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}
              sx={{ py: 1.2, gap: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 'unset' }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>My Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1.5, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 'unset', color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;