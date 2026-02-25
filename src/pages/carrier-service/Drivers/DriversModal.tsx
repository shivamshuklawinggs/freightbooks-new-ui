import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, IconButton, Typography, Box, Divider, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Report } from '@mui/icons-material';
import DriverForm from './DriverForm';
import { IDriver } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import apiService from '@/service/apiService';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { paths } from '@/utils/paths';
import { useNavigate } from 'react-router-dom';

interface DriversModalProps {
  open: boolean;
  onClose: () => void;
  carrier: string;
  onUpdate: () => void;
  loading: boolean;
}

const DriversModal: React.FC<DriversModalProps> = ({ 
  open, 
  onClose, 
  carrier, 
  loading,
  onUpdate
}) => {
  const navigate = useNavigate();
  const [showDriverForm, setShowDriverForm] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<IDriver | null>(null);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const handleAddDriver = (): void => {
    setSelectedDriver(null);
    setShowDriverForm(true);
  };

  const handleEditDriver = (driver: IDriver): void => {
    setSelectedDriver(driver);
    setShowDriverForm(true);
  };


  const handleClose = (): void => {
    setShowDriverForm(false);
    setSelectedDriver(null);
    onClose();
  };
  const getDrivers = async () => {
    const response = await apiService.getDrivers({carrierId:carrier})
    setDrivers(response.data);
  };

useEffect(() => {
  getDrivers();
}, [carrier]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Manage Drivers 
          </Typography>
          {!showDriverForm && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={handleAddDriver}
              disabled={loading}
            >
              Add Driver
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {showDriverForm  ? (
          <DriverForm
            driver={selectedDriver || undefined}
            carrier={carrier}
            onCancel={() => {
              setShowDriverForm(false);
              setSelectedDriver(null);
            }}
            onUpdate={() => {
              onUpdate();
              setShowDriverForm(false);
              setSelectedDriver(null);
            }}
          />
        ) : (
          <List>
            {drivers?.map((driver: IDriver, index: number) => (
              <React.Fragment key={driver._id ?? index}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditDriver(driver)}
                        disabled={loading}
                        color="primary"
                        
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`${paths.carriers}/driver/${driver._id}`)}
                        disabled={loading}
                        color='warning'
                        size='small'
                        
                      >
                        <Report /> <span>Report</span>
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {driver.driverName}
                        </Typography>
                        <Chip
                          label={driver.isActive ? 'Active' : 'Inactive'}
                          color={driver.isActive ? 'success' : 'error'}
                          
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography component="div" variant="body2" color="text.secondary">
                          Phone: {driver.driverPhone}
                        </Typography>
                        <Typography component="div" variant="body2" color="text.secondary">
                          CDL: {driver.driverCDL}
                        </Typography>
                        <Typography component="div" variant="body2" color="text.secondary">
                          CDL Expiration: {formatDate(driver.driverCDLExpiration) }
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
            {(!drivers || drivers.length === 0) && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="text.secondary" align="center">
                      No drivers added yet
                    </Typography>
                  }
                  secondary={
                    <Typography onClick={handleAddDriver}  sx={{cursor:"pointer"}} color="primary" align="center" variant="body2">
                      Click the Add Driver button to add drivers
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withPermission("create",["carriers"])(DriversModal);