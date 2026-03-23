import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@neondatabase/neon-js/auth/react/ui';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';

function App() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateCursorPosition = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, [role="button"], input, textarea, select, [onclick]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateCursorPosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div className="grain"></div>
      <div 
        className="cursor hidden md:block" 
        style={{ 
          left: cursorPos.x, 
          top: cursorPos.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2.2 : 1})`
        }} 
      />
      <div 
        className="cursor-ring hidden md:block" 
        style={{ 
          left: cursorPos.x, 
          top: cursorPos.y,
          width: isHovering ? '52px' : '36px',
          height: isHovering ? '52px' : '36px'
        }} 
      />
      <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
      <Route path="/auth/:pathname" element={<AuthPage />} />
      <Route path="/account/:pathname" element={<AccountPage />} />

      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <Dashboard />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn redirectTo="/auth/sign-in" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/profile"
        element={
          <>
            <SignedIn>
              <ProfilePage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn redirectTo="/auth/sign-in" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/settings"
        element={
          <>
            <SignedIn>
              <SettingsPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn redirectTo="/auth/sign-in" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/billing"
        element={
          <>
            <SignedIn>
              <BillingPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn redirectTo="/auth/sign-in" />
            </SignedOut>
          </>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
