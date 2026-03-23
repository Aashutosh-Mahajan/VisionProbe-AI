import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate, Link } from 'react-router-dom'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import '@neondatabase/neon-js/ui/css'

import './index.css'
import App from './App.jsx'
import { authClient } from './lib/auth'

import { ThemeProvider } from './components/ThemeProvider.jsx'

function AppWrapper() {
  const navigate = useNavigate();
  
  return (
    <NeonAuthUIProvider 
      authClient={authClient}
      navigate={navigate}
      Link={Link}
      redirectTo="/dashboard"
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </NeonAuthUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  </StrictMode>,
)
