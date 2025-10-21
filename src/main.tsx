import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GroupProvider } from './contexts/GroupContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <GroupProvider>
        <App />
      </GroupProvider>
    </AuthProvider>
  </React.StrictMode>,
);
