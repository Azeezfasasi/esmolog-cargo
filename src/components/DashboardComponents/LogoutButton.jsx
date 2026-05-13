// components/LogoutButton.jsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/components/context-api/ProfileContext';

function LogoutButton() {
  const { logout } = useProfile();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
