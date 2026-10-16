import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <LanguageProvider>
        <UserDataProvider>
          <NavigationProvider>
            <App />
          </NavigationProvider>
        </UserDataProvider>
      </LanguageProvider>
    </ToastProvider>
  </React.StrictMode>
);