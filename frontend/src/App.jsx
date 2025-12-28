import React from 'react';
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
  return (
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
  );
}

export default App;
