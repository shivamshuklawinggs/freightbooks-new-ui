import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Box, Button } from '@mui/material';
import { paths } from '@/utils/paths';
import { getIcon } from '@/components/common/icons/getIcon';

const ShortCuts: React.FC = () => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom>
        SHORTCUTS
      </Typography>
      <List sx={{ width: '100%', mb: 2 }}>
        <ListItem 
          component={Link} 
          to={paths.generateInvoice}
          sx={{ 
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
           {getIcon("receiptLong")}


          </ListItemIcon>
          <ListItemText primary="Create Invoice" />
        </ListItem>
        <ListItem 
          component={Link} 
          to={paths.createload}
          sx={{ 
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getIcon("truck")}
          </ListItemIcon>
          <ListItemText primary="Create Load" />
        </ListItem>
        <ListItem 
          component={Link} 
          to={paths.paymentterms}
          sx={{ 
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getIcon("creditCard")}
          </ListItemIcon>
          <ListItemText primary="Take payment" />
        </ListItem>
        <ListItem 
          component={Link} 
          to={paths.billpay}
          sx={{ 
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getIcon("AttachMoneyIcon")}
          </ListItemIcon>
          <ListItemText primary="Pay bills" />
        </ListItem>
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Button 
          component={Link} 
          to={paths.shortcuts}
          sx={{ 
            textTransform: 'none',
            justifyContent: 'flex-start',
            pl: 0
          }}
        >
          Show all
        </Button>
      </Box>
    </Paper>
  );
};

export default ShortCuts;