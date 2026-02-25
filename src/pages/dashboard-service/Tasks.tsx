import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Typography, List, ListItem, Box, Stack, Button } from '@mui/material';
import { getIcon } from '@/components/common/icons/getIcon';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'unpaid' | 'overdue' | 'pending';
  amount?: string;
}

const Tasks: React.FC = () => {
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Remind your customers about 4 unpaid invoices',
      description: 'Next time, you can get paid right from an invoice by connecting to',
      status: 'unpaid'
    },
    {
      id: '2',
      title: 'Remind your customers about 4 unpaid invoices',
      description: 'Next time, you can get paid right from an invoice by connecting to',
      status: 'unpaid'
    },
    {
      id: '3',
      title: 'Pay 6 overdue bills',
      description: 'They amount to $5,670.00.',
      status: 'overdue',
      amount: '$5,670.00'
    },
    {
      id: '4',
      title: 'Categorise 20 transactions',
      description: 'They\'re worth up to $7,365.19',
      status: 'pending',
      amount: '$7,365.19'
    }
  ];

  const getStatusColor = (status: Task['status']): string => {
    switch (status) {
      case 'unpaid':
        return '#ffc107';
      case 'overdue':
        return '#dc3545';
      case 'pending':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

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
        TASKS
      </Typography>
      <List sx={{ width: '100%' }}>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
              '&:last-child': {
                mb: 0
              }
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {getIcon("GoDotFill",{ color: getStatusColor(task.status) })}
              <Typography variant="body2">
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Typography>
              <Button
                component={Link}
                to={`/tasks/${task.id}`}
                
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  py: 0.5
                }}
              >
                Go
              </Button>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Tasks;
