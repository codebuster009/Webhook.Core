import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import { WalkthroughProvider } from './walkthrough/WalkthroughContext.jsx';
import { TourOverlay } from './walkthrough/TourOverlay.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WalkthroughProvider>
          <App />
          <TourOverlay />
        </WalkthroughProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
