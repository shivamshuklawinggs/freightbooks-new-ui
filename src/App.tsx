import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import RouterConfig from './routes/RouterConfig';
import { useGlobalNumericInputPrevention } from './hooks/useGlobalNumericInputPrevention';
import { ThemeProvider } from '@mui/material/styles';
import {usecustomeTheme} from './data/theme';
import { CssBaseline } from '@mui/material';
// Create a client
const queryClient = new QueryClient()
const App: React.FC = () => {
  useGlobalNumericInputPrevention({
    allowNegative: false,
    preventArrows: true
  });

  // Create a new theme instance whenever the color changes
  const theme = usecustomeTheme();
  return (
      <QueryClientProvider client={queryClient}
       >
        <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <RouterConfig />
      </Router>
      </ThemeProvider>
      </QueryClientProvider>

    
  );
};

export default App; 