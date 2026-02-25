import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Badge, Menu, MenuItem, Tooltip, Box, ListItemIcon, ListItemText } from "@mui/material";
import { Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle, Logout as LogoutIcon, Person as PersonIcon } from "@mui/icons-material";
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
  const { user,themeMode ,currentCompanyDetails} = useSelector((state: RootState) => state.user);
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
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: themeMode === 'dark' ? '#333' : 'white',
        color: "primary.main",
        boxShadow: 1,
        // borderBottom: `none`,
        transition: theme => theme.transitions.create(['margin', 'width', 'border-color'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {currentCompanyDetails?.label}
        </Typography>
        {/* Notifications */}
        <Box sx={{ display: 'flex' }}>
        
         {user?.role !==Role.SUPERADMIN && <SelectCoompany/>}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              aria-controls="notification-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            keepMounted
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              style: {
                maxHeight: 300,
                width: 320,
              },
            }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <MenuItem key={index} onClick={() => handleNotificationItemClick(notification)}>
                  {notification.message}
                </MenuItem>
              ))
            ) : (
              <MenuItem>No notifications</MenuItem>
            )}
          </Menu>

          {/* User Menu */}
          <Tooltip title="Account settings">
            <IconButton
              color="inherit"
              onClick={handleUserMenuClick}
              aria-controls="user-menu"
              aria-haspopup="true"
              sx={{ ml: 1 }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchorEl}
            keepMounted
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
          >

            {/* role  */}
            <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <ListItemIcon>
    <PersonIcon fontSize="small" color="primary" />
  </ListItemIcon>
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography
      variant="body1"
      sx={{ fontWeight: 600, textTransform: "capitalize", lineHeight: 1.2 }}
    >
      {user?.name}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "capitalize" }}
    >
      {user?.role}
    </Typography>
  </Box>
               </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;