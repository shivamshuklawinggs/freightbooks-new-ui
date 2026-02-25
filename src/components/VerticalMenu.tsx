// components/VerticalMenu.tsx
import React, { useState, MouseEvent } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { getIcon ,iconType } from './common/icons/getIcon';
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
      <Button aria-label="row actions" onClick={handleOpen} size="small">
        <MoreVertIcon fontSize="small" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: itemHeight * 4.5,
            width,
          },
        }}
      >
        {validActions.map((action, idx) => (
          <MenuItem
            key={idx}
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            // onLoad={action?.loading}
            disabled={action.disabled}
          >
            <span style={{ marginRight: 8 }}>{getIcon(action.icon)}</span>
            {action.loading && '...'} { action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default VerticalMenu;
