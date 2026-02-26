// components/VerticalMenu.tsx
import React, { useState, MouseEvent } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { getIcon, iconType } from './common/icons/getIcon';
export interface MenuAction {
  label: string;
  icon: iconType  ;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface VerticalMenuProps {
  actions: (MenuAction | null)[];
  itemHeight?: number;
  width?: string;
}

const VerticalMenu: React.FC<VerticalMenuProps> = ({
  actions,
  itemHeight = 48,
  width = '20ch',
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const validActions = actions.filter(
    (action): action is MenuAction => !!action
  );

  if (validActions.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="row actions"
        onClick={handleOpen}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            minWidth: width,
            maxHeight: itemHeight * 4.5,
            borderRadius: 2,
            '& .MuiMenuItem-root': { borderRadius: 1, mx: 0.5, my: 0.25 },
          },
        }}
      >
        {validActions.map((action, idx) => (
          <MenuItem
            key={idx}
            onClick={() => { action.onClick(); handleClose(); }}
            disabled={action.disabled || action.loading}
            sx={{ py: 1, px: 1.5, gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 'unset', color: 'inherit' }}>
              {action.loading
                ? <CircularProgress size={16} />
                : getIcon(action.icon)
              }
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
              {action.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default VerticalMenu;
