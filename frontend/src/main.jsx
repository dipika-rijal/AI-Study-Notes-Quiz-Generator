import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f1f0f7',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
