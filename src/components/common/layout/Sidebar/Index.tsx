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
  Typography,
  Tooltip,
  Box,
  alpha,
  Popover,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { protectedRoutes } from "@/routes";
// import { toggleSidebar } from "@/redux/Slice/sidebarSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { UserLogout } from "@/redux/api";
import { getIcon, iconType } from "@/components/common/icons/getIcon";
import { SidebarMenuItem, SideDrawerProps } from "@/types";
import { hasAccess } from "@/hooks/ProtectedRoute/authUtils";

const SideDrawer: React.FC<SideDrawerProps> = ({ drawerWidth }) => {
  // const isExpanded = useSelector((state: RootState) => state.sidebar.isOpen);
  const isExpanded = false
  const user = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [menuState, setMenuState] = React.useState<{
    key: string | null
    anchor: HTMLElement | null
  }>({
    key: null,
    anchor: null
  })

  const [nestedMenuState, setNestedMenuState] = React.useState<{
    key: string | null
    anchor: HTMLElement | null
  }>({
    key: null,
    anchor: null
  })

  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const nestedCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const [openMenus, setOpenMenus] = React.useState<Set<string>>(new Set());

  // Use dynamic routes if available, otherwise fallback to static routes
  const menuRoutes = protectedRoutes;

  // Generate unique menu key for nested items
  const getMenuKey = (item: SidebarMenuItem, parentKey: string = '') => {
    return parentKey ? `${parentKey}-${item.title}` : item.title;
  };


  const handleMenuClick = (menuKey: string) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (nestedCloseTimeoutRef.current) {
        clearTimeout(nestedCloseTimeoutRef.current);
      }
    };
  }, []);
 
  // Recursive component for rendering nested menu items
// Recursive component for rendering nested menu items
const renderNestedMenuItems = (
  items: SidebarMenuItem[],
  parentKey: string = '',
  level: number = 0
) => {
  return items.map((item, index) => {
    const menuKey = getMenuKey(item, parentKey)
    const icon = getIcon(item.icon as iconType)

    const basePath = item.path ? normalizePath(item.path) : ""
    const isActive = basePath && location.pathname.startsWith(basePath)

    const hasChildren = item.children && item.children.length > 0

    const isHovered = menuState.key === menuKey
    const isOpen = openMenus.has(menuKey)

    return (
      <ListItem
        key={`${level}-${index}`}
        disablePadding
        sx={{ px: 1, position: "relative" }}
      >
        <ListItemButton
          component={hasChildren ? "div" : Link}
          to={hasChildren ? undefined : basePath}
          onClick={hasChildren ? () => handleMenuClick(menuKey) : undefined}
          onMouseEnter={
            hasChildren
              ? (e: React.MouseEvent<HTMLElement>) =>
                  handleMenuHover(e, menuKey)
              : undefined
          }
          onMouseLeave={hasChildren ? handleMenuLeave : undefined}
          sx={{
            borderRadius: 1,
            minHeight: Math.max(32 - level * 2, 24),
            bgcolor: isActive ? alpha("#fff", 0.18) : "transparent",
            "&:hover": { bgcolor: alpha("#fff", 0.12) },
            position: "relative",
            "&::before": isActive
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  height: "60%",
                  width: 3,
                  borderRadius: "0 3px 3px 0",
                  bgcolor: "rgba(255,255,255,0.9)"
                }
              : {}
          }}
        >
          {icon && (
            <ListItemIcon
              sx={{
                color: isActive
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.75)",
                minWidth: Math.max(32 - level * 4, 20),
                "& svg": { fontSize: Math.max(18 - level * 2, 14) }
              }}
            >
              {icon}
            </ListItemIcon>
          )}

          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: Math.max(0.75 - level * 0.05, 0.6),
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? "rgba(255,255,255,1)"
                : "rgba(255,255,255,0.85)"
            }}
          />

          {hasChildren &&
            (isOpen ? (
              <ChevronRightIcon
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: Math.max(16 - level, 12),
                  transform: "rotate(90deg)"
                }}
              />
            ) : (
              <ChevronRightIcon
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: Math.max(16 - level, 12)
                }}
              />
            ))}
        </ListItemButton>

        {/* Recursive Popover */}
        {hasChildren && (
          <Popover
            open={isHovered || isOpen}
            anchorEl={menuState.anchor}
            onClose={handlePopoverLeave}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left"
            }}
            disableRestoreFocus
            sx={{
              "& .MuiPopover-paper": {
                ml: 0.5,
                bgcolor: theme.palette.primary.main,
                backgroundImage: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: "4px 4px 20px rgba(0,0,0,0.3)",
                borderRadius: 2,
                minWidth: Math.max(200 - level * 20, 140)
              }
            }}
          >
            <Box
              onMouseEnter={handlePopoverEnter}
              onMouseLeave={handlePopoverLeave}
              sx={{ py: 1 }}
            >
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  display: "block",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: Math.max(0.65 - level * 0.05, 0.55)
                }}
              >
                {item.title}
              </Typography>

              <List disablePadding>
                {renderNestedMenuItems(
                  item.children!,
                  menuKey,
                  level + 1
                )}
              </List>
            </Box>
          </Popover>
        )}
      </ListItem>
    )
  })
}

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

        if (hasChildren) {
          const isHovered = menuState.key === item.title;
          return (
            <React.Fragment key={`${level}-${index}`}>
              <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
                <Tooltip title={!isExpanded ? item.title : ""} placement="right">
                  <ListItemButton
                    onMouseEnter={(e) => handleMenuHover(e, item.title)}
                    onMouseLeave={handleMenuLeave}
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
                        <ChevronRightIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }} />
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {/* Hover Popover for children */}
              <Popover
                open={isHovered}
                anchorEl={menuState.anchor}
                onClose={handlePopoverLeave}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{
                  pointerEvents: 'none',
                  '& .MuiPopover-paper': {
                    pointerEvents: 'auto',
                    ml: 0.5,
                    bgcolor: theme.palette.primary.main,
                    backgroundImage: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: '4px 4px 20px rgba(0,0,0,0.3)',
                    borderRadius: 2,
                    minWidth: 200,
                  }
                }}
                disableRestoreFocus
              >
                <Box
                  onMouseEnter={handlePopoverEnter}
                  onMouseLeave={handlePopoverLeave}
                  sx={{ py: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 0.5,
                      display: 'block',
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.65rem',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <List disablePadding>
                    {item.children?.map((child, childIndex) => {
                      const childIcon = getIcon(child.icon as iconType);
                      const childPath = child.path ? normalizePath(child.path) : "#";
                      const isChildActive = childPath && location.pathname.startsWith(childPath);
                      const hasGrandChildren = child.children && child.children.length > 0;

                      return (
                        <ListItem key={childIndex} disablePadding sx={{ px: 1, position: 'relative' }}>
                          <ListItemButton
                            component={hasGrandChildren ? 'div' : Link}
                            to={hasGrandChildren ? undefined : childPath}
                            onMouseEnter={hasGrandChildren ? (e: React.MouseEvent<HTMLElement>) => handleNestedMenuHover(e, `${item.title}-${child.title}`) : undefined}
                            onMouseLeave={hasGrandChildren ? handleNestedMenuLeave : undefined}
                            sx={{
                              borderRadius: 1,
                              minHeight: 36,
                              bgcolor: isChildActive ? alpha('#fff', 0.18) : 'transparent',
                              '&:hover': { bgcolor: alpha('#fff', 0.12) },
                              position: 'relative',
                              '&::before': isChildActive ? {
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
                            {childIcon && (
                              <ListItemIcon sx={{ color: isChildActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.75)', minWidth: 32, '& svg': { fontSize: 18 } }}>
                                {childIcon}
                              </ListItemIcon>
                            )}
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                fontSize: '0.75rem',
                                fontWeight: isChildActive ? 600 : 500,
                                color: isChildActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)'
                              }}
                            />
                            {hasGrandChildren && (
                              <ChevronRightIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }} />
                            )}
                          </ListItemButton>

                          {/* Nested Popover for grandchildren */}
                          {hasGrandChildren && (
                            <Popover
                              open={nestedMenuState.key === `${item.title}-${child.title}`}
                              anchorEl={nestedMenuState.anchor}
                              onClose={handleNestedPopoverLeave}
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                              sx={{
                                pointerEvents: 'none',
                                '& .MuiPopover-paper': {
                                  pointerEvents: 'auto',
                                  ml: 0.5,
                                  bgcolor: theme.palette.primary.main,
                                  backgroundImage: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                  boxShadow: '4px 4px 20px rgba(0,0,0,0.3)',
                                  borderRadius: 2,
                                  minWidth: 180,
                                }
                              }}
                              disableRestoreFocus
                            >
                              <Box
                                onMouseEnter={handleNestedPopoverEnter}
                                onMouseLeave={handleNestedPopoverLeave}
                                sx={{ py: 1 }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    display: 'block',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontSize: '0.65rem',
                                  }}
                                >
                                  {child.title}
                                </Typography>
                                <List disablePadding>
                                  {child.children?.map((grandChild, grandChildIndex) => {
                                    const grandChildIcon = getIcon(grandChild.icon as iconType);
                                    const grandChildPath = grandChild.path ? normalizePath(grandChild.path) : "#";
                                    const isGrandChildActive = grandChildPath && location.pathname.startsWith(grandChildPath);

                                    return (
                                      <ListItem key={grandChildIndex} disablePadding sx={{ px: 1 }}>
                                        <ListItemButton
                                          component={Link}
                                          to={grandChildPath}
                                          sx={{
                                            borderRadius: 1,
                                            minHeight: 32,
                                            bgcolor: isGrandChildActive ? alpha('#fff', 0.18) : 'transparent',
                                            '&:hover': { bgcolor: alpha('#fff', 0.12) },
                                            position: 'relative',
                                            '&::before': isGrandChildActive ? {
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
                                          {grandChildIcon && (
                                            <ListItemIcon sx={{ color: isGrandChildActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.75)', minWidth: 28, '& svg': { fontSize: 16 } }}>
                                              {grandChildIcon}
                                            </ListItemIcon>
                                          )}
                                          <ListItemText
                                            primary={grandChild.title}
                                            primaryTypographyProps={{
                                              fontSize: '0.7rem',
                                              fontWeight: isGrandChildActive ? 600 : 500,
                                              color: isGrandChildActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)'
                                            }}
                                          />
                                        </ListItemButton>
                                      </ListItem>
                                    );
                                  })}
                                </List>
                              </Box>
                            </Popover>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </Popover>
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
 const handleMenuHover = (
  event: React.MouseEvent<HTMLElement>,
  menuKey: string
) => {
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current)
  }

  setMenuState({
    key: menuKey,
    anchor: event.currentTarget
  })
}

const handleMenuLeave = () => {
  closeTimeoutRef.current = setTimeout(() => {
    setMenuState({
      key: null,
      anchor: null
    })
  }, 200)
}

const handleNestedMenuHover = (
  event: React.MouseEvent<HTMLElement>,
  menuKey: string
) => {
  if (nestedCloseTimeoutRef.current) {
    clearTimeout(nestedCloseTimeoutRef.current)
  }

  setNestedMenuState({
    key: menuKey,
    anchor: event.currentTarget
  })
}

const handleNestedMenuLeave = () => {
  nestedCloseTimeoutRef.current = setTimeout(() => {
    setNestedMenuState({
      key: null,
      anchor: null
    })
  }, 200)
}

const handlePopoverEnter = () => {
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current)
  }
}

const handleNestedPopoverEnter = () => {
  if (nestedCloseTimeoutRef.current) {
    clearTimeout(nestedCloseTimeoutRef.current)
  }
}

const handlePopoverLeave = () => {
  setMenuState({
    key: null,
    anchor: null
  })
}

const handleNestedPopoverLeave = () => {
  setNestedMenuState({
    key: null,
    anchor: null
  })
}
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
            // onClick={() => dispatch(toggleSidebar())}
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
