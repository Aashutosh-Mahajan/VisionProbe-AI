import React from 'react';
import { useParams } from 'react-router-dom';
import { AccountView } from '@neondatabase/neon-js/auth/react/ui';

const AccountPage = () => {
  const { pathname } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AccountView pathname={pathname} />
    </div>
  );
};

export default AccountPage;
