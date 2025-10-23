import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GroupProvider } from './contexts/GroupContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <GroupProvider>
        <AppWrapper />
      </GroupProvider>
    </AuthProvider>
  </React.StrictMode>,
);
