import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_dmFsdWVkLWZsb3VuZGVyLTE5MTEuY2xlcmsuYWNjb3VudHMuZGV2JA';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#111114',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          colorInputBackground: '#09090b',
          colorInputBorder: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.375rem'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
