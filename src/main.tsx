import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GroupProvider } from './contexts/GroupContext.tsx';
import { GroupMemberProvider } from './contexts/GroupMemberContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <GroupProvider>
        <GroupMemberProvider>
          <App />
        </GroupMemberProvider>
      </GroupProvider>
    </AuthProvider>
  </React.StrictMode>,
);
